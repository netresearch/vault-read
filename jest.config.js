module.exports = {
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.ts"],
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: [
        "<rootDir>/node_modules/"
    ],
    coverageReporters: [
        "text"
    ],
    moduleFileExtensions: [
        "js",
        "json",
        "ts",
    ],
    preset: 'ts-jest',
    reporters: [
        "default",
        "jest-junit"
    ],
    testEnvironment: "node",
    testMatch: [
        "**/test/**/*.[jt]s?(x)",
        "**/test/?(*.)+(spec|test).[tj]s?(x)"
    ],
    transform: {
        ".ts": "ts-jest"
    },
};