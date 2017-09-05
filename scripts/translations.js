import path from "path";
import {mkdirs, writeFile, readFile} from "fs-extra";
import _ from "lodash/fp";
import {
    dataToObject,
    simplifyPokeIds,
    removeAestheticPokes,
    combineItemsAndBerries
} from "./utilities";

const inDir = path.join(__dirname, "data/translations");
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
        transform: _.flow(
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

const parseTranslationFile = async(locale, {
    name,
    files,
    transform = _.identity
}) => {
    const fileToObject = async file => {
        try {
            return dataToObject(
                await readFile(path.join(inDir, locale, file))
            );
        } catch (error) {
            return {};
        }
    };

    const pendingResult = Array.isArray(files)
        ? Promise.all(_.map(fileToObject, files))
        : fileToObject(files);
    const result = transform(await pendingResult);

    await writeFile(
        path.join(outDir, locale, `${name}.js`),
        `export default ${JSON.stringify(result)}`
    );

    return result;
};

const translations = async() => {
    await Promise.all(
        _.map(
            async locale => {
                await Promise.all([
                    mkdirs(path.join(inDir, locale)),
                    mkdirs(path.join(outDir, locale))
                ]);
                return Promise.all(
                    _.map(
                        fileType => parseTranslationFile(locale, fileType),
                        fileTypes
                    )
                );
            },
            locales
        )
    );
};

translations().catch(error => {
    console.log(error);
});
