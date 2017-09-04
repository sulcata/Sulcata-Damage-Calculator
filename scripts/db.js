"use strict";
const path = require("path");
const {mkdirs, writeFile, readFile} = require("fs-extra");
const _ = require("lodash/fp");
const {
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes,
    combineItemsAndBerries
} = require("./utilities");
const {reduceByDiffs} = require("./diffs");

const inDir = path.join(__dirname, "data/db");
const outDir = path.join(__dirname, "../dist/db");

const createIndex = _.flow(
    _.map(name => `export {default as ${name}} from "./${name}"`),
    _.join("\n"),
    exports => writeFile(path.join(outDir, "index.js"), exports)
);

async function processData({name, files, transform = _.identity}) {
    const fileToObject = async file => {
        if (typeof file !== "string") return file;
        return dataToObject(
            await readFile(path.join(inDir, file))
        );
    };

    const result = await _.cond([
        [
            _.isArray,
            _.flow(
                _.map(fileToObject),
                files => Promise.all(files)
            )
        ],
        [
            _.stubTrue,
            fileToObject
        ]
    ])(files);

    const processedResult = transform(result);

    await writeFile(
        path.join(outDir, `${name}.js`),
        `export default ${JSON.stringify(processedResult)}`
    );

    return processedResult;
}

const createPreprocessor = fn => _.map(_.mapValues(fn));
const omitCurseType = _.omitBy(type => type === 18);
const mapValuesToNumbers = _.mapValues(Number);
const mapAllValuesToNumbers = _.map(mapValuesToNumbers);
const mapValuesToOne = _.mapValues(() => 1);
const mapAllValuesToOne = _.map(mapValuesToOne);
const parseNumberList = _.flow(_.split(" "), _.map(Number));

