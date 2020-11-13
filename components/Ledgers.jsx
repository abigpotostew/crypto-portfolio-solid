import {coinBase, initialMarketRates, mergeRates} from "../src/marketrates";
import {createLedger, useLedgerContainerUri, ttlFiles, deleteLedger} from "../src/store";
import {
    useWebId, useAuthentication,
    useMyProfile, useProfile,
    useEnsured, useContainer,
    useThing
} from 'swrlit'
import {asUrl} from "@itme/solid-client"
import MarketRatesTicker from "./marketRates";
import Ledger from "./ledger";
import React from "react"

import Button from "@material-ui/core/Button"

function LedgerManage({ledger}){

    const handleDelete = () =>{
        deleteLedger(ledger)
    }
    return (
        <div>
            <p>{asUrl(ledger)}</p>
            <Button onClick={handleDelete}>Delete Ledger</Button>
        </div>
    )
}


export default function Ledgers(){

    const myWebId = useWebId()

    const [isTickerActive, setIsTickerActive] = React.useState(true);
    const [marketRates, setMarketRates] = React.useState(initialMarketRates())

    // start market rates ticker
    React.useEffect(() => {

        let interval = null;
        if (isTickerActive) {
            interval = setInterval(() => {
                //get market rates
                getMarketRates()
            }, 10000); ///todo make a call out in an effect
        } else if (!isTickerActive) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTickerActive]);

    const getMarketRates = ()=>{
        const merge = (outCurrency, newRates, existingRates) => {
            const newMarketRates = mergeRates(outCurrency, newRates, existingRates)
            setMarketRates(newMarketRates)
            // setTotalValue(computeMarketRate(data, "USD", newMarketRates))
        }

        coinBase("USD", ({err, rates}) => {
            if (err) {
                console.error(err)
                console.error("stopping market rates ticker")
                setIsTickerActive(false)
            } else {
                merge("USD", rates, marketRates)
            }
        })
    }
    // initial market rates query
    React.useEffect(()=>{
        // do stuff here...
        getMarketRates()
    }, []) // <-- empty dependency array


    const ledgerContainerUri = useLedgerContainerUri(myWebId, 'private')
    const { resources: ledgers, mutate: mutateLedgers } = useContainer(ledgerContainerUri)

    const createLedgerHandler = async ({ name = "Cryptocurrency Ledger"}) => {
        await createLedger(name, ledgerContainerUri, mutateLedgers)
    }

    return (
        <div>
            <Ledger marketRates={marketRates}/>
            <MarketRatesTicker rates={marketRates}/>

            {ledgers && <Button variant="contained" color="primary" onClick={createLedgerHandler}>
                Create Ledger
            </Button>}

            <p> you have {ledgers && ledgers.length || 0} ledgers</p>
            <div className="flex">
                {ledgers && ledgers.filter(ttlFiles).map(ledger => <LedgerManage key={asUrl(ledger)} ledger={ledger} /> )}
            </div>
        </div>
    )
}
