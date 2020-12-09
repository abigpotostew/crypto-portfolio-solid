import React from "react"

import EnhancedTable, {EditableNumericCell} from "./EnhancedTable";
import computeMarketRate from "../src/compute";
import {USD} from "../src/currencies";
import {getAllTradesDataFromDoc, getLedgerDoc, newTrade, saveTradesToLedger, Trade} from "../src/store";
import AppContext from "../contexts/AppContext";
import {getPodFromWebId} from "./Ledgers";
import {MarketRates} from "../src/marketdata/provider";

interface CoinPortfolioProps {
    marketRates: MarketRates
}

export default function CoinPortfolio({marketRates}: CoinPortfolioProps) {

    // @ts-ignore
    const {state, dispatch} = React.useContext(AppContext);
    const {webId, ledgersState} = state;
    const {podDocument} = ledgersState && ledgersState || {};


    //TODO figure out where this data should come from in a reused way
    const [data, setData] = React.useState(React.useMemo(() => {
        //fetch data from doc
        console.log("loaded data from memo")
        return getAllTradesDataFromDoc(podDocument)
    }, []))

    React.useEffect(() => {
        console.log("setting data from doc trades...")
        setData(getAllTradesDataFromDoc(podDocument))
        console.log("done setting data from doc trades")
    }, [podDocument])


    //handler passed to table, saves to pod and dispatches new pod doc and ledger thing
    //don't let anythign else call setData
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
            payload: {"podDocument": fetchedPodDocument}
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
                Header: 'Amount',
                accessor: 'amount',// @ts-ignore
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: 'Coin',
                accessor: 'currency',
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
                    return (<span>${table.value}</span>)
                }
            },
            {
                Header: "Fee",
                accessor: 'fee',
                // @ts-ignore
                Cell: (table, cell) => {
                    return (<span>${table.value}</span>)
                }
            }

        ],
        []
    )

    React.useEffect(() => {
        setTotalValue(computeMarketRate(data, "USD", marketRates))
    }, [marketRates, data])


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
        <p>Total Portfolio Value: {totalValue}</p>
        <EnhancedTable
            columns={columns}
            data={data}
            setData={setDataHandler} // add, remove delete table action
            updateMyData={updateMyData} // table edit inline action
            skipPageReset={skipPageReset}
        />


    </div>)

}