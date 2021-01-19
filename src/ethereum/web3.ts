import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider';

export interface EthereumProvider {
    isMetaMask?: boolean;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
        web3?: any;
    }
}

//connect to metamask
export async function enableEthereum() {
    // if (provider !== window.ethereum) {
    //     console.error('Do you have multiple wallets installed?');
    // }
}

export async function ethEnabled() {
    const provider = await detectEthereumProvider() as EthereumProvider | null;
    if (provider !== window.ethereum) {
        console.error('Do you have multiple wallets installed?');
        return {};
    }
    if (!window.web3) {
        // @ts-ignore
        window.web3 = new Web3(provider);
    }
    const web3 = window.web3 as Web3
    //set web3 in state?
    return {provider: provider, web3: web3};
}

