import {coinGecko, initialMarketRates} from "../src/marketrates";
import {
    createLedger,
    createTradeRow, createTradeRowTDoc,
    deleteLedger, getAllTradesDataFromDoc, getLedgerDoc, getLedgerThing, getLedgerThings, newTrade,
    ttlFiles,
    useLedgerContainerUri
} from "../src/store";
// import {useContainer, useWebId} from 'swrlit'
// import {asUrl} from "@itme/solid-client"
import MarketRatesTicker from "./marketRates";
import Ledger from "./ledger";
import React from "react"
import Tripledoc from "tripledoc"

import Button from "@material-ui/core/Button"
import {useWebId} from "../src/solid";
import AppContext from "../contexts/AppContext";

export function getPodFromWebId(webId, path = 'public') {
    const a = document.createElement('a');
    a.href = webId;
    return `${a.protocol}//${a.hostname}/${path}/cryptoledger`;
}

export default function Ledgers(){

    const { state, dispatch } = React.useContext(AppContext);
    const { webId, ledgersState } = state;
    const {podDocument } = ledgersState && ledgersState || {};

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

    // initial market rates query, one time only
    React.useEffect(()=>{
        // do stuff here...
        getMarketRates()
    }, []) // <-- empty dependency array


    React.useEffect(() => {
        async function fetchLedgers() {
            const ledgerContainerUri = getPodFromWebId(webId, "private")
            // const { resources: ledgers, mutate: mutateLedgers } = useContainer(ledgerContainerUri)
            const podDocument = await getLedgerDoc(ledgerContainerUri);

            console.log("trades now",getAllTradesDataFromDoc(podDocument))
            // const ledgerThings = podDocument && getLedgerThings(podDocument)
            // const ledgerThing = ledgerThings && ledgerThings[0]

            dispatch({
                type: 'set_ledgers_state',
                payload: {"podDocument":podDocument }
            });
        }
        if (webId !== null) {
            fetchLedgers();
        }
    }, [webId]);




    // const createLedgerHandler = async ({ name = "Cryptocurrency Ledger"}) => {
    //     await createLedger(name, ledgerContainerUri, mutateLedgers)
    // }


    return (
        <div>
            {/*todo tell this ledger which ledger subject to use*/}
            {podDocument && <Ledger marketRates={marketRates} />}
            <MarketRatesTicker rates={marketRates}/>


            {/*only one ledger at this time, but someday could have multiple in the same document*/}
            {/*{document && <Button variant="contained" color="primary" onClick={createLedgerHandler}>*/}
            {/*    Create Ledger*/}
            {/*</Button>}*/}

            {/*<p> you have {ledgersState && ledgersState.length || 0} ledgers</p>*/}
            {/*<div className="flex">*/}
            {/*    {document && getLedgerThings(document).map((ledgerThing,i) => <LedgerThing key={i} ledgerDoc={ledgerThing} /> )}*/}
            {/*</div>*/}
        </div>
    )
}
