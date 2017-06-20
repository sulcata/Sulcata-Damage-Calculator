/* eslint-disable import/max-dependencies */
"use strict";
require("babel-register");

const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
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
    null,
    null,
    null,
    null,
    null,
    null
];

function minifySetdexData(setdexData) {
    return setdexData.map((setdex, gen) => minifySetdex(setdex, gen));
}

function minifySetdex(setdex, gen) {
    if (setdex === null) return null;
    const minifiedSetdex = {};
    for (const pokemon in setdex) {
        const pokemonId = info.pokemonId(pokemon);
        if (pokemonId !== "0:0") {
            minifiedSetdex[pokemonId] = minifySets(setdex[pokemon], gen);
        }
    }
    return minifiedSetdex;
}

function minifySets(sets, gen) {
    const minifiedSets = {};
    for (const setName in sets) {
        if (!setName.includes("(CAP")) {
            minifiedSets[setName] = minifySet(sets[setName], gen);
        }
    }
    return minifiedSets;
}

function minifySet(set, gen) {
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
    }

    if (set.item) {
        minifiedSet.i = info.itemId(set.item);
    }

    const moves = set.moves.map(move => importMove(move, gen));
    for (const move of moves) {
        if (move.ivs) minifiedSet.d = move.ivs;
    }
    minifiedSet.m = moves.map(({id}) => id);

    if (set.evs) {
        minifiedSet.e = Array(6).fill(defaultEv);
        for (const stat in set.evs) {
            minifiedSet.e[statMatches[stat]] = Math.trunc(set.evs[stat] / 4);
        }
    }

    if (!minifiedSet.d && set.ivs) {
        minifiedSet.d = Array(6).fill(defaultIv);
        for (const stat in set.ivs) {
            minifiedSet.d[statMatches[stat]] = set.ivs[stat];
        }
    }

    return minifiedSet;
}

const hiddenPowerRegex = /Hidden Power( \[?(\w*)]?)?/i;

function importMove(move, gen) {
    const match = hiddenPowerRegex.exec(move);
    if (match) {
        const type = info.typeId(match[2]);
        const ivs = Move.hiddenPowers(type, gen)[0];
        return {
            id: info.moveId("Hidden Power"),
            ivs
        };
    }
    return {id: info.moveId(move)};
}

function setdex() {
    const outDir = path.join(__dirname, "../dist/setdex");
    mkdirp.sync(outDir);
    const minifiedSmogonSetdex = minifySetdexData(smogonSetdex);
    const minifiedPokemonPerfectSetdex = minifySetdexData(pokemonPerfectSetdex);
    fs.writeFile(
        path.join(__dirname, "../dist/setdex/smogon.js"),
        `export default ${JSON.stringify(minifiedSmogonSetdex)}`,
        error => {
            if (error) throw error;
        });
    fs.writeFile(
        path.join(__dirname, "../dist/setdex/pokemonPerfect.js"),
        `export default ${JSON.stringify(minifiedPokemonPerfectSetdex)}`,
        error => {
            if (error) throw error;
        });
}

setdex();
