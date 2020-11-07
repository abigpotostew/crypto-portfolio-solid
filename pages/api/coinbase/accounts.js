import getReq from "../../../src/async_request"

async function handler(req, res) {

    if (req.method !== 'GET') {
        res.statusCode = 404
        res.json({error: 'Not Found'})

    }

    console.log("req", new Date())

    const copyHeaders ={}
    for (var i in req.headers) {
        copyHeaders[i] = req.headers[i];
    }
    copyHeaders["Accept"]="application/json"
    copyHeaders["Authorization"]=req.headers["authorization"]

    const options = {
        host: process.env.COINBASE_HOST,
        path: '/v2/accounts',
        method: 'GET',
        headers:copyHeaders,
    }
    //send req to cb
    const tokenData = await getReq(options)
    const {response, error} = tokenData
    if (error) {
        console.error("error getting token", error)
        res.status(400).json({"error": error})
    } else {
        res.status(response.statusCode).json(response.body)
    }

}

export default handler
