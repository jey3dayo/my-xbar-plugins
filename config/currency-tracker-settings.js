const avg = 105.46;
const band = 0.03;

const settings = {
  currencyTypes: ['USDJPY', 'GBPUSD'],
  holds: {
    USDJPY: avg,
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
