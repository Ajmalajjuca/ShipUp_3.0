module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^../(.*)$': '<rootDir>/src/$1',
    '^../auth/(.*)$': '<rootDir>/src/auth/$1',
    '^../users/(.*)$': '<rootDir>/src/users/$1',
    '^../orders/(.*)$': '<rootDir>/src/orders/$1',
    '^../locations/(.*)$': '<rootDir>/src/locations/$1',
    '^../shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  testTimeout: 30000,
  verbose: true
};