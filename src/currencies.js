export const USD = "USD"
export const CoinLTC = "LTC"
export const CoinETH = "ETH"
export const CoinLINK = "LINK"
export const CoinBTC = "BTC"
export const CoinPRQ = "PRQ"
const cy = (tradeName, label)=>{ return {tradeName:tradeName, label:label}}
export default function allCurrencies() {
    return [
        //todo precision
        cy(CoinETH, "Ethereum"),
        cy(CoinLINK, "Chainlink"),
        cy(CoinLTC, "Litecoin"),
        cy(CoinBTC, "Bitcoin"),
        cy(USD, "US Dollar")
    ]
}

export function allCoins() {
    return [
        //todo precision
        cy(CoinETH, "Ethereum"),
        cy(CoinLINK, "Chainlink"),
        cy(CoinLTC, "Litecoin"),
        cy(CoinBTC, "Bitcoin"),
        cy(CoinPRQ, "Parsiq"),
    ]
}

export function validCurrency(tradeName) {
    const all = allCurrencies()
    for (let i = 0; i < all.length; ++i) {
        if (all[i].tradeName === tradeName) {
            return true
        }
    }
    return false
}