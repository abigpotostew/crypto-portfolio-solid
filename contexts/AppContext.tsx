import React, {createContext, useReducer, useEffect} from 'react';
import {appReducer} from '../reducers/appReducer';
import {getWebId} from "../src/authentication";
import {PodDocument, Trade} from "../src/store";

// import { getWebId } from '../functions/authentication';

interface LedgerState {
    podDocument: PodDocument | null
    trades: Trade[]
}

interface AppState {
    ledgersState: LedgerState
    webId: string | null
}

const initialState: AppState = {
    ledgersState: {podDocument: null, trades: []},
    webId: null,
};

const AppContext = createContext(initialState);
const {Provider} = AppContext;

// @ts-ignore
export function AppProvider({children}) {
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
    return <Provider value={{state, dispatch}}>{children}</Provider>;
}

export const AppConsumer = AppContext.Consumer;

export default AppContext;
