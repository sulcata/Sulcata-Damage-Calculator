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

  return {
    overrides: [
      { test: "**/*.js", presets, plugins },
      {
        test: "**/*.ts",
        presets: [...presets, "@babel/preset-typescript"],
        plugins
      }
    ]
  };
};
