"use strict";

module.exports = function(api) {
  const env = api.env();

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
            browsers: ">= 1%, not ie 11, not dead"
          },
          modules: env === "webpack" ? false : "commonjs",
          shippedProposals: true,
          useBuiltIns: "usage"
        }
      ]
    ],
    plugins: [
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-proposal-export-namespace-from",
      "lodash",
      ["development", "test"].includes(env) &&
        "babel-plugin-dynamic-import-node"
    ].filter(Boolean)
  };
};
