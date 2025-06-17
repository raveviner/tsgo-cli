/**
 * @type {import('@jest/types').Config.InitialOptions}
 *
 * Jest configuration file
 * This file configures Jest for TypeScript testing with ESM support
 *
 * @see {@link https://jestjs.io/docs/configuration} for all configuration options
 * @see {@link https://kulshekhar.github.io/ts-jest/docs/guides/esm-support} for ESM support details
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  verbose: true,
};
