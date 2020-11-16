export function appReducer(state, { type, payload }) {
    console.log(type, payload);
    switch (type) {
        case 'set_web_id':
            return {
                ...state,
                webId: payload,
            }
        case 'set_ledgers_state':
            return {
                ...state,
                ledgersState: payload,
            }
        default:
            return state;
    }
}
