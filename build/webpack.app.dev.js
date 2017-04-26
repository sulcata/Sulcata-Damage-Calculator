"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {cloneDeep} = require("lodash");

const {version} = require("../package.json");
const baseConfig = require("./webpack.app.config");
const {css, javascript} = require("./dependencies");

const config = cloneDeep(baseConfig);

config.module = Object.assign({rules: []}, config.module);
config.module.rules.push({
    test: /\.vue$/,
    loader: "vue-loader"
});

config.plugins = config.plugins || [];
config.plugins.push(
    new webpack.LoaderOptionsPlugin({forceEnv: "webpack"}),
    new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("development"),
        "process.libVersion": JSON.stringify(version)
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: ["setdex", "sulcalc", "db"]
    }),
    new HtmlWebpackPlugin({
        template: path.join(__dirname, "../app/index.hbs"),
        inject: false,
        hash: true,
        title: "sulcalc",
        description: "A Pokémon damage calculator",
        cdn: false,
        css,
        javascript
    })
);

config.devServer = {
    contentBase: path.join(__dirname, "../node_modules"),
    port: 3000,
    inline: false,
    stats: config.stats
};

module.exports = config;
