module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  extends: ['akarion'],
  env: {
    worker: true,
  },
};
