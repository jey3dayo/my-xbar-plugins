#!/usr/bin/env /usr/local/bin/node

const fetch = require('node-fetch');
const { exec } = require('child_process');

const types = { usdjpy: 'USDJPY', gbpusd: 'GBPUSD' };
const currencyType = [types.usdjpy, types.gbpusd];

const alert = () => {
  exec(`say ping pon`);
  // const times = 3;
  // [...Array(3)].forEach((_, repeat) => {
  //   exec(`say ${repeat} ping pon`);
  // });
};

const coloring = (v, color = 'red') => {
  return `${v} | color=${color}`;
};

const formated = ({ pair, bid }) => {
  const ret = `${pair}: ${bid}`;

  if (pair === 'USDJPY') {
    if (bid < 104.2) {
      alert();
      return coloring(ret, 'red');
    }
  }

  if (pair === 'GBPUSD') {
    if (bid < 1.2924) {
      alert();
      return coloring(ret, 'red');
    }
  }

  return ret;
};

const main = async () => {
  const res = await fetch('https://www.gaitameonline.com/rateaj/getrate');
  const result = await res.json();

  const pairs = result.quotes
    .filter(v => currencyType.includes(v.currencyPairCode))
    .map(v => ({ bid: v.bid, pair: v.currencyPairCode }));

  const head = pairs.shift();
  console.log(formated(head));
  console.log('---');

  pairs.forEach(v => {
    const output = formated(v);
    console.log(output);
  });
};

main();
