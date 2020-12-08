import * as React from 'react'
// import {mount} from 'enzyme'
import computeMarketRate from "../src/compute"
import {parseCoinbaseRates} from "../src/marketRatesCB"
import {graph} from "../src/tradeGraph";
import {Currencies, Currency} from "../src/marketdata/provider";
import {newTrade, Trade} from "../src/store";
//



function testCurrencies():Currencies{
    const cs = [
        {id:"bitcoin", symbol:"BTC", name:"Bitcoin"},
        {id:"ethereum", symbol:"ETH", name:"Ethereum"},
        {id:"usd", symbol:"USD", name:"US Dollar"},
        ]
    const mapped = new Map<string, Currency>()
    for (const c of cs) {
        mapped.set(c.id, c)
        mapped.set(c.name, c)
        mapped.set(c.name.toLowerCase(), c)
        mapped.set(c.symbol, c)
        mapped.set(c.symbol.toLowerCase(), c)
    }
    return {
        getAll:():Currency[]=>  cs,
        get:(id:string):Currency | null=> mapped.get(id) || null
    }
}

describe('Trade graph', () => {
    it('1 trades', function () {

        // expect(false).toBe(true)

        // const trades:Trade[] = [
        //    newTrade( {
        //         key: 0,
        //        pri
        //         outCurrency: "USD",
        //         inCurrency: "ETH",
        //         outAmount: 100,
        //         inAmount: 1,
        //         fee: 1,
        //         feeCoin: "USD",
        //         exchange:""
        //     })
        // ]
        //
        // const res = graph(trades, testCurrencies())

    })
})