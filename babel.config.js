"use strict";

module.exports = function(api) {
  const presets = [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ">= 0.1%, last 1 version, not dead, current node"
        },
        modules: api.env("webpack") ? false : "commonjs",
        shippedProposals: true,
        useBuiltIns: "usage"
      }
    ]
  ];

  const plugins = [
    ["@babel/plugin-proposal-nullish-coalescing-operator", { loose: true }],
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-export-namespace-from",
    "lodash",
    !api.env("webpack") && "babel-plugin-dynamic-import-node"
  ].filter(Boolean);

  return { presets, plugins };
};
