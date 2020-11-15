import {useEnsured, useProfile, useThing} from 'swrlit'
import {
    addUrl,
    asUrl,
    createSolidDataset,
    createThing,
    getDecimal,
    getStringNoLocale,
    getUrl,
    getUrlAll,
    saveSolidDatasetInContainer,
    setDatetime,
    setDecimal,
    setStringNoLocale,
    setThing,
    getThing
} from '@itme/solid-client'
import {WS} from '@inrupt/vocab-solid-common'
import {RDF, RDFS} from '@inrupt/vocab-common-rdf'
import moment from 'moment'
import {schema} from 'rdf-namespaces';
import {USD} from "./currencies";


const cryptledgerNs = "https://stewartbracken.club/v/cryptoledger#"
export const LedgerType = {
    Ledger: `${cryptledgerNs}Ledger`,
    Trade: `${cryptledgerNs}Trade`,
    trades: `${cryptledgerNs}trades`,
    outAmount: `${cryptledgerNs}outAmount`,
    inAmount: `${cryptledgerNs}inAmount`,
    feeAmount: `${cryptledgerNs}feeAmount`,
}

export function useLedgerContainerUri(webId, path = 'public') {
    const storageContainer = useStorageContainer(webId)
    return useEnsured(storageContainer && `${storageContainer}${path}/cryptoledger/`)
}

export async function deleteLedger(ledger, ledgerContainerUri, mutateLedgers){

    await deleteSolidDataset(asUrl(ledger))
    mutateLedgers()
}

export async function createLedger({name = "Cryptocurrency Ledger"}, ledgerContainerUri, mutateLedgers) {
    var ledger = createThing({name: 'ledger'});
    ledger = addUrl(ledger, RDF.type, LedgerType.Ledger)
    ledger = setStringNoLocale(ledger, RDFS.label, name)
    var dataset = createSolidDataset()
    dataset = setThing(dataset, ledger)
    await saveSolidDatasetInContainer(ledgerContainerUri, dataset, {slugSuggestion: name})
    mutateLedgers()
}

function useStorageContainer(webId) {
    const {profile} = useProfile(webId)
    return profile && getUrl(profile, WS.storage)
}

export function ttlFiles(resource) {
    return asUrl(resource).endsWith(".ttl")
}


export function getTrade(url, idx, setData) {
    // return tradeUrl
    const {thing: tradeThing} = url&&useThing(`${url}`)
    // const name = tradeThing && getStringNoLocale(tradeThing, RDFS.label)

    const getAmount = (typeRef) => {
        const amountUrl = tradeThing && getUrl(tradeThing, typeRef)
        const {thing: amountThing} = useThing(`${amountUrl}`)

        const currency = amountThing && getStringNoLocale(amountThing, schema.currency)
        const amount = amountThing && getDecimal(amountThing, schema.amount)
        return {currency: currency, amount: amount}
    }

    const {currency: outCurrency, amount: outAmount} = getAmount(LedgerType.outAmount)
    const {currency: inCurrency, amount: inAmount} = getAmount(LedgerType.inAmount)
    const {currency: feeCurrency, amount: feeAmount} = getAmount(LedgerType.feeAmount)

    if (tradeThing){
        //set data
        const t = newTrade({
            outCurrency:outCurrency,
            outAmount:outAmount,
            inCurrency:inCurrency,
            inAmount:inAmount,
            feeCurrency:feeCurrency,
            feeAmount:feeAmount,
            url:url
        })
        setData(old=> old.concat(t))
    }else{
//the thing
    }

    return newTrade({
        outCurrency:outCurrency,
        outAmount:outAmount,
        inCurrency:inCurrency,
        inAmount:inAmount,
        feeCurrency:feeCurrency,
        feeAmount:feeAmount,
        url:url
    })
}

export function getRows(ledgerObject) {
    if (!ledgerObject){
        return {}
    }
    //trades in ledger
    const url = asUrl(ledgerObject)
    // getThing(url)
    const {thing: ledgerThing, save, resource, saveResource} = ledgerObject && useThing(`${url}#ledger`)
    const name = ledgerThing && getStringNoLocale(ledgerThing, RDFS.label)
    const trades = ledgerThing && getUrlAll(ledgerThing, LedgerType.trades)

    if (trades) {
        //loop
        // trade
        //{trades && trades.map(trade => <Entry key={entry} entryUri={entry}/>)}
        return {ledgerThing: ledgerThing, trades: trades, resource: resource, saveResource: saveResource}
        // const { thing: entry, save } = useThing(entryUri)
        // const description = getStringNoLocale(entry, RDFS.comment)
        // const start = getDatetime(entry, schema.startTime)
        // const end = getDatetime(entry, schema.endTime)
        // setData(old=>{
        //
        // })
    } else {
        //return pending
        // return {}
        // setData((old)=>{
        //     return old
        // })
        return {}
    }
}

export async function createTradeRow ({ledger, ledgerResource, saveResource}) {
    var trade = createThing();
    trade = addUrl(trade, RDF.type, LedgerType.Trade)
    //todo set all the trade fields here
    trade = setStringNoLocale(trade, RDFS.comment, "HELLO WORLD")

    var now = moment().toDate()
    trade = setDatetime(trade, schema.dateCreated, now)
    trade = setDatetime(trade, schema.dateModified, now)
    // trade = setDatetime(trade, schema.endTime, endMoment.toDate())
    // trade = setStringNoLocale(trade, RDFS.PaymentCurrencyAmount)

    const addAmount = (trade, ledgerResource, schemaType) => {
        var amount = createThing()
        amount = addUrl(amount, RDF.type, schema.MonetaryAmount) // it is a monetary amount type
        amount = setStringNoLocale(amount, schema.currency, "USD")
        amount = setDecimal(amount, schema.amount, 1.1)
        ledgerResource = setThing(ledgerResource, amount)
        trade = addUrl(trade, schemaType, amount)
        return [trade, ledgerResource]
    }

    var [trade1, ledgerResource1] = addAmount(trade, ledgerResource, LedgerType.outAmount)
    var [trade2, ledgerResource2] = addAmount(trade1, ledgerResource1, LedgerType.inAmount)
    var [trade3, ledgerResource3] = addAmount(trade2, ledgerResource2, LedgerType.feeAmount)
    trade = trade3
    ledgerResource = ledgerResource3

    var newLedger = addUrl(ledger, LedgerType.trades, trade)//add trade to the ledger
    ledgerResource = setThing(ledgerResource, newLedger)
    ledgerResource = setThing(ledgerResource, trade)//add
    await saveResource(ledgerResource)
}

// export class Trade {
//     outCurrency;
//     inCurrency;
//     outAmount;
//     inAmount;
//     fee;
//     feeCoin;
export function newTrade({outCurrency,
                         inCurrency,
                         outAmount,
                         inAmount,
                         fee,
                         feeCoin,
                         url}){
    const out = {}
    out.outCurrency = outCurrency
    out.inCurrency = inCurrency;
    out.outAmount = outAmount;
    out.inAmount = inAmount;
    out.fee = fee;
    out.feeCoin = feeCoin;
    out.url = url
    return out
}