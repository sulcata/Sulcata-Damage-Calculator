"use strict";
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const ScriptExtHtmlPlugin = require("script-ext-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");

const setdexRegex = /dist[\\/]setdex[\\/].*?\.(js|json)$/;

module.exports = {
  entry: path.join(__dirname, "../app/src/main"),
  output: {
    filename: process.env.WEBPACK_SERVE
      ? "[name].[hash].js"
      : "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
    path: path.join(__dirname, "../dist/app")
  },
  resolve: {
    alias: {
      sulcalc: path.join(__dirname, "../src/index")
    }
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
      },
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  mode: process.env.WEBPACK_SERVE ? "development" : "production",
  // babili issue with sourcemaps
  devtool: process.env.WEBPACK_SERVE
    ? "module-source-map"
    : "cheap-module-source-map",
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      maxAsyncRequests: Infinity,
      cacheGroups: {
        sulcalc: {
          test: path.join(__dirname, "../src")
        },
        db: {
          test: path.join(__dirname, "../dist/db")
        },
        setdex1: {
          test({ resource }) {
            return (
              setdexRegex.test(resource) &&
              (resource.includes("rby") ||
                resource.includes("gsc") ||
                resource.includes("rse") ||
                resource.includes("dpp"))
            );
          }
        },
        setdex2: {
          test({ resource }) {
            return (
              setdexRegex.test(resource) &&
              (resource.includes("bw") ||
                resource.includes("xy") ||
                resource.includes("sm"))
            );
          }
        }
      }
    },
    minimizer: [new BabelMinifyPlugin()]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[name].[contenthash].css"
    }),
    new HtmlPlugin({
      template: path.join(__dirname, "../app/index.html"),
      inject: "head"
    }),
    new ScriptExtHtmlPlugin({ defaultAttribute: "defer" })
  ]
};
