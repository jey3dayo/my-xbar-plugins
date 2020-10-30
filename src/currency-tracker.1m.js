#!/usr/bin/env /Users/t00114/.nodebrew/current/bin/node

const fetch = require('node-fetch');

const currencyType = ['USDJPY', 'GBPUSD'];

const main = async () => {
  const res = await fetch('https://www.gaitameonline.com/rateaj/getrate');
  const result = await res.json();

  const pairs = result.quotes
    .filter(v => currencyType.includes(v.currencyPairCode))
    .map(v => ({ bid: v.bid, pair: v.currencyPairCode }));
  pairs.forEach(v => {
    console.log(`${v.pair}: ${v.bid}`);
  });
};

main();
