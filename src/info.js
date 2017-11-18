import {
  castArray,
  defaultTo,
  findKey,
  snakeCase,
  words,
  capitalize,
  has,
  get
} from "lodash";
import db from "../dist/db";
import { Gens, Types, DamageClasses, Natures, maxGen } from "./utilities";

// istanbul ignore else
if (process.env.NODE_ENV !== "production") {
  (function deepFreeze(obj) {
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  })(db);
}

const capsCase = string =>
  words(string)
    .map(capitalize)
    .join(" ");
const constCase = string => snakeCase(string.toLowerCase()).toUpperCase();

const makeEnumNameGetter = (enumObject, defaultName) => value =>
  capsCase(
    findKey(enumObject, testValue => testValue === value) || defaultName
  );

const makeEnumValueGetter = (enumObject, defaultValue) => name =>
  defaultTo(enumObject[constCase(name)], defaultValue);

function getInfo(gen, path, defaultValue = undefined) {
  for (let currentGen = gen; currentGen <= maxGen; currentGen++) {
    if (has(db[currentGen], path)) {
      return get(db[currentGen], path);
    }
  }
  return defaultValue;
}

const makeNameToId = (objectName, defaultId) => name => {
  if (typeof name !== "string") return defaultId;
  const id = name.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  return getInfo(maxGen, [objectName, id]) ? id : defaultId;
};

/* Gen Information */
export const genName = gen => getInfo(gen, ["name"], "SM");

/* Nature Information */
const natureMultArr = [-1, 0, 1, 3, 4, 2];
const natureStatsArr = [1, 2, 5, 3, 4];
export const natureName = makeEnumNameGetter(Natures, "Hardy");
export const natureId = makeEnumValueGetter(Natures, Natures.HARDY);
export const natureMultiplier = (natureId, stat) =>
  (Math.trunc(natureId / 5) === natureMultArr[stat]) -
  (natureId % 5 === natureMultArr[stat]);
export const natureStats = natureId =>
  Math.trunc(natureId / 5) === natureId % 5
    ? [-1, -1]
    : [natureStatsArr[Math.trunc(natureId / 5)], natureStatsArr[natureId % 5]];

/* Pokemon Information */
export const pokemonName = pokeId =>
  getInfo(maxGen, ["pokedex", pokeId, "b"], "(No Pokemon)");
export const pokemonId = makeNameToId("pokedex", "nopokemon");
export const isPokeReleased = (pokeId, gen) =>
  gen >= getInfo(maxGen, ["pokedex", pokeId, "a"]);
export const releasedPokes = gen =>
  Object.keys(getInfo(maxGen, ["pokedex"], {}))
    .filter(pokeId => isPokeReleased(pokeId, gen))
    .sort();
export const baseStats = (pokeId, gen) =>
  getInfo(gen, ["pokedex", pokeId, "c"]);
export const weight = (pokeId, gen) => getInfo(gen, ["pokedex", pokeId, "d"]);
export const pokeType1 = (pokeId, gen) =>
  getInfo(gen, ["pokedex", pokeId, "e", "0"], Types.CURSE);
export const pokeType2 = (pokeId, gen) =>
  getInfo(gen, ["pokedex", pokeId, "e", "1"], Types.CURSE);
export const hasEvolution = (pokeId, gen) => {
  const evolutions = getInfo(gen, ["pokedex", pokeId, "f"], []);
  return evolutions.some(pokeId => isPokeReleased(pokeId, gen));
};
export const hasPreEvolution = (pokeId, gen) => {
  const baseForm = getInfo(gen, ["pokedex", pokeId, "i"], pokeId);
  const preEvolution = getInfo(gen, ["pokedex", baseForm, "g"]);
  return Boolean(preEvolution && isPokeReleased(preEvolution, gen));
};
export const isMega = (pokeId, gen) =>
  Boolean(getInfo(gen, ["pokedex", pokeId, "h"]));
