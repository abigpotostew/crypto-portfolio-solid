import validCurrency, {USD} from "./currencies";
import {Trade} from "./store";
import {Currencies, Currency, MarketRates} from "./marketdata/provider";

export default function computeMarketRate(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, currencies: Currencies) {
    const totals = calcTotals(tradesList, currencies)

    let grandTotal = 0
    totals.forEach((value, currency, map) => {
        //get market rate
        const rate = marketRates.get(destCurrency, currency)
        grandTotal += value * rate
    })

    return grandTotal
}

function calcTotals(tradesList: Trade[], currencies: Currencies) {
    const totals = new Map<string, number>()

    // const defaultFiat = USD
    for (let i = 0; i < tradesList.length; ++i) {
        const t = tradesList[i]
        if (currencies.get(t.amount.currency) === null) {
            throw new Error("invalid currency " + t.amount.currency.symbol)
        }
        const holding = t.amount
        const heldCurrency: Currency = currencies.get(t.amount.currency) || t.amount.currency
        const cost = t.cost
        const fee = t.fee
        const outCurrent = totals.get(cost.currency.symbol.toLowerCase()) || 0 //todo support non fiat costs
        totals.set(cost.currency.symbol.toLowerCase(), outCurrent - cost.amount)
        const inCurrent = totals.get(heldCurrency.symbol.toLowerCase()) || 0
        totals.set(heldCurrency.symbol.toLowerCase(), inCurrent + holding.amount)
        if (fee.amount > 0) {
            let feeCoinResolved = fee.currency
            const currFeeCoin = totals.get(feeCoinResolved.symbol.toLowerCase()) || 0
            totals.set(feeCoinResolved.symbol.toLowerCase(), currFeeCoin - fee.amount)
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
            return rate * (totals.get(forCoin.symbol) || 0)
        },
        holdings: (tradesList: Trade[], fiat: Currency, marketRates: MarketRates, currencyProvider: Currencies) => {
            const totals = calcTotals(tradesList, currencyProvider)
            const out = new Array<MarketHolding>()
            totals.forEach((total, currency) => {
                out.push({
                    currency: currencyProvider.get(currency)!,
                    totalHoldings: total,
                    totalMarketHoldings: marketRates.get(currency, fiat) * total
                })
            })
            return out
        }
    }
}