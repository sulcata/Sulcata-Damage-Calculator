"use strict";

module.exports = {
    coveragePathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/test/"
    ],
    coverageReporters: ["json", "lcov"],
    coverageThreshold: {
        global: {
            branches: 45,
            functions: 85,
            lines: 50,
            statements: 50
        }
    }
};
