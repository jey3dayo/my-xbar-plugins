export default {
  // say: 'ping pon',
  say: null,
  // target: 'bid',
  type: 'ask',
  positions: [{ pair: 'USDJPY', hold: 114.68, monitoring: true, priority: 1 }],
  threshholds: {
    GBPUSD: [
      { check: 'high', value: 1.3932 },
      // { check: 'low', value: 1.3605 },
      { check: 'low', value: 1.372 },
    ],
    USDJPY: [
      { check: 'high', value: 115.5 },
      { check: 'low', value: 113.0 },
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
