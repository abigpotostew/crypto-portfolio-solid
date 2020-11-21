import superagent from "superagent";

//maybe separate provider from fetcher?
export interface Provider {
    getCurrencies(): Currencies;

    fetchCurrencies(callback: (err: Error | null) => void): void;

    fetchMarketRates(outCurrency: string, supportedCurrencies:Array<string>, callback: (err: Error | null, mr: MarketRates | null) => void): void;

    getLatestMarketRates(): MarketRates
}

export interface Currencies {
    getAll(): Currency[]

    //Get by id, name, or symbol
    get(id: string): Currency | null
}

export interface Currency {
    id: string
    symbol: string
    name: string
}

export interface MarketRates {
    get: (outC: string | Currency, inC: string | Currency) => number
    pending: ()=> boolean
}


export function coinGeckoProvider() {
    return new CoinGecko()
}

class CoinGecko implements Provider {
    //todo return fetched data
    latestMarketRates: MarketRates | null;
    idMap: Map<string, Currency>


    constructor() {
        this.idMap = new Map();
        this.latestMarketRates = null
    }

    fetchCurrencies(callback: (err: Error | null) => void): void {
        const listIds = 'https://api.coingecko.com/api/v3/coins/list'

        if (this.idMap && this.idMap.size > 0) {
            return callback(null)
        }

        superagent.get(listIds)
            .set("Accept", "application/json")
            .end((err, res) => {
                    // Calling the end function will send the request
                    if (err) {
                        return callback(err)
                    } else {
                        if (res.status === 200) {
                            //parse it

                            const idMap = new Map<string, Currency>()
                            for (var i = 0; i < res.body.length; ++i) {
                                const c = res.body[i]
                                idMap.set(res.body[i].symbol, {id: c.id, symbol: c.symbol, name: c.name})
                            }

                            this.idMap = idMap
                            callback(null)
                        } else {
                            const err = new Error(`Unexpected status ${res.status} from ${listIds}, body: ${res.body}`)
                            callback(err)
                        }
                    }
                }
            );
    }

    getCurrencies(): Currencies {
        //todo return internal state
        const idMap = this.idMap
        return {
            get(id: string): Currency | null {
                return idMap.get(id) || null
            },
            getAll(): Currency[] {
                return Array.from(idMap.values())
            }
        }
    }

    fetchMarketRates(outCurrency: string, supportedCurrencies:Array<string>, callback: (err: Error | null, mr: MarketRates | null) => void): void {
        const vsCurrency = outCurrency.toLowerCase()

        const currIds = new Array<string>()
        supportedCurrencies.forEach((c)=>{
            const v = this.idMap.get(c.toLowerCase())
            if (v) currIds.push( v.id)
        })

        // if (currIds.length==0){
        //     return // call back??
        // }

        // const all = this.getCurrencies().getAll().map((c) => c.id)
        const idsString = currIds.join(",")

        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${idsString}`
        superagent.get(url)
            .set("Accept", "application/json")
            .end((err, res) => {
                    // Calling the end function will send the request
                    if (err) {
                        return callback(err, null)
                    } else {
                        if (res.status === 200) {
                            //parse it

                            const forUsd = new Map<string, number>()
                            for (var i = 0; i < res.body.length; ++i) {
                                const market = res.body[i]
                                const avg = (market.high_24h + market.low_24h) / 2
                                forUsd.set(market.symbol.toLowerCase(), avg)
                            }
                            const rates = {
                                get: (outC: string | Currency, inC: string | Currency) => {
                                    let outCurrencyStr = (typeof outC === "string") ? outC : outC.symbol
                                    let inCurrencyStr = (typeof inC === "string") ? inC : inC.symbol
                                    if (outCurrencyStr === inCurrencyStr) return 1.0
                                    const out = forUsd.get(outCurrencyStr.toLowerCase())
                                    if (!out) {
                                        throw new Error(`unsupported currency: '${outCurrencyStr}'`)
                                    } else {
                                        return forUsd.get(outCurrencyStr.toLowerCase()) || 0.0
                                    }
                                },
                                pending:()=>false
                            }

                            return callback(null, rates)
                        } else {
                            const err = new Error(`Unexpected status ${res.status} from ${url}, body: ${res.body}`)
                            return callback(err, null)
                        }
                    }
                }
            )
    }

    getLatestMarketRates(): MarketRates {
        if (this.latestMarketRates === null) {
            return {
                get: (outC: string | Currency, inC: string | Currency) => {
                    let outCurrencyStr = (typeof outC === "string") ? outC : outC.symbol
                    let inCurrencyStr = (typeof inC === "string") ? inC : inC.symbol
                    if (outCurrencyStr === inCurrencyStr) return 1.0
                    return 0
                },
                pending:()=>true
            }
        }
        return this.latestMarketRates
    }
}
