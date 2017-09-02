"use strict";
const webpack = require("webpack");
const BabelMinifyPlugin = require("babel-minify-webpack-plugin");
const {cloneDeep} = require("lodash/fp");
const baseConfig = require("./webpack.app.config");

const config = cloneDeep(baseConfig);

config.devtool = "source-map";

config.plugins = config.plugins || [];
config.plugins.unshift(
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.LoaderOptionsPlugin({minimize: true}),
    new webpack.EnvironmentPlugin({NODE_ENV: "production"}),
    new BabelMinifyPlugin()
);

module.exports = config;
