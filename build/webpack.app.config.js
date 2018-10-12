"use strict";
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const HtmlPlugin = require("html-webpack-plugin");
const ScriptExtHtmlPlugin = require("script-ext-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const setdexRegex = /[\\/]dist[\\/]setdex[\\/].*?\.(js|json)$/;
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
      app: path.join(__dirname, "../app")
    },
    extensions: [".js", ".json", ".vue"]
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.js$/,
        type: "javascript/esm",
        loader: "babel-loader",
        exclude: file =>
          /[\\/](node_modules|dist)[\\/]/.test(file) && !/\.vue\.js/.test(file),
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
        terserOptions: { ecma: 8 }
      })
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: "[name].[contenthash:8].css" }),
    new HtmlPlugin({
      template: path.join(__dirname, "../app/index.html"),
      inject: "head"
    }),
    new ScriptExtHtmlPlugin({ defaultAttribute: "defer" }),
    new BundleAnalyzerPlugin({
      analyzerMode: env.production ? "disabled" : "server",
      analyzerHost: "localhost",
      defaultSizes: "gzip",
      openAnalyzer: false
    })
  ]
});
