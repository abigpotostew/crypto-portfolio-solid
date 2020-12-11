import {Trade} from "./store";
import {Currencies, Currency, UncheckedCurrency} from "./marketdata/provider";

export interface TradeGraph {

}


const outnode = "-out"
const innode = "-in"
const remaindernode = "-remainder"

interface Node {
    id: string;
    value: number
    currency: Currency
    children: Node[]
    parent: Node[] | undefined

    feeValue: number
    feeCurrency: Currency
    trade: Trade
}

const currencyNone: Currency = new UncheckedCurrency("<NA>")

export function graph(tradesInOrder: Trade[], currencies: Currencies): TradeGraph {

    let getReq = (id: string) => {
        const out = currencies.get(id);
        if (out) return out
        else {
            throw new Error("missing currency " + id)
        }
    }


    // const heads = new Array<Node>()
    // const leafNodes = new Map<Node, Node[]>()
    // let head :Node


    let head: Node = {
        id: tradesInOrder[0].url + outnode,
        value: tradesInOrder[0].amount.amount,
        currency: getReq(tradesInOrder[0].amount.currency.symbol),
        children: [],
        parent: undefined,
        feeValue: tradesInOrder[0].fee.amount,
        feeCurrency: getReq(tradesInOrder[0].fee.currency.symbol),
        trade: tradesInOrder[0],
    }
    let leafNodes: Node[] = [];


    const findLeaf = (forCurrency: Currency, inExchange: string): Node => {
        //for each leaf, find first in exchange and has enough currency same type
        //todo if not enough currency, find all nodes in exchange
        return head
    }

    const calcTotal = (currency: Currency): number => {
        return leafNodes.filter((n) => n.currency.id === currency.id).reduce((prev, curr) => prev + curr.value, 0)
    }

    const totals = new Map<Currency, number>()


    for (var i = 0; i < tradesInOrder.length; ++i) {
        const trade = tradesInOrder[i]

        //find parent node here
        if (trade.amount.currency.symbol === "USD") {
            //it's a new usd head
            //add to heads
        } else {
            //try to find parent leaf for this trade's exchange,
            //todo add exchange to trades

        }

        let parentOutNode: Node

        // find parent of out node
        if (trade.amount.currency.symbol === "USD") {
            parentOutNode = {
                id: trade.url + outnode,
                value: trade.amount.amount,
                currency: getReq(trade.amount.currency.symbol),
                children: [],
                parent: undefined,
                feeValue: trade.fee.amount,
                feeCurrency: getReq(trade.fee.currency.symbol),
                trade: trade,
            }
        } else {
            //find parent from leaves for our currency
            //which tree?
            parentOutNode = findLeaf(getReq(trade.amount.currency.symbol), trade.exchange)
            //todo what if it's not found?
        }


        const inNode: Node = {
            id: trade.url + innode,
            value: trade.amount.amount,
            currency: getReq(trade.amount.currency.symbol),
            children: [],
            parent: [parentOutNode],
            feeValue: 0,
            feeCurrency: currencyNone,
            trade: trade
        }
        parentOutNode.children.push(inNode)
        //calc remainder
        /**
         * for each leaf
         */
        // let totalOut = calcTotal(outNode.currency)
        // if (totalOut - trade.amount > 0) {
        //
        //     const remainderNode: Node = {
        //         id: trade.url + remaindernode,
        //         value: totalOut - trade.amount,
        //         currency: getReq(trade.currency),
        //         children: [],
        //         parent: [outNode],
        //         feeValue: 0,
        //         feeCurrency: currencyNone,
        //         trade: trade
        //     }
        //
        //     outNode.children.push(inNode)
        // }
    }

    return {}
}