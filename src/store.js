import {
    useWebId, useAuthentication,
    useMyProfile, useProfile,
    useEnsured, useContainer,
    useThing
} from 'swrlit'
import {
    createSolidDataset, saveSolidDatasetInContainer,
    setThing, createThing, asUrl,
    getUrl, getUrlAll, addUrl,
    getStringNoLocale, setStringNoLocale,
    getDatetime, setDatetime, setDecimal
} from '@itme/solid-client'
import {WS} from '@inrupt/vocab-solid-common'
import {RDF, RDFS} from '@inrupt/vocab-common-rdf'

import { schema } from 'rdf-namespaces';


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

export async function createLedger ({ name = "Cryptocurrency Ledger"},  ledgerContainerUri, mutateLedgers)  {
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

export function getRows(ledgerObject){
    //trades in ledger
    const url = asUrl(ledgerObject)
    const { thing: ledgerThing, save, resource, saveResource } = useThing(`${url}#ledger`)
    const name = ledgerThing && getStringNoLocale(ledgerThing, RDFS.label)
    const trades = ledgerThing && getUrlAll(ledgerThing, LedgerType.trades)

    if (trades){
        //loop
        // trade
        //{trades && trades.map(trade => <Entry key={entry} entryUri={entry}/>)}
        return {ledgerThing:ledgerThing,trades:trades, resource:resource, saveResource:saveResource}
        // const { thing: entry, save } = useThing(entryUri)
        // const description = getStringNoLocale(entry, RDFS.comment)
        // const start = getDatetime(entry, schema.startTime)
        // const end = getDatetime(entry, schema.endTime)
    }else{
        //return pending
        return {}
    }
}

export async function createTradeRow ({ledger, ledgerResource, saveResource}) {
    var trade = createThing();
    trade = addUrl(trade, RDF.type, LedgerType.Trade)
    //todo set all the trade fields here
    trade = setStringNoLocale(trade, RDFS.comment, "HELLO WORLD")
    // trade = setDatetime(trade, schema.startTime, startMoment.toDate())
    // trade = setDatetime(trade, schema.endTime, endMoment.toDate())
    // trade = setStringNoLocale(trade, RDFS.PaymentCurrencyAmount)

    var newLedgerResource
    const addAmount = (schemaType)=>{
        var amount = createThing()
        amount = addUrl(amount, RDF.type, schema.MonetaryAmount) // it is a monetary amount type
        amount = setStringNoLocale(amount, schema.currency, "USD")
        amount = setDecimal(amount, schema.amount, 1.1)
        newLedgerResource = setThing(ledgerResource, amount)
        trade = addUrl(trade, schemaType, amount)
    }

    addAmount(LedgerType.outAmount)
    addAmount(LedgerType.inAmount)
    addAmount(LedgerType.feeAmount)
    //
    // var outAmount = createThing()
    // outAmount = addUrl(outAmount, RDF.type, schema.MonetaryAmount) // it is a monetary amount type
    // outAmount = setStringNoLocale(outAmount, schema.currency, "USD")
    // outAmount = setDecimal(outAmount, schema.amount, 1.1)
    // var newLedgerResource = setThing(ledgerResource, outAmount)
    // trade = addUrl(trade, LedgerType.outAmount, outAmount)
    //
    // var inAmount = createThing()
    // inAmount = addUrl(inAmount, RDF.type, schema.MonetaryAmount) // it is a monetary amount type
    // inAmount = setStringNoLocale(inAmount, schema.currency, "BTC")
    // inAmount = setDecimal(inAmount, schema.amount, 1.1)
    // newLedgerResource = setThing(ledgerResource, inAmount)
    // trade = addUrl(trade, LedgerType.inAmount, inAmount)
    //
    // var inAmount = createThing()
    // inAmount = addUrl(inAmount, RDF.type, schema.MonetaryAmount) // it is a monetary amount type
    // inAmount = setStringNoLocale(inAmount, schema.currency, "BTC")
    // inAmount = setDecimal(inAmount, schema.amount, 1.1)
    // newLedgerResource = setThing(ledgerResource, inAmount)
    // trade = addUrl(trade, LedgerType.inAmount, inAmount)

    var newTrade = addUrl(ledger, LedgerType.trades, trade) //todo add this for monetary amount
    newLedgerResource = setThing(newLedgerResource, newTrade)
    newLedgerResource = setThing(newLedgerResource, trade)
    await saveResource(newLedgerResource)
    // callback("")



    // ideas for format
    // schema.price
    // schema.amount =
    // schema.priceCurrency = "USD"
    // schema.MonetaryAmount = "50 USD" //create thing
}