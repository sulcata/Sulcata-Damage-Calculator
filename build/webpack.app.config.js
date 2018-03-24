"use strict";
const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const ScriptExtHtmlPlugin = require("script-ext-html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: {
    main: path.join(__dirname, "../app/src/main"),
    db: path.join(__dirname, "../dist/db"),
    smogon: path.join(__dirname, "../dist/setdex/smogon"),
    pokemonPerfect: path.join(__dirname, "../dist/setdex/pokemonPerfect"),
    vendor: ["big-integer", "vue", "vuex", "vue-multiselect"]
  },
  output: {
    filename: "[name].[chunkhash].js",
    path: path.join(__dirname, "../dist/app")
  },
  stats: "minimal",
  devServer: {
    port: 3000,
    inline: false,
    stats: "minimal"
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
  optimization: {
    splitChunks: { chunks: "all" },
    minimizer: [new BabelMinifyPlugin()]
  },
  plugins: [
    new ExtractTextPlugin("style.[contenthash].css"),
    new HtmlPlugin({
      template: path.join(__dirname, "../app/index.hbs"),
      inject: "head"
    }),
    new ScriptExtHtmlPlugin({ defaultAttribute: "defer" })
  ]
};
