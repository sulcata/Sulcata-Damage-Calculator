"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const {identity, isEqual} = require("lodash");
const pify = require("pify");
const {
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes
} = require("./utils");

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

const inDir = path.join(__dirname, "db");
const outDir = path.join(__dirname, "../dist/db");

async function processData(name, files, preFn = identity, postFn = identity) {
    let result;
    if (Array.isArray(files)) {
        files = files.map(file => {
            if (file) {
                return readFile(path.join(inDir, file));
            }
            return Promise.resolve(file);
        });
        const dataArray = await Promise.all(files);
        result = dataArray.map(data => dataToObject(data, preFn));
    } else {
        result = dataToObject(await readFile(path.join(inDir, files)), preFn);
    }
    result = postFn(result);

    await writeFile(path.join(outDir, `${name}.js`),
                    `export default ${JSON.stringify(result)}`);

    return result;
}

function removeEquivEntries(arr, idx, prop, val) {
    while (idx < arr.length) {
        const obj = arr[idx];
        if (!isEqual(obj[prop], val)) break;
        delete obj[prop];
        idx++;
    }
}

function reduceByDiffs(arr) {
    for (let i = 0; i < arr.length; i++) {
        const obj = arr[i];
        if (obj !== null) {
            for (const prop in obj) {
                removeEquivEntries(arr, i + 1, prop, obj[prop]);
            }
        }
    }
    return arr;
}

