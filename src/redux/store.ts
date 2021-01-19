import {useMemo} from 'react'
import {createStore, applyMiddleware} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import {appReducer} from "../../reducers/appReducer"
import {PodDocument, Trade} from "../store";

// export default createStore(appReducer);


export interface AppState {
    ledgersState: LedgerState
    webId: string | null

    ethereumAccount: string | null;
}

export interface LedgerState {
    podDocument: PodDocument | null
    trades: Trade[]
}

const initialState: AppState = {
    ledgersState: {podDocument: null, trades: []},
    webId: null,
    ethereumAccount: null
};


// @ts-ignore
let store

function initStore(preloadedState = initialState) {
    return createStore(
        appReducer,
        preloadedState,
        composeWithDevTools(applyMiddleware())
    )
}

// @ts-ignore
export const initializeStore = (preloadedState) => {
    // @ts-ignore
    let _store = store ?? initStore(preloadedState)

    // After navigating to a page with an initial Redux state, merge that state
    // with the current state in the store, and create a new store
    // @ts-ignore
    if (preloadedState && store) {
        _store = initStore({
            // @ts-ignore
            ...store.getState(),
            ...preloadedState,
        })
        // Reset the current store
        store = undefined
    }

    // For SSG and SSR always create a new store
    if (typeof window === 'undefined') return _store
    // Create the store once in the client
    // @ts-ignore
    if (!store) store = _store

    return _store
}

// @ts-ignore
export function useStore(initialState) {
    const store = useMemo(() => initializeStore(initialState), [initialState])
    return store
}
