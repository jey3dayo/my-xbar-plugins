#!/usr/bin/env /usr/local/bin/node

const fetch = require('node-fetch');
const { exec } = require('child_process');
const settings = require('../config/currency-tracker-settings');

const alert = say => exec(`say ${say}`);

const { say, displayDiff, currencyTypes, holds, threshholds, rate } = settings;

const coloring = (v, color = 'red') => {
  return `${v} | color=${color}`;
};

const calcPips = (pair, bid) => {
  return Math.round((bid - holds[pair]) * 1000);
};

const formated = ({ pair, bid }) => {
  const target = pair in holds ? calcPips(pair, bid) : bid;
  const ret = `${pair}: ${bid} [${target}]`;

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

  const pairs = result.quotes
    .filter(v => currencyTypes.includes(v.currencyPairCode))
    .map(v => ({ bid: v.bid, pair: v.currencyPairCode }));

  // const head = pairs.shift();
  const head = pairs.pop();
  console.log(formated(head));
  console.log('---');

  pairs.forEach(v => {
    const output = formated(v);
    console.log(output);
  });
};

main();
