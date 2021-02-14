import { Trade } from "../src/store";
import TextField from '@material-ui/core/TextField';
import React from "react"
import { Compute } from "../src/compute";
import { UncheckedCurrency } from "../src/marketdata/provider";
import Button from '@material-ui/core/Button';


interface HitRatioProps {
    // handleSyncTrades: ((t: Trade[]) => void)
    trades: Trade[]
    compute: Compute
}

export default function HitRatio({ trades, compute }: HitRatioProps) {
    const [maker, setMaker] = React.useState("DAI")
    const [taker, setTaker] = React.useState("APY")
    const [hitRatio, setHitRatio] = React.useState("-")

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value
        if (e.target.id === "hitRatioMaker") {
            setMaker(value)
        } else if (e.target.id === "hitRatioTaker") {
            setTaker(value)
        }

    }
    const onClick = () => {
        setHitRatio(compute.hitRatio(trades, new UncheckedCurrency(maker), new UncheckedCurrency(taker)).toString())
    }
    return (
        <span>
            <TextField id="hitRatioMaker" type="text" onChange={onChange} defaultValue={"DAI"} /> -
            <TextField id="hitRatioTaker" type="text" onChange={onChange} defaultValue={"APY"} />
            <Button variant="contained" onClick={onClick}>HitRatio</Button>

            <span>={hitRatio}</span>
        </span>
    )
}