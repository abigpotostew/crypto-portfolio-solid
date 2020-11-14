import {coinBase, coinGecko, initialMarketRates, mergeRates} from "../src/marketrates";
import {createLedger, useLedgerContainerUri, ttlFiles, deleteLedger, getRows, createTradeRow} from "../src/store";
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

    const {trades, resource:ledgerResource, saveResource, ledgerThing} = getRows(ledger)

    const handleDelete = async () =>{
        await deleteLedger(ledger)
    }
    const createTradeRowHandler =  async () => {
        await createTradeRow({ledger: ledgerThing, ledgerResource: ledgerResource, saveResource: saveResource})
    }

    return (
        <div>
            <p>{asUrl(ledger)}</p>
            <p>You have {trades && trades.length} trades</p>
            <ul>
                {trades && trades.map( trade => <li key={trade}>{trade}</li>)}
            </ul>

            <Button onClick={createTradeRowHandler}>Add Row</Button>
            <Button onClick={handleDelete}>Delete Ledger</Button>
        </div>
    )
}


export default function Ledgers(){

    const myWebId = useWebId()

    const [isTickerActive, setIsTickerActive] = React.useState(false);
    const [marketRates, setMarketRates] = React.useState(initialMarketRates())

    const getMarketRates = ()=>{
        coinGecko("USD", ({err, rates}) => {
            if (err) {
                console.error(err)
                console.error("stopping market rates ticker")
                setIsTickerActive(false)
            } else {
                setMarketRates(rates)
                //coinbase requires merge
            }
        }, marketRates)
    }

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
