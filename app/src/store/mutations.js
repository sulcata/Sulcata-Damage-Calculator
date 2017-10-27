import Vue from "vue";
import { Pokemon, Field, Gens, Weathers } from "sulcalc";

export function addLocale(state, { locale, messages }) {
  Vue.set(state.i18n.messages, locale, messages);
}

export function setLocale(state, { locale }) {
  if (!state.i18n.messages.hasOwnProperty(locale)) {
    throw new Error("Locale not found.");
  }
  state.i18n.locale = locale;
}

export function importPokemon(state, { importText, gen }) {
  const importedPokemon = importText
    .trim()
    .replace("\r", "")
    .split("\n\n")
    .map(importText => Pokemon.fromImportable(importText, gen));
  const custom = state.sets.custom[gen];
  for (const pokemon of importedPokemon) {
    if (!custom.hasOwnProperty(pokemon.id)) {
      Vue.set(custom, pokemon.id, {});
    }
    if (!pokemon.nickname) {
      let i = 1;
      while (custom[pokemon.id].hasOwnProperty(i)) i++;
      pokemon.nickname = String(i);
    }
    Vue.set(custom[pokemon.id], pokemon.nickname, pokemon.toSet());
  }
}

export function toggleSmogonSets(state) {
  state.enabledSets.smogon = !state.enabledSets.smogon;
}

export function togglePokemonPerfectSets(state) {
  state.enabledSets.pokemonPerfect = !state.enabledSets.pokemonPerfect;
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
    throw new TypeError("Invalid generation.");
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
    throw new TypeError("Attacker must be a Pokemon.");
  }
  if (pokemon.gen !== state.gen) {
    throw new Error("Expected gen of attacker to match current state.");
  }
  state.attacker = pokemon;
}

export function setDefender(state, { pokemon }) {
  if (!(pokemon instanceof Pokemon)) {
    throw new TypeError("Defender must be a Pokemon.");
  }
  if (pokemon.gen !== state.gen) {
    throw new Error("Expected gen of defender to match current state.");
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

export function toggleGrassyTerrain(state) {
  state.field.grassyTerrain = !state.field.grassyTerrain;
}

export function toggleElectricTerrain(state) {
  state.field.electricTerrain = !state.field.electricTerrain;
}

export function toggleMistyTerrain(state) {
  state.field.mistyTerrain = !state.field.mistyTerrain;
}

export function togglePsychicTerrain(state) {
  state.field.psychicTerrain = !state.field.psychicTerrain;
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
    throw new TypeError("Invalid weather.");
  }
  state.field.weather = weather;
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
    throw new TypeError("Spikes must be an integer.");
  }
  const maxSpikes = state.gen >= Gens.ADV ? 3 : 1;
  if (parsedSpikes < 0 || parsedSpikes > maxSpikes) {
    throw new Error("Spikes out of valid range.");
  }
  state[side].spikes = parsedSpikes;
}

function validateSide(side) {
  if (side !== "attacker" && side !== "defender") {
    throw new TypeError("Invalid side.");
  }
}
