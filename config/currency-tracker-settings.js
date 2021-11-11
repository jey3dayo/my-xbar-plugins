const settings = {
  // say: 'ping pon',
  say: null,
  // target: 'bid',
  type: 'ask',
  positions: [{ pair: 'USDJPY', hold: 112.942, monitoring: true, priority: 1 }],
  threshholds: {
    GBPUSD: [
      { check: 'high', value: 1.3932 },
      // { check: 'low', value: 1.3605 },
      { check: 'low', value: 1.372 },
    ],
    USDJPY: [
      { check: 'high', value: 114.2 },
      { check: 'low', value: 110.3 },
    ],
  },
  rate: {
    GBPUSD: 100000,
    GBPJPY: 1000,
  },
  format: {
    GBPUSD: '£/$',
    USDJPY: '$/¥',
  },
};

export default settings;
