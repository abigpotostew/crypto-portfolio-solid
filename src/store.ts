// import {useEnsured, useProfile, useThing} from 'swrlit'
import {RDF, RDFS} from '@inrupt/vocab-common-rdf'
import moment from 'moment'
import {schema} from 'rdf-namespaces';
import {USD} from "./currencies";
import {createDocument, fetchDocument, TripleDocument, TripleSubject} from 'tripledoc';
import {Currency} from "./marketdata/provider";

const docname = "Cryptocurrency%20Ledger.ttl"

const cryptledgerNs = "https://stewartbracken.club/v/cryptoledger#"
export const LedgerType = {
    Ledger: `${cryptledgerNs}Ledger`,
    Trade: schema.TradeAction,
    // trades: `${cryptledgerNs}trades`,

    outAmount: `${cryptledgerNs}priceSpecification`,
    feeAmount: `${cryptledgerNs}feePriceSpecification`,
};

export class PodDocument {
    doc: TripleDocument;

    constructor(doc: TripleDocument) {
        this.doc = doc;
    }
}

enum TradeType {
    BUY = 1,
    SELL,
    TRANSFER_IN,
    TRANSFER_OUT
}

export interface Trade {
    currency: Currency;
    amount: number;
    cost: number; //in dollars, fiat
    fee: number; //always in fiat
    url: string; //pod ref
    dateCreated: Date;
    dateModified: Date;
    dirty: boolean;
    exchange: string;
    comment: string
    type: TradeType
}

