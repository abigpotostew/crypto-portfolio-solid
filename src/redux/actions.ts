import {ActionTypes} from './actionTypes'

export const setWebId = (webId: string) => ({
    type: ActionTypes.SET_WEB_ID,
    payload: webId
})