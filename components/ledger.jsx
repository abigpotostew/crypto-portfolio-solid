import React from "react"

import EnhancedTable, {EditableNumericCell} from "./EnhancedTable";
import computeMarketRate from "../src/compute";
import {CoinBTC, CoinETH, CoinLINK, CoinLTC, CoinPRQ, USD} from "../src/currencies";
import {newTrade} from "../src/store";

export default function Ledger({marketRates}) {

    // const USD = USD
    // const CoinLTC = CoinLTC
    // const CoinETH = CoinETH
    // const CoinLINK = CoinLINK
    // const CoinBTC = CoinBTC

    //todo update calculation when data changes
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

    const [data, setData] = React.useState(React.useMemo(() => defaultData, []))
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


    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateMyData = (rowIndex, columnId, value) => {
        // We also turn on the flag to not reset the page
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

    return (<div>
        <EnhancedTable
            columns={columns}
            data={data}
            setData={setData}
            updateMyData={updateMyData}
            skipPageReset={skipPageReset}
        />

        <p>Total Portfolio Value: {totalValue}</p>
    </div>)

}