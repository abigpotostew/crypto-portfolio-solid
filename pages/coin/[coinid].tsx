import {useRouter} from 'next/router'
import AppContext from "../../contexts/AppContext";
import React from "react"
import {coinGeckoProvider, Currency} from "../../src/marketdata/provider";
import {alwaysIncludeCoins} from "../../src/currencies";
import {getAllTradesDataFromDoc, getLedgerDoc} from "../../src/store";
import {getPodFromWebId} from "../../components/Ledgers";
import styles from "../../styles/Home.module.css"
// @ts-ignore
import {AuthButton} from "@solid/react"
import {useWebId} from "../../src/solid";
import CoinPortfolio from "../../components/CoinPortfolio";

const CoinLayout = () => {


    const router = useRouter()
    const {coinid} = router.query

    //TODO this is all duplicate, figure out where to put this stuff, probably in it's own effect wrapper
    const myWebId = useWebId()

    // @ts-ignore
    const {state, dispatch} = React.useContext(AppContext);
    const {webId, ledgersState} = state;
    const {podDocument} = webId && ledgersState && ledgersState || {};

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
                setMarketRates((old) => rates || old)
                //coinbase requires merge
            }
        })
    }

    // start market rates ticker
    React.useEffect(() => {
        let interval: number | undefined = undefined;
        if (isTickerActive) {
            // @ts-ignore //todo wtf
            interval = setInterval(() => {
                //get market rates
                getMarketRates()
            }, 10000);
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

    React.useEffect(() => {
        async function fetchLedgers() {
            const ledgerContainerUri = getPodFromWebId(webId, "private")
            const podDocument = await getLedgerDoc(ledgerContainerUri);

            console.log("trades now", getAllTradesDataFromDoc(podDocument))

            let trades = getAllTradesDataFromDoc(podDocument)
            const uniqueCurrencies = new Set<Currency>();
            trades.forEach((t) => {
                uniqueCurrencies.add(t.amount.currency)
            })
            //todo remove all non-crypto currencies
            let uniqueCryptoCoins = Array.from(uniqueCurrencies.values()).filter((t) => t.symbol !== "USD")
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

    //todo show trades filted to this coin, and if valid coin only
    return (
        <div className={styles.container}>
            <p>{myWebId}</p>
            <AuthButton popup="/popup.html" login="Login here!" logout="Log me out"/>
            <p>Coin ID: {coinid}</p>
            {myWebId && <CoinPortfolio marketRates={marketRates}></CoinPortfolio>}
        </div>
    )
}


export default CoinLayout