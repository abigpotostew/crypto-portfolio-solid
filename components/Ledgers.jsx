import {getAllTradesDataFromDoc, getLedgerDoc,} from "../src/store";
import MarketRatesTicker from "./marketRates";
import Ledger from "./ledger";
import React from "react"
import AppContext from "../contexts/AppContext";
import {coinGeckoProvider} from "../src/marketdata/provider";
import {alwaysIncludeCoins} from "../src/currencies";

export function getPodFromWebId(webId, path = 'public') {
    const a = document.createElement('a');
    a.href = webId;
    return `${a.protocol}//${a.hostname}/${path}/cryptoledger`;
}


export default function Ledgers() {

    const {state, dispatch} = React.useContext(AppContext);
    const {webId, ledgersState} = state;
    const {podDocument} = ledgersState && ledgersState || {};

    const [isTickerActive, setIsTickerActive] = React.useState(false);
    const [currencyProvider] = React.useState(coinGeckoProvider())

    const [currencies, setCurrencies] = React.useState(currencyProvider.getCurrencies())
    const [supportedCurrencies, setSupportedCurrencies] = React.useState(alwaysIncludeCoins)
    const [marketRates, setMarketRates] = React.useState(currencyProvider.getLatestMarketRates())


    const getMarketRates = () => {
        currencyProvider.fetchMarketRates("USD", supportedCurrencies, (err, rates) => {
            if (err) {
                console.error(err)
                console.error("stopping market rates ticker")
                setIsTickerActive(false)
            } else {
                setMarketRates(rates)
                //coinbase requires merge
            }
        })
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
    React.useEffect(() => {
        //if currencies are empty
        if (currencies.getAll().length === 0) {
            currencyProvider.fetchCurrencies((err) => {
                setCurrencies(currencyProvider.getCurrencies())
                getMarketRates()
                setIsTickerActive(true)
                // fetch market rates
            })
        } else {
            getMarketRates()
        }
        // then fetch market rates
        // then start the timer using set ticker
        // do stuff here...

    }, [supportedCurrencies]) // <-- empty dependency array


    // React.useEffect(()=>{
    //     console.log("fetching market rates from supported currencies")
    //     if (!marketRates.pending()) getMarketRates()
    // },[supportedCurrencies])

    React.useEffect(() => {
        async function fetchLedgers() {
            const ledgerContainerUri = getPodFromWebId(webId, "private")
            const podDocument = await getLedgerDoc(ledgerContainerUri);

            console.log("trades now", getAllTradesDataFromDoc(podDocument))

            let trades = getAllTradesDataFromDoc(podDocument)
            const uniqueCurrencies = new Set();
            trades.forEach((t) => {
                // uniqueCurrencies.add(t.feeCoin)
                uniqueCurrencies.add(t.amount.currency)
                // uniqueCurrencies.add(t.inCurrency)
            })
            //todo remove all non-crypto currencies
            let uniqueCryptoCoins = Array.from(uniqueCurrencies.values()).filter((t) => t !== "USD")
            uniqueCryptoCoins.push(...alwaysIncludeCoins)

            setSupportedCurrencies(uniqueCryptoCoins)

            dispatch({
                type: 'set_ledgers_state',
                payload: {"podDocument": podDocument}
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
            {podDocument && <Ledger marketRates={marketRates}/>}
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
