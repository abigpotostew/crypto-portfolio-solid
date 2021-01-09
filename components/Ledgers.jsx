import { getAllTradesDataFromDoc, getLedgerDoc, } from "../src/store";
import MarketRatesTicker from "./marketRates";
import Ledger from "./ledger";
import LedgerSummary from "./LedgerSummary";
import React from "react"

import { coinGeckoProvider } from "../src/marketdata/provider";
import { alwaysIncludeCoins } from "../src/currencies";
import { useCurrencies, useMarketRates, useTrades } from "../src/marketdata/effect";
import { AppState } from "../src/redux/store";
import { useSelector, useDispatch } from 'react-redux'
import Loading from "./loading/loading";
import { useWebId } from "../src/authentication";

export function getPodFromWebId(webId, path = 'public') {
    const a = document.createElement('a');
    a.href = webId;
    return `${a.protocol}//${a.hostname}/${path}/cryptoledger`;
}


export default function Ledgers() {

    //todo this doesn't refresh upon login
    const podDocument = useSelector((state) => state.ledgersState.podDocument)

    const [isTickerActive, setIsTickerActive] = React.useState(false);
    const [provider] = React.useState(React.useMemo(() => coinGeckoProvider()))



    const webId = useWebId()
    const dispatch = useDispatch()




    const {
        marketRates,
        trades,
        loading,
        error, currencies
    } = useMarketRates({ provider: provider })

    // // start market rates ticker
    // React.useEffect(() => {
    //
    //     let interval = null;
    //     if (isTickerActive) {
    //         interval = setInterval(() => {
    //             //get market rates
    //             // if (document.hasFocus()) getMarketRates()
    //             //todo support a ticker
    //         }, 10000); ///todo make a call out in an effect
    //     } else if (!isTickerActive) {
    //         clearInterval(interval);
    //     }
    //     return () => clearInterval(interval);
    // }, [isTickerActive]);


    return (
        <div>
            {/*todo tell this ledger which ledger subject to use*/}
            {loading && <Loading />}
            {podDocument && !loading &&
                <LedgerSummary marketRates={marketRates} currencies={provider.getCurrencies()} trades={trades} />}
            <MarketRatesTicker rates={marketRates} />


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
