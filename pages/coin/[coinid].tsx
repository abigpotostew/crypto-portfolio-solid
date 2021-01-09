import { useRouter } from 'next/router'
import React from "react"
import { coinGeckoProvider, Currency } from "../../src/marketdata/provider";
import { alwaysIncludeCoins } from "../../src/currencies";
import { getAllTradesDataFromDoc, getLedgerDoc } from "../../src/store";
import { getPodFromWebId } from "../../components/Ledgers";
import styles from "../../styles/Home.module.css"
// @ts-ignore
import { AuthButton } from "@solid/react"
import CoinPortfolio from "../../components/CoinPortfolio";
import Link from 'next/link'
import { AppState } from "../../src/redux/store";
import { useSelector, useDispatch } from 'react-redux'
import { useWebId } from "../../src/authentication";
import { useMarketRates } from "../../src/marketdata/effect";
import Loading from "../../components/loading/loading";

const CoinLayout = () => {


    const router = useRouter()
    const { coinid } = router.query
    const coinName = (typeof coinid === "string" && coinid || undefined)

    //TODO this is all duplicate, figure out where to put this stuff, probably in it's own effect wrapper
    // const myWebId = useWebId()
    //
    // // @ts-ignore
    // const {state, dispatch} = React.useContext(AppContext);
    // const {webId, ledgersState} = state;
    // // const {podDocument} = webId && ledgersState && ledgersState || {};

    const webId = useWebId()
    const dispatch = useDispatch()

    const [provider] = React.useState(coinGeckoProvider())

    const {
        marketRates,
        trades,
        loading,
        error, currencies
    } = useMarketRates({ provider: provider })

    //todo show trades filted to this coin, and if valid coin only

    return (
        <div className={styles.container}>
            <Link href={"/"}>Home</Link>
            <p>{webId}</p>

            <AuthButton popup="/popup.html" login="Login here!" logout="Log me out" />
            {!webId || !coinid || loading && <Loading />}
            <p>Coin ID: {coinid}</p>
            {webId && coinid &&
                <CoinPortfolio coinId={coinName || ""} trades={trades} marketRates={marketRates}
                    currencies={currencies}></CoinPortfolio>}
        </div>
    )
}


export default CoinLayout