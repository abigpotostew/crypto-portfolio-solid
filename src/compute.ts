import validCurrency from "./currencies";
import {Trade} from "./store";
import {Currency, MarketRates} from "./marketdata/provider";

export default function computeMarketRate(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates) {
    const totals = calcTotals(tradesList)

    let grandTotal = 0
    totals.forEach((value, currencyName, map) => {
        //get market rate
        const rate = marketRates.get(currencyName, destCurrency)
        grandTotal += value * rate
    })

    return grandTotal
}

function calcTotals(tradesList: Trade[]) {
    const totals = new Map<string, number>()

    const defaultFiat = "USD"
    for (let i = 0; i < tradesList.length; ++i) {
        const t = tradesList[i]
        const holding = t.amount
        const cost = t.cost
        const fee = t.fee
        const outCurrent = totals.get(defaultFiat) || 0
        totals.set(defaultFiat, outCurrent - cost.amount)
        const inCurrent = totals.get(holding.currency.symbol) || 0
        totals.set(holding.currency.symbol, inCurrent + holding.amount)
        if (fee.amount > 0) {
            let feeCoinResolved = defaultFiat
            const currFeeCoin = totals.get(feeCoinResolved) || 0
            totals.set(feeCoinResolved, currFeeCoin - fee.amount)
        }
    }
    return totals

}

export interface Compute {
    marketRateGrandTotal(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates): number

    marketRateTotal(tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, forCoin: Currency): number
}

export function NewCompute() {
    return {
        marketRateGrandTotal: (tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates) => {
            return computeMarketRate(tradesList, destCurrency, marketRates)
        },
        marketRateTotal: (tradesList: Trade[], destCurrency: Currency, marketRates: MarketRates, forCoin: Currency) => {
            const totals = calcTotals(tradesList)
            const rate = marketRates.get(forCoin.symbol, destCurrency)
            return rate * (totals.get(forCoin.symbol) || 0)
        }
    }
}