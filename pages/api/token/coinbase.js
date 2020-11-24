const https = require('https')

async function handler(req, res) {

    if (req.method !== 'GET') {
        res.statusCode = 404
        res.json({error: 'Not Found'})

    }

    //get code qp
    const code = req.query.code

    console.log("req", new Date())

    //send req to cb
    const tokenData = await getToken(code)
    const {data, error} = tokenData
    if (error) {
        console.error("error getting token", error)
        res.status(400).json({"error": error})
    } else {
        res.status(200).json(data)
    }

}

export default handler

//returns a promise
async function getToken(code) {
    return getTokenAsync(code).then((data) => {
        return {data: data, error: null}
    }).catch((err) => {
        return {data: null, error: err}
    })
}


/*
returns promise of this json object
{
    "access_token": "6915ab99857fec1e6f2f6c078583756d0c09d7207750baea28dfbc3d4b0f2cb80",
    "token_type": "bearer",
    "expires_in": 7200,
    "refresh_token": "73a3431906de603504c1e8437709b0f47d07bed11981fe61b522278a81a9232b7",
    "scope": "wallet:user:read wallet:accounts:read"
}
 */
function getTokenAsync(code) {

    //todo
    var details = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': '1eec0d529c12bf40b3be16a4f8ceaf6ddbc50cb2ecb2dbfff98e29e3c5922e40',
        'redirect_uri': "http://localhost:3000/redirect",
        'client_secret': process.env.COINBASE_SECRET,
        'Accept-Language': "en"
    };

    var formBody = [];
    for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");


    var options = {
        host: "api.coinbase.com",
        path: '/oauth/token',
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            'Content-Length': formBody.length
        }
    };

    return new Promise((resolve, reject) => {
        try {
            const callback = function (response) {

                var str = ''
                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    console.log("END", response.statusCode, str);

                    if (response.statusCode !== 200) {
                        reject('Invalid status code <' + response.statusCode + '>');
                        return
                    }
                    resolve(JSON.parse(str))

                });


            }

            var req = https.request(options, callback);
            req.on('error', error => {
                console.error("on error, reject", error)
                reject(error)
            })
            //This is the data we are posting, it needs to be a string or a buffer
            req.write(formBody);
            req.end();
        } catch (err) {
            reject(err)
        }
    })
}