"use strict";

const fs = require("fs");
const identity = require("lodash/identity");

function dataToObject(data, preFunc = identity) {
    if (!data) return data;
    const obj = {};
    const lines = stripByteOrderMark(data).toString()
                                          .split("\n");
    for (let line of lines) {
        line = parseLine(line.split("#", 1)[0]);
        if (!line.key) continue;
        obj[line.key] = preFunc(line.value);
    }
    return obj;
}

function stripByteOrderMark(data) {
    if (data.length >= 3 && data.readUIntBE(0, 3) === 0xEFBBBF) {
        return data.slice(3);
    }
    return data;
}

function readFiles(files) {
    const promises = files.map(file =>
        new Promise((resolve, reject) => {
            if (typeof file === "string") {
                fs.readFile(file, (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
            } else {
                resolve(null);
            }
        })
    );
    return Promise.all(promises);
}

function parseLine(line) {
    // strip comments
    line = line.split("#", 1)[0];

    let idx = line.indexOf(" ");
    if (idx < 0) {
        idx = line.length;
    }

    return {
        key: line.substring(0, idx).trim(),
        value: line.substring(idx).trim()
    };
}

const baseFormOnly = [
    "201",
    "666",
    "676",
    "25",
    "669",
    "670",
    "671",
    "585",
    "586",
    "172",
    "422",
    "423",
    "550",
    "716"
];

const exceptions = [
    "670:5"
];

function isAesthetic(id) {
    return !exceptions.includes(id)
        && id.split(":")[1] !== "0"
        && baseFormOnly.some(baseId => id.startsWith(baseId));
}

function removeAestheticPokes(obj) {
    for (const key in obj) {
        if (isAesthetic(key)) delete obj[key];
    }
    return obj;
}

function simplifyPokeIds(obj) {
    if (!obj) return obj;
    const newObj = {};

    for (const key in obj) {
        newObj[key.split(":", 2).join(":")] = obj[key];
    }

    return newObj;
}

module.exports = {
    stripByteOrderMark,
    dataToObject,
    readFiles,
    simplifyPokeIds,
    removeAestheticPokes
};
