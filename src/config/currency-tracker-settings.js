const settings = {
  // say: 'ping pon',
  say: null,
  // target: 'bid',
  type: 'ask',
  positions: [{ pair: 'USDJPY', hold: 113.028, monitoring: true, priority: 1 }],
  threshholds: {
    USDJPY: [
      { check: 'high', value: 113.7 },
      { check: 'low', value: 112.5 },
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
