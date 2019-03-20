import path from "path";
import fs from "fs-extra";
import _ from "lodash";
import { info, Ability, Generation, Item, Move, Pokemon } from "../src";

const inDir = path.join(__dirname, "data/stats");
const outDir = path.join(__dirname, "../dist");
const setdexOutDir = path.join(outDir, "setdex");

const statsFiles = [
  [Generation.RBY, "gen1ou-1760.json"],
  [Generation.GSC, "gen2ou-1760.json"],
  [Generation.ADV, "gen3ou-1760.json"],
  [Generation.HGSS, "gen4ou-1760.json"],
  [Generation.B2W2, "gen5ou-1760.json"],
  [Generation.ORAS, "gen6ou-1760.json"],
  [Generation.SM, "gen7ou-1825.json"]
];

async function getSetdexAndUsage(gen, file) {
  const { data } = await fs.readJSON(path.join(inDir, file));
  const setdex = {};
  const usage = {};
  for (const [pokeId, pokeInfo] of Object.entries(data)) {
    const pokemon = getUsagePoke(pokeId, pokeInfo, gen);
    if (pokemon.id !== "nopokemon") {
      setdex[pokemon.id] = { "Usage Stats": pokemon.toSet() };
      usage[pokemon.id] = pokeInfo["usage"];
    }
  }
  return { gen, setdex, usage };
}

function getUsagePoke(pokeId, pokeInfo, gen) {
  const moves = getTopAttackingMoves(pokeInfo["Moves"], gen);
  const { nature, evs } = getTopSpread(pokeInfo["Spreads"]);
  const item = getTopItem(pokeInfo["Items"], gen);
  const ability = getTopAbility(pokeInfo["Abilities"], gen);
  return new Pokemon({
    id: pokeId,
    moves,
    evs,
    item,
    ability,
    nature,
    gen
  });
}

function getTopAttackingMoves(movesData, gen, numberOfMoves = 4) {
  const moves = [];
  let hasHiddenPower = false;
  for (const [id] of getSortedUsage(movesData)) {
    const move = new Move({ id, gen });
    if (move.isOther() || move.power() === 0) continue;
    if (move.isHiddenPower()) {
      if (hasHiddenPower) continue;
      hasHiddenPower = true;
    }
    moves.push(move);
  }
  return moves.slice(0, numberOfMoves);
}

function getTopSpread(spreadData) {
  const [spread] = getSortedUsage(spreadData)[0];
  const spreadMatch = /^(.+?):(.*)/.exec(spread);
  if (spreadMatch === null) {
    throw new Error(`Unreadable Spread: ${JSON.stringify(spread)}`);
  }
  const nature = info.natureId(spreadMatch[1]);
  const evString = spreadMatch[2];
  const evs = evString.split("/").map(ev => Number(ev));
  return { nature, evs };
}

function getTopAbility(abilityData, gen) {
  const [abilityId] = getSortedUsage(abilityData)[0];
  return new Ability({ id: abilityId, gen });
}

function getTopItem(itemData, gen) {
  const [itemId] = getSortedUsage(itemData)[0];
  return new Item({ id: itemId, gen });
}

function getSortedUsage(usageData) {
  return Object.entries(usageData).sort((x1, x2) => x2[1] - x1[1]);
}

async function stats() {
  const setdexAndUsage = await Promise.all(
    statsFiles.map(entry => getSetdexAndUsage(...entry))
  );
  const usagePairs = setdexAndUsage.map(data => [data.gen, data.usage]);
  const setdexPairs = setdexAndUsage.map(data => [data.gen, data.setdex]);
  const usage = _.fromPairs(usagePairs);
  const setdex = _.fromPairs(setdexPairs);
  await Promise.all([
    fs.outputFile(
      path.join(outDir, "usage.ts"),
      `export default ${JSON.stringify(usage)}`
    ),
    fs.outputFile(
      path.join(setdexOutDir, "usage.ts"),
      `export default ${JSON.stringify(setdex)}`
    )
  ]);
}

stats().catch(error => {
  console.error(error);
});
