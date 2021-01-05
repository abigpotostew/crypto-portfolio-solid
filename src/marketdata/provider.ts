import superagent from "superagent";

//maybe separate provider from fetcher?
export interface Provider {
    getCurrencies(): Currencies;

    fetchCurrencies(callback: (err: Error | null) => void): void;

    fetchMarketRates(outCurrency: string, supportedCurrencies: Array<Currency>, callback: (err: (Error | null), mr: (MarketRates | null)) => void): void;

    getLatestMarketRates(): MarketRates

    asyncFetchCurrencies(): Promise<Error | null>

}

export interface Currencies {
    getAll(): Currency[]

    //Get by id, name, or symbol
    get(id: string | Currency): Currency | null
}

export function emptyCurrencies(): Currencies {
    return {
        get(id: string | Currency): Currency | null {
            return null;
        }, getAll(): Currency[] {
            return [];
        }
    }
}

export class CurrenciesFromArray implements Currencies {
    cs: Currency[]

    constructor(cs: Currency[]) {
        this.cs = cs;
    }

    get(id: string | Currency): Currency | null {
        for (let entry of this.cs) {
            if (typeof id === "string") {
                if (entry.symbol.toLowerCase() === id.toLowerCase()) {
                    return entry
                }
            } else {
                if (
                    id.symbol === (entry.symbol.toLowerCase()) ||
                    id.symbol === (entry.symbol) ||
                    id.id === (entry.id.toLowerCase()) ||
                    id.id === (entry.id)) {
                    return entry;
                }
            }
        }
        return null
    }

    getAll(): Currency[] {
        return Array.from(this.cs.values())
    }

}

export interface Currency {
    id: string
    symbol: string
    name: string

    hasSymbol(symbol: string): boolean
}

export class ValidCurrency implements Currency {
    id: string
    symbol: string
    name: string

    constructor(_id: string, _symbol: string, _name: string) {
        this.id = _id;
        this.symbol = _symbol;
        this.name = _name;
    }

    hasSymbol(symbol: string): boolean {
        return symbol.toLowerCase() === this.id.toLowerCase()
    }
}

export class UncheckedCurrency implements Currency {
    id: string
    symbol: string
    name: string

    constructor(id: string) {
        this.id = id;
        this.symbol = id
        this.name = id
    }

    hasSymbol(symbol: string): boolean {
        return symbol.toLowerCase() === this.id.toLowerCase()
    }
}

export interface MarketRates {
    get: (outC: string | Currency, inC: string | Currency) => number
    pending: () => boolean
}


export function coinGeckoProvider() {
    return new CoinGecko()
}

class CoinGecko implements Provider {
    //todo return fetched data
    latestMarketRates: MarketRates | null;
    //lowercase symbol
    symbolMap: Map<string, Currency>


    constructor() {
        this.symbolMap = new Map();

        this.latestMarketRates = null
    }

    async asyncFetchCurrencies(): Promise<Error | null> {
        const listIds = 'https://api.coingecko.com/api/v3/coins/list'
        if (this.symbolMap && this.symbolMap.size > 0) {
            return null
        }
        const res = await superagent.get(listIds)
            .set("Accept", "application/json")

        if (res.error) {
            return res.error
        }


        if (res.status === 200) {
            //parse it

            const symbolMap = new Map<string, Currency>()
            for (var i = 0; i < res.body.length; ++i) {
                const c = res.body[i]
                symbolMap.set(res.body[i].symbol, new ValidCurrency(c.id, c.symbol, c.name))
            }

            this.symbolMap = symbolMap
            return null
        } else {
            const err = new Error(`Unexpected status ${res.status} from ${listIds}, body: ${res.body}`)
            return err
        }
    }

    fetchCurrencies(callback: (err: Error | null) => void): void {
        const listIds = 'https://api.coingecko.com/api/v3/coins/list'

        if (this.symbolMap && this.symbolMap.size > 0) {
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

                            const symbolMap = new Map<string, Currency>()
                            for (var i = 0; i < res.body.length; ++i) {
                                const c = res.body[i]
                                symbolMap.set(res.body[i].symbol, new ValidCurrency(c.id, c.symbol, c.name))
                            }

                            this.symbolMap = symbolMap
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
        const idMap = this.symbolMap
        return {
            // @ts-ignore
            idMap: idMap,

            get(symbol: string | Currency): Currency | null {
                if (typeof symbol === "string") {
                    return idMap.get(symbol.toLowerCase()) || idMap.get(symbol) || null
                } else {
                    return idMap.get(symbol.symbol.toLowerCase()) ||
                        idMap.get(symbol.symbol) ||
                        idMap.get(symbol.id.toLowerCase()) ||
                        idMap.get(symbol.id) ||
                        null;
                }
            },
            getAll(): Currency[] {
                return Array.from(idMap.values())
            }
        }
    }

    fetchMarketRates(outCurrency: string, supportedCurrencies: Array<Currency>, callback: (err: (Error | null), mr: (MarketRates | null)) => void): void {
        const vsCurrency = outCurrency.toLowerCase()

        const currIds = new Array<string>()
        supportedCurrencies.forEach((c) => {
            const v = this.symbolMap.get(c.symbol.toLowerCase())
            if (v) currIds.push(v.id)
        })


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
                                // const avg = (market.high_24h + market.low_24h) / 2
                                const high = market.high_24h
                                forUsd.set(market.symbol.toLowerCase(), high)
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
                                        return forUsd.get(inCurrencyStr.toLowerCase()) || 0.0
                                    }
                                },
                                pending: () => false
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
                pending: () => true
            }
        }
        return this.latestMarketRates
    }
}
