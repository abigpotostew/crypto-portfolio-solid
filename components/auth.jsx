// import {OAuth2PopupFlow, OAuth2PopupFlowOptions} from 'oauth2-popup-flow';
import React, {useEffect, useState} from 'react';
import {authenticated, loggedIn, logout} from "../src/auth"
import {getCookie} from "../src/cookie";

const encodeObjectToUri= function (obj) {
    return Object.keys(obj)
        .map((key) => ({ key, value: obj[key] }))
        .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

// https://www.coinbase.com/oauth/authorize
export default function OAuthButton({providerURL, clientId,redirectUri, onLoggedIn, ...props}) {

    const [loggedInBool, setLoggedInBool] = useState(loggedIn());

    const opts = {
        authorizationUri: 'https://www.coinbase.com/oauth/authorize',
        clientId: '1eec0d529c12bf40b3be16a4f8ceaf6ddbc50cb2ecb2dbfff98e29e3c5922e40',
        redirectUri: 'http://localhost:3000/redirect',
        scope: 'wallet:user:read,wallet:accounts:read',
        responseType: 'code',
        // accessTokenResponseKey: 'id_token',
        additionalAuthorizationParameters: {
            target: "_blank"
        }
    }

    async function loginHandler() {
        // opens the login popup
        // if the user is already logged in, it won't open the popup
        //url
        // const popup = window.open(`${this.authorizationUri}?${OAuth2PopupFlow.encodeObjectToUri(Object.assign({ client_id: this.clientId, response_type: this.responseType, redirect_uri: this.redirectUri, scope: this.scope }, additionalParams))}`);
        const url = `${opts.authorizationUri}?${encodeObjectToUri(Object.assign({
            client_id: opts.clientId,
            response_type: opts.responseType,
            redirect_uri: opts.redirectUri,
            scope: opts.scope
        }, opts.additionalAuthorizationParameters))}`
        const popup = window.open(url);
        if (!popup)
            console.log('POPUP_FAILED');

        await authenticated()
        setLoggedInBool(true)

        console.log("yo it's logged in")
        popup.close();


    }

    function logoutHandler() {
        console.log("logout")
        logout()
        setLoggedInBool(false)
    }

    useEffect(() => {
        setLoggedInBool(loggedIn())
        if(loggedIn()){
            onLoggedIn(loggedIn())
        }
    })

    return loggedInBool ? (
        <button onClick={() => logoutHandler()}>Logout Coinbase</button>) : (
        <button onClick={() => loginHandler()}>Login Coinbase</button>
    )
}

