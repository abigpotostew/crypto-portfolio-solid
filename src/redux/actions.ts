import {ActionTypes} from './actionTypes'
import {PodDocument} from "../store";

export const setWebId = (webId: string | null) => ({
    type: ActionTypes.SET_WEB_ID,
    payload: webId
})


export const setLedgersState = (fetchedPodDocument: PodDocument) => ({
    type: ActionTypes.SET_LEDGERS_STATE,
    payload: {"podDocument": fetchedPodDocument}
})

export const setEthereumAccount = (account: string) => ({
    type: ActionTypes.SET_ETHEREUM_ACCOUNT,
    payload: account
})