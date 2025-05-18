module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  globalSetup: '<rootDir>/src/config/jest-mongo-setup.ts',
  globalTeardown: '<rootDir>/src/config/jest-mongo-teardown.ts',
  testMatch: ['**/src/tests/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};