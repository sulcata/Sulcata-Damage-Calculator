import path from "path";
import fs from "fs-extra";
import _ from "lodash/fp";
import { Generation, Type, maxGen } from "../src/utilities";
import { ignorableAbilities, requiredItems } from "./db-extras";

const inDir = path.join(__dirname, "data/ps-data");
const outDir = path.join(__dirname, "../dist");

const nameToId = name => name.replace(/[^A-Za-z0-9]/g, "").toLowerCase();

function processType(typeString) {
  const normalized = typeString.toUpperCase();
  if (["???", "CURSE"].includes(normalized)) return Type.CURSE;
  const type = Type[normalized];
  return type === undefined ? Type.CURSE : type;
}

const processAbilityInfo = _.curry((gen, abilityInfo) => {
  const result = {};
  if (abilityInfo.num || abilityInfo.gen) {
    const { num } = abilityInfo;
    let gen;
    if (abilityInfo.gen) {
      gen = abilityInfo.gen;
    } else if (num >= 192) {
      gen = Generation.SM;
    } else if (num >= 165) {
      gen = Generation.ORAS;
    } else if (num >= 124) {
      gen = Generation.B2W2;
    } else if (num >= 77) {
      gen = Generation.HGSS;
    } else if (num >= 1) {
      gen = Generation.ADV;
    }
    result.a = gen;
  }
  if (abilityInfo.name !== undefined) result.b = abilityInfo.name;
  if (gen >= maxGen && ignorableAbilities.has(abilityInfo.name)) result.c = 1;
  const immunityTypeCheck = /immune to (\S+?)-type/i.exec(abilityInfo.desc);
  if (immunityTypeCheck !== null) {
    result.d = processType(immunityTypeCheck[1]);
  } else if (/immune to Ground/i.test(abilityInfo.desc)) {
    result.d = Type.GROUND;
  } else if (/redirects that move/i.test(abilityInfo.desc)) {
    result.d = -1;
  }
  const pinchTypeCheck = /has 1\/3 or less.*?HP.*?1\.5.*? (\S+?)-type attack/i.exec(
    abilityInfo.desc
  );
  if (pinchTypeCheck !== null) result.e = processType(pinchTypeCheck[1]);
  if (/cannot.*?critical hit/i.test(abilityInfo.shortDesc)) result.f = 1;
  const normalToTypeCheck = /Normal-type moves become (\S+?)-type/i.exec(
    abilityInfo.desc
  );
  if (normalToTypeCheck !== null) result.g = processType(normalToTypeCheck[1]);
  if (/ignore the Abilities/i.test(abilityInfo.shortDesc)) result.h = 1;
  if (_.isEmpty(result)) return undefined;
  return result;
});

const processItemInfo = _.curry((gen, itemInfo) => {
  // skipped f, h
  const result = {};
  if (itemInfo.num || itemInfo.gen) {
    let gen;
    const { num } = itemInfo;
    if (itemInfo.gen) {
      gen = itemInfo.gen;
    } else if (num >= 689) {
      gen = Generation.SM;
    } else if (num >= 577) {
      gen = Generation.ORAS;
    } else if (num >= 537) {
      gen = Generation.B2W2;
    } else if (num >= 377) {
      gen = Generation.HGSS;
    } else {
      gen = Generation.ADV;
    }
    result.a = gen;
  }
  if (itemInfo.name !== undefined) result.b = itemInfo.name;
  if (itemInfo.naturalGift !== undefined) {
    result.c = [
      itemInfo.naturalGift.basePower,
      processType(itemInfo.naturalGift.type)
    ];
  }
  if (itemInfo.fling !== undefined) result.d = itemInfo.fling.basePower;
  if (itemInfo.megaStone !== undefined) result.e = nameToId(itemInfo.megaStone);
  if (itemInfo.onPlate !== undefined) {
    result.g = 1;
    result.d = 90;
  }
  if (itemInfo.onDrive !== undefined) result.d = 70;
  if (itemInfo.onMemory !== undefined) {
    result.i = processType(itemInfo.onMemory);
    result.d = 50;
  }
  if (/Speed(.*?)halved/i.test(itemInfo.desc)) result.j = 1;
  const typeBoostCheck = /holder's (\S+?)-type/i.exec(itemInfo.desc);
  if (typeBoostCheck !== null) result.k = processType(typeBoostCheck[1]);
  const typeResistCheck = /halves damage .+? (.\S+?)-type attack/i.exec(
    itemInfo.desc
  );
  if (typeResistCheck !== null) result.l = processType(typeResistCheck[1]);
  if (itemInfo.isGem) result.m = processType(itemInfo.name.split(" ")[0]);
  if (itemInfo.isBerry) result.n = 1;
  if (itemInfo.zMove === true) {
    result.o = 1;
  } else if (itemInfo.zMove !== undefined) {
    result.o = [nameToId(itemInfo.zMove), nameToId(itemInfo.zMoveFrom)];
  }
  if (_.isEmpty(result)) return undefined;
  return result;
});

