import {castArray, cond, fromPairs, identity, kebabCase} from "lodash";
import * as db from "../dist/db";
import {Gens, Types, DamageClasses} from "./utilities";

const {trunc} = Math;

// istanbul ignore else
if (process.env.NODE_ENV !== "production") {
    (function deepFreeze(obj) {
        for (const value of Object.values(obj)) {
            if (value && typeof value === "object") {
                deepFreeze(value);
            }
        }
        return Object.freeze(obj);
    }(db));
}

const altPokeNames = {
    "681:0": "Aegislash-Shield",
    "669:0": "Flabebe",
    "678:0": "Meowstic-M",
    "460:1": "Abomasnow-Mega",
    "359:1": "Absol-Mega",
    "142:1": "Aerodactyl-Mega",
    "306:1": "Aggron-Mega",
    "65:1":  "Alakazam-Mega",
    "334:1": "Altaria-Mega",
    "181:1": "Ampharos-Mega",
    "531:1": "Audino-Mega",
    "354:1": "Banette-Mega",
    "15:1":  "Beedrill-Mega",
    "9:1":   "Blastoise-Mega",
    "257:1": "Blaziken-Mega",
    "323:1": "Camerupt-Mega",
    "6:1":   "Charizard-Mega-X",
    "6:2":   "Charizard-Mega-Y",
    "719:1": "Diancie-Mega",
    "475:1": "Gallade-Mega",
    "445:1": "Garchomp-Mega",
    "282:1": "Gardevoir-Mega",
    "94:1":  "Gengar-Mega",
    "362:1": "Glalie-Mega",
    "130:1": "Gyarados-Mega",
    "214:1": "Heracross-Mega",
    "229:1": "Houndoom-Mega",
    "115:1": "Kangaskhan-Mega",
    "380:1": "Latias-Mega",
    "381:1": "Latios-Mega",
    "428:1": "Lopunny-Mega",
    "448:1": "Lucario-Mega",
    "310:1": "Manectric-Mega",
    "303:1": "Mawile-Mega",
    "308:1": "Medicham-Mega",
    "376:1": "Metagross-Mega",
    "150:1": "Mewtwo-Mega-X",
    "150:2": "Mewtwo-Mega-Y",
    "18:1":  "Pidgeot-Mega",
    "127:1": "Pinsir-Mega",
    "384:1": "Rayquaza-Mega",
    "302:1": "Sableye-Mega",
    "373:1": "Salamence-Mega",
    "254:1": "Sceptile-Mega",
    "212:1": "Scizor-Mega",
    "319:1": "Sharpedo-Mega",
    "80:1":  "Slowbro-Mega",
    "208:1": "Steelix-Mega",
    "260:1": "Swampert-Mega",
    "248:1": "Tyranitar-Mega",
    "3:1":   "Venusaur-Mega",
    "383:1": "Groudon-Primal",
    "382:1": "Kyogre-Primal"
};

