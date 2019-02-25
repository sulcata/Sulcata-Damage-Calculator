/* tslint:disable:no-unsafe-any */
import { castArray, defaultTo, get, has } from "lodash";
import db from "../dist/db";
import {
  DamageClass,
  Generation,
  maxGen,
  Nature,
  Stat,
  StatList,
  Type,
  types
} from "./utilities";

// istanbul ignore else
if (process.env.NODE_ENV !== "production") {
  (function deepFreeze(obj: object) {
    for (const value of Object.values(obj)) {
      if (value && typeof value === "object") {
        deepFreeze(value);
      }
    }
    Object.freeze(obj);
  })(db);
}

function getInfo<T>(
  gen: Generation,
  path: (number | string)[],
  defaultValue?: T
) {
  for (let currentGen = gen; currentGen <= maxGen; currentGen++) {
    if (has(db[currentGen], path)) {
      return get(db[currentGen], path);
    }
  }
  return defaultValue;
}

const makeNameToId = (objectName: string, defaultId: string) => (
  name: any
): string => {
  if (typeof name !== "string") return defaultId;
  const id = name.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  return getInfo(maxGen, [objectName, id]) ? id : defaultId;
};

/* Gen Information */
export const genName = (gen: Generation): string =>
  getInfo(gen, ["name"], "SM");

/* Nature Information */
const natureMultArr = [-1, 0, 1, 3, 4, 2];
const natureStatsArr: Stat[] = [1, 2, 5, 3, 4];
const naturesToNames: { [key in Nature]: string } = {
  [Nature.HARDY]: "Hardy",
  [Nature.LONELY]: "Lonely",
  [Nature.BRAVE]: "Brave",
  [Nature.ADAMANT]: "Adamant",
  [Nature.NAUGHTY]: "Naughty",
  [Nature.BOLD]: "Bold",
  [Nature.DOCILE]: "Docile",
  [Nature.RELAXED]: "Relaxed",
  [Nature.IMPISH]: "Impish",
  [Nature.LAX]: "Lax",
  [Nature.TIMID]: "Timid",
  [Nature.HASTY]: "Hasty",
  [Nature.SERIOUS]: "Serious",
  [Nature.JOLLY]: "Jolly",
  [Nature.NAIVE]: "Naive",
  [Nature.MODEST]: "Modest",
  [Nature.MILD]: "Mild",
  [Nature.QUIET]: "Quiet",
  [Nature.BASHFUL]: "Bashful",
  [Nature.RASH]: "Rash",
  [Nature.CALM]: "Calm",
  [Nature.GENTLE]: "Gentle",
  [Nature.SASSY]: "Sassy",
  [Nature.CAREFUL]: "Careful",
  [Nature.QUIRKY]: "Quirky"
};
const namesToNatures: { [key: string]: Nature } = {
  hardy: Nature.HARDY,
  lonely: Nature.LONELY,
  brave: Nature.BRAVE,
  adamant: Nature.ADAMANT,
  naughty: Nature.NAUGHTY,
  bold: Nature.BOLD,
  docile: Nature.DOCILE,
  relaxed: Nature.RELAXED,
  impish: Nature.IMPISH,
  lax: Nature.LAX,
  timid: Nature.TIMID,
  hasty: Nature.HASTY,
  serious: Nature.SERIOUS,
  jolly: Nature.JOLLY,
  naive: Nature.NAIVE,
  modest: Nature.MODEST,
  mild: Nature.MILD,
  quiet: Nature.QUIET,
  bashful: Nature.BASHFUL,
  rash: Nature.RASH,
  calm: Nature.CALM,
  gentle: Nature.GENTLE,
  sassy: Nature.SASSY,
  careful: Nature.CAREFUL,
  quirky: Nature.QUIRKY
};
export const natureName = (nature: Nature): string => naturesToNames[nature];
export const natureId = (nature: string): Nature =>
  defaultTo(namesToNatures[nature.trim().toLowerCase()], Nature.HARDY);
export const natureMultiplier = (natureId: Nature, stat: Stat): number =>
  (Math.trunc(natureId / 5) === natureMultArr[stat] ? 1 : 0) -
  (natureId % 5 === natureMultArr[stat] ? 1 : 0);
export const natureStats = (nature: Nature): [Stat, Stat] | [-1, -1] =>
  Math.trunc(nature / 5) === nature % 5
    ? [-1, -1]
    : [natureStatsArr[Math.trunc(nature / 5)], natureStatsArr[nature % 5]];

