import {useDispatch} from 'react-redux'
import React from "react";
import Web3 from "web3";
import {ethEnabled, EthereumProvider} from "../../src/ethereum/web3";
import MetaMaskOnboarding from '@metamask/onboarding';


export function useProvider() {
    const dispatch = useDispatch()
    const [loading, setLoading] = React.useState<boolean>(false);
    const [provider, setProvider] = React.useState<EthereumProvider>();
    const [connected, setConnected] = React.useState<boolean>(false)
    const [web3, setWeb3] = React.useState<Web3>()

    React.useEffect(() => {
        async function doIt() {
            try {
                const {provider, web3} = await ethEnabled()
                setProvider(provider)
                setConnected(!!provider)
                setWeb3(web3)
                console.log("Eth is enabled")
            } catch (e) {
                setConnected(false)
            } finally {
                setLoading(false)
            }
        }

        setLoading(true)
        doIt()
    }, [])

    return {loading, provider, connected, web3, ethereum: provider}
}