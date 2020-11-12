import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {AuthButton, Link, LoggedIn, LoggedOut, Value} from "@solid/react"
import EnhancedTable, {EditableNumericCell} from "../components/EnhancedTable";

import dynamic from "next/dynamic";
import superagent from "superagent";
import React from "react";
import MarketRatesTicker from "../components/marketRates";
import {coinBase, initialMarketRates, mergeRates} from "../src/marketrates";
import computeMarketRate from "../src/compute";

const OAuthButton = dynamic(() => import("../components/auth"), {ssr: false});

function onLoggedIn(token) {
    // console.log(token)

    //invoke api

    // this is blocked by coinbase cors, so it needs to be proxied.
    superagent.get(process.env.NEXT_PUBLIC_COINBASE_API_URL + '/v2/accounts')
      .set("Authorization", token)
      .set("Accept", "application/json")
      // .set("Referer", "http://localhost:3000/")
      .end((err, res) => {
            // Calling the end function will send the request
            if (err) {
              console.error(err)
            } else {
              if (res.statusCode === 200) {
                console.log("success", res.body)
              } else {
                console.error(res.statusCode)
                console.error(res.body)
              }
            }
          }
      );
}

export default function Home() {
    const USD = "USD"
    const CoinLTC = "LTC"
    const CoinETH = "ETH"
    const CoinLINK = "LINK"
    const CoinBTC = "BTC"
    const defaultData = [

        {
            key: 0,
            outCurrency: USD,
            inCurrency: CoinETH,
            outAmount: 500,
            inAmount: 1.51862536,
            fee: 7.34,
            feeCoin: USD,
        },
        {
            key: 1,
            outCurrency: USD,
            inCurrency: CoinLTC,
            outAmount: 300,
            inAmount: 5.60673567,
            fee: 4.40,
            feeCoin: USD,
        },
        {
            key: 2,
            outCurrency: CoinLTC,
            inCurrency: USD,
            outAmount: 5.60673567,
            inAmount: 293.80,
            fee: 4.44,
            feeCoin: USD,
        },
        {
            key: 3,
            outCurrency: USD,
            inCurrency: CoinLINK,
            outAmount: 500,
            inAmount: 29.39195119,
            fee: 7.34,
            feeCoin: USD,
        },
        {
            key: 4,
            outCurrency: USD,
            inCurrency: CoinBTC,
            outAmount: 293.80,
            inAmount: .02243376,
            fee: 4.31,
            feeCoin: USD,
        },
    ]

    const [data, setData] = React.useState(React.useMemo(() => defaultData, []))
    const [skipPageReset, setSkipPageReset] = React.useState(false)
    const [isTickerActive, setIsTickerActive] = React.useState(true);
    const [marketRates, setMarketRates] = React.useState(initialMarketRates())
    const [totalValue, setTotalValue] = React.useState(0)

    const columns = React.useMemo(
        () => [
            {
                Header: 'Out',
                accessor: 'outAmount',
                Cell: (table, cell) => {
                    //should have precision of the currency
                    return (<EditableNumericCell {...table} />)
                },
            },
            {
                Header: 'Out Currency',
                accessor: 'outCurrency',
                Cell: (table, cell) => {
                    // console.log(table, cell)
                    // doesn't work because it updateMyData is needed here
                    // return (<CurrencySelect  label={""}></CurrencySelect>)
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: 'In',
                accessor: 'inAmount',
                Cell: (table, cell) => {
                    return (<EditableNumericCell {...table} />)
                },
            },
            {
                Header: 'In Currency',
                accessor: 'inCurrency',
                Cell: (table, cell) => {
                    // console.log(table, cell)
                    // doesn't work because it updateMyData is needed here
                    // return (<CurrencySelect  label={""}></CurrencySelect>)
                    return (<span>{table.value}</span>)
                }
            },
            {
                Header: "Fee",
                accessor: 'fee',
                Cell: (table, cell) => {
                    return (<EditableNumericCell {...table} />)
                },
                Footer: info => {
                    // Only calculate total visits if rows change
                    const total = React.useMemo(
                        // rows.value
                        () =>
                            info.rows.reduce((sum, row) => row.values.fee + sum, 0)
                            // return computeMarketRate(trades, "USD", marketRates)
                            // const trades = info.rows.map((i) => i.values)
                        ,
                        [info.rows]
                    )

                    return <>Total USD Value: ${total}</>
                },
            }

        ],
        []
    )

    // defaultData.push(...defaultData)
    // defaultData.push(...defaultData)


    React.useEffect(()=>{
        setTotalValue(computeMarketRate(data, "USD", marketRates))
    })
    // start market rates ticker
    React.useEffect(() => {

        let interval = null;
        if (isTickerActive) {
            interval = setInterval(() => {
                //get market rates
                const merge = (outCurrency, newRates, existingRates) => {
                    const newMarketRates = mergeRates(outCurrency, newRates, existingRates)
                    setMarketRates(newMarketRates)
                    setTotalValue(computeMarketRate(data, "USD", newMarketRates))
                }

                coinBase("USD", ({err, rates}) => {
                    if (err) {
                        console.error(err)
                        console.error("stopping market rates ticker")
                        setIsTickerActive(false)
                    } else {
                        // merge("USD", rates)
                        const usdRates = rates
                        coinBase("LTC", ({err, rates}) => {
                            if (err) {
                                console.error(err)
                                console.error("stopping market rates ticker")
                                setIsTickerActive(false)
                            } else {
                                merge("LTC", rates, usdRates)
                            }
                        })
                    }
                })

            }, 3000);
        } else if (!isTickerActive) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTickerActive]);

    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateMyData = (rowIndex, columnId, value) => {
        // We also turn on the flag to not reset the page
        setSkipPageReset(true)
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...old[rowIndex],
                        [columnId]: value,
                    }
                }
                return row
            })
        )
        // setTotalValue((old)=>computeMarketRate(data, "USD", marketRates))
    }



  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>



      <main className={styles.main}>


        <AuthButton popup="/popup.html" login="Login here!" logout="Log me out"/>
        <LoggedOut>
          <p>You are not logged in, and this is a members-only area!</p>
        </LoggedOut>
        <LoggedIn>
          <p>You are logged in and can see the special content.</p>

            <p>Welcome back, <Value src="user.firstName"/></p>
            {/*<Image src="user.image" defaultSrc="profile.svg" className="pic"/>*/}
            <ul>
                <li><Link href="user.inbox">Your inbox</Link></li>
                <li><Link href="user.homepage">Your homepage</Link></li>
            </ul>
            {/*<List src="user.public.notes" >*/}
            {/*</List>*/}
            <EnhancedTable
                columns={columns}
                data={data}
                setData={setData}
                updateMyData={updateMyData}
                skipPageReset={skipPageReset}
            />
        </LoggedIn>


          <MarketRatesTicker rates={marketRates}/>
            <p>Total Portfolio Value: {totalValue}</p>


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