/* Pokemon Information */
export const pokemonName = (pokeId: string): string =>
  getInfo(maxGen, ["pokedex", pokeId, "b"], "(No Pokemon)");
export const pokemonId = makeNameToId("pokedex", "nopokemon");
export const isPokeReleased = (pokeId: string, gen: Generation): boolean =>
  gen >= getInfo(maxGen, ["pokedex", pokeId, "a"]);
export const releasedPokes = (gen: Generation): string[] =>
  Object.keys(getInfo(maxGen, ["pokedex"], {}))
    .filter(pokeId => isPokeReleased(pokeId, gen))
    .sort();
export const baseStats = (pokeId: string, gen: Generation): StatList =>
  getInfo(gen, ["pokedex", pokeId, "c"]);
export const weight = (pokeId: string, gen: Generation): number =>
  getInfo(gen, ["pokedex", pokeId, "d"]);
export const pokeTypes = (pokeId: string, gen: Generation): [Type, Type] =>
  getInfo(gen, ["pokedex", pokeId, "e"], [Type.CURSE]);
export const pokeType1 = (pokeId: string, gen: Generation): Type =>
  defaultTo(pokeTypes(pokeId, gen)[0], Type.CURSE);
export const pokeType2 = (pokeId: string, gen: Generation): Type =>
  defaultTo(pokeTypes(pokeId, gen)[1], Type.CURSE);
export const hasEvolution = (pokeId: string, gen: Generation): boolean => {
  const evolutions: string[] = getInfo(gen, ["pokedex", pokeId, "f"], []);
  return evolutions.some(pokeId => isPokeReleased(pokeId, gen));
};
export const hasPreEvolution = (pokeId: string, gen: Generation): boolean => {
  const baseForm = getInfo(gen, ["pokedex", pokeId, "i"], pokeId);
  const preEvolution = getInfo(gen, ["pokedex", baseForm, "g"]);
  return Boolean(preEvolution && isPokeReleased(preEvolution, gen));
};
export const isMega = (pokeId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["pokedex", pokeId, "h"]));
export const requiredItemForPoke = (pokeId: string, gen: Generation): string =>
  getInfo(gen, ["pokedex", pokeId, "j"], "noitem");

/* Move Information */
export const moveName = (moveId: string): string =>
  getInfo(maxGen, ["moves", moveId, "b"], "(No Move)");
export const moveId = makeNameToId("moves", "nomove");
export const movePower = (moveId: string, gen: Generation): number =>
  getInfo(gen, ["moves", moveId, "c"], 0);
export const isMoveReleased = (moveId: string, gen: Generation): boolean =>
  gen >= getInfo(maxGen, ["moves", moveId, "a"]);
export const releasedMoves = (gen: Generation): string[] =>
  Object.keys(getInfo(maxGen, ["moves"], {}))
    .filter(moveId => isMoveReleased(moveId, gen))
    .sort();
export const moveType = (moveId: string, gen: Generation): Type =>
  getInfo(gen, ["moves", moveId, "d"], Type.CURSE);
export const moveDamageClass = (moveId: string, gen: Generation): DamageClass =>
  getInfo(gen, ["moves", moveId, "e"], DamageClass.OTHER);
export const moveIgnoresAbilities = (
  moveId: string,
  gen: Generation
): boolean => Boolean(getInfo(gen, ["moves", moveId, "f"]));
export const priority = (moveId: string, gen: Generation): number =>
  getInfo(gen, ["moves", moveId, "g"], 0);
export const minHits = (moveId: string, gen: Generation): number =>
  getInfo(gen, ["moves", moveId, "i", "0"], 1);
export const maxHits = (moveId: string, gen: Generation): number =>
  getInfo(gen, ["moves", moveId, "i", "1"], 1);
export const hitsMultipleTargets = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "j"]));
export const zMovePower = (moveId: string, gen: Generation): number =>
  getInfo(gen, ["moves", moveId, "k"]);
export const hasSecondaryEffect = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "l"]));
export const recoil = (moveId: string, gen: Generation): number =>
  getInfo(gen, ["moves", moveId, "m"], 0);
