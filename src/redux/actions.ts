import {ActionTypes} from './actionTypes'

export const setWebId = (webId: string | null) => ({
    type: ActionTypes.SET_WEB_ID,
    payload: webId
})