import React from "react"

import EnhancedTable, {EditableNumericCell} from "./EnhancedTable";
import computeMarketRate, {NewCompute} from "../src/compute";
import {USD} from "../src/currencies";
import {getAllTradesDataFromDoc, getLedgerDoc, newTrade, saveTradesToLedger, Trade} from "../src/store";
import {getPodFromWebId} from "./Ledgers";
import {Currencies, Currency, MarketRates, UncheckedCurrency} from "../src/marketdata/provider";
import TimeStamp from "./date/TimeStamp";
import {AppState} from "../src/redux/store";
import {useSelector, useDispatch} from 'react-redux'

interface CoinPortfolioProps {
    marketRates: MarketRates
    coinId: string
    currencies: Currencies
    trades: Trade[]
}

// a portfolio grid for a specific coin
export default function CoinPortfolio({marketRates, trades, coinId, currencies}: CoinPortfolioProps) {

    const webId = useSelector((state: AppState) => state.webId)
    const podDocument = useSelector((state: AppState) => state.ledgersState.podDocument)
    const dispatch = useDispatch()

    const [compute] = React.useState(NewCompute())
    const [coin, setCoin] = React.useState<Currency>(new UncheckedCurrency(coinId))

    const data = trades
    //todo include if the fee or the sell amount is this symbol
    const visibleTrades = trades.filter((t) => {
        return t.amount.currency.hasSymbol(coin.symbol) || t.fee.currency.hasSymbol(coin.symbol) || t.cost.currency.hasSymbol(coin.symbol)
    })

    //filter trades to just this coin


    // React.useEffect(() => {
    //     console.log("setting data from doc trades...")
    //     podDocument && setData(getAllTradesDataFromDoc(podDocument))
    //     console.log("done setting data from doc trades")
    // }, [podDocument])


    //handler passed to table, saves to pod and dispatches new pod doc and ledger thing
    //don't let anythign else call setData
    const setDataHandler = async (newData: Trade[]) => {

        //detect deletes here :)
        const deletes = data.filter((d) => !newData.includes(d))
        //update external pod and ledger and data will automatically be set after dispatch

        console.log("setDataHandler saving...", newData)
        // store save ledger trades,
        // @ts-ignore
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

        for (let i = 0; i < deletes.length; ++i) {
            const toDelete = deletes[i]
            for (let j = 0; j < data.length; ++j) {
                if (toDelete.url === data[j].url) {

                }
            }
        }
        const newData = data.filter((t, i) => {
            for (let i = 0; i < deletes.length; ++i) {
                if (deletes[i].url === t.url) {
                    return false
                }
            }
            return true
        })

        setDataHandler(newData)

    }

    //todo the data is not coming in from tripledoc
    // const data = React.useMemo(() => tradesData, [tradesData])
    // const setData = console.error
    const [skipPageReset, setSkipPageReset] = React.useState(false)

    const [totalValue, setTotalValue] = React.useState(0)

    const columns = React.useMemo(
        () => [
            {
                Header: 'Date',
                accessor: 'dateCreated',// @ts-ignore
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<TimeStamp date={table.value}/>)
                }
            },
            {
                Header: 'Amount',
                accessor: 'amount',// @ts-ignore
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<span>{table.value.amount}</span>)
                }
            },
            {
                Header: 'Coin',
                accessor: 'amount.currency',
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<span>{table.value.symbol}</span>)
                }
            },
            {
                Header: 'Cost',
                accessor: 'cost',
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<span>{table.value.currency.symbol + " " + table.value.amount}</span>)
                }
            },
            {
                Header: "Fee",
                accessor: 'fee',
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<span>{table.value.currency.symbol + " " + table.value.amount}</span>)
                }
            }

        ],
        []
    )

    React.useEffect(() => {
        if (coin && data && currencies.getAll().length > 0 && !marketRates.pending()) {

            setTotalValue(compute.marketRateTotal(data, USD, marketRates, coin, currencies))
        }
    }, [marketRates, data, currencies, coin])

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateMyData = (rowIndex: number, columnId: any, value: any) => {
        // We also turn on the flag to not reset the page

        // update it in pod now

        setSkipPageReset(true)
        console.log("my data is updating")

        //might get into async problems using data directly, should use state hook prior state
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
    }


    return (<div>
        <p>{coin.name} Holdings Market Value: {totalValue}</p>
        <EnhancedTable
            columns={columns}
            data={visibleTrades}
            // setData={setDataHandler} // add, remove delete table action
            addData={addDataHandler} // add, remove delete table action
            deleteData={deleteDataHandler} // add, remove delete table action
            updateMyData={updateMyData} // table edit inline action
            skipPageReset={skipPageReset}
        />


    </div>)

}