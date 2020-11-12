import superagent from "superagent";

export const coinBase = marketRatesCoinbase

export function initialMarketRates(){
    return {get:()=>0.0, data:{}}
}
// merge new rates for out currency into existing reates. returns a copy
export function mergeRates(outCurrency, newRates, existingRates){
    const newData = Object.assign({}, existingRates.data);
    newData[outCurrency] = newRates.data[outCurrency]
    const copy = Object.assign({}, existingRates);
    copy.data = newData
    return copy
}

//callback gets {err,rates}
function marketRatesCoinbase(outCurrency, callback){
    const url = process.env.NEXT_PUBLIC_COINBASE_API_URL+'/v2/exchange-rates?currency='+outCurrency

    superagent.get(url)
        .set("Accept", "application/json")
        .end((err, res) => {
                // Calling the end function will send the request
                if (err) {
                    return callback(err)
                } else {
                    if (res.statusCode === 200) {
                        //parse it
                        const parsed=parseCoinbaseRates(outCurrency, res.body)
                        return callback({err:undefined, rates:parsed})
                    } else {
                        const err = `Unexpected status ${res.statusCode} from ${url}, body: ${res.body}`
                        callback({err:err, rates:undefined})
                    }
                }
            }
        );
}

function parseCoinbaseRates(outCurrency, {data: {rates}}){
    // const parsed = JSON.parse(body)
    // const {data: {rates}} = parsed

    //only supports USD right now
    return {
        get:function(outCurrency, inCurrency) {
            const rates = this.data[inCurrency]
            if (outCurrency===inCurrency) return 1.0
            if (!rates){
                throw new Error("unsupported exchange rate: "+ outCurrency+ " to "+inCurrency)
            }
            return 1/rates[outCurrency]
            // return 1/rates[inCurrency]
        },
        data:{[outCurrency]:rates}
    }
}