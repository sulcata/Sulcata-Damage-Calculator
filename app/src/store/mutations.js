import Vue from "vue";
import { Pokemon, Field, Gens, Weathers } from "sulcalc";

export const addLocale = (state, { locale, messages }) => {
  Vue.set(state.i18n.messages, locale, messages);
};

export const setLocale = (state, { locale }) => {
  if (!state.i18n.messages.hasOwnProperty(locale)) {
    throw new Error("Locale not found.");
  }
  state.i18n.locale = locale;
};

export const importPokemon = (state, { importText, gen }) => {
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
};

export const toggleSmogonSets = state => {
  state.enabledSets.smogon = !state.enabledSets.smogon;
};

export const togglePokemonPerfectSets = state => {
  state.enabledSets.pokemonPerfect = !state.enabledSets.pokemonPerfect;
};

export const toggleCustomSets = state => {
  state.enabledSets.custom = !state.enabledSets.custom;
};

export const toggleLongRolls = state => {
  state.longRolls = !state.longRolls;
};

export const toggleFractions = state => {
  state.fractions = !state.fractions;
};

export const changeGen = (state, { gen }) => {
  if (!Object.values(Gens).includes(gen)) {
    throw new TypeError("Invalid generation.");
  }
  state.gen = gen;
  state.attacker = new Pokemon({ gen });
  state.defender = new Pokemon({ gen });
  state.field = new Field({ gen });
};

export const setReport = (state, { report }) => {
  state.overrideReport = report;
};

export const setAttacker = (state, { pokemon }) => {
  if (!(pokemon instanceof Pokemon)) {
    throw new TypeError("Attacker must be a Pokemon.");
  }
  if (pokemon.gen !== state.gen) {
    throw new Error("Expected gen of attacker to match current state.");
  }
  state.attacker = pokemon;
};

export const setDefender = (state, { pokemon }) => {
  if (!(pokemon instanceof Pokemon)) {
    throw new TypeError("Defender must be a Pokemon.");
  }
  if (pokemon.gen !== state.gen) {
    throw new Error("Expected gen of defender to match current state.");
  }
  state.defender = pokemon;
};

export const toggleMultiBattle = state => {
  state.field.multiBattle = !state.field.multiBattle;
};

export const toggleInvertedBattle = state => {
  state.field.invertedBattle = !state.field.invertedBattle;
};

export const toggleWaterSport = state => {
  state.field.waterSport = !state.field.waterSport;
};

export const toggleMudSport = state => {
  state.field.mudSport = !state.field.mudSport;
};

export const toggleGravity = state => {
  state.field.gravity = !state.field.gravity;
};

export const toggleGrassyTerrain = state => {
  state.field.grassyTerrain = !state.field.grassyTerrain;
};

export const toggleElectricTerrain = state => {
  state.field.electricTerrain = !state.field.electricTerrain;
};

export const toggleMistyTerrain = state => {
  state.field.mistyTerrain = !state.field.mistyTerrain;
};

export const togglePsychicTerrain = state => {
  state.field.psychicTerrain = !state.field.psychicTerrain;
};

export const toggleFairyAura = state => {
  state.field.fairyAura = !state.field.fairyAura;
};

export const toggleDarkAura = state => {
  state.field.darkAura = !state.field.darkAura;
};

export const toggleAuraBreak = state => {
  state.field.auraBreak = !state.field.auraBreak;
};

export const toggleIonDeluge = state => {
  state.field.ionDeluge = !state.field.ionDeluge;
};

export const setWeather = (state, { weather }) => {
  if (!Object.values(Weathers).includes(weather)) {
    throw new TypeError("Invalid weather.");
  }
  state.field.weather = weather;
};

export const toggleStealthRock = (state, { side }) => {
  validateSide(side);
  state[side].stealthRock = !state[side].stealthRock;
};

export const toggleReflect = (state, { side }) => {
  validateSide(side);
  state[side].reflect = !state[side].reflect;
};

export const toggleLightScreen = (state, { side }) => {
  validateSide(side);
  state[side].lightScreen = !state[side].lightScreen;
};

export const toggleForesight = (state, { side }) => {
  validateSide(side);
  state[side].foresight = !state[side].foresight;
};

export const toggleFriendGuard = (state, { side }) => {
  validateSide(side);
  state[side].friendGuard = !state[side].friendGuard;
};

export const toggleAuroraVeil = (state, { side }) => {
  validateSide(side);
  state[side].auroraVeil = !state[side].auroraVeil;
};

export const toggleBattery = (state, { side }) => {
  validateSide(side);
  state[side].battery = !state[side].battery;
};

export const setSpikes = (state, { side, spikes }) => {
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
};

function validateSide(side) {
  if (side !== "attacker" && side !== "defender") {
    throw new TypeError("Invalid side.");
  }
}
