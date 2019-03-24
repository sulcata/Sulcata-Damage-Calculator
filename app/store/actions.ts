import { Field, Generation, Pokemon, Terrain, Weather } from "sulcalc";
import { ActionContext } from "vuex";
import { Getters } from "./getters";
import { State } from "./state";

interface SidePayload {
  side: "attacker" | "defender";
}
interface ImportablePayload {
  importable: string;
}
interface GenPayload {
  gen: Generation;
}
interface IndexPayload {
  index: number;
}
interface PokemonPayload {
  pokemon: Pokemon;
}
interface WeatherPayload {
  weather: Weather;
}
interface TerrainPayload {
  terrain: Terrain;
}
interface SpikesPayload {
  spikes: 0 | 1 | 2 | 3;
}

type ContextUntypedGetters = ActionContext<State, State>;
type Context = Pick<
  ContextUntypedGetters,
  Exclude<keyof ContextUntypedGetters, "getters">
> & { getters: Getters };

export function importPokemon(
  { commit, state }: Context,
  { importable }: ImportablePayload
) {
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

export function toggleSmogonSets({ commit, state }: Context) {
  commit("setSmogonSets", { active: !state.enabledSets.smogon });
}

export function togglePokemonPerfectSets({ commit, state }: Context) {
  commit("setPokemonPerfectSets", {
    active: !state.enabledSets.pokemonPerfect
  });
}

export function toggleUsageSets({ commit, state }: Context) {
  commit("setUsageSets", { active: !state.enabledSets.usage });
}

export function toggleCustomSets({ commit, state }: Context) {
  commit("setCustomSets", { active: !state.enabledSets.custom });
}

export function toggleLongRolls({ commit, state }: Context) {
  commit("setLongRolls", { active: !state.longRolls });
}

export function toggleFractions({ commit, state }: Context) {
  commit("setFractions", { active: !state.fractions });
}

export function changeGen({ commit }: Context, { gen }: GenPayload) {
  const genObj = { gen };
  commit("setGen", genObj);
  commit("setAttacker", { pokemon: new Pokemon(genObj) });
  commit("setDefender", { pokemon: new Pokemon(genObj) });
  commit("setField", { field: new Field(genObj) });
  commit("setReportStick", { active: false });
  commit("setReportOverrideIndex", { index: -1 });
}

export function selectReport(
  { commit, state, getters }: Context,
  { index }: IndexPayload
) {
  commit("setReportStick", {
    active: index === getters.selectedReportIndex && !state.reportStick
  });
  commit("setReportOverrideIndex", { index });
}

export function unsetReport({ commit }: Context) {
  commit("setReportStick", { active: false });
  commit("setReportOverrideIndex", { index: -1 });
}

export function setAttacker({ commit }: Context, { pokemon }: PokemonPayload) {
  commit("setAttacker", { pokemon });
}

export function setDefender({ commit }: Context, { pokemon }: PokemonPayload) {
  commit("setDefender", { pokemon });
}

export function setHp({ commit, getters }: Context) {
  if (getters.selectedReport.defender === undefined) {
    throw new Error("A valid report must be selected");
  }
  const pokemon = getters.selectedReport.defender;
  if (getters.isAttackerReportSelected) {
    commit("setDefender", { pokemon });
  } else if (getters.isDefenderReportSelected) {
    commit("setAttacker", { pokemon });
  }
}

export function toggleMultiBattle({ commit, state }: Context) {
  commit("setMultiBattle", { active: !state.field.multiBattle });
}

export function toggleInvertedBattle({ commit, state }: Context) {
  commit("setInvertedBattle", { active: !state.field.invertedBattle });
}

export function toggleWaterSport({ commit, state }: Context) {
  commit("setWaterSport", { active: !state.field.waterSport });
}

export function toggleMudSport({ commit, state }: Context) {
  commit("setMudSport", { active: !state.field.mudSport });
}

export function toggleGravity({ commit, state }: Context) {
  commit("setGravity", { active: !state.field.gravity });
}

export function toggleFairyAura({ commit, state }: Context) {
  commit("setFairyAura", { active: !state.field.fairyAura });
}

export function toggleDarkAura({ commit, state }: Context) {
  commit("setDarkAura", { active: !state.field.darkAura });
}

export function toggleAuraBreak({ commit, state }: Context) {
  commit("setAuraBreak", { active: !state.field.auraBreak });
}

export function toggleIonDeluge({ commit, state }: Context) {
  commit("setIonDeluge", { active: !state.field.ionDeluge });
}

export function setWeather({ commit }: Context, { weather }: WeatherPayload) {
  commit("setWeather", { weather });
}

export function setTerrain({ commit }: Context, { terrain }: TerrainPayload) {
  commit("setTerrain", { terrain });
}

export function toggleStealthRock(
  { commit, state }: Context,
  { side }: SidePayload
) {
  commit("setStealthRock", { side, active: !state[side].stealthRock });
}

export function toggleReflect(
  { commit, state }: Context,
  { side }: SidePayload
) {
  commit("setReflect", { side, active: !state[side].reflect });
}

export function toggleLightScreen(
  { commit, state }: Context,
  { side }: SidePayload
) {
  commit("setLightScreen", { side, active: !state[side].lightScreen });
}

export function toggleForesight(
  { commit, state }: Context,
  { side }: SidePayload
) {
  commit("setForesight", { side, active: !state[side].foresight });
}

export function toggleFriendGuard(
  { commit, state }: Context,
  { side }: SidePayload
) {
  commit("setFriendGuard", { side, active: !state[side].friendGuard });
}

export function toggleAuroraVeil(
  { commit, state }: Context,
  { side }: SidePayload
) {
  commit("setAuroraVeil", { side, active: !state[side].auroraVeil });
}

export function toggleBattery(
  { commit, state }: Context,
  { side }: SidePayload
) {
  commit("setBattery", { side, active: !state[side].battery });
}

export function setSpikes(
  { commit }: Context,
  { side, spikes }: SidePayload & SpikesPayload
) {
  commit("setSpikes", { side, spikes });
}
