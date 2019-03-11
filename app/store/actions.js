import Vue from "vue";
import { Pokemon, Field } from "sulcalc";

export function importPokemon({ commit, state }, { importable }) {
  const pokeImportables = importable
    .trim()
    .replace("\r", "")
    .split("\n\n");
  for (const pokeImportable of pokeImportables) {
    commit("addCustomPokemonSet", {
      pokemon: Pokemon.fromImportable(pokeImportable, state.gen)
    });
  }
}

export function toggleSmogonSets({ commit, state }) {
  commit("setSmogonSets", { active: !state.enabledSets.smogon });
}

export function togglePokemonPerfectSets({ commit, state }) {
  commit("setPokemonPerfectSets", {
    active: !state.enabledSets.pokemonPerfect
  });
}

export function toggleUsageSets({ commit, state }) {
  commit("setUsageSets", { active: !state.enabledSets.usage });
}

export function toggleCustomSets({ commit, state }) {
  commit("setCustomSets", { active: !state.enabledSets.custom });
}

export function toggleLongRolls({ commit, state }) {
  commit("setLongRolls", { active: !state.longRolls });
}

export function toggleFractions({ commit, state }) {
  commit("setFractions", { active: !state.fractions });
}

export function changeGen({ commit }, { gen }) {
  const genObj = { gen };
  commit("setGen", genObj);
  commit("setAttacker", { pokemon: new Pokemon(genObj) });
  commit("setDefender", { pokemon: new Pokemon(genObj) });
  commit("setField", { field: new Field(genObj) });
  commit("setReportStick", { active: false });
  commit("setReportOverrideIndex", { index: -1 });
}

export function selectReport({ commit, state, getters }, { index }) {
  commit("setReportStick", {
    active: index === getters.selectedReportIndex && !state.reportStick
  });
  commit("setReportOverrideIndex", { index });
}

export function unsetReport({ commit }) {
  commit("setReportStick", { active: false });
  commit("setReportOverrideIndex", { index: -1 });
}

export function setAttacker({ commit }, { pokemon }) {
  commit("setAttacker", { pokemon });
}

export function setDefender({ commit }, { pokemon }) {
  commit("setDefender", { pokemon });
}

export function setHp({ commit, getters }) {
  const pokemon = getters.selectedReport.defender;
  if (getters.isAttackerReportSelected) {
    commit("setDefender", { pokemon });
  } else if (getters.isDefenderReportSelected) {
    commit("setAttacker", { pokemon });
  }
}

export function toggleMultiBattle({ commit, state }) {
  commit("setMultiBattle", { active: !state.field.multiBattle });
}

export function toggleInvertedBattle({ commit, state }) {
  commit("setInvertedBattle", { active: !state.field.invertedBattle });
}

export function toggleWaterSport({ commit, state }) {
  commit("setWaterSport", { active: !state.field.waterSport });
}

export function toggleMudSport({ commit, state }) {
  commit("setMudSport", { active: !state.field.mudSport });
}

export function toggleGravity({ commit, state }) {
  commit("setGravity", { active: !state.field.gravity });
}

export function toggleFairyAura({ commit, state }) {
  commit("setFairyAura", { active: !state.field.fairyAura });
}

export function toggleDarkAura({ commit, state }) {
  commit("setDarkAura", { active: !state.field.darkAura });
}

export function toggleAuraBreak({ commit, state }) {
  commit("setAuraBreak", { active: !state.field.auraBreak });
}

export function toggleIonDeluge({ commit, state }) {
  commit("setIonDeluge", { active: !state.field.ionDeluge });
}

export function setWeather(state, { weather }) {
  commit("setWeather", { weather });
}

export function setTerrain(state, { terrain }) {
  commit("setTerrain", { terrain });
}

export function toggleStealthRock({ commit, state }, { side }) {
  commit("setStealthRock", { active: !state[side].stealthRock });
}

export function toggleReflect({ commit, state }, { side }) {
  commit("setReflect", { active: !state[side].reflect });
}

export function toggleLightScreen({ commit, state }, { side }) {
  commit("setLightScreen", { active: !state[side].lightScreen });
}

export function toggleForesight({ commit, state }, { side }) {
  commit("setForesight", { active: !state[side].foresight });
}

export function toggleFriendGuard({ commit, state }, { side }) {
  commit("setFriendGuard", { active: !state[side].friendGuard });
}

export function toggleAuroraVeil({ commit, state }, { side }) {
  commit("setAuroraVeil", { active: !state[side].auroraVeil });
}

export function toggleBattery({ commit, state }, { side }) {
  commit("setBattery", { active: !state[side].battery });
}

export function setSpikes(state, { side, spikes }) {
  commit("setSpikes", { side, spikes });
}