export const requiredItemForPoke = (pokeId, gen) =>
  getInfo(gen, ["pokedex", pokeId, "j"], "noitem");

/* Move Information */
export const moveName = moveId =>
  getInfo(maxGen, ["moves", moveId, "b"], "(No Move)");
export const moveId = makeNameToId("moves", "nomove");
export const movePower = (moveId, gen) =>
  getInfo(gen, ["moves", moveId, "c"], 0);
export const isMoveReleased = (moveId, gen) =>
  gen >= getInfo(maxGen, ["moves", moveId, "a"]);
export const releasedMoves = gen =>
  Object.keys(getInfo(maxGen, ["moves"], {}))
    .filter(moveId => isMoveReleased(moveId, gen))
    .sort();
export const moveType = (moveId, gen) =>
  getInfo(gen, ["moves", moveId, "d"], Types.CURSE);
export const moveDamageClass = (moveId, gen) =>
  getInfo(gen, ["moves", moveId, "e"], DamageClasses.OTHER);
export const minHits = (moveId, gen) =>
  getInfo(gen, ["moves", moveId, "i", "0"], 1);
export const maxHits = (moveId, gen) =>
  getInfo(gen, ["moves", moveId, "i", "1"], 1);
export const hitsMultipleTargets = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "j"]));
export const recoil = (moveId, gen) => getInfo(gen, ["moves", moveId, "m"], 0);
export const hasSecondaryEffect = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "l"]));
export const zMovePower = (moveId, gen) => getInfo(gen, ["moves", moveId, "k"]);
export const isOhkoMove = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "n"]));
export const canCrit = (moveId, gen) =>
  gen >= Gens.HGSS || !getInfo(gen, ["moves", moveId, "o"]);
export const hasBiteFlag = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "A"]));
export const hasBulletFlag = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "B"]));
export const hasContactFlag = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "D"]));
export const hasPowderFlag = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "E"]));
export const hasPulseFlag = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "F"]));
export const hasPunchFlag = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "G"]));
export const hasSoundFlag = (moveId, gen) =>
  Boolean(getInfo(gen, ["moves", moveId, "I"]));

/* Item Information */
export const itemName = itemId =>
  getInfo(maxGen, ["items", itemId, "b"], "(No Item)");
export const itemId = makeNameToId("items", "noitem");
export const isItemReleased = (itemId, gen) =>
  gen >= getInfo(maxGen, ["items", itemId, "a"]);
export const isHeavy = (itemId, gen) =>
  Boolean(getInfo(gen, ["items", itemId, "j"]));
export const isPlate = (itemId, gen) =>
  Boolean(getInfo(gen, ["items", itemId, "g"]));
export const itemBoostedType = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "k"], -1);
export const berryTypeResist = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "l"], -1);
export const gemType = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "m"], -1);
export const isBerry = (itemId, gen) =>
  Boolean(getInfo(gen, ["items", itemId, "n"]));
export const naturalGiftPower = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "c", "0"], 0);
export const naturalGiftType = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "c", "1"], -1);
export const flingPower = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "d"], 10);
export const megaStone = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "e"], "nopokemon");
export const memoryType = (itemId, gen) =>
  getInfo(gen, ["items", itemId, "i"], Types.NORMAL);
export const releasedItems = gen =>
  Object.keys(getInfo(maxGen, ["items"], {}))
    .filter(itemId => isItemReleased(itemId, gen))
    .sort();

/* Ability Information */
export const abilityName = abilityId =>
  getInfo(maxGen, ["abilities", abilityId, "b"], "(No Ability)");
export const abilityId = makeNameToId("abilities", "noability");
export const isIgnoredByMoldBreaker = (abilityId, gen) =>
  Boolean(getInfo(gen, ["abilities", abilityId, "c"]));
export const isAbilityReleased = (abilityId, gen) =>
  gen >= getInfo(maxGen, ["abilities", abilityId, "a"]);
