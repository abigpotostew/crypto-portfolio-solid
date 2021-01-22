import {newTradeC, Trade, TradeType} from "../../store";
import {Address, CovalentTransaction, GetERC20TokenTransfersResponse} from "./covalent";
import {Currency, UncheckedCurrency, ValidCurrency} from "../../marketdata/provider";


const ethCurrency = new ValidCurrency("ETH", "ETH", "ETH")

export function getTransactionHashes(data: GetERC20TokenTransfersResponse): Set<string> {
    const out = new Set<string>()
    for (let a of data.items) {
        out.add(a.tx_hash)
    }
    return out
}

const OUT_TYPE = "OUT";
const IN_TYPE = "IN";

function ethInfo(currentAddress: Address, data: CovalentTransaction) {
    const isEthValueSet = (data.value !== "0")
    const ethValue = parseInt(data.value)//todo bigint this
    const ethValueConverted = ethValue / Math.pow(10, 18)
    let ethIn = 0
    let ethOut = 0
    if (data.to_address === currentAddress) {
        ethIn = ethValueConverted
    }
    if (data.from_address === currentAddress) {
        ethOut = ethValueConverted
    }
    const gas = data.gas_spent;
    const gasConverted = gas / Math.pow(10, 9)
    const transferDate = data.block_signed_at

    let transferType = TradeType.NONE
    if (data.to_address === currentAddress) {
        transferType = TradeType.TRANSFER_IN
    } else if (data.from_address === currentAddress) {
        transferType = TradeType.TRANSFER_OUT
    }

    return {isEthValueSet, ethValue, ethValueConverted, gas, gasConverted, transferDate, transferType}
}

export function asTrade(currentAddress: Address, data: CovalentTransaction): Trade | undefined {
    if (!data.successful) {
        return
    }
    const {
        isEthValueSet,
        ethValue,
        ethValueConverted,
        gas,
        gasConverted,
        transferDate,
        transferType
    } = ethInfo(currentAddress, data)

    if (!isEthValueSet) {
        console.error("Unsupported transaction, this transaction is not a transfer")
        return
    }

    let inAmount = 0
    let inCurrency: Currency
    let outAmount = 0
    let outCurrency: Currency
    let feeAmount = gasConverted
    let feeCurrency: Currency = ethCurrency

    if (transferType === TradeType.TRANSFER_IN) {
        inAmount = ethValueConverted
        inCurrency = ethCurrency
        outCurrency = inCurrency
    } else {
        outAmount = ethValueConverted
        outCurrency = ethCurrency
        inCurrency = outCurrency
    }

    return newTradeC({
        amount: {amount: inAmount, currency: inCurrency},
        cost: {amount: outAmount, currency: outCurrency},
        fee: {amount: feeAmount, currency: feeCurrency},
        url: "",
        dateCreated: transferDate,
        dateModified: transferDate,
        dirty: true,
        exchange: "exchange todo",
        comment: data.tx_hash,
        type: transferType,
    })
}

export function asTrades(currentAddress: Address, data: GetERC20TokenTransfersResponse): Trade[] {

    const out = new Array<Trade>()
    for (let erc20Token of data.items) {
        if (!erc20Token.successful) {
            continue
        }
        const {
            isEthValueSet,
            ethValue,
            ethValueConverted,
            gas,
            gasConverted,
            transferDate,
            transferType: ethTransferType
        } = ethInfo(currentAddress, erc20Token)

        for (let transfer of erc20Token.transfers) {
            const contractDecimals = transfer.contract_decimals;
            const delta = transfer.delta;
            const contract = transfer.contract_address
            const contractTicker = transfer.contract_ticker_symbol;// JRT

            const deltaConverted = delta / Math.pow(10, contractDecimals);

            const transferType = asTradeType(transfer.transfer_type)

            //todo capture the historical quote
            let inAmount = 0
            let inCurrency: Currency
            let outAmount = 0
            let outCurrency: Currency
            let feeAmount = gasConverted
            let feeCurrency: Currency = ethCurrency

            if (transferType == TradeType.TRANSFER_IN) {
                inAmount = deltaConverted
                inCurrency = new UncheckedCurrency(contractTicker)
                outCurrency = inCurrency
                if (isEthValueSet) {
                    if (ethTransferType === TradeType.TRANSFER_OUT) {
                        outAmount = ethValueConverted
                        outCurrency = ethCurrency
                    } else {
                        throw new Error("Unsupported transfer erc20 token in and eth in. todo to support")
                    }
                }
            } else {
                outAmount = deltaConverted
                outCurrency = new UncheckedCurrency(contractTicker)
                inCurrency = outCurrency
                if (isEthValueSet) {
                    if (ethTransferType === TradeType.TRANSFER_IN) {
                        inAmount = ethValueConverted
                        inCurrency = ethCurrency
                    } else {
                        throw new Error("Unsupported transfer ecr20 token out and eth out")
                    }
                }

            }
            //todo if the transaction is has IN of an erc20 token AND IN for eth then it should output 2 trades

            //todo uniswap fees...? 

            out.push(newTradeC({
                amount: {amount: inAmount, currency: inCurrency},
                cost: {amount: outAmount, currency: outCurrency},
                fee: {amount: feeAmount, currency: feeCurrency},
                url: "",
                dateCreated: transferDate,
                dateModified: transferDate,
                dirty: true,
                exchange: "exchange todo",
                comment: transfer.tx_hash,
                type: transferType,
            }))
        }
    }

    return out
}

export function asTradeType(transferType: string): TradeType {
    switch (transferType) {
        case IN_TYPE:
            return TradeType.TRANSFER_IN
        case OUT_TYPE:
            return TradeType.TRANSFER_OUT
    }
    throw new Error("unable to get trade type for " + transferType)
}