const processMoveInfo = _.curry((gen, moveInfo) => {
  const result = {};
  if (moveInfo.num || moveInfo.gen) {
    let gen;
    const { num } = moveInfo;
    if (moveInfo.gen) {
      gen = moveInfo.gen;
    } else if (num >= 622) {
      gen = Generation.SM;
    } else if (num >= 560) {
      gen = Generation.ORAS;
    } else if (num >= 468) {
      gen = Generation.B2W2;
    } else if (num >= 355) {
      gen = Generation.HGSS;
    } else if (num >= 252) {
      gen = Generation.ADV;
    } else if (num >= 166) {
      gen = Generation.GSC;
    } else if (num >= 1) {
      gen = Generation.RBY;
    }
    result.a = gen;
  }
  if (moveInfo.name !== undefined) result.b = moveInfo.name;
  if (moveInfo.basePower !== undefined) result.c = moveInfo.basePower;
  if (moveInfo.type !== undefined) result.d = processType(moveInfo.type);
  if (moveInfo.name === "Struggle") result.d = 18;
  if (moveInfo.category !== undefined) {
    result.e = processCategory(moveInfo.category);
  }
  if (moveInfo.ignoreAbility) result.f = 1;
  if (moveInfo.priority !== 0) result.g = moveInfo.priority;
  if (moveInfo.accuracy !== undefined && moveInfo.accuracy !== true) {
    result.h = moveInfo.accuracy;
  }
  if (typeof moveInfo.multihit === "number") {
    result.i = [moveInfo.multihit, moveInfo.multihit];
  } else if (moveInfo.multihit !== undefined) {
    result.i = moveInfo.multihit;
  }
  if (["allAdjacent", "allAdjacentFoes"].includes(moveInfo.target)) {
    result.j = 1;
  }
  if (moveInfo.zMovePower !== undefined) result.k = moveInfo.zMovePower;
  if (moveInfo.secondary) result.l = processSecondaryInfo(moveInfo.secondary);
  if (moveInfo.recoil !== undefined) result.m = moveInfo.recoil;
  if (moveInfo.ohko !== undefined) result.n = 1;
  if (moveInfo.flags !== undefined) {
    const flags = moveInfo.flags;
    /*
     * authentic, dance, defrost, distance, gravity, heal, mirror,
     * mystery, nonsky, protect, reflectable, snatch
     */
    if (flags.bite) result.A = 1;
    if (flags.bullet) result.B = 1;
    if (flags.charge) result.C = 1;
    if (flags.contact) result.D = 1;
    if (flags.powder) result.E = 1;
    if (flags.pulse) result.F = 1;
    if (flags.punch) result.G = 1;
    if (flags.recharge) result.H = 1;
    if (flags.sound) result.I = 1;
  }
  if (_.isEmpty(result)) return undefined;
  return result;
});

function processSecondaryInfo(secondaryInfo) {
  const result = {};
  if (secondaryInfo.chance !== undefined) result.a = secondaryInfo.chance;
  if (secondaryInfo.status !== undefined) {
    result.b = processStatus(secondaryInfo.status);
  }
  if (secondaryInfo.volatileStatus === "flinch") result.c = 1;
  if (secondaryInfo.volatileStatus === "confusion") result.d = 1;
  if (secondaryInfo.boosts !== undefined) {
    result.e = processStats(secondaryInfo.boosts);
  }
  if (secondaryInfo.self && secondaryInfo.self.boosts) {
    result.f = processStats(secondaryInfo.self.boosts);
  }
  if (_.isEmpty(result)) return undefined;
  return result;
}

function processStatus(statusString) {
  switch (statusString) {
    case "brn":
      return 3;
    case "frz":
      return 6;
    case "par":
      return 4;
    case "psn":
      return 1;
    case "tox":
      return 2;
    case "slp":
      return 5;
    default:
      return 0;
  }
}

