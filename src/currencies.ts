import {Currency, ValidCurrency} from "./marketdata/provider";

const cy = (tradeName: string, label: string): Currency => {
    return new ValidCurrency(tradeName, tradeName, label)
}

export const USD = cy("USD", "US Dollar")

export default function validCurrency(name: string): boolean {
    return alwaysIncludeCoins.findIndex((c) => c.hasSymbol(name)) !== -1
}

const currencies = [USD]


export const alwaysIncludeCoins = [
    USD,
    cy("btc", "Bitcoin"),
    cy("eth", "Ethereum"),
    cy("ltc", "Litecoin"),
    cy("prq", "Parsiq"),
    cy("ada", "Cardano")]