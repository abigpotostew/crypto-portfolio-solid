import validCurrency, { USD } from "./currencies";
import { Trade } from "./store";
import { Currencies, Currency, MarketRates } from "./marketdata/provider";

export default function computeMarketRate(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, currencies: Currencies) {
    const totals = calcTotals(tradesList, currencies)

    let grandTotal = 0
    totals.totals.forEach((value, currency, map) => {
        //get market rate
        const rate = marketRates.get(currency, destCurrency)
        grandTotal += value * rate
    })

    return grandTotal
}

class Total {
    totals: Map<string, number>

    constructor() {
        this.totals = new Map<string, number>();
    }

    get(currency: Currency | string): number {
        let symbol: string;
        if (typeof currency == "string") {
            symbol = currency.toLowerCase();
        } else {
            symbol = currency.symbol.toLowerCase()
        }
        return this.totals.get(symbol) || 0
    }

    set(currency: Currency, v: number) {
        this.totals.set(currency.symbol.toLowerCase(), v)
    }

}

function calcTotals(tradesList: Trade[], currencies: Currencies): Total {
    const totals = new Total()

    // const defaultFiat = USD
    for (let i = 0; i < tradesList.length; ++i) {
        const t = tradesList[i]
        if (currencies.get(t.amount.currency) === null) {
            console.log("invalid currency " + t.amount.currency.symbol)
            continue;
        }
        const holding = t.amount
        const heldCurrency: Currency = currencies.get(t.amount.currency) || t.amount.currency
        const cost = t.cost
        const fee = t.fee
        const outCurrent = totals.get(cost.currency.symbol) //todo support non fiat costs
        totals.set(cost.currency, outCurrent - cost.amount)
        const inCurrent = totals.get(heldCurrency.symbol.toLowerCase()) || 0
        totals.set(heldCurrency, inCurrent + holding.amount)
        if (fee.amount > 0) {
            let feeCoinResolved = fee.currency
            const currFeeCoin = totals.get(feeCoinResolved.symbol.toLowerCase()) || 0
            totals.set(feeCoinResolved, currFeeCoin - fee.amount)
        }
    }
    return totals
}

export interface MarketHolding {
    currency: Currency
    totalHoldings: number
    totalMarketHoldings: number
}

export interface Compute {
    marketRateGrandTotal(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, currencyProvider: Currencies): number

    marketRateTotal(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, forCoin: Currency, currencyProvider: Currencies): number

    holdings(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, currencyProvider: Currencies): MarketHolding[]

    hitRatio(tradesList: Trade[], maker: Currency, taker: Currency): number
}

interface Hit {
    entry: Trade
    exit: Trade
    profit: number
}

export function NewCompute(): Compute {
    return {
        marketRateGrandTotal: (tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, currencyProvider: Currencies) => {
            return computeMarketRate(tradesList, destCurrency, marketRates, currencyProvider)
        },
        marketRateTotal: (tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, forCoin: Currency, currencyProvider: Currencies) => {
            const totals = calcTotals(tradesList, currencyProvider)
            const rate = marketRates.get(forCoin, destCurrency)
            return rate * (totals.get(forCoin.symbol))
        },
        holdings: (tradesList: Trade[], fiat: Currency, marketRates: MarketRates, currencyProvider: Currencies) => {
            const totals = calcTotals(tradesList, currencyProvider)
            const out = new Array<MarketHolding>()
            totals.totals.forEach((total, currency) => {
                out.push({
                    currency: currencyProvider.get(currency)!,
                    totalHoldings: total,
                    totalMarketHoldings: marketRates.get(currency, fiat) * total
                })
            })
            return out
        },
        hitRatio: (tradesList: Trade[], maker: Currency, taker: Currency): number => {
            const tradesListCopy = [...tradesList]
            tradesListCopy.sort((a, b) => {
                return -1 * (b.dateCreated - a.dateCreated)
                // const aS = a.dateCreated.
                // const bS = b.dateCreated.toDateString()
                // if (aS < bS) return -1
                // if (aS > bS) return 1
                // return 0
            })
            const calcProfit = (entry: Trade, exit: Trade): number => {
                return exit.amount.amount - entry.cost.amount
            }
            const hits: Hit[] = []
            let profitableHitCount = 0
            let openHit: Trade | undefined = undefined;
            for (let i = 0; i < tradesListCopy.length; i++) {
                const t = tradesListCopy[i]
                if (openHit) {
                    if (t.amount.currency.hasSymbol(maker.symbol) && t.cost.currency.hasSymbol(taker.symbol)) {
                        //exit
                        const hit: Hit = {
                            entry: openHit,
                            exit: t,
                            profit: calcProfit(openHit, t)
                        }
                        hits.push(hit)
                        if (hit.profit > 0) {
                            profitableHitCount++;
                        }
                    }
                } else {
                    const hasMaker = t.cost.currency.hasSymbol(maker.symbol)
                    const hasTaker = t.amount.currency.hasSymbol(taker.symbol)
                    if (hasMaker || hasTaker) {
                        const a = 1
                    }
                    if (hasMaker && hasTaker) {
                        //entry
                        openHit = t
                    }
                }
            }
            if (hits.length === 0) {
                return 0
            }
            return profitableHitCount / hits.length;
        }
    }
}