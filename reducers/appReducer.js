import {ActionTypes} from "../src/redux/actionTypes";

export function appReducer(state, {type, payload}) {
    console.log(type, payload);
    switch (type) {
        case ActionTypes.SET_WEB_ID:
            return {
                ...state,
                webId: payload,
            }
        case ActionTypes.SET_LEDGERS_STATE:
            return {
                ...state,
                ledgersState: payload,
            }
        case ActionTypes.SET_ETHEREUM_ACCOUNT:
            return {
                ...state,
                ethereumAccount: payload,
            }
        default:
            return state;
    }
}
