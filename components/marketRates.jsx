import {useState,useEffect} from "react"
import React from "react"

export default function MarketRatesTicker({rates}) {
    // const [rates, setRates] = useState(initialRates)

    // useEffect(() => {
    //     // Update the document title using the browser API
    //
    // });

    // assume USD
    return (
        <p>${rates.get("ETH","USD")} / ETH</p>
    )
}