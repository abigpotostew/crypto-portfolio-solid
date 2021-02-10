import {Currencies, MarketRates} from "../src/marketdata/provider";
import {getAllTradesDataFromDoc, getLedgerDoc, saveTradesToLedger, Trade} from "../src/store";
import React from "react"
import EnhancedTable, {EditableNumericCell} from "./EnhancedTable";
import computeMarketRate, {MarketHolding, NewCompute} from "../src/compute";
import {USD} from "../src/currencies";
import {getPodFromWebId} from "./Ledgers";
import TickerSymbolLink from "./currency/TickerSymbolLink";
import {useWebId} from "../src/authentication";
import {useSelector, useDispatch} from 'react-redux'
import {AppState} from "../src/redux/store";

interface LedgerSummaryProps {
    marketRates: MarketRates
    currencies: Currencies
    trades: Trade[]
}

export default function LedgerSummary({marketRates, currencies, trades}: LedgerSummaryProps) {
    const webId = useSelector((state: AppState) => state.webId)
    const podDocument = useSelector((state: AppState) => state.ledgersState.podDocument)
    const dispatch = useDispatch()

    const [compute] = React.useState(NewCompute);
    const [summaryData, setSummaryData] = React.useState(new Array<MarketHolding>());

    const [data, setData] = React.useState(React.useMemo(() => {
        //fetch data from doc
        console.log("loaded data from memo")
        return trades //getAllTradesDataFromDoc(podDocument)
    }, [trades]))

    // React.useEffect(() => {
    //     console.log("setting data from doc trades...")
    //     setData(getAllTradesDataFromDoc(podDocument))
    //     console.log("done setting data from doc trades")
    // }, [podDocument])


    React.useEffect(() => {
        if (currencies.getAll().length > 0) {
            setSummaryData(compute.holdings(data, USD, marketRates, currencies))
        }
    }, [podDocument, data, marketRates, currencies])


    const [skipPageReset, setSkipPageReset] = React.useState(false)

    const columns = React.useMemo(
        () => [
            {
                Header: 'Coin',
                accessor: 'currency',
                // @ts-ignore
                Cell: (table, cell) => {
                    //should have precision of the currency
                    return (<TickerSymbolLink currency={table.value}/>)
                },
            },
            {
                Header: 'Amount',
                accessor: 'totalHoldings',
                // @ts-ignore
                Cell: (table, cell) => {
                    // console.log(table, cell)
                    // doesn't work because it updateMyData is needed here
                    // return (<CurrencySelect  label={""}></CurrencySelect>)
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: 'Fiat',
                accessor: 'totalMarketHoldings',
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<span>${table.value.toFixed(2)}</span>)
                },
            },

        ],
        []
    )

    // React.useEffect(() => {
    //     setTotalValue(computeMarketRate(data, USD, marketRates))
    // }, [marketRates, data])

    const setDataHandler = async (newData: Trade[]) => {
        // console.error("cannot update data from summary at this time")
        // return

        //detect deletes here :)
        const deletes = data.filter((d) => !newData.includes(d))
        //update external pod and ledger and data will automatically be set after dispatch

        console.log("setDataHandler saving...", newData)
        // store save ledger trades,
        await saveTradesToLedger(podDocument, newData, deletes)
        // t.url = tradeRef
        // const newdata = data.concat(t)
        console.log("setDataHandler saved", newData)

        const ledgerContainerUri = getPodFromWebId(webId, "private")
        const fetchedPodDocument = await getLedgerDoc(ledgerContainerUri);

        // dispatch the thing
        dispatch({
            type: 'set_ledgers_state',
            payload: {"podDocument": fetchedPodDocument}
        });
        console.log("setDataHandler dispatched")
    }

    const addDataHandler = async (adds: Trade[]) => {
        await setDataHandler(data.concat(...adds))
    }
    const deleteDataHandler = async (deletes: Trade[]) => {

        console.error("cannot delete from the summary page")
        return
    }

    // @ts-ignore
    const updateMyData = (rowIndex, columnId, value) => {

        console.error("cannot update data from summary at this time")
        return

        // We also turn on the flag to not reset the page
        // update it in pod now
        setSkipPageReset(true)
        console.log("my data is updating")

        setDataHandler(data.map((row, index) => {
            if (index === rowIndex) {
                return {
                    ...data[rowIndex],
                    [columnId]: value,
                    ["dirty"]: true
                }
            }
            return row
        }))
        console.log("my data is updated")

        // setTotalValue(computeMarketRate(data, "USD", marketRates))
    }

    return (<div>
        <EnhancedTable
            columns={columns}
            data={summaryData}
            // setData={setDataHandler} // add, remove delete table action
            addData={addDataHandler} // add, remove delete table action
            deleteData={deleteDataHandler} // add, remove delete table action
            updateMyData={updateMyData} // table edit inline action
            skipPageReset={skipPageReset}
        />

        {/*<p>Total Portfolio Value: {totalValue}</p>*/}

    </div>)
}