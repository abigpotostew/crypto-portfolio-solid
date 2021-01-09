import React from "react"

import EnhancedTable, { EditableNumericCell } from "./EnhancedTable";
import computeMarketRate from "../src/compute";
import { USD } from "../src/currencies";
import { getAllTradesDataFromDoc, getLedgerDoc, newTrade, saveTradesToLedger, Trade } from "../src/store";
import { getPodFromWebId } from "./Ledgers";
import { Currencies, MarketRates } from "../src/marketdata/provider";
import { useSelector, useDispatch } from 'react-redux'
import { AppState } from "../src/redux/store";

interface LedgerProps {
    marketRates: MarketRates
    currencies: Currencies
    trades: Trade[]
}

export default function Ledger({ marketRates, currencies, trades }: LedgerProps) {

    const webId = useSelector((state: AppState) => state.webId)
    const podDocument = useSelector((state: AppState) => state.ledgersState.podDocument)
    const dispatch = useDispatch()


    const [data, setData] = React.useState(React.useMemo(() => {
        //fetch data from doc
        console.log("loaded data from memo")
        return trades//getAllTradesDataFromDoc(podDocument)
    }, []))

    React.useEffect(() => {
        console.log("setting data from doc trades...")
        setData(trades)//getAllTradesDataFromDoc(podDocument))
        console.log("done setting data from doc trades")
    }, [podDocument])


    //handler passed to table, saves to pod and dispatches new pod doc and ledger thing
    //don't let anything else call setData
    const setDataHandler = async (newData: Trade[]) => {

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
            payload: { "podDocument": fetchedPodDocument }
        });
        console.log("setDataHandler dispatched")
    }

    //todo the data is not coming in from tripledoc
    // const data = React.useMemo(() => tradesData, [tradesData])
    // const setData = console.error
    const [skipPageReset, setSkipPageReset] = React.useState(false)

    const [totalValue, setTotalValue] = React.useState(0)

    const columns = React.useMemo(
        () => [
            {
                Header: 'Out',
                accessor: 'cost.amount',
                // @ts-ignore
                Cell: (table, cell) => {
                    //should have precision of the currency
                    return (<EditableNumericCell {...table} />)
                },
            },
            {
                Header: 'Out Currency',
                accessor: 'cost.currency.symbol',
                // @ts-ignore
                Cell: (table, cell) => {
                    // console.log(table, cell)
                    // doesn't work because it updateMyData is needed here
                    // return (<CurrencySelect  label={""}></CurrencySelect>)
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: 'In',
                accessor: 'amount.amount',
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<EditableNumericCell {...table} />)
                },
            },
            {
                Header: 'In Currency',
                accessor: 'amount.currency.symbol',
                // @ts-ignore
                Cell: (table, cell) => {
                    // console.log(table, cell)
                    // doesn't work because it updateMyData is needed here
                    // return (<CurrencySelect  label={""}></CurrencySelect>)
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: "Fee",
                accessor: 'fee.amount',
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<EditableNumericCell {...table} />)
                },
                // // @ts-ignore
                // Footer: info => {
                //     // Only calculate total visits if rows change
                //     const total = React.useMemo(
                //         // rows.value
                //         () =>
                //             // @ts-ignore
                //             info.rows.reduce((sum, row) => row.values.fee + sum, 0)
                //         // return computeMarketRate(trades, "USD", marketRates)
                //         // const trades = info.rows.map((i) => i.values)
                //         ,
                //         [info.rows]
                //     )
                //
                //     return <>Total USD Value: ${total}</>
                // },
            }

        ],
        []
    )

    React.useEffect(() => {
        setTotalValue(computeMarketRate(data, USD, marketRates, currencies))
    }, [marketRates, data])


    // React.useEffect(()=>{
    //     setData()
    // })

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    // @ts-ignore
    const updateMyData = (rowIndex, columnId, value) => {
        // We also turn on the flag to not reset the page

        // update it in pod now

        setSkipPageReset(true)
        console.log("my data is updating")
        // setData(async old => {
        //         const out = old.map((row, index) => {
        //             if (index === rowIndex) {
        //                 return {
        //                     ...old[rowIndex],
        //                     [columnId]: value,
        //                 }
        //             }
        //             return row
        //         })
        //         await setDataHandler(out)
        //         return out
        //     }
        // )
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

        // setTotalValue(computeMarketRate(data, "USD", marketRates))

    }


    return (<div>
        <EnhancedTable
            columns={columns}
            data={data}
            //@ts-ignore
            setData={setDataHandler} // add, remove delete table action
            updateMyData={updateMyData} // table edit inline action
            skipPageReset={skipPageReset}
        />

        <p>Total Portfolio Value: {totalValue}</p>

    </div>)

}