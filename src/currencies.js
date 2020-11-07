
const cy = (tradeName, label)=>{ return {tradeName:tradeName, label:label}}
export default function allCurrencies(){
    return [
        cy("ETH", "Ethereum"),
        cy("LINK", "Chainlink"),
        cy("LTC","Litecoin"),
        cy("BTC","Bitcoin"),
        cy("USD","US Dollar")
    ]
}