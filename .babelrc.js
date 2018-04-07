"use strict";

module.exports = function(api) {
  const env = api.env();

  const modules = env === "webpack" ? false : "commonjs";

  const plugins = [
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-export-namespace-from",
    "lodash"
  ];
  if (env === "development" || env === "test") {
    plugins.unshift("babel-plugin-dynamic-import-node");
  }

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
            browsers: ">= 1%, not ie 11, not dead"
          },
          modules,
          shippedProposals: true,
          useBuiltIns: "usage"
        }
      ]
    ],
    plugins
  };
};

// ugly hack until jest supports babel 7 config functions
if (process.env.NODE_ENV === "test") {
  module.exports = module.exports({ env: () => "test" });
}
