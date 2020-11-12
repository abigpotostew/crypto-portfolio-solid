
const cy = (tradeName, label)=>{ return {tradeName:tradeName, label:label}}
export default function allCurrencies() {
    return [
        //todo precision
        cy("ETH", "Ethereum"),
        cy("LINK", "Chainlink"),
        cy("LTC", "Litecoin"),
        cy("BTC", "Bitcoin"),
        cy("USD", "US Dollar")
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