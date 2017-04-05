"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const {
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes
} = require("./utils");

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

function parseTranslationFile(locale, fileType) {
    const localeOutDir = path.join(outDir, locale, `${fileType.name}.json`);
    let promise;
    if (fileType.files) {
        promise = Promise.all(fileType.files.map(file =>
            new Promise(resolve => {
                const localeInDir = path.join(inDir, locale, file);
                fs.readFile(localeInDir, (error, data) => {
                    resolve(error ? {} : dataToObject(data, fileType.preFn));
                });
            })
        ));
    } else {
        promise = new Promise(resolve => {
            const localeInDir = path.join(inDir, locale, fileType.file);
            fs.readFile(localeInDir, (error, data) => {
                resolve(error ? {} : dataToObject(data, fileType.preFn));
            });
        });
    }
    return promise.then(obj => new Promise((resolve, reject) => {
        if (fileType.postFn) {
            obj = fileType.postFn(obj);
        }
        fs.writeFile(localeOutDir, JSON.stringify(obj), error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    }));
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
