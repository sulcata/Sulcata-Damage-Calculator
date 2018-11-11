"use strict";

const moduleFileExtensions = ["js", "jsx", "json", "ts", "tsx", "vue"];

const moduleNameMapper = {
  "^sulcalc$": "<rootDir>/src/index",
  "^sulcalc/(.*)$": "<rootDir>/src/$1",
  "^package$": "<rootDir>/package.json"
};

const testMatch = "**/*.(spec|test).{js,jsx,ts,tsx}";

const transform = {
  "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
  "^.+\\.vue$": "<rootDir>/node_modules/vue-jest"
};

module.exports = {
  collectCoverageFrom: [
    "<rootDir>/app/**/*.{js,jsx,ts,tsx,vue}",
    "<rootDir>/src/**/*.{js,jsx,ts,tsx,vue}",
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
      testMatch: [`<rootDir>/src/${testMatch}`],
      moduleFileExtensions,
      moduleNameMapper,
      transform
    },
    {
      displayName: "app",
      testEnvironment: "jsdom",
      testMatch: [`<rootDir>/app/${testMatch}`],
      moduleFileExtensions,
      moduleNameMapper,
      transform
    }
  ]
};
