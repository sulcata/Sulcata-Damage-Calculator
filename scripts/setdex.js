import path from "path";
import fs from "fs-extra";
import _ from "lodash/fp";
import { info, Move, Stats, Pokemon, Gens } from "../src";

const mapValuesUncapped = _.mapValues.convert({ cap: false });

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

  pokemon.nature = info.natureId(set.nature ?? "");

  pokemon.moves = _.map(move => new Move({ name: move, gen }), set.moves);

  if (set.evs) {
    for (const [stat, value] of Object.entries(set.evs)) {
      pokemon.evs[statMatches[stat]] = value;
    }
  }

  if (set.ivs) {
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

const setdex = async () => {
  const inDir = path.join(__dirname, "data/setdex");
  const outDir = path.join(__dirname, "../dist/setdex");
  await fs.mkdirs(outDir);
  const files = [
    ["setdex_rby", Gens.RBY],
    ["setdex_gsc", Gens.GSC],
    ["setdex_rse", Gens.ADV],
    ["setdex_dpp", Gens.HGSS],
    ["setdex_bw", Gens.B2W2],
    ["setdex_xy", Gens.ORAS],
    ["setdex_sm", Gens.SM],
    ["setdex_rby_pp", Gens.RBY],
    ["setdex_xy_pp", Gens.ORAS]
  ].map(async ([file, gen]) => {
    const setdexData = (await import(path.join(inDir, file + ".js"))).default;
    const minifiedSetdex = minifySetdex(setdexData, gen);
    await fs.writeFile(
      path.join(outDir, file + ".js"),
      `export default ${JSON.stringify(minifiedSetdex)}`
    );
  });
  await Promise.all([
    ...files,
    fs.writeFile(
      path.join(outDir, "smogon.js"),
      `
        import rby from "./setdex_rby.js"
        import gsc from "./setdex_gsc.js"
        import adv from "./setdex_rse.js"
        import hgss from "./setdex_dpp.js"
        import b2w2 from "./setdex_bw.js"
        import oras from "./setdex_xy.js"
        import sm from "./setdex_sm.js"
        export default [{}, rby, gsc, adv, hgss, b2w2, oras, sm]
      `
    ),
    fs.writeFile(
      path.join(outDir, "pokemonPerfect.js"),
      `
        import rby from "./setdex_rby_pp.js"
        import oras from "./setdex_xy_pp.js"
        export default [{}, rby, {}, {}, {}, {}, oras, {}]
      `
    )
  ]);
};

setdex().catch(error => {
  console.error(error);
});
