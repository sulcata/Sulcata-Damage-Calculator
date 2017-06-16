"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const config = {
    entry: {
        main: path.join(__dirname, "../app/src/main"),
        db: path.join(__dirname, "../src/db"),
        setdex: path.join(__dirname, "../dist/setdex"),
        vendor: ["vue", "vue-i18n", "vue-multiselect", "lodash"]
    },
    output: {
        filename: "[name].[chunkhash].js",
        path: path.join(__dirname, "../dist/app")
    },
    stats: "minimal",
    resolve: {
        alias: {
            sulcalc: path.join(__dirname, "../src/sulcalc"),
            setdex: path.join(__dirname, "../dist/setdex"),
            translations: path.join(__dirname, "../dist/translations")
        }
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|db|translations|setdex)\//,
                loader: "babel-loader",
                options: {
                    babelrc: false,
                    plugins: [
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
            name: ["setdex", "db", "vendor"]
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "../app/index.hbs"),
            inject: "head"
        }),
        new ScriptExtHtmlWebpackPlugin({defaultAttribute: "defer"})
    ]
};

module.exports = config;
