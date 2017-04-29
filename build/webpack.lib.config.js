"use strict";

const path = require("path");
const webpack = require("webpack");
const BabiliPlugin = require("babili-webpack-plugin");
const {version} = require("../package.json");

const config = {
    entry: path.join(__dirname, "../src/sulcalc"),
    output: {
        filename: "sulcalc.js",
        path: path.join(__dirname, "../dist/lib"),
        library: "sulcalc",
        libraryTarget: "umd"
    },
    devtool: "source-map",
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
                        "syntax-dynamic-import",
                        "transform-export-extensions",
                        "lodash"
                    ]
                }
            }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({minimize: true}),
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify("production"),
            "process.libVersion": JSON.stringify(version)
        }),
        new BabiliPlugin()
    ]
};

module.exports = config;
