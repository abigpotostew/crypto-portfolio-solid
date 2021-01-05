import {Currencies, CurrenciesFromArray, Currency, emptyCurrencies, Provider} from "./provider";
import React from "react";
import {getAllTradesDataFromDoc, getLedgerDoc, Trade} from "../store";
import {alwaysIncludeCoins} from "../currencies";
import {getPodFromWebId} from "../../components/Ledgers";
import {AppState} from "../redux/store";
import {useSelector, useDispatch} from 'react-redux'

interface UseCurrenciesProps {
    // initialCurrencies: Currency[]
    provider: Provider
}

function fetch(provider: Provider): Promise<Error | null> {
    return provider.asyncFetchCurrencies()
}

export function useCurrencies({provider}: UseCurrenciesProps) {
    const [data, setData] = React.useState<Currencies>(provider.getCurrencies());
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<Error | null>();


    React.useEffect(() => {
        setError(null);
        if (provider) {
            (async () => {
                try {
                    setLoading(true);
                    const responseErr = await fetch(provider);
                    if (responseErr) {
                        throw responseErr
                    }
                    setData(provider.getCurrencies());
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            // setData(emptyCurrencies());
            setLoading(false);
        }
    }, [provider]);

    return {data, loading, error};
}

interface UseTradesProps {
    webId: string | null
}

async function fetchledger(webId: string) {
    const ledgerContainerUri = getPodFromWebId(webId, "private")
    const podDocument = await getLedgerDoc(ledgerContainerUri);

    console.log("trades now", getAllTradesDataFromDoc(podDocument))

    let trades = getAllTradesDataFromDoc(podDocument)
    const uniqueCurrencies = new Set<Currency>();
    trades.forEach((t) => {
        // uniqueCurrencies.add(t.feeCoin)
        uniqueCurrencies.add(t.amount.currency)
        // uniqueCurrencies.add(t.inCurrency)
    })
    //todo remove all non-crypto currencies
    let uniqueCryptoCoins = Array.from(uniqueCurrencies.values()).filter((t) => t.id !== "USD")
    uniqueCryptoCoins.push(...alwaysIncludeCoins)

    return {trades: trades, uniqueCryptoCoins: uniqueCryptoCoins, podDocument: podDocument}
}

export function useTrades({webId}: UseTradesProps) {

    const dispatch = useDispatch()

    const [trades, setTrades] = React.useState<Trade[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<Error | null>();

    const [uniqueCurrencies, setUniqueCurrencies] = React.useState<Currency[]>([])

    React.useEffect(() => {
        setError(null);
        if (webId) {
            (async () => {
                try {
                    setLoading(true);
                    const res = await fetchledger(webId)
                    setTrades(res.trades)
                    setUniqueCurrencies(res.uniqueCryptoCoins)
                    dispatch({
                        type: 'set_ledgers_state',
                        payload: {"podDocument": res.podDocument}
                    });
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                }
            })()

        } else {
            setLoading(false)
            setTrades([])
        }
    }, [webId])

    return {trades, uniqueCurrencies, loading, error};
}


interface UseMarketRatesProps extends UseCurrenciesProps {
    initialCurrencies: Currency[]
}


export function useMarketRates({provider}: UseCurrenciesProps) {
    const webId = useSelector((state: AppState) => state.webId)

    const {
        data: currencies,
        loading: currenciesLoading,
        error: currenciesError
    } = useCurrencies({provider: provider})

    const [marketRates, setMarketRates] = React.useState(provider.getLatestMarketRates())

    const {
        trades: trades,
        uniqueCurrencies: uniqueCurrencies,
        loading: tradesLoading,
        error: tradesError
    } = useTrades({webId: webId})

    const getMarketRates = () => {
        // todo filter out fiat somehow?
        let uniqueCryptoCoins = Array.from(uniqueCurrencies.values()).filter((t) => t.symbol !== "USD")
        uniqueCryptoCoins.push(...alwaysIncludeCoins)
        const coins = uniqueCryptoCoins
        console.assert(coins.length < 100, "coin gecko provider has max currency query")
        provider.fetchMarketRates("USD", coins, (err, rates) => {
            if (err) {
                console.error(err)
                console.error("stopping market rates ticker")
            } else if (rates) {
                setMarketRates(rates)
            }
        })
    }

    // initial market rates query, one time only
    React.useEffect(() => {
        //if currencies are empty
        // todo PERF this is running a lot of times
        if (!currenciesLoading && currencies.getAll().length > 0) {
            getMarketRates()
        }

    }, [currenciesLoading, currencies, trades]); // <-- empty dependency array

    const loading = (tradesLoading && currenciesLoading)
    const error = tradesError || currenciesError
    return {marketRates, trades, loading, error};
}


