// import {useContainer, useWebId} from "swrlit";
import React from "react"
import { useTable } from 'react-table'
import CssBaseline from '@material-ui/core/CssBaseline'
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import EnhancedTable, {EditableNumericCell} from "./EnhancedTable";
import MarketRatesTicker from "./marketRates";
import {coinBase, initialMarketRates, mergeRates} from "../src/marketrates";
import computeMarketRate from "../src/compute";

import {
    useWebId, useAuthentication,
    useMyProfile, useProfile,
    useEnsured, useContainer,
    useThing
} from 'swrlit'
import {
    createSolidDataset, saveSolidDatasetInContainer,
    setThing, createThing, asUrl,
    getUrl, getUrlAll, addUrl,
    getStringNoLocale, setStringNoLocale,
    getDatetime, setDatetime
} from '@inrupt/solid-client'
import { WS } from '@inrupt/vocab-solid-common'
import { VCARD, FOAF, RDF, RDFS } from '@inrupt/vocab-common-rdf'

 function useStorageContainer(webId) {
    const { profile } = useProfile(webId)
    return profile && getUrl(profile, WS.storage)
}

 function useLedgerContainerUri(webId, path = 'public') {
    const storageContainer = useStorageContainer(webId)
    return useEnsured(storageContainer && `${storageContainer}${path}/cryptoledger/`)
}

const cryptledgerNs = "https://stewartbracken.club/v/cryptoledger#"
const LEDGER = {
    Ledger: `${cryptledgerNs}Ledger`,
    Trade: `${cryptledgerNs}Trade`,
    trades: `${cryptledgerNs}trades`
}

export default function Ledger(props) {

    const myWebId = useWebId()
    const ledgerContainerUri = useLedgerContainerUri(myWebId, 'private')
    const { resources: ledgers, mutate: mutateLedgers } = useContainer(ledgerContainerUri)

    const createLedger = async ({ name = "Cryptocurrency Ledger"}) => {
        var ledger = createThing({ name: 'ledger' });
        ledger = addUrl(ledger, RDF.type, LEDGER.Ledger)
        ledger = setStringNoLocale(ledger, RDFS.label, name)
        var dataset = createSolidDataset()
        dataset = setThing(dataset, ledger)
        await saveSolidDatasetInContainer(ledgerContainerUri, dataset, { slugSuggestion: name })
        mutateLedgers()
    }
    //get ledger if it exist


    const USD = "USD"
    const CoinLTC = "LTC"
    const CoinETH = "ETH"
    const CoinLINK = "LINK"
    const CoinBTC = "BTC"
    const defaultData = [

        {
            // key: 0,
            outCurrency: USD,
            inCurrency: CoinETH,
            outAmount: 500,
            inAmount: 1.51862536,
            fee: 7.34,
            feeCoin: USD,
        },
        {
            // key: 1,
            outCurrency: USD,
            inCurrency: CoinLTC,
            outAmount: 300,
            inAmount: 5.60673567,
            fee: 4.40,
            feeCoin: USD,
        },
        {
            // key: 2,
            outCurrency: CoinLTC,
            inCurrency: USD,
            outAmount: 5.60673567,
            inAmount: 293.80,
            fee: 4.44,
            feeCoin: USD,
        },
        {
            // key: 3,
            outCurrency: USD,
            inCurrency: CoinLINK,
            outAmount: 500,
            inAmount: 29.39195119,
            fee: 7.34,
            feeCoin: USD,
        },
        {
            // key: 4,
            outCurrency: USD,
            inCurrency: CoinBTC,
            outAmount: 293.80,
            inAmount: .02243376,
            fee: 4.31,
            feeCoin: USD,
        },
    ]

    const [data, setData] = React.useState(React.useMemo(() => defaultData, []))
    const [skipPageReset, setSkipPageReset] = React.useState(false)
    const [isTickerActive, setIsTickerActive] = React.useState(true);
    const [marketRates, setMarketRates] = React.useState(initialMarketRates())
    const [totalValue, setTotalValue] = React.useState(0)

    const columns = React.useMemo(
        () => [
            {
                Header: 'Out',
                accessor: 'outAmount',
                Cell: (table, cell) => {
                    //should have precision of the currency
                    return (<EditableNumericCell {...table} />)
                },
            },
            {
                Header: 'Out Currency',
                accessor: 'outCurrency',
                Cell: (table, cell) => {
                    // console.log(table, cell)
                    // doesn't work because it updateMyData is needed here
                    // return (<CurrencySelect  label={""}></CurrencySelect>)
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: 'In',
                accessor: 'inAmount',
                Cell: (table, cell) => {
                    return (<EditableNumericCell {...table} />)
                },
            },
            {
                Header: 'In Currency',
                accessor: 'inCurrency',
                Cell: (table, cell) => {
                    // console.log(table, cell)
                    // doesn't work because it updateMyData is needed here
                    // return (<CurrencySelect  label={""}></CurrencySelect>)
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: "Fee",
                accessor: 'fee',
                Cell: (table, cell) => {
                    return (<EditableNumericCell {...table} />)
                },
                Footer: info => {
                    // Only calculate total visits if rows change
                    const total = React.useMemo(
                        // rows.value
                        () =>
                            info.rows.reduce((sum, row) => row.values.fee + sum, 0)
                        // return computeMarketRate(trades, "USD", marketRates)
                        // const trades = info.rows.map((i) => i.values)
                        ,
                        [info.rows]
                    )

                    return <>Total USD Value: ${total}</>
                },
            }

        ],
        []
    )



    React.useEffect(()=>{
        // do stuff here...
        getMarketRates()
    }, []) // <-- empty dependency array

    React.useEffect(()=>{
        //todo use loader for market rate total value
        setTotalValue(computeMarketRate(data, "USD", marketRates))
    }, [marketRates])

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
                // const usdRates = rates
                // merge("LTC", rates, marketRates)
                // coinBase("LTC", ({err, rates}) => {
                //     if (err) {
                //         console.error(err)
                //         console.error("stopping market rates ticker")
                //         setIsTickerActive(false)
                //     } else {
                //         merge("LTC", rates, usdRates)
                //     }
                // })
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
            }, 3000); ///todo make a call out in an effect
        } else if (!isTickerActive) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTickerActive]);

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateMyData = (rowIndex, columnId, value) => {
        // We also turn on the flag to not reset the page
        setSkipPageReset(true)
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...old[rowIndex],
                        [columnId]: value,
                    }
                }
                return row
            })
        )
        // setTotalValue((old)=>computeMarketRate(data, "USD", marketRates))
    }

    return (<div>
        <EnhancedTable
            columns={columns}
            data={data}
            setData={setData}
            updateMyData={updateMyData}
            skipPageReset={skipPageReset}
        />
        <MarketRatesTicker rates={marketRates}/>
        <p>Total Portfolio Value: {totalValue}</p>
        <p> you have {ledgers && ledgers.length || 0} ledgers</p>
    </div>)

}