export function newTrade(
                             currency: Currency,
                             amount: number,
                             cost: number,
                             fee: number,
                             url: string,
                             dateCreated: Date,
                             dateModified: Date,
                             exchange: string,
                             notes: string,
                             tradeType: TradeType
                         ): Trade {
    const out: Trade = {
        currency: currency,
        amount: amount,
        cost: cost,
        fee: fee,
        url: url,
        dateCreated: dateCreated || new Date(),
        dateModified: dateModified || new Date(),
        dirty: false,
        exchange: exchange,
        comment: notes,
        type: tradeType,
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

function getPriceSpecSubject(podDocument: TripleDocument, tradeSubject: TripleSubject, addType: string):TripleSubject|undefined{

    const priceSpecifications = tradeSubject.getAllRefs(schema.priceSpecification)

    const priceSubjects = priceSpecifications.map((pRef)=>podDocument.getSubject(pRef))

    //todo account for multiple add types
    return priceSubjects.find((pSubject)=>pSubject.getRef(schema.additionalType) === addType)
}

function hydrateTradeData(podDocument: TripleDocument, tradeSubject: TripleSubject) {
    const trade = tradeSubject
    const outAmount = getPriceSpecSubject(podDocument, tradeSubject, LedgerType.outAmount)
    const feeAmount = getPriceSpecSubject(podDocument, tradeSubject, LedgerType.feeAmount)

    if (!outAmount || !feeAmount) {
        console.error("missing amount")
        throw new Error("something is missing")
    }

    //todo need to verify this incoming data which could be bad data
    const newData = {
        // BTC
        currency: outAmount.getString(schema.priceCurrency),

        // 0.001
        amount: parseFloat(trade.getString(schema.price) || "0"),

        // $100.19
        cost: parseFloat(outAmount.getString(schema.price) || "0"),

        // $1.11
        fee: parseFloat(feeAmount.getString(schema.price) || "0"),
        url: tradeSubject.asRef(),
        dateCreated: trade.getDateTime(schema.dateCreated),
        dateModified: trade.getDateTime(schema.dateModified),
        comment: tradeSubject.getString(RDFS.comment),
        type: TradeType.BUY,
    }

    //

    return newTrade(...newData)
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

export async function saveTradesToLedger(podDocument: PodDocument, tradesData: Trade[], deletes:Trade[]) {
    //map each one to an existing subject, but update the data in each.
    // for new ones (missing url) add it to the ledger thing and document (create traderowtdoc)
    //it would be a good question for solid forum to isolate this scenario for replication.


    const doc = podDocument.doc

    const updatedTrades:TripleSubject[] = new Array<TripleSubject>()
    for(var i=0;i<tradesData.length;++i){
        const t = tradesData[i]
        if (t.url && doc.getSubject(t.url)) {
            if (! t.dirty){
                continue
            }
            // it's a modify
            const tradeSubject = doc.getSubject(t.url)
            //set all fields here

            //todo this is a perf enhancement
            // if (!tradeNeedsUpdate({podDocument:podDocument, tradeData:t, tradeSubject:tradeSubject})){
            //     return null //skip update if data is unchanged
            // }
            const newTradeSubj = setTradeInDocument(
                podDocument,
                // ledgerSubject: ledgerThing,
                t,
                tradeSubject
            )
            updatedTrades.push(...newTradeSubj)
            //todo add to a ledger subject, not just the container
            //don't set it on the ledger object because it's already there
            //ledgerSubject.addRef(LedgerType.trades, tradeSubject.asRef())
        } else {
            //it's a create
            const newSubjects = setNewTradeInDocument(
                podDocument,
                t
            )
            updatedTrades.push( ...newSubjects)
        }
    }

    // remove deletes and associated refs
    for(var i=0;i<deletes.length;++i){
        const d = deletes[i]
        const s = doc.getSubject(d.url)
        doc.removeSubject(d.url)
        updatedTrades.push(s)

        const amtRefs = s.getAllRefs(schema.priceSpecification)
        amtRefs.forEach((ref)=>{
            const s = doc.getSubject(ref)
            doc.removeSubject(ref)
            updatedTrades.push(s)
        })
    }

    updatedTrades.push(...deletes.map((d)=> {
        const s = doc.getSubject(d.url)
        doc.removeSubject(d.url)
        return s
    }))
    //todo add all the price specs

    if (updatedTrades.length>0) {
        //it can delete data that is updated to the same value, or something.
        console.log("saving new trades")
        const savedDoc = await doc.save(updatedTrades);
        console.log("saved new trades")
        return {podDocumentModified: savedDoc, tradesData: tradesData}
    }
}

function setDataDefaults(tradeData: Trade) {
    tradeData.amount = tradeData.amount || 0.0
    tradeData.fee = tradeData.fee || 0.0
}

function setTradeInDocument(podDocument: PodDocument, tradeData: Trade, tradeSubject: TripleSubject):TripleSubject[] {
    tradeSubject.setRef(RDF.type, LedgerType.Trade)
    var now = moment().toDate()
    tradeSubject.setDateTime(schema.dateModified, now)
    tradeSubject.setString(RDFS.comment, tradeData.comment)

    //set defaults
    setDataDefaults(tradeData)

    const doc = podDocument.doc
    //todo use type for currency

    const modifiedSubjects = new Array<TripleSubject>()

    const addAmount = (schemaType: string, amountDecimal: number, currency?: Currency) => {

        let amountSubject: TripleSubject|undefined = getPriceSpecSubject(podDocument.doc, tradeSubject, schemaType)

        if (!amountSubject){
            amountSubject= doc.addSubject()
        }

        // all existing data must be set again for existing objects, never conditionally set data
        amountSubject.setRef(RDF.type, schema.PriceSpecification)
        amountSubject.setRef(schema.additionalType, schemaType)
        tradeSubject.addRef(schema.priceSpecification, amountSubject.asRef())
        if (currency) amountSubject.setString(schema.priceCurrency, currency.symbol)
        amountSubject.setString(schema.price, String(amountDecimal))
        amountSubject?modifiedSubjects.push(amountSubject):null;
    }

    addAmount(LedgerType.outAmount, tradeData.amount, tradeData.currency)
    addAmount(LedgerType.feeAmount, tradeData.fee)
    modifiedSubjects.push(tradeSubject)
    return modifiedSubjects
    // ledgerSubject.setDateTime(schema.dateModified, now)
}

function setNewTradeInDocument(podDocument: PodDocument, tradeData: Trade) :TripleSubject[]{
    const tradeSubject = podDocument.doc.addSubject()
    const modifiedSubjects = setTradeInDocument(
        podDocument,
        tradeData,
        tradeSubject
    )
    tradeSubject.setDateTime(schema.dateCreated, moment().toDate())
    return modifiedSubjects
}