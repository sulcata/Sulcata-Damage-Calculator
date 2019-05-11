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
): void {
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

export function toggleSmogonSets({ commit, state }: Context): void {
  commit("setSmogonSets", { active: !state.enabledSets.smogon });
}

export function togglePokemonPerfectSets({ commit, state }: Context): void {
  commit("setPokemonPerfectSets", {
    active: !state.enabledSets.pokemonPerfect
  });
}

export function toggleUsageSets({ commit, state }: Context): void {
  commit("setUsageSets", { active: !state.enabledSets.usage });
}

export function toggleCustomSets({ commit, state }: Context): void {
  commit("setCustomSets", { active: !state.enabledSets.custom });
}

export function toggleLongRolls({ commit, state }: Context): void {
  commit("setLongRolls", { active: !state.longRolls });
}

export function toggleFractions({ commit, state }: Context): void {
  commit("setFractions", { active: !state.fractions });
}

export function toggleSortByUsage({ commit, state }: Context): void {
  commit("setSortByUsage", { active: !state.sortByUsage });
}

export function changeGen({ commit }: Context, { gen }: GenPayload): void {
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
): void {
  commit("setReportStick", {
    active: index === getters.selectedReportIndex && !state.reportStick
  });
  commit("setReportOverrideIndex", { index });
}

export function unsetReport({ commit }: Context): void {
  commit("setReportStick", { active: false });
  commit("setReportOverrideIndex", { index: -1 });
}

export function setAttacker(
  { commit }: Context,
  { pokemon }: PokemonPayload
): void {
  commit("setAttacker", { pokemon });
}

export function setDefender(
  { commit }: Context,
  { pokemon }: PokemonPayload
): void {
  commit("setDefender", { pokemon });
}

export function setHp({ commit, getters }: Context): void {
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

export function toggleMultiBattle({ commit, state }: Context): void {
  commit("setMultiBattle", { active: !state.field.multiBattle });
}

export function toggleInvertedBattle({ commit, state }: Context): void {
  commit("setInvertedBattle", { active: !state.field.invertedBattle });
}

export function toggleWaterSport({ commit, state }: Context): void {
  commit("setWaterSport", { active: !state.field.waterSport });
}

export function toggleMudSport({ commit, state }: Context): void {
  commit("setMudSport", { active: !state.field.mudSport });
}

export function toggleGravity({ commit, state }: Context): void {
  commit("setGravity", { active: !state.field.gravity });
}

export function toggleFairyAura({ commit, state }: Context): void {
  commit("setFairyAura", { active: !state.field.fairyAura });
}

export function toggleDarkAura({ commit, state }: Context): void {
  commit("setDarkAura", { active: !state.field.darkAura });
}

export function toggleAuraBreak({ commit, state }: Context): void {
  commit("setAuraBreak", { active: !state.field.auraBreak });
}

export function toggleIonDeluge({ commit, state }: Context): void {
  commit("setIonDeluge", { active: !state.field.ionDeluge });
}

export function setWeather(
  { commit }: Context,
  { weather }: WeatherPayload
): void {
  commit("setWeather", { weather });
}

export function setTerrain(
  { commit }: Context,
  { terrain }: TerrainPayload
): void {
  commit("setTerrain", { terrain });
}

export function toggleStealthRock(
  { commit, state }: Context,
  { side }: SidePayload
): void {
  commit("setStealthRock", { side, active: !state[side].stealthRock });
}

export function toggleReflect(
  { commit, state }: Context,
  { side }: SidePayload
): void {
  commit("setReflect", { side, active: !state[side].reflect });
}

export function toggleLightScreen(
  { commit, state }: Context,
  { side }: SidePayload
): void {
  commit("setLightScreen", { side, active: !state[side].lightScreen });
}

export function toggleForesight(
  { commit, state }: Context,
  { side }: SidePayload
): void {
  commit("setForesight", { side, active: !state[side].foresight });
}

export function toggleFriendGuard(
  { commit, state }: Context,
  { side }: SidePayload
): void {
  commit("setFriendGuard", { side, active: !state[side].friendGuard });
}

export function toggleAuroraVeil(
  { commit, state }: Context,
  { side }: SidePayload
): void {
  commit("setAuroraVeil", { side, active: !state[side].auroraVeil });
}

export function toggleBattery(
  { commit, state }: Context,
  { side }: SidePayload
): void {
  commit("setBattery", { side, active: !state[side].battery });
}

export function setSpikes(
  { commit }: Context,
  { side, spikes }: SidePayload & SpikesPayload
): void {
  commit("setSpikes", { side, spikes });
}
