"use strict";

module.exports = function(api) {
  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
          browsers: ">= 1%, not ie 11, not dead"
        },
        modules: api.env("webpack") ? false : "commonjs",
        shippedProposals: true,
        useBuiltIns: "usage"
      }
    ]
  ];

  const plugins = [
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-export-namespace-from",
    "lodash",
    !api.env("webpack") && "babel-plugin-dynamic-import-node"
  ].filter(Boolean);

  return { presets, plugins };
};
