import {appReducer} from "../reducers/appReducer";
import {getWebId} from "../src/authentication";
import {setWebId} from "../src/redux/actions";
import {useSelector, useDispatch} from 'react-redux'
import React from 'react'
import {AppState} from "./AppContext";

// @ts-ignore
export function WebIdProvider({children}) {
    const webId = useSelector((state: AppState) => {
        state.webId
    })
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function fetchWebId() {
            const webId = await getWebId();

            // @ts-ignore
            dispatch(setWebId(webId));
        }

        if (webId === null) {
            fetchWebId();
        }
    }, []);

    // @ts-ignore
    return {children}
}


export default WebIdProvider;
