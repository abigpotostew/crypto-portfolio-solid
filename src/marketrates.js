import superagent from "superagent";
import {allCoins} from "./currencies";

export const coinBase = marketRatesCoinbase
export const coinGecko = marketRatesCoinGecko

export function initialMarketRates() {
    return parseCoinbaseRates({})
}

// merge new rates for out currency into existing reates. returns a copy
export function mergeRates(outCurrency, newRates, existingRates) {
    const newData = Object.assign({}, existingRates.data);
    newData[outCurrency] = newRates.data[outCurrency]
    const copy = Object.assign({}, newRates);
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

                        const parsed = parseCoinbaseRates({[outCurrency]: res.body.data.rates})
                        //parseCoinbaseRates(outCurrency, res.body)
                        return callback({err: undefined, rates: parsed})
                    } else {
                        const err = `Unexpected status ${res.statusCode} from ${url}, body: ${res.body}`
                        callback({err:err, rates:undefined})
                    }
                }
            }
        );
}

export function parseCoinbaseRates( data) {
    return {
        get: queryRates,
        data: data
    }
}

// with coinbase, look up the reverse rate (out -> in) and invert rate,
// example if eth is 400 per usd, then fetch coinbase usd->eth which is
// 0.0025 then return inverse 1/0.0025 = 400
const queryRates = function (outCurrency, inCurrency) {
    if (outCurrency === inCurrency) return 1.0
    const rates = this.data[inCurrency]
    if (!rates) {
        console.log(new Error("unsupported exchange rate: " + outCurrency + " to " + inCurrency))
        // throw
        return 0
    }
    return 1 / rates[outCurrency]
}

//callback gets {err,rates}
function marketRatesCoinGecko(outCurrency, callback, existing) {
    //parsiq,ethereum,bitcoin,chainlink,litecoin

    getCoinGeckoIds(({err, idMap}) => {
        const ids = allCoins()
            .map((c) => c.tradeName)
            .map((c) => c.toLowerCase())
            .map((c) => idMap[c])

        const vsCurrency = outCurrency.toLowerCase()
        const idsString = ids.join(",")
        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${idsString}`
        superagent.get(url)
            .set("Accept", "application/json")
            .end((err, res) => {
                    // Calling the end function will send the request
                    if (err) {
                        return callback(err)
                    } else {
                        if (res.statusCode === 200) {
                            //parse it

                            const forUsd = new Map()
                            for(var i=0;i<res.body.length;++i){
                                const market =res.body[i]
                                const avg = (market.high_24h + market.low_24h)/2
                                forUsd[market.symbol] = avg
                            }

                           const rates= {
                                get:(outC, inC)=>{
                                    if (outC===inC) return 1.0
                                    return forUsd[outC.toLowerCase()]
                                },
                                idMap:idMap
                            }

                            return callback({err: undefined, rates: rates})
                        } else {
                            const err = `Unexpected status ${res.statusCode} from ${url}, body: ${res.body}`
                            return callback({err: err, rates: undefined})
                        }
                    }
                }
            );

    }, existing)
}

function getCoinGeckoIds(callback, existing) {
    const listIds = 'https://api.coingecko.com/api/v3/coins/list'

    if (existing && existing.idMap) {
        return callback({err: undefined, idMap: existing.idMap})
    }

    superagent.get(listIds)
        .set("Accept", "application/json")
        .end((err, res) => {
                // Calling the end function will send the request
                if (err) {
                    return callback(err)
                } else {
                    if (res.statusCode === 200) {
                        //parse it

                        const idMap = new Map()
                        for (var i = 0; i < res.body.length; ++i) {
                            idMap[res.body[i].symbol] = res.body[i].id
                        }

                        callback({err: undefined, idMap: idMap})
                    } else {
                        const err = `Unexpected status ${res.statusCode} from ${url}, body: ${res.body}`
                        callback({err: err, idMap: undefined})
                    }
                }
            }
        );
}

// function initialMarketRatesCoinGecko(outCurrency, callback) {
//
//     getCoinGeckoIds(({err, idMap}) => {
//         if (err) {
//             throw new Error(err)
//         }
//
//     })
// }