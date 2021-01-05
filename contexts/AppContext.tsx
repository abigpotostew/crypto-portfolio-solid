import React, {createContext, useReducer, useEffect} from 'react';
import {appReducer} from '../reducers/appReducer';
import {getWebId} from "../src/authentication";
import {PodDocument, Trade} from "../src/store";


export interface LedgerState {
    podDocument: PodDocument | null
    trades: Trade[]
}

export interface AppState {
    ledgersState: LedgerState
    webId: string | null
}

const initialState: AppState = {
    ledgersState: {podDocument: null, trades: []},
    webId: null,
};

const AppContext = React.createContext(initialState);
const {Provider} = AppContext;

// @ts-ignore
export function AppProvider({children, store}) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        async function fetchWebId() {
            const webId = await getWebId();

            // @ts-ignore
            dispatch({type: 'set_web_id', payload: webId});
        }

        if (state.webId === null) {
            fetchWebId();
        }
    }, []);

    // @ts-ignore
    return ({children});
}

export default AppContext;
