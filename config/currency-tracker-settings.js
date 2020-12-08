const avg = 105.46;
const band = 0.03;

const settings = {
  currencyTypes: ['USDJPY', 'GBPUSD'],
  holds: {
    // USDJPY: 104.307,
    // GBPUSD: 1.32919,
  },
  rate: {
    GBPUSD: 100000,
  },
  threshholds: {
    USDJPY: [
      { check: 'high', value: avg + band },
      { _check: 'low', value: 104.8 },
      { _check: 'abs', value: 150 },
    ],
  },
};

module.exports = settings;
