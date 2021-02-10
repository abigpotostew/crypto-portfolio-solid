import {useState, useEffect} from "react"
import React from "react"
import Loading from "./loading/loading";

export default function MarketRatesTicker({rates}) {
    // const [rates, setRates] = useState(initialRates)

    // useEffect(() => {
    //     // Update the document title using the browser API
    //
    // });

    // assume USD
    return (

        (!rates) ? <Loading/> : <p>${rates.get("ETH", "USD")} / ETH</p>

    )

}