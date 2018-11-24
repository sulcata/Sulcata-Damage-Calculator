"use strict";
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: path.join(__dirname, "../src"),
  output: {
    filename: "sulcalc.js",
    path: path.join(__dirname, "../dist/sulcalc"),
    library: "sulcalc",
    libraryTarget: "umd"
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
        type: "javascript/esm",
        loader: "babel-loader",
        exclude: /(node_modules|dist)\//,
        options: { envName: "webpack" }
      }
    ]
  },
  mode: "production",
  devtool: "source-map",
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: true,
        parallel: true,
        terserOptions: { ecma: 8 }
      })
    ]
  }
};
