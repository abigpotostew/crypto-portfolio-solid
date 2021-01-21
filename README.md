This is a [Next.js](https://nextjs.org/) project bootstrapped
with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Todo list - MVP

* [] Allow entering a trade for any of the supported currencies.
* Date on the trade
* show profit for a specific holding, which tracks a tree for a given coin, so it can show total fees and such
* [x] import trades from metamask
* [] Sync from metamask
* [] import trades from other exchanges.

## Todo list - other

* Support edit currency in the grid
* Notes for each trade
* drill down into each trade
* Associate trades to accounts or exchange
* view trades only for a specific coin, and profit for this coin, etc
* [x] query for currencies from coin gecko based on what's in the trade ledger
