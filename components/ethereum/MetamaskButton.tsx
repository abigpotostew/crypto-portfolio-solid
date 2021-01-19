import React, {useState} from 'react'
import Button from '@material-ui/core/Button'
import {enableEthereum, ethEnabled} from '../../src/ethereum/web3'
import {useProvider} from "./useProvider";
import MetaMaskOnboarding from '@metamask/onboarding';
import {useDispatch} from 'react-redux'
import {setEthereumAccount} from "../../src/redux/actions";

const ONBOARD_TEXT = 'Click here to install MetaMask!';
const CONNECT_TEXT = 'Metamask Connect';
const CONNECTED_TEXT = 'Metamask Connected ✅';


export default function MetamaskButton() {
    const dispatch = useDispatch()

    const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
    const [isDisabled, setDisabled] = React.useState(false);
    const [accounts, setAccounts] = React.useState([]);
    const onboarding = React.useRef<MetaMaskOnboarding>();

    React.useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    React.useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(CONNECTED_TEXT);
                setDisabled(true);
                onboarding.current.stopOnboarding();
            } else {
                setButtonText(CONNECT_TEXT);
                setDisabled(false);
            }
        }
    }, [accounts]);

    React.useEffect(() => {
        function handleNewAccounts(newAccounts) {
            setAccounts(newAccounts);
            dispatch(setEthereumAccount(newAccounts[0]))
        }

        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            // @ts-ignore
            window.ethereum
                .request({method: 'eth_requestAccounts'})
                .then(handleNewAccounts);
            // @ts-ignore
            window.ethereum.on('accountsChanged', handleNewAccounts);
            return () => {
                // @ts-ignore
                window.ethereum.off('accountsChanged', handleNewAccounts);
            };
        }
    }, []);

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            // @ts-ignore
            window.ethereum.request({method: 'eth_requestAccounts'}).then((newAccounts) => setAccounts(newAccounts));
        } else {
            // @ts-ignore
            onboarding.current.startOnboarding();
        }
    };

    return (
        <Button disabled={isDisabled} onClick={onClick} color={"primary"} variant="contained">
            {buttonText}
        </Button>
    );
}