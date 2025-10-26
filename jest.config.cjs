/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // Enable coverage collection (merged from jest.config.json)
  collectCoverage: true,
    collectCoverageFrom: [
    'src/**/*.{ts,tsx}',       // include all TS/TSX files
    'src/*.{ts,tsx}',       // include all TS/TSX files
    '!src/**/*.d.ts',          // ignore type definitions
    '!src/**/__tests__/**',    // ignore test files
  ],
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
