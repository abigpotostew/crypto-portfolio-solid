import {coinGecko, initialMarketRates} from "../src/marketrates";
import {
    createLedger,
    createTradeRow,
    deleteLedger, getAllTradesDataFromDoc, getLedgerDoc, getLedgerThing, getLedgerThings,
    getRows,
    getTrade,
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

function Trade({trade}) {
    const {url, outAmount, outCurrency, inAmount, inCurrency, fee, feeCoin} = getTrade(trade)
    return (<li>{outAmount} {outCurrency} for {inAmount} {inCurrency} and {fee} {feeCoin} fee</li>)
}

function LedgerThing({ledgerDoc, ledgerThing}) {

    // const {trades, resource: ledgerResource, saveResource, ledgerThing} = getRows(ledgerDoc)

    const handleDelete = async () => {
        await deleteLedger(ledgerDoc)
    }
    const createTradeRowHandler = async () => {
        console.log("pizza skip create trade row todo")
        // await createTradeRow({ledger: ledgerThing, ledgerResource: ledgerResource, saveResource: saveResource})
    }

    return (
        <div>
            <p>{asUrl(ledgerDoc)}</p>
            <p>You have {trades && trades.length} trades</p>
            <ul>
                {trades && trades.map(trade => <Trade key={trade} trade={trade}></Trade>)}
            </ul>

            <Button onClick={createTradeRowHandler}>Add Row</Button>
            <Button onClick={handleDelete}>Delete Ledger</Button>
        </div>
    )
}


export default function Ledgers(){

    const { state, dispatch } = React.useContext(AppContext);
    const { webId, ledgersState } = state;
    const {document, ledgerThing, tradesData } = ledgersState && ledgersState || {};

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



// Tripledoc.fetchDocument

    React.useEffect(() => {
        async function fetchLedgers() {
            const ledgerContainerUri = getPodFromWebId(webId, "private")
            // const { resources: ledgers, mutate: mutateLedgers } = useContainer(ledgerContainerUri)
            const document = await getLedgerDoc(ledgerContainerUri);
            const ledgerThings = document && getLedgerThings(document)
            const ledgerThing = ledgerThings && ledgerThings[0]
            const data = getAllTradesDataFromDoc(document, ledgerThing)

            dispatch({
                type: 'set_ledgers_state',
                payload: {"document":document, "ledgerThing":ledgerThing, "tradesData":data }
            });
        }
        if (webId !== null) {
            fetchLedgers();
        }
    }, [webId]);




    const createLedgerHandler = async ({ name = "Cryptocurrency Ledger"}) => {
        await createLedger(name, ledgerContainerUri, mutateLedgers)
    }

    return (
        <div>
            {document && tradesData&& <Ledger marketRates={marketRates} tradesData={tradesData}/>}
            <MarketRatesTicker rates={marketRates}/>

            {document && <Button variant="contained" color="primary" onClick={createLedgerHandler}>
                Create Ledger
            </Button>}

            <p> you have {ledgersState && ledgersState.length || 0} ledgers</p>
            {/*<div className="flex">*/}
            {/*    {document && getLedgerThings(document).map((ledgerThing,i) => <LedgerThing key={i} ledgerDoc={ledgerThing} /> )}*/}
            {/*</div>*/}
        </div>
    )
}