const dataList = [
    {
        name: "abilities",
        files: "abilities/abilities.txt"
    },
    {
        name: "abilityEffects",
        files: [
            null,
            null,
            null,
            "abilities/ability_effects_3G.txt",
            "abilities/ability_effects_4G.txt",
            "abilities/ability_effects_5G.txt",
            "abilities/ability_effects_6G.txt",
            "abilities/ability_effects_7G.txt"
        ],
        postFn: reduceByDiffs
    },
    {
        name: "naturalGiftPowers",
        files: "items/berry_pow.txt",
        preFn: Number
    },
    {
        name: "naturalGiftTypes",
        files: "items/berry_type.txt",
        preFn: Number
    },
    {
        name: "moveCategories",
        files: [
            null,
            "moves/1G/category.txt",
            "moves/2G/category.txt",
            "moves/3G/category.txt",
            "moves/4G/category.txt",
            "moves/5G/category.txt",
            "moves/6G/category.txt",
            "moves/7G/category.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "moveDamageClasses",
        files: [
            null,
            null,
            null,
            null,
            "moves/4G/damage_class.txt",
            "moves/5G/damage_class.txt",
            "moves/6G/damage_class.txt",
            "moves/7G/damage_class.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "evolutions",
        files: "pokes/evos.txt",
        preFn: s => s.split(" ").map(Number)
    },
    {
        name: "moveFlags",
        files: [
            null,
            "moves/1G/flags.txt",
            "moves/2G/flags.txt",
            "moves/3G/flags.txt",
            "moves/4G/flags.txt",
            "moves/5G/flags.txt",
            "moves/6G/flags.txt",
            "moves/7G/flags.txt"
        ],
        preFn: Number
    },
    {
        name: "flinchChances",
        files: [
            null,
            "moves/1G/flinch_chance.txt",
            "moves/2G/flinch_chance.txt",
            "moves/3G/flinch_chance.txt",
            "moves/4G/flinch_chance.txt",
            "moves/5G/flinch_chance.txt",
            "moves/6G/flinch_chance.txt",
            "moves/7G/flinch_chance.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "itemEffects",
        files: [
            "items/berry_effects.txt",
            "items/2G/item_effects.txt",
            "items/3G/item_effects.txt",
            "items/4G/item_effects.txt",
            "items/5G/item_effects.txt",
            "items/6G/item_effects.txt",
            "items/7G/item_effects.txt"
        ],
        postFn(objArr) {
            const [berryEffects, ...itemEffects] = objArr;
            for (const berryId in berryEffects) {
                itemEffects[0][Number(berryId) + 8000] = berryEffects[berryId];
            }
            return reduceByDiffs([null, null, ...itemEffects]);
        }
    },
    {
        name: "flingPowers",
        files: "items/items_pow.txt",
        preFn: Number
    },
    {
        name: "usefulItems",
        files: [
            "items/item_useful.txt",
            "items/berry_useful.txt"
        ],
        preFn: () => 1,
        postFn(objArr) {
            const items = Object.assign({}, objArr[0]);
            for (const berryId in objArr[1]) {
                items[Number(berryId) + 8000] = objArr[1][berryId];
            }
            return items;
        }
    },
    {
        name: "items",
        files: [
            "items/items.txt",
            "items/berries.txt"
        ],
        postFn(objArr) {
            const items = Object.assign({}, objArr[0]);
            for (const berryId in objArr[1]) {
                items[Number(berryId) + 8000] = objArr[1][berryId];
            }
            return items;
        }
    },
    {
        name: "moves",
        files: "moves/moves.txt"
    },
    {
        name: "natures",
        files: "natures/nature.txt"
    },
    {
        name: "pokemon",
        files: "pokes/pokemons.txt",
        postFn: simplifyPokeIds
    },
    {
        name: "recoils",
        files: [
            null,
            "moves/1G/recoil.txt",
            "moves/2G/recoil.txt",
            "moves/3G/recoil.txt",
            "moves/4G/recoil.txt",
            "moves/5G/recoil.txt",
            "moves/6G/recoil.txt",
            "moves/7G/recoil.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "statBoosts",
        files: [
            null,
            "moves/1G/statboost.txt",
            "moves/2G/statboost.txt",
            "moves/3G/statboost.txt",
            "moves/4G/statboost.txt",
            "moves/5G/statboost.txt",
            "moves/6G/statboost.txt",
            "moves/7G/statboost.txt"
        ],
        preFn(s) {
            let arr = new Uint32Array([Number(s)]);
            arr = new Int8Array(arr.buffer, 0, 3);
            return Array.from(arr)
                .filter(identity)
                .reverse();
        },
        postFn: reduceByDiffs
    },
    {
        name: "types",
        files: "types/types.txt"
    },
    {
        name: "weights",
        files: "pokes/weight.txt",
        preFn: s => Number(s.replace(".", "")),
        postFn: simplifyPokeIds
    },
    {
        name: "moldBreaker",
        files: "abilities/mold_breaker.txt",
        preFn: () => 1
    },
    {
        name: "minMaxHits",
        files: [
            null,
            "moves/1G/min_max_hits.txt",
            "moves/2G/min_max_hits.txt",
            "moves/3G/min_max_hits.txt",
            "moves/4G/min_max_hits.txt",
            "moves/5G/min_max_hits.txt",
            "moves/6G/min_max_hits.txt",
            "moves/7G/min_max_hits.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "moveTypes",
        files: [
            null,
            "moves/1G/type.txt",
            "moves/2G/type.txt",
            "moves/3G/type.txt",
            "moves/4G/type.txt",
            "moves/5G/type.txt",
            "moves/6G/type.txt",
            "moves/7G/type.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "pokeTypes1",
        files: [
            null,
            "pokes/1G/type1.txt",
            "pokes/2G/type1.txt",
            "pokes/3G/type1.txt",
            "pokes/4G/type1.txt",
            "pokes/5G/type1.txt",
            "pokes/6G/type1.txt",
            "pokes/7G/type1.txt"
        ],
        preFn: Number,
        postFn: arr => reduceByDiffs(arr).map(genObj => {
            for (const k in genObj) {
                if (genObj[k] === 18) delete genObj[k];
            }
            return simplifyPokeIds(genObj);
        })
    },
    {
        name: "pokeTypes2",
        files: [
            null,
            "pokes/1G/type2.txt",
            "pokes/2G/type2.txt",
            "pokes/3G/type2.txt",
            "pokes/4G/type2.txt",
            "pokes/5G/type2.txt",
            "pokes/6G/type2.txt",
            "pokes/7G/type2.txt"
        ],
        preFn: Number,
        postFn: arr => reduceByDiffs(arr).map(genObj => {
            for (const k in genObj) {
                if (genObj[k] === 18) delete genObj[k];
            }
            return simplifyPokeIds(genObj);
        })
    },
    {
        name: "movePowers",
        files: [
            null,
            "moves/1G/power.txt",
            "moves/2G/power.txt",
            "moves/3G/power.txt",
            "moves/4G/power.txt",
            "moves/5G/power.txt",
            "moves/6G/power.txt",
            "moves/7G/power.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "moveRanges",
        files: [
            null,
            null,
            null,
            "moves/3G/range.txt",
            "moves/4G/range.txt",
            "moves/5G/range.txt",
            "moves/6G/range.txt",
            "moves/7G/range.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "baseStats",
        files: [
            null,
            "pokes/1G/stats.txt",
            "pokes/2G/stats.txt",
            "pokes/3G/stats.txt",
            "pokes/4G/stats.txt",
            "pokes/5G/stats.txt",
            "pokes/6G/stats.txt",
            "pokes/7G/stats.txt"
        ],
        preFn: s => s.split(" ").map(Number),
        postFn: arr => reduceByDiffs(arr).map(simplifyPokeIds)
    },
    {
        name: "typesTables",
        files: [
            null,
            "types/1G/typestable.txt",
            "types/2G/typestable.txt",
            "types/3G/typestable.txt",
            "types/4G/typestable.txt",
            "types/5G/typestable.txt",
            "types/6G/typestable.txt",
            "types/7G/typestable.txt"
        ],
        preFn: s => s.split(" ").map(Number),
        postFn: arr => reduceByDiffs(arr.map((val, idx) => {
            if (val === null) {
                return val;
            }
            if (idx < 2) {
                delete val[8];
                delete val[16];
            }
            if (idx < 6) {
                delete val[17];
            }
            return val;
        }))
    },
    {
        name: "abilities1",
        files: [
            null,
            null,
            null,
            "pokes/3G/ability1.txt",
            "pokes/4G/ability1.txt",
            "pokes/5G/ability1.txt",
            "pokes/6G/ability1.txt",
            "pokes/7G/ability1.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "abilities2",
        files: [
            null,
            null,
            null,
            "pokes/3G/ability2.txt",
            "pokes/4G/ability2.txt",
            "pokes/5G/ability2.txt",
            "pokes/6G/ability2.txt",
            "pokes/7G/ability2.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "abilities3",
        files: [
            null,
            null,
            null,
            null,
            null,
            "pokes/5G/ability3.txt",
            "pokes/6G/ability3.txt",
            "pokes/7G/ability3.txt"
        ],
        preFn: Number,
        postFn: reduceByDiffs
    },
    {
        name: "releasedItems",
        files: [
            "items/2G/released_items.txt",
            "items/3G/released_items.txt",
            "items/4G/released_items.txt",
            "items/5G/released_items.txt",
            "items/6G/released_items.txt",
            "items/7G/released_items.txt",
            "items/2G/released_berries.txt",
            "items/3G/released_berries.txt",
            "items/4G/released_berries.txt",
            "items/5G/released_berries.txt",
            "items/6G/released_berries.txt",
            "items/7G/released_berries.txt"
        ],
        preFn: () => 1,
        postFn(objArr) {
            const items = [];
            for (let i = 0; i < objArr.length / 2; i++) {
                const obj = Object.assign({}, objArr[i]);
                for (const berryId in objArr[i + objArr.length / 2]) {
                    obj[Number(berryId) + 8000]
                        = objArr[i + objArr.length / 2][berryId];
                }
                items.push(obj);
            }
            return [null, null, ...items];
        }
    },
    {
        name: "releasedMoves",
        files: [
            null,
            "moves/1G/moves.txt",
            "moves/2G/moves.txt",
            "moves/3G/moves.txt",
            "moves/4G/moves.txt",
            "moves/5G/moves.txt",
            "moves/6G/moves.txt",
            "moves/7G/moves.txt"
        ],
        preFn: () => 1
    },
    {
        name: "releasedPokes",
        files: [
            null,
            "pokes/1G/released.txt",
            "pokes/2G/released.txt",
            "pokes/3G/released.txt",
            "pokes/4G/released.txt",
            "pokes/5G/released.txt",
            "pokes/6G/released.txt",
            "pokes/7G/released.txt"
        ],
        preFn: () => 1,
        postFn: arr => arr.map(removeAestheticPokes).map(simplifyPokeIds)
    },
    {
        name: "zCrystalType",
        files: "items/zcrystal_type.txt",
        preFn: Number
    },
    {
        name: "zMovePower",
        files: "moves/7G/zpower.txt",
        preFn: Number
    }
];

function db() {
    mkdirp.sync(inDir);
    mkdirp.sync(outDir);
    const promises = dataList.map(entry =>
        processData(entry.name, entry.files, entry.preFn, entry.postFn));
    return Promise.all(promises);
}

db();