export const releasedAbilities = gen =>
  Object.keys(getInfo(maxGen, ["abilities"], {}))
    .filter(abilityId => isAbilityReleased(abilityId, gen))
    .sort();
export const immunityType = (abilityId, gen) =>
  getInfo(gen, ["abilities", abilityId, "d"], -1);
export const pinchType = (abilityId, gen) =>
  getInfo(gen, ["abilities", abilityId, "e"], -1);
export const critArmor = (abilityId, gen) =>
  Boolean(getInfo(gen, ["abilities", abilityId, "f"]));
export const normalToType = (abilityId, gen) =>
  getInfo(gen, ["abilities", abilityId, "g"], -1);
export const abilityIgnoresAbilities = (abilityId, gen) =>
  Boolean(getInfo(gen, ["abilities", abilityId, "h"]));

/* Type Information */
export const typeName = makeEnumNameGetter(Types, "Curse");
export const typeId = makeEnumValueGetter(Types, Types.CURSE);
export const types = gen =>
  Object.values(Types)
    .filter(typeId => gen < Gens.GSC && typeId !== Types.STEEL)
    .filter(typeId => gen < Gens.GSC && typeId !== Types.DARK)
    .filter(typeId => gen < Gens.ORAS && typeId !== Types.FAIRY)
    .sort((a, b) => a - b);
export const typeDamageClass = typeId =>
  typeId >= Types.FIRE && typeId <= Types.DARK
    ? DamageClasses.SPECIAL
    : DamageClasses.PHYSICAL;
export const isPhysicalType = typeId =>
  typeDamageClass(typeId) === DamageClasses.PHYSICAL;
export const isSpecialType = typeId =>
  typeDamageClass(typeId) === DamageClasses.SPECIAL;
export const isLustrousType = typeId =>
  typeId === Types.WATER || typeId === Types.DRAGON;
export const isAdamantType = typeId =>
  typeId === Types.STEEL || typeId === Types.DRAGON;
export const isGriseousType = typeId =>
  typeId === Types.GHOST || typeId === Types.DRAGON;
export const isSoulDewType = typeId =>
  typeId === Types.PSYCHIC || typeId === Types.DRAGON;
export const isSandForceType = typeId =>
  typeId === Types.GROUND || typeId === Types.ROCK || typeId === Types.STEEL;

const singleTypeEffectiveness = (aType, dType, options) => {
  const e = getInfo(options.gen, ["typechart", dType, aType], 2);

  if (options.inverted) {
    if (e < 2) return 4;
    if (e > 2) return 1;
    return 2;
  }

  if (
    e === 0 &&
    dType === Types.GHOST &&
    (options.foresight || options.scrappy)
  ) {
    return 2;
  }

  if (e > 2 && dType === Types.FLYING && options.strongWinds) {
    return 2;
  }

  return e;
};

export const effectiveness = (
  attackingTypes,
  defendingTypes,
  options = { gen: maxGen }
) => {
  attackingTypes = castArray(attackingTypes);
  defendingTypes = castArray(defendingTypes);

  if (options.gravity) {
    defendingTypes = defendingTypes.filter(type => type !== Types.FLYING);
  }

  let effectiveness = 1;

  for (const dType of defendingTypes) {
    if (options.freezeDry && dType === Types.WATER) {
      // 2x for each attacking type and one more 2x
      // since freeze-dry is always 2x effective on water
      effectiveness *= 2 * 2 ** attackingTypes.length;
    } else {
      for (const aType of attackingTypes) {
        effectiveness *= singleTypeEffectiveness(aType, dType, options);
      }
    }
  }

  if (effectiveness === 0) return [0, 1];
  const numeratorExponent = Math.log2(effectiveness);
  const denominatorExponent = attackingTypes.length * defendingTypes.length;
  return [
    2 ** Math.max(0, numeratorExponent - denominatorExponent),
    2 ** Math.max(0, denominatorExponent - numeratorExponent)
  ];
};
