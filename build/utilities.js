"use strict";
const {identity, mapKeys, omitBy} = require("lodash");

function dataToObject(data, preFunc = identity) {
    if (!data) return data;
    const obj = {};
    const lines = String(stripByteOrderMark(data)).split("\n");
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

function parseLine(line) {
    // strip comments
    line = line.split("#", 1)[0];

    let idx = line.indexOf(" ");
    if (idx < 0) {
        idx = line.length;
    }

    return {
        key: line.slice(0, idx).trim(),
        value: line.slice(idx).trim()
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
    return omitBy(obj, (value, id) => isAesthetic(id));
}

function simplifyPokeIds(obj) {
    if (!obj) return obj;
    return mapKeys(obj, (value, key) => key.split(":", 2).join(":"));
}

function berryToItem(berryId) {
    return Number(berryId) + 8000;
}

function berriesToItems(berries) {
    return mapKeys(berries, (value, key) => berryToItem(key));
}

module.exports = {
    stripByteOrderMark,
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes,
    berriesToItems
};
