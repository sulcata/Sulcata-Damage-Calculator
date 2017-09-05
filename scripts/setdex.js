import path from "path";
import {mkdirs, writeFile} from "fs-extra";
import _ from "lodash/fp";
import {info, Move, Gens, Stats} from "../src/sulcalc";
import abilities1 from "../dist/db/abilities1";

const mapUncapped = _.map.convert({cap: false});
const mapValuesUncapped = _.mapValues.convert({cap: false});

const importMove = _.curry((move, gen) => {
    const hiddenPowerMatch = /Hidden Power( \[?(\w*)]?)?/i.exec(move);
    if (hiddenPowerMatch) {
        const type = info.typeId(hiddenPowerMatch[2]);
        const ivs = Move.hiddenPowers(type, gen)[0];
        return {id: info.moveId("Hidden Power"), ivs};
    }
    return {id: info.moveId(move)};
});

const minifySet = _.curry((set, pokemonId, gen) => {
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
            minifiedSet.a = abilities1[gen][pokemonId];
        }
    }

    if (set.item) {
        minifiedSet.i = info.itemId(set.item);
    }

    const moves = _.map(importMove(_, gen), set.moves);
    for (const move of moves) {
        if (move.ivs) minifiedSet.d = move.ivs;
    }
    minifiedSet.m = _.map(_.property("id"), moves);

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
});

const minifySets = _.curry((sets, pokemonId, gen) => {
    const capRemoved = _.omitBy((set, name) => name.includes("CAP"), sets);
    return _.mapValues(minifySet(_, pokemonId, gen), capRemoved);
});

const minifySetdex = (setdex, gen) => {
    const translated = _.mapKeys(info.pokemonId, setdex);
    const omitted = _.omitBy((sets, id) => id === "0:0", translated);
    return mapValuesUncapped(minifySets(_, _, gen), omitted);
};

const minifySetdexData = mapUncapped(minifySetdex);

const setdex = async() => {
    const inDir = path.join(__dirname, "data/setdex");
    const outDir = path.join(__dirname, "../dist/setdex");
    const filesToSetdex = _.map(_.cond([
        [
            _.isString,
            async file => (await import(path.join(inDir, file))).default
        ],
        [
            _.stubTrue,
            _.identity
        ]
    ]));
    await mkdirs(outDir);
    const data = [
        {
            file: "smogon.js",
            data: await Promise.all(
                filesToSetdex([
                    {},
                    "setdex_rby",
                    "setdex_gsc",
                    "setdex_rse",
                    "setdex_dpp",
                    "setdex_bw",
                    "setdex_xy",
                    "setdex_sm"
                ])
            )
        },
        {
            file: "pokemonPerfect.js",
            data: await Promise.all(
                filesToSetdex([
                    {},
                    "setdex_rby_pp",
                    {},
                    {},
                    {},
                    {},
                    "setdex_xy_pp",
                    {}
                ])
            )
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
};

setdex().catch(error => {
    console.log(error);
});
