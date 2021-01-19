import {newTradeC, Trade, TradeType} from "../../store";
import {GetERC20TokenTransfersResponse} from "./covalent";
import {Currency, UncheckedCurrency} from "../../marketdata/provider";

export function asTrades(data: GetERC20TokenTransfersResponse): Trade[] {

    const out = new Array<Trade>()
    for (let erc20Token of data.items) {
        if (!erc20Token.successful) {
            continue
        }

        const ethCost = parseInt(erc20Token.value)
        const gas = erc20Token.gas_spent;
        const gasConverted = gas / Math.pow(10, 9)
        const transferDate = erc20Token.block_signed_at
        for (let transfer of erc20Token.transfers) {
            const contractDecimals = transfer.contract_decimals;
            const delta = transfer.delta;
            const contract = transfer.contract_address
            const contractTicker = transfer.contract_ticker_symbol;// JRT

            const deltaConverted = delta / Math.pow(10, contractDecimals);
            const ethCostConverted = ethCost / Math.pow(10, 18)
            const transferType = asTradeType(transfer.transfer_type)

            let inAmount = 0
            let inCurrency: Currency
            let outAmount = 0
            let outCurrency: Currency
            let feeAmount = gasConverted
            let feeCurrency: Currency = new UncheckedCurrency("ETH")

            if (transferType == TradeType.TRANSFER_IN) {
                inAmount = deltaConverted
                inCurrency = new UncheckedCurrency(contractTicker)
                outCurrency = inCurrency
                if (ethCostConverted > 0) {
                    outCurrency = new UncheckedCurrency("ETH")
                    outAmount = ethCostConverted
                }
            } else {
                outAmount = deltaConverted
                outCurrency = new UncheckedCurrency(contractTicker)
                inCurrency = outCurrency
            }

            out.push(newTradeC({
                amount: {amount: inAmount, currency: inCurrency},
                cost: {amount: outAmount, currency: outCurrency},
                fee: {amount: feeAmount, currency: feeCurrency},
                url: "",
                dateCreated: transferDate,
                dateModified: transferDate,
                dirty: true,
                exchange: "exchange todo",
                comment: "notes todo",
                type: transferType,
            }))
        }
    }

    return out
}

export function asTradeType(transferType: string): TradeType {
    switch (transferType) {
        case "IN":
            return TradeType.TRANSFER_IN
        case "OUT":
            return TradeType.TRANSFER_OUT
    }
    throw new Error("unable to get trade type for " + transferType)
}