const processPokeInfo = _.curry((gen, pokeInfo) => {
  const result = {};
  if (
    pokeInfo.forme &&
    pokeInfo.forme !== "Alola" &&
    pokeInfo.baseSpecies === "Pikachu"
  ) {
    return undefined;
  }
  if (pokeInfo.num || pokeInfo.gen) {
    let gen;
    const { num, forme } = pokeInfo;
    if (pokeInfo.gen) {
      gen = pokeInfo.gen;
    } else if (num >= 722 || forme === "Alola") {
      gen = Generation.SM;
    } else if (
      num >= 650 ||
      ["Mega", "Mega-X", "Mega-Y", "Primal"].includes(forme)
    ) {
      gen = Generation.ORAS;
    } else if (num >= 494) {
      gen = Generation.B2W2;
    } else if (num >= 387) {
      gen = Generation.HGSS;
    } else if (num >= 252) {
      gen = Generation.ADV;
    } else if (num >= 152) {
      gen = Generation.GSC;
    } else if (num >= 1) {
      gen = Generation.RBY;
    }
    result.a = gen;
  }
  if (pokeInfo.species !== undefined) result.b = pokeInfo.species;
  if (pokeInfo.baseStats !== undefined) {
    result.c = processStats(pokeInfo.baseStats);
  }
  if (pokeInfo.weightkg !== undefined) {
    result.d = Math.round(pokeInfo.weightkg * 10);
  }
  if (pokeInfo.types !== undefined) {
    result.e = _.map(processType, pokeInfo.types);
  }
  if (pokeInfo.evos !== undefined) result.f = _.map(nameToId, pokeInfo.evos);
  if (pokeInfo.prevo !== undefined) result.g = nameToId(pokeInfo.prevo);
  if (pokeInfo.forme !== undefined) result.h = pokeInfo.forme;
  if (pokeInfo.baseSpecies !== undefined) {
    result.i = nameToId(pokeInfo.baseSpecies);
  }
  if (requiredItems.has(pokeInfo.species)) {
    result.j = nameToId(requiredItems.get(pokeInfo.species));
  }
  if (_.isEmpty(result)) return undefined;
  return result;
});

const processTypechart = _.flow(
  _.mapKeys(processType),
  _.mapValues(
    _.flow(
      _.get("damageTaken"),
      _.mapKeys(processType),
      _.toPairs,
      _.reject(
        _.flow(
          _.get(0),
          _.eq(String(Type.CURSE))
        )
      ),
      _.fromPairs,
      _.mapValues(n => [2, 4, 1, 0][n])
    )
  )
);

function processCategory(categoryString) {
  const Categories = {
    STATUS: 0,
    PHYSICAL: 1,
    SPECIAL: 2
  };
  return Categories[categoryString.toUpperCase()];
}

function processStats(stats) {
  return [
    stats.hp || 0,
    stats.atk || 0,
    stats.def || 0,
    stats.spa || 0,
    stats.spd || 0,
    stats.spe || 0
  ];
}

async function tryImport(importPath) {
  try {
    return await import(importPath);
  } catch {
    return {};
  }
}

async function getGenInfo(gen) {
  const types = ["abilities", "items", "moves", "pokedex", "typechart"];
  const data = await _.flow(
    _.map(type => path.join(inDir, `gen${gen}/${type}.js`)),
    _.map(tryImport),
    dataList => Promise.all(dataList)
  )(types);
  return processGenInfo(gen, _.zipObject(types, data));
}

function processGenInfo(gen, genInfo) {
  const omitBadEntries = _.omitBy(
    entry => entry.num < 0 || entry.isNonstandard === true
  );
  const abilities = _.flow(
    omitBadEntries,
    _.mapValues(processAbilityInfo(gen)),
    _.omitBy(_.isNil)
  )(genInfo.abilities.BattleAbilities);

  const items = _.flow(
    omitBadEntries,
    _.mapValues(processItemInfo(gen)),
    _.omitBy(_.isNil)
  )(genInfo.items.BattleItems);

  const moves = _.flow(
    omitBadEntries,
    _.mapValues(processMoveInfo(gen)),
    _.omitBy(_.isNil)
  )(genInfo.moves.BattleMovedex);

  const pokedex = _.flow(
    omitBadEntries,
    _.mapValues(processPokeInfo(gen)),
    _.omitBy(_.isNil)
  )(genInfo.pokedex.BattlePokedex);

  const typechart = processTypechart(genInfo.typechart.BattleTypeChart);

  if (gen === maxGen) {
    abilities.noability = { name: "(No Ability)" };
    items.noitem = { name: "(No Item)", d: 0 };
    moves.nomove = { name: "(No Move)", i: [0, 0] };
    pokedex.nopokemon = { name: "(No Pokemon)", c: [50, 50, 50, 50, 50, 50] };
  }

  return {
    name: ["", "RBY", "GSC", "ADV", "HGSS", "B2W2", "ORAS", "SM"][gen],
    abilities,
    items,
    moves,
    pokedex,
    typechart
  };
}

async function db() {
  const genList = _.range(1, maxGen + 1);
  const infoList = await Promise.all(_.map(getGenInfo, genList));
  const genObject = _.zipObject(genList, infoList);
  await fs.mkdirs(outDir);
  await fs.writeFile(
    path.join(outDir, "db.ts"),
    `export default ${JSON.stringify(genObject)}`
  );
}

db().catch(error => {
  console.error(error);
});
