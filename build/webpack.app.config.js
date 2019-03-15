"use strict";
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlPlugin = require("html-webpack-plugin");
const ScriptExtHtmlPlugin = require("script-ext-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

const setdexRegex = /[\\/]dist[\\/]setdex[\\/].*?\.(js|json,ts)$/;
const libRegex = /[\\/]node_modules[\\/](lodash|big-integer|bootstrap|vue|vuex|vue-multiselect)[\\/]/;

module.exports = env => ({
  entry: path.join(__dirname, "../app/index"),
  output: {
    filename: "[name].[chunkhash:8].js",
    path: path.join(__dirname, "../dist/app")
  },
  resolve: {
    alias: {
      sulcalc: path.join(__dirname, "../src"),
      package: path.join(__dirname, "../package.json")
    },
    extensions: [".js", ".json", ".ts", ".vue"]
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: "babel-loader",
        exclude: file =>
          /[\\/](node_modules|dist)[\\/]/.test(file) &&
          !/\.vue\.(js|ts)/.test(file),
        options: { envName: "webpack" }
      },
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.scss$/,
        use: [
          env.production ? MiniCssExtractPlugin.loader : "vue-style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.css$/,
        use: [
          env.production ? MiniCssExtractPlugin.loader : "vue-style-loader",
          "css-loader"
        ]
      }
    ]
  },
  mode: env.production ? "production" : "development",
  devtool: env.production ? false : "cheap-module-eval-source-map",
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
        usage: {
          test: path.join(__dirname, "../dist/setdex/usage")
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
        },
        vendors: {
          test: libRegex,
          priority: -10
        },
        webpack: {
          test: /[\\/]node_modules[\\/]/,
          priority: -15
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        sourceMap: !env.production,
        parallel: true,
        terserOptions: { ecma: 8 }
      })
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    env.production &&
      new MiniCssExtractPlugin({ filename: "[name].[contenthash:8].css" }),
    env.production && new OptimizeCssAssetsPlugin(),
    new HtmlPlugin({
      template: path.join(__dirname, "../app/index.html"),
      inject: "head"
    }),
    new ScriptExtHtmlPlugin({ defaultAttribute: "defer" }),
    env.production &&
      new WorkboxPlugin.GenerateSW({
        cacheId: "sulcalc",
        swDest: "service-worker.js",
        importWorkboxFrom: "local",
        offlineGoogleAnalytics: false,
        cleanupOutdatedCaches: true,
        dontCacheBustURLsMatching: /\.\p{ASCII_Hex_Digit}{8}\./u
      })
  ].filter(Boolean)
});
