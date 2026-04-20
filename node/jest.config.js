module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        strict: false,
        skipLibCheck: true,
        target: 'es2019',
        module: 'commonjs',
        lib: ['ES2020'],
      },
    },
  },
  collectCoverageFrom: [
    'validations/**/*.ts',
    'services/**/*.ts',
    '!services/settings/**',
  ],
}
