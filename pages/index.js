import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React from "react";
import Ledgers from "../components/Ledgers";
import {useWebId} from "../src/solid";
import {AuthButton} from "@solid/react"


export default function Home() {
    const myWebId = useWebId()

    return (

    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>


          <AuthButton popup="/popup.html" login="Login here!" logout="Log me out"/>
          <p>{myWebId}</p>
          {myWebId?<Ledgers /> : <p>you're logged out</p>}

        {/*<AuthButton popup="/popup.html" login="Login here!" logout="Log me out"/>*/}
        {/*<LoggedOut>*/}
        {/*  <p>You are not logged in, and this is a members-only area!</p>*/}
        {/*</LoggedOut>*/}
        {/*<LoggedIn>*/}
        {/*  <p>You are logged in and can see the special content.</p>*/}

        {/*    <p>Welcome back, <Value src="user.firstName"/></p>*/}
        {/*    /!*<Image src="user.image" defaultSrc="profile.svg" className="pic"/>*!/*/}
        {/*    <ul>*/}
        {/*        <li><Link href="user.inbox">Your inbox</Link></li>*/}
        {/*        <li><Link href="user.homepage">Your homepage</Link></li>*/}
        {/*    </ul>*/}

        {/*    <Ledger />*/}

        {/*</LoggedIn>*/}




        {/*<h1 className={styles.title}>*/}
        {/*  Welcome to <a href="https://nextjs.org">Next.js!</a>*/}
        {/*</h1>*/}

        {/*<p className={styles.description}>*/}
        {/*  Get started by editing{' '}*/}
        {/*  <code className={styles.code}>pages/index.js</code>*/}
        {/*</p>*/}

        {/*<div className={styles.grid}>*/}


        {/*  <a*/}
        {/*    href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"*/}
        {/*    className={styles.card}*/}
        {/*  >*/}
        {/*    <h3>Deploy &rarr;</h3>*/}
        {/*    <p>*/}
        {/*      Instantly deploy your Next.js site to a public URL with Vercel.*/}
        {/*    </p>*/}
        {/*  </a>*/}
        {/*</div>*/}

      </main>

      {/*<footer className={styles.footer}>*/}
      {/*  <a*/}
      {/*    href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"*/}
      {/*    target="_blank"*/}
      {/*    rel="noopener noreferrer"*/}
      {/*  >*/}
      {/*    Powered by{' '}*/}
      {/*    <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />*/}
      {/*  </a>*/}
      {/*</footer>*/}


    </div>
  )
}
