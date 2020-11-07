import {useProfile, useThing, useWebId,useContainer,useEnsured} from 'swrlit'

 function useStorageContainer(webId) {
    const { profile } = useProfile(webId)
    return profile && getUrl(profile, WS.storage)
}
function useAccountsContainerUri(webId, path = 'public') {
    const storageContainer = useStorageContainer(webId)
    return useEnsured(storageContainer && `${storageContainer}${path}/notes/`)
}


export default function Accounts({children = (item, index) => <li key={index}>{`${item}`}</li>}) {

    const webId = useWebId()
    const accountsContainerUri = useAccountsContainerUri(webId ,"public")
    console.log(accountsContainerUri)
    const { resources: notes, mutate } = useContainer(accountsContainerUri)
    // const expression = `[${src}].public.Text`;
    // const [notes, pending, error] = useLDflex(expression, true);
    //
    // if (pending)
    //     return <span>loading <em>({notes.length} posts so far)</em></span>;
    // if (error)
    //     return <span>loading failed: {error.message}</span>;

    console.log(notes)
    return <ul>{notes&&notes.map(children)}</ul>;


}