const dataList = [
    {
        name: "abilities",
        files: "abilities/abilities.txt"
    },
    {
        name: "abilityEffects",
        files: [
            {},
            {},
            {},
            "abilities/ability_effects_3G.txt",
            "abilities/ability_effects_4G.txt",
            "abilities/ability_effects_5G.txt",
            "abilities/ability_effects_6G.txt",
            "abilities/ability_effects_7G.txt"
        ],
        transform: reduceByDiffs
    },
    {
        name: "naturalGiftPowers",
        files: "items/berry_pow.txt",
        transform: mapValuesToNumbers
    },
    {
        name: "naturalGiftTypes",
        files: "items/berry_type.txt",
        transform: mapValuesToNumbers
    },
    {
        name: "moveCategories",
        files: [
            {},
            "moves/1G/category.txt",
            "moves/2G/category.txt",
            "moves/3G/category.txt",
            "moves/4G/category.txt",
            "moves/5G/category.txt",
            "moves/6G/category.txt",
            "moves/7G/category.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "moveDamageClasses",
        files: [
            {},
            {},
            {},
            {},
            "moves/4G/damage_class.txt",
            "moves/5G/damage_class.txt",
            "moves/6G/damage_class.txt",
            "moves/7G/damage_class.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "evolutions",
        files: "pokes/evos.txt",
        transform: _.mapValues(parseNumberList)
    },
    {
        name: "moveFlags",
        files: [
            {},
            "moves/1G/flags.txt",
            "moves/2G/flags.txt",
            "moves/3G/flags.txt",
            "moves/4G/flags.txt",
            "moves/5G/flags.txt",
            "moves/6G/flags.txt",
            "moves/7G/flags.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "flinchChances",
        files: [
            {},
            "moves/1G/flinch_chance.txt",
            "moves/2G/flinch_chance.txt",
            "moves/3G/flinch_chance.txt",
            "moves/4G/flinch_chance.txt",
            "moves/5G/flinch_chance.txt",
            "moves/6G/flinch_chance.txt",
            "moves/7G/flinch_chance.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "itemEffects",
        files: [
            "items/berry_effects.txt",
            {},
            {},
            "items/2G/item_effects.txt",
            "items/3G/item_effects.txt",
            "items/4G/item_effects.txt",
            "items/5G/item_effects.txt",
            "items/6G/item_effects.txt",
            "items/7G/item_effects.txt"
        ],
        transform(objs) {
            const [berryEffects, ...itemEffectsList] = objs;
            return _.flow([
                _.map(
                    itemEffects => combineItemsAndBerries(
                        itemEffects,
                        berryEffects
                    )
                ),
                reduceByDiffs
            ])(itemEffectsList);
        }
    },
    {
        name: "flingPowers",
        files: "items/items_pow.txt",
        transform: mapValuesToNumbers
    },
    {
        name: "usefulItems",
        files: [
            "items/item_useful.txt",
            "items/berry_useful.txt"
        ],
        transform: _.flow(
            mapAllValuesToOne,
            _.spread(combineItemsAndBerries)
        )
    },
    {
        name: "items",
        files: [
            "items/items.txt",
            "items/berries.txt"
        ],
        transform: _.spread(combineItemsAndBerries)
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
        transform: simplifyPokeIds
    },
    {
        name: "recoils",
        files: [
            {},
            "moves/1G/recoil.txt",
            "moves/2G/recoil.txt",
            "moves/3G/recoil.txt",
            "moves/4G/recoil.txt",
            "moves/5G/recoil.txt",
            "moves/6G/recoil.txt",
            "moves/7G/recoil.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "statBoosts",
        files: [
            {},
            "moves/1G/statboost.txt",
            "moves/2G/statboost.txt",
            "moves/3G/statboost.txt",
            "moves/4G/statboost.txt",
            "moves/5G/statboost.txt",
            "moves/6G/statboost.txt",
            "moves/7G/statboost.txt"
        ],
        transform: _.flow(
            createPreprocessor(
                _.flow(
                    s => new Uint32Array([Number(s)]),
                    arr => new Int8Array(arr.buffer, 0, 3),
                    Array.from,
                    _.compact,
                    _.reverse
                )
            ),
            reduceByDiffs
        )
    },
    {
        name: "types",
        files: "types/types.txt"
    },
    {
        name: "weights",
        files: "pokes/weight.txt",
        transform: _.flow(
            _.mapValues(
                _.flow(_.replace(".", ""), Number)
            ),
            simplifyPokeIds
        )
    },
    {
        name: "moldBreaker",
        files: "abilities/mold_breaker.txt",
        transform: mapValuesToOne
    },
    {
        name: "minMaxHits",
        files: [
            {},
            "moves/1G/min_max_hits.txt",
            "moves/2G/min_max_hits.txt",
            "moves/3G/min_max_hits.txt",
            "moves/4G/min_max_hits.txt",
            "moves/5G/min_max_hits.txt",
            "moves/6G/min_max_hits.txt",
            "moves/7G/min_max_hits.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "moveTypes",
        files: [
            {},
            "moves/1G/type.txt",
            "moves/2G/type.txt",
            "moves/3G/type.txt",
            "moves/4G/type.txt",
            "moves/5G/type.txt",
            "moves/6G/type.txt",
            "moves/7G/type.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "pokeTypes1",
        files: [
            {},
            "pokes/1G/type1.txt",
            "pokes/2G/type1.txt",
            "pokes/3G/type1.txt",
            "pokes/4G/type1.txt",
            "pokes/5G/type1.txt",
            "pokes/6G/type1.txt",
            "pokes/7G/type1.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            _.map(omitCurseType),
            _.map(simplifyPokeIds),
            reduceByDiffs
        )
    },
    {
        name: "pokeTypes2",
        files: [
            {},
            "pokes/1G/type2.txt",
            "pokes/2G/type2.txt",
            "pokes/3G/type2.txt",
            "pokes/4G/type2.txt",
            "pokes/5G/type2.txt",
            "pokes/6G/type2.txt",
            "pokes/7G/type2.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            _.map(omitCurseType),
            _.map(simplifyPokeIds),
            reduceByDiffs
        )
    },
    {
        name: "movePowers",
        files: [
            {},
            "moves/1G/power.txt",
            "moves/2G/power.txt",
            "moves/3G/power.txt",
            "moves/4G/power.txt",
            "moves/5G/power.txt",
            "moves/6G/power.txt",
            "moves/7G/power.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "moveRanges",
        files: [
            {},
            {},
            {},
            "moves/3G/range.txt",
            "moves/4G/range.txt",
            "moves/5G/range.txt",
            "moves/6G/range.txt",
            "moves/7G/range.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "baseStats",
        files: [
            {},
            "pokes/1G/stats.txt",
            "pokes/2G/stats.txt",
            "pokes/3G/stats.txt",
            "pokes/4G/stats.txt",
            "pokes/5G/stats.txt",
            "pokes/6G/stats.txt",
            "pokes/7G/stats.txt"
        ],
        transform: _.flow(
            createPreprocessor(parseNumberList),
            _.map(simplifyPokeIds),
            reduceByDiffs
        )
    },
    {
        name: "typesTables",
        files: [
            {},
            "types/1G/typestable.txt",
            "types/2G/typestable.txt",
            "types/3G/typestable.txt",
            "types/4G/typestable.txt",
            "types/5G/typestable.txt",
            "types/6G/typestable.txt",
            "types/7G/typestable.txt"
        ],
        transform: _.flow(
            createPreprocessor(parseNumberList),
            reduceByDiffs
        )
    },
    {
        name: "abilities1",
        files: [
            {},
            {},
            {},
            "pokes/3G/ability1.txt",
            "pokes/4G/ability1.txt",
            "pokes/5G/ability1.txt",
            "pokes/6G/ability1.txt",
            "pokes/7G/ability1.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "abilities2",
        files: [
            {},
            {},
            {},
            "pokes/3G/ability2.txt",
            "pokes/4G/ability2.txt",
            "pokes/5G/ability2.txt",
            "pokes/6G/ability2.txt",
            "pokes/7G/ability2.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "abilities3",
        files: [
            {},
            {},
            {},
            {},
            {},
            "pokes/5G/ability3.txt",
            "pokes/6G/ability3.txt",
            "pokes/7G/ability3.txt"
        ],
        transform: _.flow(
            mapAllValuesToNumbers,
            reduceByDiffs
        )
    },
    {
        name: "releasedItems",
        files: [
            {},
            {},
            "items/2G/released_items.txt",
            "items/3G/released_items.txt",
            "items/4G/released_items.txt",
            "items/5G/released_items.txt",
            "items/6G/released_items.txt",
            "items/7G/released_items.txt",
            {},
            {},
            "items/2G/released_berries.txt",
            "items/3G/released_berries.txt",
            "items/4G/released_berries.txt",
            "items/5G/released_berries.txt",
            "items/6G/released_berries.txt",
            "items/7G/released_berries.txt"
        ],
        transform: _.flow(
            mapAllValuesToOne,
            _.over([
                _.flow(
                    _.property("length"),
                    _.divide(_, 2)
                ),
                _.identity
            ]),
            _.spread(_.chunk),
            _.unzip,
            _.map(_.spread(combineItemsAndBerries)),
            reduceByDiffs
        )
    },
    {
        name: "releasedMoves",
        files: [
            {},
            "moves/1G/moves.txt",
            "moves/2G/moves.txt",
            "moves/3G/moves.txt",
            "moves/4G/moves.txt",
            "moves/5G/moves.txt",
            "moves/6G/moves.txt",
            "moves/7G/moves.txt"
        ],
        transform: _.flow(
            mapAllValuesToOne,
            reduceByDiffs
        )
    },
    {
        name: "releasedPokes",
        files: [
            {},
            "pokes/1G/released.txt",
            "pokes/2G/released.txt",
            "pokes/3G/released.txt",
            "pokes/4G/released.txt",
            "pokes/5G/released.txt",
            "pokes/6G/released.txt",
            "pokes/7G/released.txt"
        ],
        transform: _.flow(
            mapAllValuesToOne,
            _.map(removeAestheticPokes),
            _.map(simplifyPokeIds),
            reduceByDiffs
        )
    },
    {
        name: "zCrystalType",
        files: "items/zcrystal_type.txt",
        transform: mapValuesToOne
    },
    {
        name: "zMovePower",
        files: "moves/7G/zpower.txt",
        transform: mapValuesToNumbers
    }
];

async function db() {
    await Promise.all(_.map(mkdirs, [inDir, outDir]));
    await Promise.all([
        ..._.map(processData, dataList),
        createIndex(_.map(entry => entry.name, dataList))
    ]);
}

db().catch(error => {
    console.log(error);
});
