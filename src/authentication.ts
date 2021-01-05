import auth from 'solid-auth-client';
import {AppState, useStore} from "./redux/store";
import {setWebId} from "./redux/actions";
import {useSelector, useDispatch} from 'react-redux'
import React from 'react'

export async function getWebId() {
    const session = await auth.currentSession();
    if (session) {
        return session.webId;
    }
    return null;
}

// Fetches the solid web id string or
export function useWebId(): string | null {
    const webId = useSelector((state: AppState) =>
        state.webId
    )
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function fetchWebId() {
            const webId = await getWebId();

            dispatch(setWebId(webId));
        }

        if (webId === null) {
            fetchWebId();
        }
    }, []);

    return webId
}