const requiredItems = {
    // Don't exclude plates & orbs as those affect damage
    // Genesect
    "649:1":  "Douse Drive",
    "649:2":  "Shock Drive",
    "649:3":  "Burn Drive",
    "649:4":  "Chill Drive",
    // Megas
    "460:1":  "Abomasite",
    "359:1":  "Absolite",
    "142:1":  "Aerodactylite",
    "306:1":  "Aggronite",
    "65:1":   "Alakazite",
    "334:1":  "Altarianite",
    "181:1":  "Ampharosite",
    "531:1":  "Audinite",
    "354:1":  "Banettite",
    "15:1":   "Beedrillite",
    "9:1":    "Blastoisinite",
    "257:1":  "Blazikenite",
    "323:1":  "Cameruptite",
    "6:1":    "Charizardite X",
    "6:2":    "Charizardite Y",
    "719:1":  "Diancite",
    "475:1":  "Galladite",
    "445:1":  "Garchompite",
    "282:1":  "Gardevoirite",
    "94:1":   "Gengarite",
    "362:1":  "Glalitite",
    "130:1":  "Gyaradosite",
    "214:1":  "Heracronite",
    "229:1":  "Houndoominite",
    "115:1":  "Kangaskhanite",
    "380:1":  "Latiasite",
    "381:1":  "Latiosite",
    "428:1":  "Lopunnity",
    "448:1":  "Lucarionite",
    "310:1":  "Manectite",
    "303:1":  "Mawilite",
    "308:1":  "Medichamite",
    "376:1":  "Metagrossite",
    "150:1":  "Mewtwonite X",
    "150:2":  "Mewtwonite Y",
    "18:1":   "Pidgeotite",
    "127:1":  "Pinsirite",
    "302:1":  "Sablenite",
    "373:1":  "Salamencite",
    "254:1":  "Sceptilite",
    "212:1":  "Scizorite",
    "319:1":  "Sharpedonite",
    "80:1":   "Slowbronite",
    "208:1":  "Steelixite",
    "260:1":  "Swampertite",
    "248:1":  "Tyranitarite",
    "3:1":    "Venusaurite",
    // Primals
    "383:1":  "Red Orb",
    "382:1":  "Blue Orb",
    // Silvally
    "773:1":  "Fighting Memory",
    "773:2":  "Flying Memory",
    "773:3":  "Poison Memory",
    "773:4":  "Ground Memory",
    "773:5":  "Rock Memory",
    "773:6":  "Bug Memory",
    "773:7":  "Ghost Memory",
    "773:8":  "Steel Memory",
    "773:9":  "Fire Memory",
    "773:10": "Water Memory",
    "773:11": "Grass Memory",
    "773:12": "Electric Memory",
    "773:13": "Psychic Memory",
    "773:14": "Ice Memory",
    "773:15": "Dragon Memory",
    "773:16": "Dark Memory",
    "773:17": "Fairy Memory"
};

function getInfo(arr, key, gen, defaultValue) {
    // search most to least recent
    // stop at null or after the 0th index
    while (arr[gen] && arr[gen][key] !== null) {
        // best way to check since it might be falsy
        if (arr[gen].hasOwnProperty(key)) {
            return arr[gen][key];
        }
        gen--;
    }

    return defaultValue;
}

function nameToId(obj, name, defaultId) {
    const normalizedName = kebabCase(name.toLowerCase());

    for (const [id, name] of Object.entries(obj)) {
        if (normalizedName === kebabCase(name.toLowerCase())) {
            return id;
        }
    }

    return defaultId;
}

function createFlagGetter(allEffects, defaultValue, flagsToGet) {
    return (id, gen) => {
        const effectString = getInfo(allEffects, id, gen) || "";
        const effects = fromPairs(
            effectString.split("|")
                .map(effect => effect.split("-", 2))
        );
        for (const [flag, parser] of Object.entries(flagsToGet)) {
            if (effects.hasOwnProperty(flag)) {
                return parser(effects[flag] || true);
            }
        }
        return defaultValue;
    };
}

const natureMultArr = [-1, 0, 1, 3, 4, 2];
const natureStatsArr = [1, 2, 5, 3, 4];

/* Nature Information */

export function natureName(natureId) {
    return db.natures.hasOwnProperty(natureId)
        ? db.natures[natureId] : undefined;
}

export function natureId(natureName) {
    const name = nameToId(db.natures, natureName);
    return name ? Number(name) : undefined;
}

export function natures() {
    const natures = [];
    for (let i = 0; i < 25; i++) {
        natures.push(i);
    }
    return natures;
}

export function natureMultiplier(natureId, stat) {
    return (trunc(natureId / 5) === natureMultArr[stat])
        - (natureId % 5 === natureMultArr[stat]);
}

export function natureStats(natureId) {
    if (trunc(natureId / 5) !== natureId % 5) {
        return [
            natureStatsArr[trunc(natureId / 5)],
            natureStatsArr[natureId % 5]
        ];
    }
    return [-1, -1];
}

/* Pokemon Information */

export function pokemonName(pokeId) {
    return db.pokemon.hasOwnProperty(pokeId)
        ? db.pokemon[pokeId] : "Missingno";
}

export function pokemonId(pokeName) {
    return nameToId(db.pokemon, pokeName)
        || nameToId(altPokeNames, pokeName)
        || "0:0";
}

