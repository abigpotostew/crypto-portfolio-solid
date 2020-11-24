import * as React from 'react'
// import {mount} from 'enzyme'
import computeMarketRate from "../src/compute"
import {parseCoinbaseRates} from "../src/marketRatesCB"
//

describe('MarketRates', () => {
    describe('Compute Total', () => {
        it('2 trades', function () {

            const trades = [
                {
                    key: 0,
                    outCurrency: "USD",
                    inCurrency: "ETH",
                    outAmount: 100,
                    inAmount: 1,
                    fee: 1,
                    feeCoin: "USD",
                },
                {
                    key: 0,
                    outCurrency: "USD",
                    inCurrency: "BTC",
                    outAmount: 100,
                    inAmount: 1,
                    fee: 1,
                    feeCoin: "USD",
                },
            ]

            const marketRates = parseCoinbaseRates(new Map([
                    ["USD", new Map([["ETH",0.01], ["BTC", 0.01]])],
                ],
            ))

            // - $202 out usd
            // + $100 eth in
            // + $100 btc in
            // - $2 fees

            expect(computeMarketRate(trades, "USD", marketRates)).toBe(-2)
        })
        it('in and out with zero eth remainder', function () {

            const trades = [
                {
                    key: 0,
                    outCurrency: "USD",
                    inCurrency: "ETH",
                    outAmount: 100,
                    inAmount: 1,
                    fee: 1,
                    feeCoin: "USD",
                },
                {
                    key: 0,
                    outCurrency: "ETH",
                    inCurrency: "USD",
                    outAmount: 1,
                    inAmount: 110,
                    fee: 1,
                    feeCoin: "USD",
                },
            ]

            const marketRates = parseCoinbaseRates(new Map([
                    ["USD", new Map([["ETH",0.01]])],
                ],
            ))


            expect(computeMarketRate(trades, "USD", marketRates)).toBe(8)
        })
        it('ETH destination unsupported rate', function () {

            const trades = [
                {
                    key: 0,
                    outCurrency: "USD",
                    inCurrency: "ETH",
                    outAmount: 100,
                    inAmount: 1,
                    fee: 1,
                    feeCoin: "USD",
                },
                {
                    key: 0,
                    outCurrency: "USD",
                    inCurrency: "BTC",
                    outAmount: 100,
                    inAmount: 1,
                    fee: 1,
                    feeCoin: "USD",
                },
            ]

            const marketRates = parseCoinbaseRates(new Map([
                    ["USD", new Map([["ETH",0.01]])],
                ],
            ))
            try {
                computeMarketRate(trades, "ETH", marketRates)
                expect(true).toBe(false)
            } catch (e) {
                //expected
            }

        })
        it('ETH destination', function () {

            const trades = [
                {
                    key: 0,
                    outCurrency: "USD",
                    inCurrency: "ETH",
                    outAmount: 100,
                    inAmount: 1,
                    fee: 1,
                    feeCoin: "USD",
                },
                {
                    key: 0,
                    outCurrency: "USD",
                    inCurrency: "BTC",
                    outAmount: 100,
                    inAmount: 1,
                    fee: 1,
                    feeCoin: "USD",
                },
            ]

            const marketRates = parseCoinbaseRates(new Map([
                    ["ETH", new Map([["USD",100]])],
                ],
            ))

            try {
                computeMarketRate(trades, "ETH", marketRates)
                expect(true).toBe(false)
            } catch (e) {
                //expected
            }
        })
    })
})