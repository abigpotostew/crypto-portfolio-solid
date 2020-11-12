
const createTimelog = async ({ name = "Time Tracker"}) => {
    var log = createThing({ name: 'log' });
    log = addUrl(log, RDF.type, TIMELOG.Log)
    log = setStringNoLocale(log, RDFS.label, name)
    var dataset = createSolidDataset()
    dataset = setThing(dataset, log)
    await saveSolidDatasetInContainer(timelogContainerUri, dataset, { slugSuggestion: name })
    mutateTimelogs()
}