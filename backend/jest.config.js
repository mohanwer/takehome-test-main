/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+\.tsx?$": ["ts-jest", {}],
    },
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['<rootDir>/tests/**/*.test.ts'],
};