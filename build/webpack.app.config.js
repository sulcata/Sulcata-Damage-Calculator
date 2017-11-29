"use strict";
const path = require("path");
const webpack = require("webpack");
const HtmlPlugin = require("html-webpack-plugin");
const ScriptExtHtmlPlugin = require("script-ext-html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const config = {
  entry: {
    main: path.join(__dirname, "../app/src/main"),
    db: path.join(__dirname, "../dist/db"),
    smogon: path.join(__dirname, "../dist/setdex/smogon"),
    pokemonPerfect: path.join(__dirname, "../dist/setdex/pokemonPerfect"),
    vendor: ["vue", "vuex", "vue-multiselect"]
  },
  output: {
    filename: "[name].[chunkhash].js",
    path: path.join(__dirname, "../dist/app")
  },
  stats: "minimal",
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
        exclude: /(node_modules|dist)\//,
        loader: "babel-loader",
        options: {
          babelrc: false,
          plugins: [
            "transform-object-rest-spread",
            "syntax-dynamic-import",
            "transform-export-extensions",
            "lodash"
          ]
        }
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader"
      },
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.[contenthash].css"),
    new webpack.optimize.CommonsChunkPlugin({
      name: ["smogon", "pokemonPerfect", "db", "vendor"]
    }),
    new HtmlPlugin({
      template: path.join(__dirname, "../app/index.hbs"),
      inject: "head"
    }),
    new ScriptExtHtmlPlugin({ defaultAttribute: "defer" })
  ]
};

module.exports = config;
