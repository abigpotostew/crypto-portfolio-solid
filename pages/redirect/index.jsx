import styles from "../../styles/Home.module.css";
import Head from "next/head";
import superagent from "superagent"
import dynamic from "next/dynamic";
import {useState, useEffect} from "react"

import fetchToken from "../../src/fetchToken"
    //dynamic(() => import("../../src/fetchToken"), { ssr: false });

export default function Redirect() {
    const [renderClientSideComponent, setRenderClientSideComponent] = useState(0);
    useEffect(() => {
        // update some client side state to say it is now safe to render the client-side only component
        if (!renderClientSideComponent) {fetchToken();}
        setRenderClientSideComponent( true);
    });

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>

                <h1 className={styles.title}>
                    Redirect Landing...
                </h1>

                <p className={styles.description}>
                   Closing...
                </p>

            </main>

        </div>
    )
}
