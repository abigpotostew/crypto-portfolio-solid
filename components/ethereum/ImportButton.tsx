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
import {asTrades} from "../../src/ethereum/covalent/data";

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

    const onClick = async () => {
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
        }).then((hexInt) => {
            console.log("num txns:", parseInt(hexInt, 16))
        })

        const covalent = new CovalentService(process.env.NEXT_PUBLIC_COVALENT_HOST, process.env.NEXT_PUBLIC_COVALENT_API_KEY)
        const balances = await covalent.getTokenAddressBalances(1, ethAccount)

        const combined: Trade[] = [];
        for (const item of balances.items) {
            console.log(`${item.contract_name} valued at ${item.quote}`)
            const tknTransfers = await covalent.getERC20TokenTransfers(ethAccount, item.contract_address, {})
            console.log(tknTransfers)
            combined.push(...asTrades(tknTransfers))

        }
        handleSyncTrades(combined)
    }

    return (
        <Button disabled={isDisabled} onClick={onClick} color={"primary"} variant="contained">
            {buttonText}
        </Button>
    );
}