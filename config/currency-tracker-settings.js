const settings = {
  say: 'ping pon',
  positions: [
    { pair: 'GBPUSD', hold: 1.36319, enable: true, priority: 1 },
    // { pair: 'USDJPY', hold: 104.1, enable: true, priority: 2 },
  ],
  rate: {
    GBPUSD: 100000,
    GBPJPY: 1000,
  },
  threshholds: {
    GBPUSD: [
      { check: 'high', value: 1.369 },
      { check: 'low', value: 1.358 },
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
};

module.exports = settings;
