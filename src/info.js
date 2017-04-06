import {Gens, Types, DamageClasses} from "./utilities";
import * as db from "./db";

const {trunc} = Math;

if (process.env.NODE_ENV !== "production") {
    (function deepFreeze(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && obj[key]
                && typeof obj[key] === "object") {
                deepFreeze(obj[key]);
            }
        }
        return Object.freeze(obj);
    })(db);
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

function getInfo(arr, key, gen, defaultValue) {
    // search most to least recent
    // stop at null or after the 0th index
    while (gen >= Gens.RBY && arr[gen]) {
        // best way to check since it might be falsy
        if (arr[gen].hasOwnProperty(key)) {
            return arr[gen][key];
        }
        gen--;
    }

    return defaultValue;
}

function normalizeName(name) {
    return name.trim()
        .replace(/ {2,}/g, " ")
        .toLowerCase();
}

function nameToId(obj, name, defaultId) {
    const normName = normalizeName(name);

    for (const id in obj) {
        if (normalizeName(obj[id]) === normName) {
            return id;
        }
    }

    return defaultId;
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
    return db.releasedPokes[gen].hasOwnProperty(pokeId);
}

export function releasedPokes(gen) {
    return Object.keys(db.releasedPokes[gen]).filter(id => id !== "0:0");
}

export function pokeType1(pokeId, gen) {
    let type = getInfo(db.pokeTypes1, pokeId, gen);
    if (type !== undefined) return type;

    type = getInfo(db.pokeTypes1, pokeId.split(":", 1) + ":0", gen);
    if (type !== undefined) return type;

    return 18;
}

export function pokeType2(pokeId, gen) {
    let type = getInfo(db.pokeTypes2, pokeId, gen);
    if (type !== undefined) return type;

    type = getInfo(db.pokeTypes2, pokeId.split(":", 1) + ":0", gen);
    if (type !== undefined) return type;

    return 18;
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
    const species = Number(pokeId.split(":")[0]);
    for (const e in db.evolutions) {
        if (db.evolutions[e].includes(species)
            && isPokeReleased(e + ":0", gen)) {
            return e + ":0";
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
    return db.releasedMoves[gen].hasOwnProperty(moveId);
}

export function releasedMoves(gen) {
    return Object.keys(db.releasedMoves[gen]).map(Number);
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
    return db.items[itemId] || "(No Item)";
}

export function itemId(itemName) {
    return Number(nameToId(db.items, itemName)) || 0;
}

export function isItemUseful(itemId) {
    return db.usefulItems.hasOwnProperty(itemId)
        && itemName(itemId) !== "(No Item)"
        && itemName(itemId) !== "(No Berry)";
}

export function isItemReleased(itemId, gen) {
    return db.releasedItems[gen].hasOwnProperty(itemId);
}

export function releasedItems(gen) {
    return Object.keys(db.releasedItems[gen]).map(Number);
}

export function itemEffects(itemId, gen) {
    return getInfo(db.itemEffects, itemId, gen);
}

export function zCrystalType(itemId) {
    return db.zCrystalType.hasOwnProperty(itemId)
        ? db.zCrystalType[itemId] : -1;
}

/* Ability Information */

export function abilityName(abilityId) {
    return db.abilities[abilityId] || "(No Ability)";
}

export function abilityId(abilityName) {
    return Number(nameToId(db.abilities, abilityName, 0));
}

export function isAbilityUseful(abilityId) {
    return abilityName(abilityId) !== "(No Ability)";
}

export function isAbilityReleased(abilityId, gen) {
    return Number(abilityId) <= [NaN, NaN, NaN, 76, 123, 164, 191][gen];
}

export function releasedAbilities(gen) {
    return Object.keys(db.releasedItems[gen]).map(Number);
}

export function abilityEffects(abilityId, gen) {
    return getInfo(db.abilityEffects, abilityId, gen);
}

export function ignoredByMoldBreaker(abilityId) {
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

/* Type Information */

export function typeName(typeId) {
    return db.types.hasOwnProperty(typeId) ? db.types[typeId] : undefined;
}

export function typeId(typeName) {
    return Number(nameToId(db.types, typeName)) || undefined;
}

export function types(gen) {
    let types = [];
    for (let i = 0; i <= 18; i++) {
        types.push(i);
    }
    if (gen < Gens.GSC) {
        types = types.filter(type => type !== 8 && type !== 16);
    }
    if (gen < Gens.ORAS) {
        types = types.filter(type => type !== 17);
    }
    return types;
}

export function typeDamageClass(typeId) {
    return typeId >= 9 && typeId <= 17 ? 2 : 1;
}

export function physicalType(typeId) {
    return typeDamageClass(typeId) === DamageClasses.PHYSICAL;
}

export function specialType(typeId) {
    return typeDamageClass(typeId) === DamageClasses.SPECIAL;
}

export function lustrousType(typeId) {
    return typeId === Types.WATER || typeId === Types.DRAGON;
}

export function adamantType(typeId) {
    return typeId === Types.STEEL || typeId === Types.DRAGON;
}

export function griseousType(typeId) {
    return typeId === Types.GHOST || typeId === Types.DRAGON;
}

export function soulDewType(typeId) {
    return typeId === Types.PSYCHIC || typeId === Types.DRAGON;
}

export function sandForceType(typeId) {
    return typeId === Types.GROUND
        || typeId === Types.ROCK
        || typeId === Types.STEEL;
}

export function effective(attackingTypes, defendingTypes, options = {}) {
    if (!Array.isArray(attackingTypes)) {
        attackingTypes = [attackingTypes];
    }
    if (!Array.isArray(defendingTypes)) {
        attackingTypes = [defendingTypes];
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

    if (aType <= 1 && dType === Types.GHOST
        && (options.foresight || options.scrappy)) {
        return 2;
    } else if (aType === Types.GROUND && dType === Types.FLYING
               && options.gravity) {
        return 2;
    }

    return e;
}
