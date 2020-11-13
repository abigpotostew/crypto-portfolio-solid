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
    getDatetime, setDatetime
} from '@itme/solid-client'
import {WS} from '@inrupt/vocab-solid-common'
import {RDF, RDFS} from '@inrupt/vocab-common-rdf'

import { schema } from 'rdf-namespaces';


const cryptledgerNs = "https://stewartbracken.club/v/cryptoledger#"
export const LedgerType = {
    Ledger: `${cryptledgerNs}Ledger`,
    Trade: `${cryptledgerNs}Trade`,
    trades: `${cryptledgerNs}trades`
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

export function getRows(ledgerUrl){
    //trades in ledger
    const url = asUrl(ledgerUrl)
    const { thing: ledger, save, resource, saveResource } = useThing(`${url}#ledger`)
    const name = ledger && getStringNoLocale(ledger, RDFS.label)
    const trades = ledger && getUrlAll(ledger, LedgerType.trades)

    if (trades){
        //loop
        // trade
        //{trades && trades.map(trade => <Entry key={entry} entryUri={entry}/>)}
        return {trades:trades, resource:resource, saveResource:saveResource}
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

    var newLedger = addUrl(ledger, LedgerType.trades, trade)
    var newResource = setThing(ledgerResource, newLedger)
    newResource = setThing(newResource, trade)
    await saveResource(newResource)
    // setDescription("")
}