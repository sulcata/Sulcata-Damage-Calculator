"use strict";
const _ = require("lodash/fp");

const dataToObject = _.cond([
    [
        _.isBuffer,
        _.flow(
            stripByteOrderMark,
            String,
            _.split("\n"),
            _.map(parseLine),
            _.fromPairs,
            _.pickBy((value, key) => key)
        )
    ],
    [
        _.stubTrue,
        _.identity
    ]
]);

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

const baseFormOnly = new Set([
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
]);

const exceptions = new Set([
    "670:5"
]);

function isAesthetic(id) {
    const [num, form] = id.split(":");
    return form !== "0"
        && !exceptions.has(id)
        && baseFormOnly.has(num);
}

function removeAestheticPokes(obj) {
    return obj && _.flow(
        _.toPairs,
        _.reject(entry => isAesthetic(entry[0])),
        _.fromPairs
    )(obj);
}

function simplifyPokeIds(obj) {
    return obj && _.mapKeys(key => key.split(":", 2).join(":"), obj);
}

function berryToItem(berryId) {
    return Number(berryId) + 8000;
}

function combineItemsAndBerries(items, berries) {
    return {...items, ..._.mapKeys(berryToItem, berries)};
}

module.exports = {
    stripByteOrderMark,
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes,
    combineItemsAndBerries
};
