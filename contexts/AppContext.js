import React, { createContext, useReducer, useEffect } from 'react';
import { appReducer } from '../reducers/appReducer';
import {getWebId} from "../src/authentication";
// import { getWebId } from '../functions/authentication';

const initialState = {
    ledgersState: {podDocument:null},
    webId: null,
};

const AppContext = createContext(initialState);
const { Provider } = AppContext;

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        async function fetchWebId() {
            const webId = await getWebId();
            dispatch({ type: 'set_web_id', payload: webId });
        }
        if (state.webId === null) {
            fetchWebId();
        }
    }, []);

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

export const AppConsumer = AppContext.Consumer;

export default AppContext;
