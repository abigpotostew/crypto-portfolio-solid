// import {useEnsured, useProfile, useThing} from 'swrlit'
import {RDF, RDFS} from '@inrupt/vocab-common-rdf'
import moment from 'moment'
import {schema} from 'rdf-namespaces';
import {USD} from "./currencies";
import {createDocument, fetchDocument, TripleDocument, TripleSubject} from 'tripledoc';

const docname = "Cryptocurrency%20Ledger.ttl"

const cryptledgerNs = "https://stewartbracken.club/v/cryptoledger#"
export const LedgerType = {
    Ledger: `${cryptledgerNs}Ledger`,
    Trade: `${cryptledgerNs}Trade`,
    trades: `${cryptledgerNs}trades`,
    outAmount: `${cryptledgerNs}outAmount`,
    inAmount: `${cryptledgerNs}inAmount`,
    feeAmount: `${cryptledgerNs}feeAmount`,
};

export class PodDocument {
    doc: TripleDocument;

    constructor(doc: TripleDocument) {
        this.doc = doc;
    }
}

interface Trade {
    outCurrency: string;
    inCurrency: string;
    outAmount: number;
    inAmount: number;
    fee: number;
    feeCoin: string;
    url: string; //pod ref
    dateCreated: Date;
    dateModified: Date;
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
                         }: any): Trade {
    const out: Trade = {
        outCurrency: outCurrency,
        inCurrency: inCurrency,
        outAmount: outAmount,
        inAmount: inAmount,
        fee: fee,
        feeCoin: feeCoin,
        url: url,
        dateCreated: dateCreated || new Date().getDate(),
        dateModified: dateModified || new Date().getDate()
    }
    return out
}

export async function getLedgerDoc(podDocUrl: string): Promise<PodDocument> {
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
        docOut = await docOut.save()
        docOut = await fetchDocument(docPath);
        console.log("created new pod document at", docPath)
    }

    return new PodDocument(docOut)
}

function hydrateTradeData(podDocument: TripleDocument, tradeSubject: TripleSubject) {
    const trade = tradeSubject
    const outAmtRef = trade.getRef(LedgerType.outAmount)
    const inAmtRef = trade.getRef(LedgerType.inAmount)
    const feeAmtRef = trade.getRef(LedgerType.feeAmount)
    if (!outAmtRef || !inAmtRef || !feeAmtRef) {
        console.error("missing amount")
        throw new Error("something is missing")
    }
    const outAmount = podDocument.getSubject(outAmtRef)
    const inAmount = podDocument.getSubject(inAmtRef)
    const feeAmount = podDocument.getSubject(feeAmtRef)

    //todo need to verify this incoming data which could be bad data
    const newData = {

        outCurrency: outAmount.getString(schema.currency),
        inCurrency: inAmount.getString(schema.currency),
        outAmount: parseFloat(outAmount.getString(schema.amount) || "0"),
        inAmount: parseFloat(inAmount.getString(schema.amount) || "0"),
        fee: parseFloat(feeAmount.getString(schema.amount) || "0"),
        feeCoin: feeAmount.getString(schema.currency),
        url: tradeSubject.asRef(),
        dateCreated: trade.getDateTime(schema.dateCreated),
        dateModified: trade.getDateTime(schema.dateModified)
    }
    return newTrade(newData)
}

export function getAllTradesDataFromDoc(podDocument: PodDocument): Trade[] {
    try {

        const tradeSubjects = podDocument.doc.getAllSubjectsOfType(LedgerType.Trade)
        const tradesData = tradeSubjects.map((t) => hydrateTradeData(podDocument.doc, t))

        return tradesData
    } catch (err) {
        return [];
    }
}

