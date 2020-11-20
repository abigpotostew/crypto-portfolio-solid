// import {useEnsured, useProfile, useThing} from 'swrlit'
import {
    addUrl,
    asUrl,
    createSolidDataset,
    createThing,
    deleteSolidDataset,
    getUrl,
    saveSolidDatasetInContainer,
    setDatetime,
    setDecimal,
    setStringNoLocale,
    setThing
} from '@inrupt/solid-client'
import {WS} from '@inrupt/vocab-solid-common'
import {RDF, RDFS} from '@inrupt/vocab-common-rdf'
import moment from 'moment'
import {schema} from 'rdf-namespaces';
import {USD} from "./currencies";
import {createDocument, fetchDocument} from 'tripledoc';

const docname = "Cryptocurrency%20Ledger.ttl"

const cryptledgerNs = "https://stewartbracken.club/v/cryptoledger#"
export const LedgerType = {
    Ledger: `${cryptledgerNs}Ledger`,
    Trade: `${cryptledgerNs}Trade`,
    trades: `${cryptledgerNs}trades`,
    outAmount: `${cryptledgerNs}outAmount`,
    outCurrency: `${cryptledgerNs}outCurrency`,
    inAmount: `${cryptledgerNs}inAmount`,
    inCurrency: `${cryptledgerNs}inCurrency`,
    feeAmount: `${cryptledgerNs}fee`,
    feeCurrency: `${cryptledgerNs}feeCurrency`,
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

export function ttlFiles(resource) {
    return asUrl(resource).endsWith(".ttl")
}



export function newTrade({
                             outCurrency,
                             inCurrency,
                             outAmount,
                             inAmount,
                             fee,
                             feeCoin,
                             url,
                             dateCreated,
                             dateModified
                         }) {
    const out = {}
    out.outCurrency = outCurrency
    out.inCurrency = inCurrency;
    out.outAmount = outAmount;
    out.inAmount = inAmount;
    out.fee = fee;
    out.feeCoin = feeCoin;
    out.url = url
    out.dateCreated = dateCreated || new Date().getDate()
    out.dateModified = dateModified || new Date().getDate()
    // trade.setDateTime(schema.dateCreated, now)
    // trade.setDateTime(schema.dateModified, now)
    return out
}

export async function getLedgerDoc(podDocUrl) {
    const docPath = `${podDocUrl}/${docname}`;

    let docOut
    try {
        console.log("fetching pod document at", docPath)
        docOut = await fetchDocument(docPath);
        console.log("fetched pod document at", docPath)
    } catch (err) {
        //TODO need to test this. it may need to use create doc in container
        console.log("creating new pod document at", docPath)
        docOut = await createDocument(docPath);
        console.log("created new pod document at", docPath)
    }

    return docOut
}

export function getLedgerThings(ledgerDoc){
    const ledgers = ledgerDoc.getAllSubjectsOfType(LedgerType.Ledger);//one per doc??
    return ledgers
}

function hydrateTradeData(podDocument, tradeSubjectRef){
    const trade = podDocument.getSubject(tradeSubjectRef)
    // const outAmount = podDocument.getSubject(trade.getRef(LedgerType.outAmount))
    // const inAmount = podDocument.getSubject(trade.getRef(LedgerType.inAmount))


    // const feeAmount = podDocument.getSubject(trade.getRef(LedgerType.feeAmount))
    //todo need to verify this incoming data which could be bad data
    return newTrade({

        outCurrency: trade.getString(LedgerType.outCurrency),
        inCurrency: trade.getString(LedgerType.inCurrency),
        feeCoin: trade.getString(LedgerType.feeCurrency),
        outAmount: parseFloat(trade.getString(LedgerType.outAmount)),
        inAmount: parseFloat(trade.getString(LedgerType.inAmount)),
        fee: parseFloat(trade.getString(LedgerType.feeAmount)),
        url: tradeSubjectRef,
        dateCreated: trade.getDateTime(schema.dateCreated),
        dateModified: trade.getDateTime(schema.dateModified)
    })
}

export function getAllTradesDataFromDoc(podDocument) {
    try {

        const tradesRefs = podDocument.getAllSubjectsOfType(LedgerType.Trade)
        const tradesData = tradesRefs.map((t)=>hydrateTradeData(podDocument,t.asRef()))

        return tradesData
    } catch (err) {
        return [];
    }
}

export async function saveTradesToLedger({podDocument, tradesData}) {
    //map each one to an existing subject, but update the data in each.
    // for new ones (missing url) add it to the ledger thing and document (create traderowtdoc)
    //it would be a good question for solid forum to isolate this scenario for replication.

    // i have to delete monetary amount in a separate save. not sure why.
  // podDocument = await deleteAllSubjectsOfType({podDocument:podDocument, types:[LedgerType.Trade]})
    // podDocument = await deleteAllSubjectsOfType({podDocument:podDocument, types:[schema.MonetaryAmount]})


    tradesData.map((t) => {
        if (t.url && podDocument.getSubject(t.url)) {
            // it's a modify
            const tradeSubject = podDocument.getSubject(t.url)
            //set all fields here

            //it's lame but this is the fix to the delete existing problem.
            if (!tradeNeedsUpdate({podDocument:podDocument, tradeData:t, tradeSubject:tradeSubject})){
                return null //skip update if data is unchanged
            }
            setTradeInDocument({
                podDocument: podDocument,
                // ledgerSubject: ledgerThing,
                tradeData: t,
                tradeSubject: tradeSubject
            })
            //don't set it on the ledger object because it's already there
            //ledgerSubject.addRef(LedgerType.trades, tradeSubject.asRef())
        } else {
            //it's a create
            const newTrade = setNewTradeInDocument({
                podDocument: podDocument,
                tradeData: t
            })
            t.url = newTrade.asRef()
            // ledgerThing.addRef(LedgerType.trades, newTrade.asRef())
        }
    })

    //it can delete data that is updated to the same value, or something.
    console.log("saving new trades")
    const savedDoc = await podDocument.save();
    console.log("saved new trades")
    return {podDocumentModified: savedDoc, tradesData:tradesData}

    // todo handle deletes
}

function setDataDefaults(tradeData){
    tradeData.outAmount =tradeData.outAmount || 0.0
    tradeData.inAmount =tradeData.inAmount || 0.0
    tradeData.fee =tradeData.fee || 0.0
    tradeData.outCurrency=tradeData.outCurrency || "USD"
    tradeData.inCurrency=tradeData.inCurrency || "BTC"
    tradeData.feeCoin =tradeData.feeCoin || 'USD'
}

function setTradeInDocument({podDocument, tradeData, tradeSubject}) {
    tradeSubject.setRef(RDF.type, LedgerType.Trade)
    var now = moment().toDate()
    tradeSubject.setDateTime(schema.dateModified, now)
    tradeSubject.setString(RDFS.comment, "HELLO WORLD")

    //set defaults
    setDataDefaults(tradeData)

    tradeSubject.setString(LedgerType.outAmount, ""+tradeData.outAmount)
    tradeSubject.setString(LedgerType.outCurrency, tradeData.outCurrency)
    tradeSubject.setString(LedgerType.inAmount, ""+tradeData.inAmount)
    tradeSubject.setString(LedgerType.inCurrency, tradeData.inCurrency)
    tradeSubject.setString(LedgerType.feeAmount, ""+tradeData.fee)
    tradeSubject.setString(LedgerType.feeCurrency, tradeData.feeCoin)

    // ledgerSubject.setDateTime(schema.dateModified, now)
}

function tradeNeedsUpdate({podDocument, tradeData, tradeSubject}){
    const docTrade = hydrateTradeData(podDocument, tradeSubject.asRef())

    const entries = Object.entries(tradeData)
    for (const [key, value] of entries) {
        if (docTrade[key] !== value)
            return true
    }
    return false
}

function setNewTradeInDocument({podDocument, tradeData}) {
    const tradeSubject = podDocument.addSubject()
    setTradeInDocument({
        podDocument: podDocument,
        tradeData: tradeData,
        tradeSubject: tradeSubject
    })
    tradeSubject.setDateTime(schema.dateCreated, moment().toDate())
    return tradeSubject
}

// returns the new trade document reference
export async function createTradeRowTDoc({podDocument, ledgerThing: ledgerSubject, tradeData}) {

    const tradeSubject = setNewTradeInDocument({podDocument: podDocument, ledgerSubject: ledgerSubject, tradeData: tradeData})

    const savedDoc = await podDocument.save();
    return {podDocumentModified: savedDoc, ledgerSubject: ledgerSubject, tradeRef: tradeSubject.asRef()}
}