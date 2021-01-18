#!/usr/bin/env /usr/local/bin/node

const fetch = require('node-fetch');
const { exec } = require('child_process');
const settings = require('../config/currency-tracker-settings');

const alert = say => exec(`say ${say}`);

const { say, positions, threshholds, rate } = settings;

const coloring = (v, color = 'red') => `${v} | color=${color}`;

const calcPips = (pair, bid, hold) => Math.round((bid - hold) * (rate[pair] ?? 1000));

const formated = ({ pair, bid, hold, monitoring }) => {
  const position = hold ? ` [${calcPips(pair, bid, hold)}]` : '';
  const ret = `${pair}: ${bid}${position}`;

  if (pair in threshholds) {
    // しきい値もしくは、指定金額以上動いたら
    const isWarn = (threshholds[pair] ?? []).map(({ check, value }) => {
      switch (check) {
        case 'high':
          return bid >= value;
        case 'low':
          return bid <= value;
        case 'abs':
          return Math.abs(position) > value;
        default:
          return false;
      }
    });

    if (monitoring && isWarn.includes(true)) {
      alert(say);
      return coloring(ret, 'red');
    }
  }

  return ret;
};

const prioritySort = (a, b) => (a.priority > b.priority ? 1 : -1);

const main = async () => {
  const res = await fetch('https://www.gaitameonline.com/rateaj/getrate');
  const result = await res.json();

  const quoteByPair = {};
  result.quotes.forEach(v => {
    quoteByPair[v.currencyPairCode] = v;
  });

  const summary = positions.map(v => ({ ...v, ...quoteByPair[v.pair] })).sort(prioritySort);
  summary.forEach((v, i) => {
    console.log(formated(v));
    if (i === 0) console.log('---');
  });
};

main();
