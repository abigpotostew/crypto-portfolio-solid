import {
    createSolidDataset, saveSolidDatasetInContainer,
    setThing, createThing, asUrl,
    getUrl, getUrlAll, addUrl,
    getStringNoLocale, setStringNoLocale,
    getDatetime, setDatetime
} from '@itme/solid-client'
import {WS} from '@inrupt/vocab-solid-common'
import {RDF, RDFS} from '@inrupt/vocab-common-rdf'

import { useEnsured, useProfile} from 'swrlit'


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