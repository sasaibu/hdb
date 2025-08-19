module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|@react-navigation|react-native-safe-area-context|react-native-screens)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  testTimeout: 30000,
};
