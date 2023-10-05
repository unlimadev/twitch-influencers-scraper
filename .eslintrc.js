module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  overrides: [{
    env: {
      node: true,
    },
    files: ['.eslintrc.{js,cjs}'],
    parserOptions: {
      sourceType: 'script',
    },
  }],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'global-require': 'off',
    'no-await-in-loop': 'off',
    'arrow-body-style': 'off',
  },
};
