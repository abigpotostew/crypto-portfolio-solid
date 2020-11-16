
import auth from 'solid-auth-client';


export async function getWebId() {
    const session = await auth.currentSession();
    if (session) {
        return session.webId;
    }
    return null;
}
