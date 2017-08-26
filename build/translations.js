"use strict";
const path = require("path");
const {mkdirs, writeFile, readFile} = require("fs-extra");
const {
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes,
    berriesToItems
} = require("./utilities");

const inDir = path.join(__dirname, "translations");
const outDir = path.join(__dirname, "../dist/translations");
const locales = ["de", "es", "fr", "it", "zh-cn"];

const fileTypes = [
    {
        name: "abilities",
        file: "db/abilities/abilities.txt"
    },
    {
        name: "items",
        files: ["db/items/items.txt", "db/items/berries.txt"],
        postFn: ([items, berries]) => ({...items, ...berriesToItems(berries)})
    },
    {
        name: "moves",
        file: "db/moves/moves.txt"
    },
    {
        name: "natures",
        file: "db/natures/nature.txt"
    },
    {
        name: "pokemons",
        file: "db/pokes/pokemons.txt",
        postFn: obj => simplifyPokeIds(removeAestheticPokes(obj))
    },
    {
        name: "statuses",
        file: "db/status/status.txt"
    },
    {
        name: "types",
        file: "db/types/types.txt"
    }
];

async function parseTranslationFile(locale, fileType) {
    let result;
    if (fileType.files) {
        const files = fileType.files.map(async file => {
            try {
                const data = await readFile(path.join(inDir, locale, file));
                return dataToObject(data, fileType.preFn);
            } catch (error) {
                return {};
            }
        });
        result = await Promise.all(files);
    } else {
        try {
            const file = fileType.file;
            const data = await readFile(path.join(inDir, locale, file));
            result = dataToObject(data, fileType.preFn);
        } catch (error) {
            result = {};
        }
    }

    if (fileType.postFn) {
        result = fileType.postFn(result);
    }

    await writeFile(
        path.join(outDir, locale, `${fileType.name}.js`),
        `export default ${JSON.stringify(result)}`
    );

    return result;
}

async function translations() {
    await locales.map(async locale => {
        await Promise.all([
            mkdirs(path.join(inDir, locale)),
            mkdirs(path.join(outDir, locale))
        ]);
        return Promise.all(
            fileTypes.map(fileType => parseTranslationFile(locale, fileType))
        );
    });
}

translations().catch(error => {
    console.log(error);
});
