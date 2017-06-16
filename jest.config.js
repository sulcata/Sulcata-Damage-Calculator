"use strict";

module.exports = {
    coveragePathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/test/",
        "<rootDir>/dist/"
    ],
    coverageThreshold: {
        global: {
            branches: 55,
            functions: 90,
            statements: 60
        }
    }
};