export async function saveTradesToLedger(podDocument: PodDocument, tradesData: Trade[]) {
    //map each one to an existing subject, but update the data in each.
    // for new ones (missing url) add it to the ledger thing and document (create traderowtdoc)
    //it would be a good question for solid forum to isolate this scenario for replication.


    const doc = podDocument.doc

    tradesData.map((t) => {
        if (t.url && doc.getSubject(t.url)) {
            // it's a modify
            const tradeSubject = doc.getSubject(t.url)
            //set all fields here

            //todo this is a perf enhancement
            // if (!tradeNeedsUpdate({podDocument:podDocument, tradeData:t, tradeSubject:tradeSubject})){
            //     return null //skip update if data is unchanged
            // }
            setTradeInDocument(
                podDocument,
                // ledgerSubject: ledgerThing,
                t,
                tradeSubject
            )
            //todo add to a ledger subject, not just the container
            //don't set it on the ledger object because it's already there
            //ledgerSubject.addRef(LedgerType.trades, tradeSubject.asRef())
        } else {
            //it's a create
            const newTrade = setNewTradeInDocument(
                podDocument,
                t
            )
            t.url = newTrade.asRef()
            // ledgerThing.addRef(LedgerType.trades, newTrade.asRef())
        }
    })

    //it can delete data that is updated to the same value, or something.
    console.log("saving new trades")
    const savedDoc = await doc.save();
    console.log("saved new trades")
    return {podDocumentModified: savedDoc, tradesData:tradesData}

    // todo handle deletes
}

function setDataDefaults(tradeData: Trade) {
    tradeData.outAmount = tradeData.outAmount || 0.0
    tradeData.inAmount = tradeData.inAmount || 0.0
    tradeData.fee = tradeData.fee || 0.0
    tradeData.outCurrency = tradeData.outCurrency || "USD"
    tradeData.inCurrency = tradeData.inCurrency || "BTC"
    tradeData.feeCoin = tradeData.feeCoin || 'USD'
}

function setTradeInDocument(podDocument: PodDocument, tradeData: Trade, tradeSubject: TripleSubject) {
    tradeSubject.setRef(RDF.type, LedgerType.Trade)
    var now = moment().toDate()
    tradeSubject.setDateTime(schema.dateModified, now)
    tradeSubject.setString(RDFS.comment, "HELLO WORLD")

    //set defaults
    setDataDefaults(tradeData)

    const doc = podDocument.doc
    //todo use type for currency
    const addAmount = (schemaType: string, amountDecimal: number, currency: string) => {
        let amountSubjectRef = tradeSubject.getRef(schemaType)
        let amountSubject: TripleSubject

        //if there's a change then delete the amount and add new
        if (amountSubjectRef) {
            amountSubject = doc.getSubject(amountSubjectRef)
            tradeSubject.addRef(schemaType, amountSubject.asRef())
        } else {
            amountSubject = doc.addSubject()
            //add vs set. set doesn't work
            amountSubject.addRef(RDF.type, schema.MonetaryAmount) // it is a monetary amount type
            tradeSubject.addRef(schemaType, amountSubject.asRef())
        }

        if (currency !== amountSubject.getString(schema.currency)) {
            amountSubject.setString(schema.currency, currency)
        }
        if (amountDecimal !== amountSubject.getDecimal(schema.amount)) {
            amountSubject.setString(schema.amount, String(amountDecimal))
        }
    }

    addAmount(LedgerType.outAmount, tradeData.outAmount, tradeData.outCurrency)
    addAmount(LedgerType.inAmount, tradeData.inAmount, tradeData.inCurrency)
    addAmount(LedgerType.feeAmount, tradeData.fee, tradeData.feeCoin)

    // ledgerSubject.setDateTime(schema.dateModified, now)
}

function setNewTradeInDocument(podDocument: PodDocument, tradeData: Trade) {
    const tradeSubject = podDocument.doc.addSubject()
    setTradeInDocument(
        podDocument,
        tradeData,
        tradeSubject
    )
    tradeSubject.setDateTime(schema.dateCreated, moment().toDate())
    return tradeSubject
}

// returns the new trade document reference
export async function createTradeRowTDoc(podDocument: PodDocument, tradeData: Trade) {
    const tradeSubject = setNewTradeInDocument(podDocument, tradeData)
    const savedDoc = await podDocument.doc.save();
    return {podDocumentModified: savedDoc, tradeRef: tradeSubject.asRef()}
}