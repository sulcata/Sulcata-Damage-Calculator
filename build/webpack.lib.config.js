"use strict";
const path = require("path");
const webpack = require("webpack");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");

const config = {
  entry: path.join(__dirname, "../src/sulcalc"),
  output: {
    filename: "sulcalc.js",
    path: path.join(__dirname, "../dist/lib"),
    library: "sulcalc",
    libraryTarget: "umd"
  },
  devtool: "cheap-module-source-map",
  stats: "minimal",
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
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
  plugins: [
    new webpack.LoaderOptionsPlugin({ minimize: true }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.EnvironmentPlugin({ NODE_ENV: "production" }),
    new BabelMinifyPlugin()
  ]
};

module.exports = config;
