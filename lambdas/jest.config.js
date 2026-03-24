/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/', '/terraform/', '/zip/'],
    clearMocks: true,
    collectCoverageFrom: [
        '**/lib/**/*.js',
        '**/sources/**/*.js',
        'what2play-lists/lib/**/*.js',
        '!**/*.test.js',
    ],
    coverageDirectory: '<rootDir>/coverage',
};
