"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const pify = require("pify");
const {
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes
} = require("./utils");

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

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
        postFn(obj) {
            const newObj = Object.assign({}, obj[0]);
            for (const key in obj[1]) {
                newObj[Number(key) + 8000] = obj[1][key];
            }
            return newObj;
        }
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

    await writeFile(path.join(outDir, locale, `${fileType.name}.js`),
                    `export default ${JSON.stringify(result)}`);

    return result;
}

function translations() {
    for (const locale of locales) {
        mkdirp.sync(path.join(inDir, locale));
        mkdirp.sync(path.join(outDir, locale));
        for (const fileType of fileTypes) {
            parseTranslationFile(locale, fileType);
        }
    }
}

translations();
