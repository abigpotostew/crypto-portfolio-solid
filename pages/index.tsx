import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React from "react";
import Ledgers, {getPodFromWebId} from "../components/Ledgers";
// @ts-ignore
import {AuthButton} from "@solid/react"
import {useWebId} from "../src/authentication";
import MetamaskButton from "../components/ethereum/MetamaskButton";
import ImportButton from "../components/ethereum/ImportButton";
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {AppState} from "../src/redux/store";
import {useSelector, useDispatch} from 'react-redux'
import {getAllTradesDataFromDoc, getLedgerDoc, saveTradesToLedger, Trade} from "../src/store";
import {setLedgersState} from "../src/redux/actions";
import HitRatio from "../components/HitRatio";
import {NewCompute} from "../src/compute";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));

export default function Home() {
    const myWebId = useWebId()
    const classes = useStyles();

    const podDocument = useSelector((state: AppState) => state.ledgersState.podDocument)
    const dispatch = useDispatch()
    const trades = getAllTradesDataFromDoc(podDocument)
    const compute = NewCompute()
    const onResetClick = async () => {
        if (!myWebId || !podDocument) {
            //todo show error
            return
        }

        const trades = getAllTradesDataFromDoc(podDocument)
        await saveTradesToLedger(podDocument, [], trades)
        //todo make this stuff part of a use effect
        const ledgerContainerUri = getPodFromWebId(myWebId, "private")
        const fetchedPodDocument = await getLedgerDoc(ledgerContainerUri);

        // dispatch the thing
        dispatch(setLedgersState(fetchedPodDocument));
    }


    const handleSync = async (trades: Trade[]) => {
        if (!myWebId || !podDocument) {
            //todo show error
            return
        }

        //todo merge with existing
        await saveTradesToLedger(podDocument, trades, [])
        //todo make this stuff part of a use effect
        const ledgerContainerUri = getPodFromWebId(myWebId, "private")
        const fetchedPodDocument = await getLedgerDoc(ledgerContainerUri);

        // dispatch the thing
        dispatch(setLedgersState(fetchedPodDocument));
    }

    return (

        <div className={styles.container}>
            <Head>
                <title>Crypto Ledger</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Crypto Ledger
                    </Typography>
                    <AuthButton popup="/popup.html" login="Login here!" logout="Log me out"/>
                    <MetamaskButton/>

                </Toolbar>
            </AppBar>

            <main className={styles.main}>
                <ImportButton handleSyncTrades={handleSync}/>
                <Button onClick={onResetClick} color={"primary"} variant="contained">
                    Reset Ledger
                </Button>
                <p>{myWebId}</p>
                {myWebId ? <Ledgers/> : <p>you're logged out</p>}

                <HitRatio trades={trades} compute={compute}/>

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
};
//