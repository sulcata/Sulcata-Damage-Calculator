"use strict";
const webpack = require("webpack");
const {cloneDeep} = require("lodash");
const baseConfig = require("./webpack.app.config");

const config = cloneDeep(baseConfig);

config.devtool = "cheap-module-source-map";

config.plugins = config.plugins || [];
config.plugins.unshift(
    new webpack.EnvironmentPlugin({NODE_ENV: "development"})
);

config.devServer = {
    port: 3000,
    inline: false,
    stats: config.stats
};

module.exports = config;
