"use strict";

module.exports = {
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/dist/"],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 95,
      statements: 60
    }
  },
  moduleNameMapper: {
    "^sulcalc$": "<rootDir>/src/index",
    "^sulcalc/(.*)$": "<rootDir>/src/$1"
  }
};
