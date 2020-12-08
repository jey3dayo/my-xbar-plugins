const settings = {
  say: 'ping pon',
  displayDiff: true,
  // currencyTypes: ['USDJPY', 'GBPUSD'],
  // currencyTypes: ['EURJPY', 'USDJPY'],
  // currencyTypes: ['EURJPY'],
  currencyTypes: ['GBPUSD'],
  holds: {
    // USDJPY: 104.307,
    // GBPUSD: 1.32919,
  },
  rate: {
    GBPUSD: 100000,
  },
  threshholds: {
    GBPUSD: [
      { check: 'high', value: 1.346 },
      { check: 'low', value: 1.327 },
    ],
    USDJPY: [
      // { check: 'high', value: 104.5 },
      // { check: 'low', value: 103.75 },
    ],
  },
};

module.exports = settings;
