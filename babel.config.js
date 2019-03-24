"use strict";

module.exports = function(api) {
  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: "> 1%, not ie 11, not dead, current node"
        },
        modules: api.env("webpack") ? false : "commonjs",
        shippedProposals: true,
        useBuiltIns: "usage",
        corejs: 3
      }
    ],
    "@babel/preset-typescript"
  ];

  const plugins = [
    "lodash",
    "@babel/plugin-proposal-class-properties"
    // "@babel/plugin-proposal-decorators"
  ];

  if (!api.env("webpack")) {
    plugins.push("babel-plugin-dynamic-import-node");
  }

  return { presets, plugins };
};
