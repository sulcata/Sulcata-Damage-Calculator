"use strict";
const path = require("path");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "../src/index"),
  output: {
    filename: "sulcalc.js",
    path: path.join(__dirname, "../dist/lib"),
    library: "sulcalc",
    libraryTarget: "umd"
  },
  stats: "minimal",
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
        type: "javascript/esm",
        loader: "babel-loader",
        exclude: /(node_modules|db|translations|setdex)\//,
        options: {
          babelrc: false,
          plugins: [
            "transform-object-rest-spread",
            "syntax-dynamic-import",
            "transform-export-extensions",
            "lodash"
          ]
        }
      }
    ]
  },
  optimization: {
    minimizer: [new BabelMinifyPlugin()]
  }
};
