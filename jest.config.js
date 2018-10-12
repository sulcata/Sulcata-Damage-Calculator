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
  moduleFileExtensions: ["js", "json", "vue"],
  moduleNameMapper: {
    "^sulcalc$": "<rootDir>/src/index",
    "^sulcalc/(.*)$": "<rootDir>/src/$1",
    "^app$": "<rootDir>/app/index",
    "^app/(.*)$": "<rootDir>/app/$1",
    "^package$": "<rootDir>/package.json"
  },
  transform: {
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.vue$": "<rootDir>/node_modules/vue-jest"
  }
};
