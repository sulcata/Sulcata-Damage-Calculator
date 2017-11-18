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
      functions: 95,
      statements: 60
    }
  }
};
