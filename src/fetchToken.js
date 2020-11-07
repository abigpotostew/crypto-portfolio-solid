import superagent from "superagent";

// for coin base
export default function fetchToken() {
    if (typeof window !== "undefined") {
        //acquire the token
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        superagent.get('/api/token/coinbase?code=' + code)
            .end((err, res) => {
                // Calling the end function will send the request
                if (err) {
                    console.error(err)
                } else {
                    if (res.statusCode === 200) {
                        const token = "Bearer " + res.body.access_token;
                        document.cookie = "coinbaseToken=" + token + "; Max-Age=" + res.body.expires_in
                        window.close()
                    } else {
                        console.error(res.statusCode)
                        console.error(res.body)
                    }
                }
            }
        );
    }
}