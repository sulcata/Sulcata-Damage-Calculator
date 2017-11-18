import path from "path";
import fs from "fs-extra";
import _ from "lodash/fp";
import { info, Move, Stats, Pokemon } from "../src/sulcalc";

const mapUncapped = _.map.convert({ cap: false });
const mapValuesUncapped = _.mapValues.convert({ cap: false });

const importMove = _.curry((move, gen) => {
  const hiddenPowerMatch = /Hidden Power( \[?(\w*)]?)?/i.exec(move);
  if (hiddenPowerMatch) {
    const type = info.typeId(hiddenPowerMatch[2]);
    const ivs = Move.hiddenPowers(type, gen)[0];
    return { move: new Move({ name: "Hidden Power", gen }), ivs };
  }
  return { move: new Move({ name: move, gen }) };
});

const minifySet = _.curry((set, pokemonId, gen) => {
  const statMatches = {
    hp: Stats.HP,
    at: Stats.ATK,
    df: Stats.DEF,
    sa: Stats.SATK,
    sd: Stats.SDEF,
    sp: Stats.SPD
  };

  const pokemon = new Pokemon({
    gen,
    level: set.level,
    ability: set.ability,
    item: set.item
  });

  pokemon.nature = info.natureId(set.nature || "");

  const moveInfo = _.map(importMove(_, gen), set.moves);
  pokemon.moves = _.map(_.property("move"), moveInfo);

  if (set.evs) {
    for (const [stat, value] of Object.entries(set.evs)) {
      pokemon.evs[statMatches[stat]] = value;
    }
  }

  const { ivs } = Object(_.find(_.property("ivs"), moveInfo));
  if (ivs) {
    pokemon.ivs = ivs;
  } else if (set.ivs) {
    for (const [stat, value] of Object.entries(set.ivs)) {
      pokemon.ivs[statMatches[stat]] = value;
    }
  }

  return pokemon.toSet();
});

const minifySets = _.curry((sets, pokemonId, gen) => {
  const capRemoved = _.omitBy((set, name) => name.includes("CAP"), sets);
  return _.mapValues(minifySet(_, pokemonId, gen), capRemoved);
});

const minifySetdex = (setdex, gen) => {
  const translated = _.mapKeys(name => info.pokemonId(name), setdex);
  const omitted = _.omitBy((sets, id) => id === "nopokemon", translated);
  return mapValuesUncapped(minifySets(_, _, gen), omitted);
};

const minifySetdexData = mapUncapped(minifySetdex);

const setdex = async () => {
  const inDir = path.join(__dirname, "data/setdex");
  const outDir = path.join(__dirname, "../dist/setdex");
  const filesToSetdex = _.map(
    _.cond([
      [
        _.isString,
        async file => (await import(path.join(inDir, file))).default
      ],
      [_.stubTrue, _.identity]
    ])
  );
  await fs.mkdirs(outDir);
  const data = [
    {
      file: "smogon.js",
      data: await Promise.all(
        filesToSetdex([
          {},
          "setdex_rby",
          "setdex_gsc",
          "setdex_rse",
          "setdex_dpp",
          "setdex_bw",
          "setdex_xy",
          "setdex_sm"
        ])
      )
    },
    {
      file: "pokemonPerfect.js",
      data: await Promise.all(
        filesToSetdex([{}, "setdex_rby_pp", {}, {}, {}, {}, "setdex_xy_pp", {}])
      )
    }
  ];
  await Promise.all(
    _.map(
      entry =>
        fs.writeFile(
          path.join(outDir, entry.file),
          `export default ${JSON.stringify(minifySetdexData(entry.data))}`
        ),
      data
    )
  );
};

setdex().catch(error => {
  console.error(error);
});
