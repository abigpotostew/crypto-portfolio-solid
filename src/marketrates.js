import superagent from "superagent";

export const coinBase = marketRatesCoinbase

export function initialMarketRates() {
    return {
        get: (outC, inC) => {
            if (outC === inC) {
                return 1
            } else return 0
        }, data: {}
    }
}

export function staticMarketRates(doubleMapToRate) {
    return {
        get: (outC, inC) => {
            if (outC === inC) {
                return 1
            }

            const outMap = doubleMapToRate[outC]
            if (outMap){
                return outMap[inC] | 0
            }
            return 0
        },
        // data: doubleMapToRate
    }
}

// merge new rates for out currency into existing reates. returns a copy
export function mergeRates(outCurrency, newRates, existingRates) {
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

// with coinbase, look up the reverse rate (out -> in) and invert rate,
// example if eth is 400 per usd, then fetch coinbase usd->eth which is
// 0.0025 then return inverse 1/0.0025 = 400
export function parseCoinbaseRates(outCurrency, {data: {rates}}){
    return {
        get:function(outCurrency, inCurrency) {
            const rates = this.data[inCurrency]
            if (outCurrency===inCurrency) return 1.0
            if (!rates){
                throw new Error("unsupported exchange rate: "+ outCurrency+ " to "+inCurrency)
            }
            return 1/rates[outCurrency]
        },
        data:{[outCurrency]:rates}
    }
}