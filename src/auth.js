import {getCookie, deleteCookie} from "./cookie";

const coinbaseCookieName = "coinbaseToken";

export function logout(){
    deleteCookie(coinbaseCookieName)
}

export function loggedIn() {
    return getCookie(coinbaseCookieName)
}

export async function authenticated(){
    const milliseconds = 100;
    while (!loggedIn()) {
        await new Promise((resolve) => window.setTimeout(() => resolve('TIMER'), milliseconds));
    }
}