const https = require('https')
//returns a promise
//var options = {
//         host: "api.coinbase.com",
//         path: '/oauth/token',
//         method: 'POST',
//         headers:{
//             "Content-Type": "application/x-www-form-urlencoded",
//             'Content-Length': formBody.length
//         }
//         //body:
//     };
export default async function getReq(opts) {
    return doReq(opts).then((res) => {
        return {response: res, error: null}
    }).catch((err) => {
        return {response: null, error: err}
    })
}

function doReq(options){

    return new Promise((resolve, reject) => {
        try {
            const callback = function (response) {
                var str = ''
                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    response.body=str
                    resolve(response)
                    return
                });
            }

            var req = https.request(options, callback);
            req.on('error', error => {
                reject(error)
            })
            if (options.body) {
                req.write(options.body);
            }
            req.end();
        }catch (err) {
            reject(err)
        }
    })
}