export function isPokeUseful(pokeId) {
    return pokemonName(pokeId) !== "Missingno";
}

export function isPokeReleased(pokeId, gen) {
    return Boolean(getInfo(db.releasedPokes, pokeId, gen));
}

export function releasedPokes(gen) {
    return Object.keys(db.pokemon)
        .filter(id => id !== "0:0" && isPokeReleased(id, gen))
        .sort((a, b) => {
            const [aNum, aForm] = a.split(":").map(Number);
            const [bNum, bForm] = b.split(":").map(Number);
            return (aNum - bNum) || (aForm - bForm);
        });
}

export function pokeType1(pokeId, gen) {
    let type = getInfo(db.pokeTypes1, pokeId, gen);
    if (type !== undefined) return type;

    type = getInfo(db.pokeTypes1, pokeId.split(":", 1) + ":0", gen);
    if (type !== undefined) return type;

    return Types.CURSE;
}

export function pokeType2(pokeId, gen) {
    let type = getInfo(db.pokeTypes2, pokeId, gen);
    if (type !== undefined) return type;

    type = getInfo(db.pokeTypes2, pokeId.split(":", 1) + ":0", gen);
    if (type !== undefined) return type;

    return Types.CURSE;
}

export function baseStats(pokeId, gen) {
    return getInfo(db.baseStats, pokeId, gen)
        || getInfo(db.baseStats, pokeId.split(":", 1) + ":0", gen);
}

export function evolutions(pokeId, gen) {
    const species = pokeId.split(":")[0];

    if (pokemonName(pokeId) === "Floette-Eternal"
        || !db.evolutions.hasOwnProperty(species)) {
        return [];
    }

    const evolutions = db.evolutions[species];
    return evolutions.filter(p => isPokeReleased(p + ":0", gen));
}

export function preEvolution(pokeId, gen) {
    const pokeNum = Number(pokeId.split(":")[0]);
    for (const [evoNum, evolutions] of Object.entries(db.evolutions)) {
        const evoId = evoNum + ":0";
        if (evolutions.includes(pokeNum) && isPokeReleased(evoId, gen)) {
            return evoId;
        }
    }
    return undefined;
}

export function weight(pokeId) {
    if (db.weights.hasOwnProperty(pokeId)) return db.weights[pokeId];

    const baseForm = pokeId.split(":", 1) + ":0";
    if (db.weights.hasOwnProperty(baseForm)) return db.weights[baseForm];

    return undefined;
}

export function requiredItemForPoke(pokeId) {
    if (!requiredItems.hasOwnProperty(pokeId)) return 0;
    return itemId(requiredItems[pokeId]);
}

/* Move Information */

export function moveName(moveId) {
    return db.moves.hasOwnProperty(moveId) ? db.moves[moveId] : "(No Move)";
}

export function moveId(moveName) {
    return Number(nameToId(db.moves, moveName, 0));
}

export function isMoveUseful(moveId, gen) {
    return moveName(moveId) !== "(No Move)" && movePower(moveId, gen) > 0;
}

export function isMoveReleased(moveId, gen) {
    return Boolean(getInfo(db.releasedMoves, moveId, gen));
}

export function releasedMoves(gen) {
    return Object.keys(db.moves)
        .map(Number)
        .filter(id => id !== 0 && isMoveReleased(id, gen))
        .sort((a, b) => a - b);
}

export function movePower(moveId, gen) {
    return getInfo(db.movePowers, moveId, gen, 0);
}

export function moveType(moveId, gen) {
    return getInfo(db.moveTypes, moveId, gen, 0);
}

export function moveDamageClass(moveId, gen) {
    return getInfo(db.moveDamageClasses, moveId, gen, 0);
}

export function minHits(moveId, gen) {
    return getInfo(db.minMaxHits, moveId, gen, 0x11) & 0xF;
}

export function maxHits(moveId, gen) {
    return (getInfo(db.minMaxHits, moveId, gen, 0x11) & 0xF0) >> 4;
}

export function moveRange(moveId, gen) {
    return getInfo(db.moveRanges, moveId, gen);
}

