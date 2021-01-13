#!/usr/bin/env /usr/local/bin/node

const fetch = require('node-fetch');
const { exec } = require('child_process');
const settings = require('../config/currency-tracker-settings');

const alert = say => exec(`say ${say}`);

const { say, positions, threshholds, rate } = settings;

const coloring = (v, color = 'red') => `${v} | color=${color}`;

const calcPips = (pair, bid, hold) => Math.round((bid - hold) * (rate[pair] ?? 1000));

const formated = ({ pair, bid, hold, enable }) => {
  const target = hold ? ` [${calcPips(pair, bid, hold)}]` : '';
  const ret = enable ? `${pair}: ${bid}${target}` : `${pair}: ${bid}`;

  if (pair in threshholds) {
    // しきい値もしくは、指定金額以上動いたら
    const isWarn = (threshholds[pair] ?? []).map(({ check, value }) => {
      switch (check) {
        case 'high':
          return bid >= value;
        case 'low':
          return bid <= value;
        case 'abs':
          return Math.abs(target) > value;
        default:
          return false;
      }
    });

    if (isWarn.includes(true)) {
      alert(say);
      return coloring(ret, 'red');
    }
  }

  return ret;
};

const main = async () => {
  const res = await fetch('https://www.gaitameonline.com/rateaj/getrate');
  const result = await res.json();

  // TODO: posions回したほうがよかったね
  const types = Object.keys(positions);
  const quotes = result.quotes
    .filter(v => types.includes(v.currencyPairCode))
    .map(v => ({ bid: v.bid, pair: v.currencyPairCode }));

  const quote = quotes.pop();
  const position = positions[quote.pair];
  console.log(formated({ ...quote, ...position }));
  console.log('---');

  quotes.forEach(v => {
    const output = formated(v);
    console.log(output);
  });
};

main();
