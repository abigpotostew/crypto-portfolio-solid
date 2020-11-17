import React from "react"

import EnhancedTable, {EditableNumericCell} from "./EnhancedTable";
import computeMarketRate from "../src/compute";
import {CoinBTC, CoinETH, CoinLINK, CoinLTC, CoinPRQ, USD} from "../src/currencies";
import {createTradeRowTDoc, getAllTradesDataFromDoc, getLedgerThings, newTrade, saveTradesToLedger} from "../src/store";
import Button from "@material-ui/core/Button"
import AppContext from "../contexts/AppContext";

export default function Ledger({marketRates}) {

    const { state, dispatch } = React.useContext(AppContext);
    const { webId, ledgersState } = state;
    const {podDocument } = ledgersState && ledgersState || {};
    // const ledgerThings = podDocument && getLedgerThings(podDocument)
    // const ledgerThing = ledgerThings && ledgerThings[0]
    //todo handle empty ledger

    // const USD = USD
    // const CoinLTC = CoinLTC
    // const CoinETH = CoinETH
    // const CoinLINK = CoinLINK
    // const CoinBTC = CoinBTC

    const [data, setData] = React.useState(React.useMemo(() => {
        //fetch data from doc
        console.log("loaded data from memo")
        return getAllTradesDataFromDoc(podDocument)
    }, []))

    React.useEffect(()=>{
        console.log("setting data from doc trades...")
        setData(getAllTradesDataFromDoc(podDocument))
        console.log("done setting data from doc trades")
    }, [podDocument])




    //handler passed to table, saves to pod and dispatches new pod doc and ledger thing
    //don't let anythign else call setData
    const setDataHandler = async (newData)=>{

        //update external pod and ledger and data will automatically be set after dispatch

        console.log("setDataHandler saving...", newData)
        // store save ledger trades,
        const {podDocumentModified} = await saveTradesToLedger({podDocument: podDocument, tradesData: newData})
        // t.url = tradeRef
        // const newdata = data.concat(t)
        console.log("setDataHandler saved", newData)

        // dispatch the thing
        dispatch({
            type: 'set_ledgers_state',
            payload: {"podDocument":podDocumentModified }
        });
        console.log("setDataHandler dispatched")
    }

    //todo update calculation when data changes
    // const data = tradesData
    const defaultData = [

        newTrade({
            // key: 0,
            outCurrency: USD,
            inCurrency: CoinETH,
            outAmount: 500,
            inAmount: 1.51862536,
            fee: 7.34,
            feeCoin: USD,
        }),
        newTrade({
            // key: 1,
            outCurrency: USD,
            inCurrency: CoinLTC,
            outAmount: 300,
            inAmount: 5.60673567,
            fee: 4.4,
            feeCoin: USD,
        }),
        newTrade( {
            // key: 2,
            outCurrency: CoinLTC,
            inCurrency: USD,
            outAmount: 5.60673567,
            inAmount: 293.80,
            fee: 4.44,
            feeCoin: USD,
        }),
        newTrade({
            // key: 3,
            outCurrency: USD,
            inCurrency: CoinLINK,
            outAmount: 500,
            inAmount: 29.39195119,
            fee: 7.34,
            feeCoin: USD,
        }),
        newTrade({
            outCurrency: USD,
            inCurrency: CoinBTC,
            outAmount: 293.80,
            inAmount: .02243376,
            fee: 4.31,
            feeCoin: USD,
        }),
        newTrade({
            outCurrency: USD,
            inCurrency: CoinETH,
            outAmount: 2000,
            inAmount: 4.4766919,
            fee: 29.36,
            feeCoin: USD,
        }),

        newTrade({//metamask
            outCurrency: CoinETH,
            inCurrency: CoinETH,
            outAmount: 2.539396,
            inAmount: 2.538955,
            fee: 0,
            feeCoin: CoinETH,
        }),

        newTrade({
            outCurrency: CoinETH,
            inCurrency: CoinETH,
            outAmount: 1.14074601,
            inAmount:  1.140305,
            fee: 0.00044100,
            feeCoin: CoinETH,
        }),
        newTrade({
            outCurrency: CoinETH,
            inCurrency: CoinPRQ,
            outAmount: 3.65,
            inAmount: 10072.693,
            fee: 0.002032,
            feeCoin: CoinETH,
        }),
        newTrade({
            //kraken wire. leaving out deposit amount now since it would be counted as a profit
            outCurrency: USD,
            inCurrency: USD,
            outAmount: 0,
            inAmount: 0,
            fee: 20,
            feeCoin: USD,
        }),
    ]

    //todo the data is not coming in from tripledoc
    // const data = React.useMemo(() => tradesData, [tradesData])
    // const setData = console.error
    const [skipPageReset, setSkipPageReset] = React.useState(false)

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
        setTotalValue(computeMarketRate(data, "USD", marketRates))
    }, [marketRates])


    // React.useEffect(()=>{
    //     setData()
    // })

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateMyData = (rowIndex, columnId, value) => {
        // We also turn on the flag to not reset the page

        // update it in pod now

        setSkipPageReset(true)
        console.log("my data is updated")
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
        setTotalValue(computeMarketRate(data, "USD", marketRates))
    }


    const createTradeInDocHandler =async  ()=>{
        const t = newTrade({outCurrency:"USD",inCurrency:"ETH",outAmount:100,inAmount:2,fee:1.5, feeCoin:"USD"})
        try {
            const {tradeRef, podDocumentModified} = await createTradeRowTDoc({podDocument: podDocument, tradeData: t})
            t.url = tradeRef
            const newdata = data.concat(t)

            setDataHandler(newdata)

            dispatch({
                type: 'set_ledgers_state',
                payload: {"podDocument":podDocumentModified }
            });
        }catch(e){
            console.error(e)
            return
        }
    }



    return (<div>
        <EnhancedTable
            columns={columns}
            data={data}
            setData={setDataHandler}
            updateMyData={updateMyData}
            skipPageReset={skipPageReset}
        />

        <p>Total Portfolio Value: {totalValue}</p>

        {podDocument && <Button variant="contained" color="primary" onClick={createTradeInDocHandler}>
            Create Trade
        </Button>}

    </div>)

}