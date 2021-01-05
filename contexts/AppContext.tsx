import React from 'react';
import {appReducer} from '../reducers/appReducer';
import {getWebId} from "../src/authentication";
import {PodDocument, Trade} from "../src/store";
import {
    Provider,
    createStoreHook,
    createDispatchHook,
    createSelectorHook
} from 'react-redux'
import {createStore} from "redux"
import {setWebId} from "../src/redux/actions";


// const myStore = createStore(appReducer)
//
// export interface LedgerState {
//     podDocument: PodDocument | null
//     trades: Trade[]
// }
//
// export interface AppState {
//     ledgersState: LedgerState
//     webId: string | null
// }
//
// const initialState: AppState = {
//     ledgersState: {podDocument: null, trades: []},
//     webId: null,
// };
//
// const AppContext = React.createContext(initialState);
//
// // @ts-ignore
// export const useStore = createStoreHook(AppContext)
// // @ts-ignore
// export const useDispatch = createDispatchHook(AppContext)
// // @ts-ignore
// export const useSelector = createSelectorHook(AppContext)
//
// // @ts-ignore
// export function AppProvider({children}) {
//     const webId = useSelector((state: AppState) =>
//         state.webId
//     )
//     const dispatch = useDispatch()
//
//     React.useEffect(() => {
//         async function fetchWebId() {
//             const webId = await getWebId();
//
//             // @ts-ignore
//             dispatch(setWebId(webId));
//         }
//
//         if (webId === null) {
//             fetchWebId();
//         }
//     }, []);
//
//     // @ts-ignore
//     return (<Provider context={AppContext} store={myStore}>{children}</Provider>)
// }
//
// export default AppContext;
