"use strict";
const path = require("path");
const {mkdirs, writeFile, readFile} = require("fs-extra");
const {cond, flow, identity, map} = require("lodash/fp");
const {
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes,
    combineItemsAndBerries
} = require("./utilities");

const inDir = path.join(__dirname, "translations");
const outDir = path.join(__dirname, "../dist/translations");
const locales = ["de", "es", "fr", "it", "zh-cn"];

const fileTypes = [
    {
        name: "abilities",
        files: "db/abilities/abilities.txt"
    },
    {
        name: "items",
        files: ["db/items/items.txt", "db/items/berries.txt"],
        transform: combineItemsAndBerries
    },
    {
        name: "moves",
        files: "db/moves/moves.txt"
    },
    {
        name: "natures",
        files: "db/natures/nature.txt"
    },
    {
        name: "pokemons",
        files: "db/pokes/pokemons.txt",
        transform: flow(
            simplifyPokeIds,
            removeAestheticPokes
        )
    },
    {
        name: "statuses",
        files: "db/status/status.txt"
    },
    {
        name: "types",
        files: "db/types/types.txt"
    }
];

async function parseTranslationFile(locale, {
    name,
    files,
    transform = identity
}) {
    const fileToObject = async file => {
        try {
            return dataToObject(
                await readFile(path.join(inDir, locale, file))
            );
        } catch (error) {
            return {};
        }
    };

    const result = await cond([
        [
            Array.isArray,
            flow(
                map(fileToObject),
                results => Promise.all(results)
            )
        ],
        [
            () => true,
            fileToObject
        ]
    ])(files);

    const processedResult = transform(result);

    await writeFile(
        path.join(outDir, locale, `${name}.js`),
        `export default ${JSON.stringify(processedResult)}`
    );

    return processedResult;
}

async function translations() {
    await Promise.all(
        map(
            async locale => {
                await Promise.all([
                    mkdirs(path.join(inDir, locale)),
                    mkdirs(path.join(outDir, locale))
                ]);
                return Promise.all(
                    map(
                        fileType => parseTranslationFile(locale, fileType),
                        fileTypes
                    )
                );
            },
            locales
        )
    );
}

translations().catch(error => {
    console.log(error);
});