export const isOhkoMove = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "n"]));
export const hasBiteFlag = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "A"]));
export const hasBulletFlag = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "B"]));
export const hasContactFlag = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "D"]));
export const hasPowderFlag = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "E"]));
export const hasPulseFlag = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "F"]));
export const hasPunchFlag = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "G"]));
export const requiresRecharge = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "H"]));
export const hasSoundFlag = (moveId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["moves", moveId, "I"]));

/* Item Information */
export const itemName = (itemId: string): string =>
  getInfo(maxGen, ["items", itemId, "b"], "(No Item)");
export const itemId = makeNameToId("items", "noitem");
export const isItemReleased = (itemId: string, gen: Generation): boolean =>
  gen >= getInfo(maxGen, ["items", itemId, "a"]);
export const isHeavy = (itemId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["items", itemId, "j"]));
export const isPlate = (itemId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["items", itemId, "g"]));
export const itemBoostedType = (itemId: string, gen: Generation): Type =>
  getInfo(gen, ["items", itemId, "k"], -1);
export const berryTypeResist = (itemId: string, gen: Generation): Type =>
  getInfo(gen, ["items", itemId, "l"], -1);
export const gemType = (itemId: string, gen: Generation): Type =>
  getInfo(gen, ["items", itemId, "m"], -1);
export const isBerry = (itemId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["items", itemId, "n"]));
export const naturalGiftPower = (itemId: string, gen: Generation): number =>
  getInfo(gen, ["items", itemId, "c", "0"], 0);
export const naturalGiftType = (itemId: string, gen: Generation): Type =>
  getInfo(gen, ["items", itemId, "c", "1"], -1);
export const flingPower = (itemId: string, gen: Generation): number =>
  getInfo(gen, ["items", itemId, "d"], 10);
export const megaStone = (itemId: string, gen: Generation): string =>
  getInfo(gen, ["items", itemId, "e"], "nopokemon");
export const memoryType = (itemId: string, gen: Generation): Type =>
  getInfo(gen, ["items", itemId, "i"], Type.NORMAL);
export const releasedItems = (gen: Generation): string[] =>
  Object.keys(getInfo(maxGen, ["items"], {}))
    .filter(itemId => isItemReleased(itemId, gen))
    .sort();
export const zMoveTransformsTo = (
  itemId: string,
  gen: Generation
): string | undefined => getInfo(gen, ["items", itemId, "o", "0"]);
export const zMoveTransformsFrom = (
  itemId: string,
  gen: Generation
): string | undefined => getInfo(gen, ["items", itemId, "o", "1"]);

/* Ability Information */
export const abilityName = (abilityId: string): string =>
  getInfo(maxGen, ["abilities", abilityId, "b"], "(No Ability)");
export const abilityId = makeNameToId("abilities", "noability");
export const isIgnoredByMoldBreaker = (
  abilityId: string,
  gen: Generation
): boolean => Boolean(getInfo(gen, ["abilities", abilityId, "c"]));
export const isAbilityReleased = (
  abilityId: string,
  gen: Generation
): boolean => gen >= getInfo(maxGen, ["abilities", abilityId, "a"]);
export const releasedAbilities = (gen: Generation): string[] =>
  Object.keys(getInfo(maxGen, ["abilities"], {}))
    .filter(abilityId => isAbilityReleased(abilityId, gen))
    .sort();
export const immunityType = (abilityId: string, gen: Generation): Type =>
  getInfo(gen, ["abilities", abilityId, "d"], -1);
export const pinchType = (abilityId: string, gen: Generation): Type =>
  getInfo(gen, ["abilities", abilityId, "e"], -1);
export const critArmor = (abilityId: string, gen: Generation): boolean =>
  Boolean(getInfo(gen, ["abilities", abilityId, "f"]));
export const normalToType = (abilityId: string, gen: Generation): Type =>
  getInfo(gen, ["abilities", abilityId, "g"], -1);
export const abilityIgnoresAbilities = (
  abilityId: string,
  gen: Generation
): boolean => Boolean(getInfo(gen, ["abilities", abilityId, "h"]));

