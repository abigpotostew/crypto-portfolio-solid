import validCurrency, {USD} from "./currencies";
import {Trade} from "./store";
import {Currencies, Currency, MarketRates} from "./marketdata/provider";

export default function computeMarketRate(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, currencies: Currencies) {
    const totals = calcTotals(tradesList, currencies)

    let grandTotal = 0
    totals.forEach((value, currencyName, map) => {
        //get market rate
        const rate = marketRates.get(currencyName, destCurrency)
        grandTotal += value * rate
    })

    return grandTotal
}

function calcTotals(tradesList: Trade[], currencies: Currencies) {
    const totals = new Map<Currency, number>()

    const defaultFiat = USD
    for (let i = 0; i < tradesList.length; ++i) {
        const t = tradesList[i]
        if (currencies.get(t.amount.currency) === null) {
            throw new Error("invalid currency " + t.amount.currency.symbol)
        }
        const holding = t.amount
        const heldCurrency: Currency | null = currencies.get(t.amount.currency) || t.amount.currency
        const cost = t.cost
        const fee = t.fee
        const outCurrent = totals.get(defaultFiat) || 0
        totals.set(defaultFiat, outCurrent - cost.amount)
        const inCurrent = totals.get(heldCurrency) || 0
        totals.set(heldCurrency, inCurrent + holding.amount)
        if (fee.amount > 0) {
            let feeCoinResolved = defaultFiat
            const currFeeCoin = totals.get(feeCoinResolved) || 0
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
}

export function NewCompute() {
    return {
        marketRateGrandTotal: (tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, currencyProvider: Currencies) => {
            return computeMarketRate(tradesList, destCurrency, marketRates, currencyProvider)
        },
        marketRateTotal: (tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, forCoin: Currency, currencyProvider: Currencies) => {
            const totals = calcTotals(tradesList, currencyProvider)
            const rate = marketRates.get(forCoin, destCurrency)
            return rate * (totals.get(forCoin) || 0)
        },
        holdings: (tradesList: Trade[], fiat: Currency, marketRates: MarketRates, currencyProvider: Currencies) => {
            const totals = calcTotals(tradesList, currencyProvider)
            const out = new Array<MarketHolding>()
            totals.forEach((total, currency) => {
                out.push({
                    currency: currencyProvider.get(currency)!,
                    totalHoldings: total,
                    totalMarketHoldings: marketRates.get(fiat, currency) * total
                })
            })
            return out
        }
    }
}