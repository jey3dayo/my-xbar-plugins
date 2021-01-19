const settings = {
  say: 'ping pon',
  // target: 'bid',
  type: 'ask',
  positions: [
    // { pair: 'GBPUSD', hold: 1.36319, monitoring: true, priority: 1 },
    { pair: 'GBPUSD', monitoring: true, priority: 1 },
    // { pair: 'USDJPY', hold: 104.1, monitoring: true, priority: 2 },
  ],
  threshholds: {
    GBPUSD: [
      { check: 'high', value: 1.37 },
      { check: 'low', value: 1.359 },
    ],
    // GBPJPY: [
    //   { check: 'high', value: 138.9 },
    //   { check: 'low', value: 138.7 },
    // ],
    // USDJPY: [
    //   { check: 'high', value: 104.1 },
    //   { check: 'low', value: 103.5 },
    // ],
  },
  rate: {
    GBPUSD: 100000,
    GBPJPY: 1000,
  },
};

module.exports = settings;
