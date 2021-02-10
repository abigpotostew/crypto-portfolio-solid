import React, {useState} from 'react'
import Button from '@material-ui/core/Button'
import {enableEthereum, ethEnabled} from '../../src/ethereum/web3'
import {useProvider} from "./useProvider";
import MetaMaskOnboarding from '@metamask/onboarding';
import {AppState} from "../../src/redux/store";
import {useSelector, useDispatch} from 'react-redux'
import {CovalentService} from "../../src/ethereum/covalent/covalent_service";
import {TokenBalance} from "../../src/ethereum/covalent/covalent";
import {Trade} from "../../src/store";
import {asTrade, asTrades, getTransactionHashes} from "../../src/ethereum/covalent/data";
import Loading from "../loading/loading";

const IMPORT_TXNS_TEXT = 'Import Txns';
const NOT_CONNECTED_TEXT = 'Not Connected';


interface ImportTradesProps {
    handleSyncTrades: ((t: Trade[]) => void)
}

export default function ImportButton({handleSyncTrades}: ImportTradesProps) {
    const [isDisabled, setDisabled] = React.useState(true);
    const ethAccount = useSelector((state: AppState) => state.ethereumAccount)
    const [buttonText, setButtonText] = React.useState(NOT_CONNECTED_TEXT);

    React.useEffect(() => {
        setButtonText(ethAccount ? IMPORT_TXNS_TEXT : NOT_CONNECTED_TEXT);
        setDisabled(!ethAccount)
    }, [ethAccount])

    const [loading, setLoading] = React.useState(false)

    const onClick = async () => {
        try {
            setLoading(true)
            const provider = window.ethereum
            if (!ethAccount) {
                return
            }

            // @ts-ignore
            provider.request({
                method: "eth_getTransactionCount",
                params: [
                    ethAccount,
                    'latest' // state at the latest block
                ]
            }).then((hexInt: string) => {
                console.log("num txns:", parseInt(hexInt, 16))
            })

            const covalent = new CovalentService(undefined, undefined)
            const balances = await covalent.getTokenAddressBalances(1, ethAccount)

            const combined: Trade[] = [];
            const uniqueTxnHashes = new Set<string>()
            for (const item of balances.items) {
                console.log(`${item.contract_name} valued at ${item.quote}`)
                const tknTransfers = await covalent.getERC20TokenTransfers(ethAccount, item.contract_address, {})
                const hashes = getTransactionHashes(tknTransfers)
                hashes.forEach((h) => uniqueTxnHashes.add(h))
                console.log(tknTransfers)
                combined.push(...asTrades(ethAccount, tknTransfers))
            }


            const etherTransfers = await covalent.getEtherTransfers(ethAccount, {})
            for (const t of etherTransfers.items) {
                // every transfer is an eth txn because gas. filter out erc20 transfers
                if (uniqueTxnHashes.has(t.tx_hash)) {
                    //skip if it's been processed in erc20 loop
                    continue
                }
                const trade = asTrade(ethAccount, t)
                if (trade) {
                    combined.push(trade)
                }
            }

            //todo get weth transfers


            handleSyncTrades(combined)
        } finally {
            setLoading(false)
        }
    }

    return (
        ((!loading) ? <Button disabled={isDisabled} onClick={onClick} color={"primary"} variant="contained">
            {buttonText}
        </Button> : <Loading/>)
    )
        ;
}