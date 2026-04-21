module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/../__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        strict: false,
        skipLibCheck: true,
        target: 'es2019',
        module: 'commonjs',
        lib: ['ES2020'],
        baseUrl: '<rootDir>',
      },
    },
  },
  collectCoverageFrom: [
    '<rootDir>/validations/**/*.ts',
    '<rootDir>/services/**/*.ts',
    '!<rootDir>/services/settings/**',
  ],
}