export function recoil(moveId, gen) {
    return getInfo(db.recoils, moveId, gen, 0);
}

export function moveHasFlags(moveId, flags, gen) {
    return Boolean(getInfo(db.moveFlags, moveId, gen) & flags);
}

export function flinchChance(moveId, gen) {
    return getInfo(db.flinchChances, moveId, gen, 0);
}

export function moveCategory(moveId, gen) {
    return getInfo(db.moveCategories, moveId, gen);
}

export function statBoosts(moveId, gen) {
    return getInfo(db.statBoosts, moveId, gen, []);
}

export function naturalGiftType(itemId) {
    return db.naturalGiftTypes.hasOwnProperty(itemId - 8000)
        ? db.naturalGiftTypes[itemId - 8000] : -1;
}

export function naturalGiftPower(itemId, gen) {
    return db.naturalGiftPowers.hasOwnProperty(itemId - 8000)
        ? db.naturalGiftPowers[itemId - 8000] + 20 * (gen >= Gens.ORAS) : 0;
}

export function flingPower(itemId) {
    return itemId && db.items.hasOwnProperty(itemId)
        ? db.flingPowers[itemId] || 10 : 0;
}

export function zMovePower(moveId) {
    return db.zMovePower.hasOwnProperty(moveId) ? db.zMovePower[moveId] : 0;
}

/* Item Information */

export function itemName(itemId) {
    return db.items.hasOwnProperty(itemId) ? db.items[itemId] : "(No Item)";
}

export function itemId(itemName) {
    return Number(nameToId(db.items, itemName, 0));
}

export function isItemUseful(itemId) {
    return db.usefulItems.hasOwnProperty(itemId)
        && itemName(itemId) !== "(No Item)"
        && itemName(itemId) !== "(No Berry)";
}

export function isItemReleased(itemId, gen) {
    return Boolean(getInfo(db.releasedItems, itemId, gen));
}

export function releasedItems(gen) {
    return Object.keys(db.items)
        .map(Number)
        .filter(id => id !== 0 && isItemReleased(id, gen))
        .sort((a, b) => a - b);
}

export const itemBoostedType = createFlagGetter(db.itemEffects, -1, {
    10: Number
});

export const berryTypeResist = createFlagGetter(db.itemEffects, -1, {
    4: Number,
    5: () => Types.NORMAL
});

export const gemType = createFlagGetter(db.itemEffects, -1, {
    37: Number
});

export const itemMega = createFlagGetter(db.itemEffects, null, {
    66: identity
});

export const memoryType = createFlagGetter(db.itemEffects, Types.NORMAL, {
    68: Number
});

export function zCrystalType(itemId) {
    return db.zCrystalType.hasOwnProperty(itemId)
        ? db.zCrystalType[itemId] : -1;
}

/* Ability Information */

export function abilityName(abilityId) {
    return db.abilities.hasOwnProperty(abilityId)
        ? db.abilities[abilityId] : "(No Ability)";
}

export function abilityId(abilityName) {
    return Number(nameToId(db.abilities, abilityName, 0));
}

export function isAbilityUseful(abilityId) {
    return abilityName(abilityId) !== "(No Ability)";
}

export function isAbilityReleased(abilityId, gen) {
    return Number(abilityId) <= [NaN, NaN, NaN, 76, 123, 164, 191, 232][gen];
}

export function releasedAbilities(gen) {
    return Object.keys(db.items)
        .map(Number)
        .filter(id => id !== 0 && isAbilityReleased(id, gen))
        .sort((a, b) => a - b);
}

export function isIgnoredByMoldBreaker(abilityId) {
    return db.moldBreaker.hasOwnProperty(abilityId);
}

export function ability1(pokeId, gen) {
    return getInfo(db.abilities1, pokeId, gen)
        || getInfo(db.abilities1, pokeId.split(":", 1) + ":0", gen)
        || 0;
}

export function ability2(pokeId, gen) {
    return getInfo(db.abilities2, pokeId, gen)
        || getInfo(db.abilities2, pokeId.split(":", 1) + ":0", gen)
        || 0;
}

