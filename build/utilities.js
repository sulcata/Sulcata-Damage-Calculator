"use strict";
const {
    flow, fromPairs, map, mapKeys,
    pickBy, reject, split, toPairs
} = require("lodash/fp");

function dataToObject(data) {
    return data && flow(
        stripByteOrderMark,
        String,
        split("\n"),
        map(parseLine),
        fromPairs,
        pickBy((value, key) => key)
    )(data);
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

    return [
        line.slice(0, idx).trim(),
        line.slice(idx).trim()
    ];
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
    return obj && flow(
        toPairs,
        reject(entry => isAesthetic(entry[0])),
        fromPairs
    )(obj);
}

function simplifyPokeIds(obj) {
    return obj && mapKeys(key => key.split(":", 2).join(":"), obj);
}

function berryToItem(berryId) {
    return Number(berryId) + 8000;
}

function berriesToItems(berries) {
    return mapKeys(berryToItem, berries);
}

function combineItemsAndBerries(items, berries) {
    return {...items, ...berriesToItems(berries)};
}

module.exports = {
    stripByteOrderMark,
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes,
    combineItemsAndBerries
};
