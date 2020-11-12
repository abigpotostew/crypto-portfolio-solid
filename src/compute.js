import {validCurrency} from "./currencies";

export default function computeMarketRate(tradesList, destCurrency, marketRates) {
    const totals = {}

    for (let i =0;i<tradesList.length;++i){
        const {outAmount, outCurrency, inAmount, inCurrency, fee, feeCoin} = tradesList[i]
        const outCurrent = totals[outCurrency] | 0
        const inCurrent = totals[inCurrency] | 0
        totals[outCurrency] = outCurrent - outAmount
        totals[inCurrency] = inCurrent + inAmount
        if (fee > 0) {
            let feeCoin = feeCoin
            if (!validCurrency(feeCoin)) {
                feeCoin = outCurrency
            }
            const currFeeCoin = totals[feeCoin] | 0
            totals[feeCoin] = currFeeCoin - fee
        }
    }

    let grandTotal = 0
    for (const currencyName in totals){
        const coinTotal = totals[currencyName]
        //get market rate
        const rate = marketRates.get(currencyName, destCurrency)
        grandTotal += coinTotal * rate
    }

    return grandTotal
}