export function ability3(pokeId, gen) {
    return getInfo(db.abilities3, pokeId, gen)
        || getInfo(db.abilities3, pokeId.split(":", 1) + ":0", gen)
        || 0;
}

export const abilityImmunityType = (() => {
    const preB2W2Flags = {
        70: Number,
        68: Number,
        120: () => Types.GROUND,
        41: () => Types.ELECTRIC,
        19: () => Types.FIRE,
        15: () => Types.WATER
    };
    const postB2W2Flags = {...preB2W2Flags, 38: Number};
    return cond([
        [
            (id, gen) => gen <= Gens.B2W2,
            createFlagGetter(db.abilityEffects, -1, preB2W2Flags)
        ],
        [
            () => true,
            createFlagGetter(db.abilityEffects, -1, postB2W2Flags)
        ]
    ]);
})();

export const ignoresAbilities = createFlagGetter(db.abilityEffects, false, {
    40: () => true
});

export const abilityPinchType = createFlagGetter(db.abilityEffects, -1, {
    7: Number
});

export const abilityNormalToType = createFlagGetter(db.abilityEffects, -1, {
    121: Number
});

/* Type Information */

export function typeName(typeId) {
    return db.types.hasOwnProperty(typeId) ? db.types[typeId] : undefined;
}

export function typeId(typeName) {
    return Number(nameToId(db.types, typeName)) || undefined;
}

export function types(gen) {
    return Object.values(Types)
        .filter(typeId => gen < Gens.GSC && typeId !== Types.STEEL)
        .filter(typeId => gen < Gens.GSC && typeId !== Types.DARK)
        .filter(typeId => gen < Gens.ORAS && typeId !== Types.FAIRY)
        .sort((a, b) => a - b);
}

export function typeDamageClass(typeId) {
    return typeId >= Types.FIRE && typeId <= Types.DARK
        ? DamageClasses.SPECIAL : DamageClasses.PHYSICAL;
}

export function isPhysicalType(typeId) {
    return typeDamageClass(typeId) === DamageClasses.PHYSICAL;
}

export function isSpecialType(typeId) {
    return typeDamageClass(typeId) === DamageClasses.SPECIAL;
}

export function isLustrousType(typeId) {
    return typeId === Types.WATER || typeId === Types.DRAGON;
}

export function isAdamantType(typeId) {
    return typeId === Types.STEEL || typeId === Types.DRAGON;
}

export function isGriseousType(typeId) {
    return typeId === Types.GHOST || typeId === Types.DRAGON;
}

export function isSoulDewType(typeId) {
    return typeId === Types.PSYCHIC || typeId === Types.DRAGON;
}

export function isSandForceType(typeId) {
    return typeId === Types.GROUND
        || typeId === Types.ROCK
        || typeId === Types.STEEL;
}

export function effectiveness(attackingTypes, defendingTypes, options = {}) {
    attackingTypes = castArray(attackingTypes);
    defendingTypes = castArray(defendingTypes);

    if (options.gravity) {
        attackingTypes = attackingTypes.filter(type => type !== Types.FLYING);
    }

    let effectiveness = 1;

    for (const dType of defendingTypes) {
        if (options.freezeDry && dType === Types.WATER) {
            // 2x for each attacking type and one more 2x
            // since freeze-dry is always 2x effective on water
            effectiveness *= 2 * 2 ** attackingTypes.length;
        } else {
            for (const aType of attackingTypes) {
                effectiveness *= typeEffectiveness(aType, dType, options);
            }
        }
    }

    return {
        num: effectiveness,
        den: 2 ** (attackingTypes.length * defendingTypes.length)
    };
}

function typeEffectiveness(aType, dType, options = {}) {
    const e = getInfo(db.typesTables, aType, options.gen)[dType];

    if (options.inverted) {
        if (e < 2) return 4;
        if (e > 2) return 1;
        return 2;
    }

    if (e === 0 && dType === Types.GHOST
        && (options.foresight || options.scrappy)) {
        return 2;
    }

    if (e > 2 && dType === Types.FLYING && options.strongWinds) {
        return 2;
    }

    return e;
}
