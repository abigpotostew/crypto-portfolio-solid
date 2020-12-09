import validCurrency from "./currencies";

export default function computeMarketRate(tradesList, destCurrency, marketRates) {
    const totals = {}

    const defaultFiat = "USD"
    for (let i = 0; i < tradesList.length; ++i) {
        const t = tradesList[i]
        const currency = t.currency
        const amount = t.amount
        const cost = t.cost
        const fee = t.fee
        const outCurrent = totals[defaultFiat] || 0
        totals[defaultFiat] = outCurrent - cost
        const inCurrent = totals[currency.symbol] || 0
        totals[currency.symbol] = inCurrent + amount
        if (fee > 0) {
            let feeCoinResolved = defaultFiat
            const currFeeCoin = totals[feeCoinResolved] || 0
            totals[feeCoinResolved] = currFeeCoin - fee
        }
    }

    let grandTotal = 0
    for (const currencyName in totals) {
        const coinTotal = totals[currencyName]
        //get market rate
        const rate = marketRates.get(currencyName, destCurrency)
        grandTotal += coinTotal * rate
    }

    return grandTotal
}