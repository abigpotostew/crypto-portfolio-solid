import {Trade} from "./store";
import {Currencies, Currency} from "./marketdata/provider";

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

    feeValue:number
    feeCurrency:Currency
    trade:Trade
}

const currencyNone={id:"<NA>", name:"<NA>", symbol:"<NA>"}

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


    let head:Node = {
        id: tradesInOrder[0].url + outnode,
        value: tradesInOrder[0].amount,
        currency: getReq(tradesInOrder[0].currency),
        children: [],
        parent: undefined,
        feeValue:tradesInOrder[0].fee,
        feeCurrency:getReq(tradesInOrder[0].feeCoin),
        trade: tradesInOrder[0],
    }
    let leafNodes :Node[]= [];


    const findLeaf=(forCurrency:Currency, inExchange:string):Node=>{
        //for each leaf, find first in exchange and has enough currency same type
        //todo if not enough currency, find all nodes in exchange
        return head
    }

    const calcTotal=(currency:Currency):number=>{
        return leafNodes.filter((n)=> n.currency.id===currency.id).reduce((prev, curr)=> prev+curr.value, 0)
    }

    const totals = new Map<Currency,number>()


    for (var i = 0; i < tradesInOrder.length; ++i) {
        const trade = tradesInOrder[i]

        //find parent node here
        if (trade.currency==="USD"){
            //it's a new usd head
            //add to heads
        }else {
            //try to find parent leaf for this trade's exchange,
            //todo add exchange to trades

        }

        let parentOutNode:Node

        // find parent of out node
        if (trade.currency=="USD"){
            parentOutNode = {
                id: trade.url + outnode,
                value: trade.amount,
                currency: getReq(trade.currency),
                children: [],
                parent: undefined,
                feeValue:trade.fee,
                feeCurrency:getReq(trade.feeCoin),
                trade: trade,
            }
        }else{
            //find parent from leaves for our currency
            //which tree?
            parentOutNode =findLeaf(getReq(trade.currency), trade.exchange)
            //todo what if it's not found?
        }


        const inNode:Node = {
            id: trade.url + innode,
            value: trade.inAmount,
            currency: getReq(trade.inCurrency),
            children: [],
            parent: [parentOutNode],
            feeValue:0,
            feeCurrency:currencyNone,
            trade:trade
        }
        parentOutNode.children.push(inNode)
        //calc remainder
        /**
         * for each leaf
         */
        let totalOut = calcTotal(outNode.currency)
        if(totalOut - trade.amount > 0){

            const remainderNode:Node = {
                id: trade.url + remaindernode,
                value: totalOut - trade.amount,
                currency: getReq(trade.currency),
                children: [],
                parent: [outNode],
                feeValue:0,
                feeCurrency:currencyNone,
                trade:trade
            }

            outNode.children.push(inNode)
        }
    }

    return {}
}