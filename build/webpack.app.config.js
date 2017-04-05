"use strict";

const path = require("path");

const config = {
    entry: {
        main: path.join(__dirname, "../app/src/main"),
        sulcalc: path.join(__dirname, "../src/sulcalc"),
        db: path.join(__dirname, "../src/db"),
        setdex: path.join(__dirname, "../dist/setdex")
    },
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "../dist/app")
    },
    devtool: "source-map",
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
                loader: "babel-loader"
            },
            {
                test: /\.hbs$/,
                loader: "handlebars-loader"
            }
        ]
    }
};

module.exports = config;
