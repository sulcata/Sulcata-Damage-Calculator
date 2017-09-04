"use strict";
const path = require("path");
const {mkdirs, writeFile} = require("fs-extra");
const _ = require("lodash/fp");
const {info, Move, Gens, Stats} = require("../src/sulcalc");
const smogonSetdex = [
    null,
    require("./setdex/setdex_rby").default,
    require("./setdex/setdex_gsc").default,
    require("./setdex/setdex_rse").default,
    require("./setdex/setdex_dpp").default,
    require("./setdex/setdex_bw").default,
    require("./setdex/setdex_xy").default,
    require("./setdex/setdex_sm").default
];
const pokemonPerfectSetdex = [
    null,
    require("./setdex/setdex_rby_pp").default,
    {},
    {},
    {},
    {},
    require("./setdex/setdex_xy_pp").default,
    {}
];

function minifySetdexData(setdexData) {
    return setdexData.map((setdex, gen) => minifySetdex(setdex, gen));
}

function minifySetdex(setdex, gen) {
    return setdex && _.flow(
        _.mapKeys(info.pokemonId),
        _.omitBy((sets, id) => id === "0:0"),
        _.toPairs,
        _.map(([id, sets]) => [id, minifySets(sets, id, gen)]),
        _.fromPairs
    )(setdex);
}

function minifySets(sets, pokemonId, gen) {
    return _.flow(
        _.omitBy((set, setName) => setName.includes("CAP")),
        _.mapValues(set => minifySet(set, pokemonId, gen))
    )(sets);
}

function minifySet(set, pokemonId, gen) {
    const statMatches = {
        hp: Stats.HP,
        at: Stats.ATK,
        df: Stats.DEF,
        sa: Stats.SATK,
        sd: Stats.SDEF,
        sp: Stats.SPD
    };
    const defaultLevel = 100;
    const defaultEv = gen >= Gens.ADV ? 0 : 63;
    const defaultIv = gen >= Gens.ADV ? 31 : 15;

    const minifiedSet = {};

    if (set.l && set.l !== defaultLevel) {
        minifiedSet.l = set.level;
    }

    if (set.nature) {
        minifiedSet.n = info.natureId(set.nature);
    }

    if (set.ability) {
        minifiedSet.a = info.abilityId(set.ability);
        if (info.pokemonName(pokemonId).startsWith("Mega ")) {
            minifiedSet.a = info.ability1(pokemonId, gen);
        }
    }

    if (set.item) {
        minifiedSet.i = info.itemId(set.item);
    }

    const moves = _.map(move => importMove(move, gen), set.moves);
    for (const move of moves) {
        if (move.ivs) minifiedSet.d = move.ivs;
    }
    minifiedSet.m = _.map(move => move.id, moves);

    if (set.evs) {
        minifiedSet.e = Array(6).fill(defaultEv);
        for (const [stat, value] of Object.entries(set.evs)) {
            minifiedSet.e[statMatches[stat]] = Math.trunc(value / 4);
        }
    }

    if (!minifiedSet.d && set.ivs) {
        minifiedSet.d = Array(6).fill(defaultIv);
        for (const [stat, value] of Object.entries(set.ivs)) {
            minifiedSet.d[statMatches[stat]] = value;
        }
    }

    return minifiedSet;
}

function importMove(move, gen) {
    const hiddenPowerMatch = /Hidden Power( \[?(\w*)]?)?/i.exec(move);
    if (hiddenPowerMatch) {
        const type = info.typeId(hiddenPowerMatch[2]);
        const ivs = Move.hiddenPowers(type, gen)[0];
        return {id: info.moveId("Hidden Power"), ivs};
    }
    return {id: info.moveId(move)};
}

async function setdex() {
    const outDir = path.join(__dirname, "../dist/setdex");
    await mkdirs(outDir);
    const data = [
        {
            file: "smogon.js",
            data: smogonSetdex
        },
        {
            file: "pokemonPerfect.js",
            data: pokemonPerfectSetdex
        }
    ];
    await Promise.all(
        _.map(
            entry => writeFile(
                path.join(outDir, entry.file),
                `export default ${JSON.stringify(minifySetdexData(entry.data))}`
            ),
            data
        )
    );
}

setdex().catch(error => {
    console.log(error);
});