/* Type Information */
const typesToNames: { [key in Type]: string } = {
  [Type.NORMAL]: "Normal",
  [Type.FIGHTING]: "Fighting",
  [Type.FLYING]: "Flying",
  [Type.POISON]: "Poison",
  [Type.GROUND]: "Ground",
  [Type.ROCK]: "Rock",
  [Type.BUG]: "Bug",
  [Type.GHOST]: "Ghost",
  [Type.STEEL]: "Steel",
  [Type.FIRE]: "Fire",
  [Type.WATER]: "Water",
  [Type.GRASS]: "Grass",
  [Type.ELECTRIC]: "Electric",
  [Type.PSYCHIC]: "Psychic",
  [Type.ICE]: "Ice",
  [Type.DRAGON]: "Dragon",
  [Type.DARK]: "Dark",
  [Type.FAIRY]: "Fairy",
  [Type.CURSE]: "Curse"
};
const namesToTypes: { [key: string]: Type } = {
  normal: Type.NORMAL,
  fighting: Type.FIGHTING,
  flying: Type.FLYING,
  poison: Type.POISON,
  ground: Type.GROUND,
  rock: Type.ROCK,
  bug: Type.BUG,
  ghost: Type.GHOST,
  steel: Type.STEEL,
  fire: Type.FIRE,
  water: Type.WATER,
  grass: Type.GRASS,
  electric: Type.ELECTRIC,
  psychic: Type.PSYCHIC,
  ice: Type.ICE,
  dragon: Type.DRAGON,
  dark: Type.DARK,
  fairy: Type.FAIRY,
  curse: Type.CURSE
};
export const typeName = (type: Type): string => typesToNames[type];
export const typeId = (type: string): Type =>
  defaultTo(namesToTypes[type.trim().toLowerCase()], Type.CURSE);
export const typesForGen = (gen: Generation): Type[] =>
  types
    .filter(type => gen < Generation.GSC && type !== Type.STEEL)
    .filter(type => gen < Generation.GSC && type !== Type.DARK)
    .filter(type => gen < Generation.ORAS && type !== Type.FAIRY)
    .sort((a, b) => a - b);
export const typeDamageClass = (type: Type): DamageClass =>
  type >= Type.FIRE && type <= Type.DARK
    ? DamageClass.SPECIAL
    : DamageClass.PHYSICAL;
export const isPhysicalType = (type: Type): boolean =>
  typeDamageClass(type) === DamageClass.PHYSICAL;
export const isSpecialType = (type: Type): boolean =>
  typeDamageClass(type) === DamageClass.SPECIAL;
export const isLustrousType = (type: Type): boolean =>
  type === Type.WATER || type === Type.DRAGON;
export const isAdamantType = (type: Type): boolean =>
  type === Type.STEEL || type === Type.DRAGON;
export const isGriseousType = (type: Type): boolean =>
  type === Type.GHOST || type === Type.DRAGON;
export const isSoulDewType = (type: Type): boolean =>
  type === Type.PSYCHIC || type === Type.DRAGON;
export const isSandForceType = (type: Type): boolean =>
  type === Type.GROUND || type === Type.ROCK || type === Type.STEEL;

export interface ITypeEffectivenessOptions {
  gen: Generation;
  immunity?: Type;
  inverted?: boolean;
  foresight?: boolean;
  scrappy?: boolean;
  strongWinds?: boolean;
  grounded?: boolean;
  freezeDry?: boolean;
}

const singleTypeEffectiveness = (
  aType: Type,
  dType: Type,
  options: ITypeEffectivenessOptions
): number => {
  const e = getInfo(options.gen, ["typechart", dType, aType], 2);

  if (options.inverted) {
    if (e < 2) return 4;
    if (e > 2) return 1;
    return 2;
  }

  if (
    e === 0 &&
    dType === Type.GHOST &&
    (options.foresight || options.scrappy)
  ) {
    return 2;
  }

  if (e > 2 && dType === Type.FLYING && options.strongWinds) {
    return 2;
  }

  return e;
};

export const effectiveness = (
  attackingType: Type | Type[],
  defendingType: Type | Type[],
  options: ITypeEffectivenessOptions = { gen: maxGen }
): [number, number] => {
  const attackingTypes = castArray(attackingType);
  let defendingTypes = castArray(defendingType);

  if (options.grounded) {
    defendingTypes = defendingTypes.filter(type => type !== Type.FLYING);
  }

  if (
    options.immunity !== undefined &&
    attackingTypes.includes(options.immunity) &&
    !(options.grounded && options.immunity === Type.GROUND)
  ) {
    return [0, 1];
  }

  let effectiveness = 1;

  for (const dType of defendingTypes) {
    if (options.freezeDry && dType === Type.WATER) {
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
