import Vue from "vue";
import { Pokemon, Field, Gens, Terrains, Weathers } from "sulcalc";

export function importPokemon(state, { importText, gen }) {
  const importedPokemon = importText
    .trim()
    .replace("\r", "")
    .split("\n\n")
    .map(importText => Pokemon.fromImportable(importText, gen));
  const custom = state.sets.custom[gen];
  for (const pokemon of importedPokemon) {
    Vue.set(custom, pokemon.id, { "Custom Set": pokemon.toSet() });
  }
}

export function toggleSmogonSets(state) {
  state.enabledSets.smogon = !state.enabledSets.smogon;
}

export function togglePokemonPerfectSets(state) {
  state.enabledSets.pokemonPerfect = !state.enabledSets.pokemonPerfect;
}

export function toggleUsageSets(state) {
  state.enabledSets.usage = !state.enabledSets.usage;
}

export function toggleCustomSets(state) {
  state.enabledSets.custom = !state.enabledSets.custom;
}

export function toggleLongRolls(state) {
  state.longRolls = !state.longRolls;
}

export function toggleFractions(state) {
  state.fractions = !state.fractions;
}

export function changeGen(state, { gen }) {
  if (!Object.values(Gens).includes(gen)) {
    throw new RangeError("gen must be in sulcalc.Gens");
  }
  state.gen = gen;
  state.attacker = new Pokemon({ gen });
  state.defender = new Pokemon({ gen });
  state.field = new Field({ gen });
}

export function setReport(state, { report }) {
  state.overrideReport = report;
}

export function setAttacker(state, { pokemon }) {
  if (!(pokemon instanceof Pokemon)) {
    throw new RangeError("pokemon must be a sulcalc.Pokemon");
  }
  if (pokemon.gen !== state.gen) {
    throw new RangeError("expected gen of pokemon to match current state");
  }
  state.attacker = pokemon;
}

export function setDefender(state, { pokemon }) {
  if (!(pokemon instanceof Pokemon)) {
    throw new RangeError("pokemon must be a sulcalc.Pokemon");
  }
  if (pokemon.gen !== state.gen) {
    throw new RangeError("expected gen of pokemon to match current state");
  }
  state.defender = pokemon;
}

export function toggleMultiBattle(state) {
  state.field.multiBattle = !state.field.multiBattle;
}

export function toggleInvertedBattle(state) {
  state.field.invertedBattle = !state.field.invertedBattle;
}

export function toggleWaterSport(state) {
  state.field.waterSport = !state.field.waterSport;
}

export function toggleMudSport(state) {
  state.field.mudSport = !state.field.mudSport;
}

export function toggleGravity(state) {
  state.field.gravity = !state.field.gravity;
}

export function toggleFairyAura(state) {
  state.field.fairyAura = !state.field.fairyAura;
}

export function toggleDarkAura(state) {
  state.field.darkAura = !state.field.darkAura;
}

export function toggleAuraBreak(state) {
  state.field.auraBreak = !state.field.auraBreak;
}

export function toggleIonDeluge(state) {
  state.field.ionDeluge = !state.field.ionDeluge;
}

export function setWeather(state, { weather }) {
  if (!Object.values(Weathers).includes(weather)) {
    throw new RangeError("weather must be in sulcalc.Weathers");
  }
  state.field.weather = weather;
}

export function setTerrain(state, { terrain }) {
  if (!Object.values(Terrains).includes(terrain)) {
    throw new RangeError("terrain must be in sulcalc.Terrains");
  }
  state.field.terrain = terrain;
}

export function toggleStealthRock(state, { side }) {
  validateSide(side);
  state[side].stealthRock = !state[side].stealthRock;
}

export function toggleReflect(state, { side }) {
  validateSide(side);
  state[side].reflect = !state[side].reflect;
}

export function toggleLightScreen(state, { side }) {
  validateSide(side);
  state[side].lightScreen = !state[side].lightScreen;
}

export function toggleForesight(state, { side }) {
  validateSide(side);
  state[side].foresight = !state[side].foresight;
}

export function toggleFriendGuard(state, { side }) {
  validateSide(side);
  state[side].friendGuard = !state[side].friendGuard;
}

export function toggleAuroraVeil(state, { side }) {
  validateSide(side);
  state[side].auroraVeil = !state[side].auroraVeil;
}

export function toggleBattery(state, { side }) {
  validateSide(side);
  state[side].battery = !state[side].battery;
}

export function setSpikes(state, { side, spikes }) {
  validateSide(side);
  const parsedSpikes = Number(spikes);
  if (!Number.isInteger(parsedSpikes)) {
    throw new RangeError("spikes must be an integer");
  }
  const maxSpikes = state.gen >= Gens.ADV ? 3 : 1;
  if (parsedSpikes < 0 || parsedSpikes > maxSpikes) {
    throw new RangeError(`spikes must be at most ${maxSpikes}`);
  }
  state[side].spikes = parsedSpikes;
}

function validateSide(side) {
  if (side !== "attacker" && side !== "defender") {
    throw new RangeError("side must be 'attacker' or 'defender'");
  }
}
