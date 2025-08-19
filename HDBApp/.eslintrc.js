module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    jest: true,
    node: true,
  },
  overrides: [
    {
      files: ['jest.setup.js', '**/__tests__/**/*', '**/*.test.*'],
      env: {
        jest: true,
      },
      globals: {
        jest: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
        describe: true,
        it: true,
        test: true,
        expect: true,
      },
    },
  ],
};
