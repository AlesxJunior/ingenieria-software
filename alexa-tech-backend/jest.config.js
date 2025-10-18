/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/prismaMock.ts'
  ]
};
