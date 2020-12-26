import Link from 'next/link'
import {Currency} from "../../src/marketdata/provider";
import React from "react"


interface TickerSymbolLinkProps {
    currency: Currency
}

export default function TickerSymbolLink({currency}: TickerSymbolLinkProps) {

    return (
        <Link href={`/coin/${encodeURIComponent(currency.symbol)}`}>{currency.symbol}</Link>
    )
}