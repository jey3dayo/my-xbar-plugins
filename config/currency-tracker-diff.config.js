export const settings = {
  // say: 'ping pon',
  say: null,
  type: 'ask',
  positions: [{ pair: 'USDJPY', hold: 115.456, monitoring: true, priority: 1 }], // head
  // positions: [{ pair: 'USDJPY', hold: 114.797, monitoring: true, priority: 1 }], // head
  // positions: [{ pair: 'USDJPY', hold: null, monitoring: true, priority: 1 }],
  threshholds: {
    USDJPY: [
      { check: 'high', value: 115.77 },
      { check: 'low', value: 114.7 },
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
