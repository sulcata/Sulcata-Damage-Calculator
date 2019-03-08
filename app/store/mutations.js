import Vue from "vue";
import { Pokemon, Field } from "sulcalc";

export function addCustomPokemonSet(state, { pokemon }) {
  Vue.set(state.sets.custom[pokemon.gen], pokemon.id, {
    "Custom Set": pokemon.toSet()
  });
}

export function setSmogonSets(state, { active }) {
  state.enabledSets.smogon = active;
}

export function setPokemonPerfectSets(state, { active }) {
  state.enabledSets.pokemonPerfect = active;
}

export function setUsageSets(state, { active }) {
  state.enabledSets.usage = active;
}

export function setCustomSets(state, { active }) {
  state.enabledSets.custom = active;
}

export function setLongRolls(state, { active }) {
  state.longRolls = active;
}

export function setFractions(state, { active }) {
  state.fractions = active;
}

export function setGen(state, { gen }) {
  state.gen = gen;
}

export function setReportOverrideIndex(state, { index }) {
  state.reportOverrideIndex = index;
}

export function setReportStick(state, { active }) {
  state.reportStick = active;
}

export function setAttacker(state, { pokemon }) {
  state.attacker = pokemon;
}

export function setDefender(state, { pokemon }) {
  state.defender = pokemon;
}

export function setField(state, { field }) {
  state.field = field;
}

export function setMultiBattle(state, { active }) {
  state.field.multiBattle = active;
}

export function setInvertedBattle(state, { active }) {
  state.field.invertedBattle = active;
}

export function setWaterSport(state, { active }) {
  state.field.waterSport = active;
}

export function setMudSport(state, { active }) {
  state.field.mudSport = active;
}

export function setGravity(state, { active }) {
  state.field.gravity = active;
}

export function setFairyAura(state, { active }) {
  state.field.fairyAura = active;
}

export function setDarkAura(state, { active }) {
  state.field.darkAura = active;
}

export function setAuraBreak(state, { active }) {
  state.field.auraBreak = active;
}

export function setIonDeluge(state, { active }) {
  state.field.ionDeluge = active;
}

export function setWeather(state, { weather }) {
  state.field.weather = weather;
}

export function setTerrain(state, { terrain }) {
  state.field.terrain = terrain;
}

export function setStealthRock(state, { side, active }) {
  validateSide(side);
  state[side].stealthRock = active;
}

export function setReflect(state, { side, active }) {
  validateSide(side);
  state[side].reflect = active;
}

export function setLightScreen(state, { side, active }) {
  validateSide(side);
  state[side].lightScreen = active;
}

export function setForesight(state, { side, active }) {
  validateSide(side);
  state[side].foresight = active;
}

export function setFriendGuard(state, { side, active }) {
  validateSide(side);
  state[side].friendGuard = active;
}

export function setAuroraVeil(state, { side, active }) {
  validateSide(side);
  state[side].auroraVeil = active;
}

export function setBattery(state, { side, active }) {
  validateSide(side);
  state[side].battery = active;
}

export function setSpikes(state, { side, spikes }) {
  validateSide(side);
  state[side].spikes = Number(spikes);
}

function validateSide(side) {
  if (side !== "attacker" && side !== "defender") {
    throw new RangeError("side must be 'attacker' or 'defender'");
  }
}
