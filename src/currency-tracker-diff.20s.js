#!/usr/bin/env /usr/local/bin/node

const fetch = require('node-fetch');
const { exec } = require('child_process');
const settings = require('../config/currency-tracker-settings');

const alert = say => (say ? exec(`say ${say}`) : null);

const { say, type, positions, threshholds, rate, format } = settings;

const coloring = (v, color = 'red') => `${v} | color=${color}`;

const calcPips = (pair, price, hold) => (hold ? Math.round((price - hold) * (rate[pair] ?? 1000)) : null);

const print = (pips, profit) => {
  if (pips && profit) {
    return ` [${pips} : ${profit}]`;
  }
  if (pips) {
    return ` [${pips}]`;
  }
  return '';
};

const formatted = ({ pair, bid, ask, hold, quantity, slip, monitoring }) => {
  const price = type === 'bid' ? bid : ask;
  const pips = calcPips(pair, price, hold) + (slip ?? 0);
  const profit = pips ? pips * quantity : '';
  const text = print(pips, profit);

  const ret = `${format?.[pair] ?? pair} ${price}${text}`;

  if (pair in threshholds) {
    // しきい値もしくは、指定金額以上動いたら
    const isWarn = (threshholds[pair] ?? []).map(({ check, value }) => {
      switch (check) {
        case 'high':
          return price >= value;
        case 'low':
          return price <= value;
        case 'abs':
          return Math.abs(print) > value;
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
    console.log(formatted(v));
    if (i === 0) console.log('---');
  });
};

main();
