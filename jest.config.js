"use strict";

module.exports = {
  collectCoverageFrom: [
    "<rootDir>/app/**/*.{js,vue}",
    "<rootDir>/src/**/*.{js,vue}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/*.test.*"
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
  coverageThreshold: {
    "./src": {
      branches: 55,
      functions: 95,
      statements: 65
    },
    "./app": {
      branches: 50,
      functions: 55,
      statements: 50
    }
  },
  projects: [
    {
      displayName: "sulcalc",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/**/*.(spec|test).js?(x)"],
      moduleNameMapper: {
        "^sulcalc$": "<rootDir>/src/index",
        "^sulcalc/(.*)$": "<rootDir>/src/$1",
        "^package$": "<rootDir>/package.json"
      }
    },
    {
      displayName: "app",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/app/**/*.(spec|test).js?(x)"],
      moduleFileExtensions: ["js", "json", "vue"],
      moduleNameMapper: {
        "^sulcalc$": "<rootDir>/src/index",
        "^sulcalc/(.*)$": "<rootDir>/src/$1",
        "^package$": "<rootDir>/package.json"
      },
      transform: {
        "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
        "^.+\\.vue$": "<rootDir>/node_modules/vue-jest"
      }
    }
  ]
};
