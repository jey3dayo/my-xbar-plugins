module.exports = {
  env: {
    browser: false,
    node: true,
    jest: true,
  },
  settings: {
    ecmascript: 6,
  },
  extends: ['plugin:prettier/recommended', 'airbnb-base', 'prettier'],
  parser: 'babel-eslint',
  rules: {
    'class-methods-use-this': 0,
    'global-require': 0,
    'no-await-in-loop': 0,
    'no-console': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'no-restricted-syntax': 0,
    'import/no-dynamic-require': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: true,
      },
    ],
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'all',
        arrowParens: 'avoid',
      },
    ],
  },
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
};
