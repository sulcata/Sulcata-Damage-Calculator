import { Field, Generation, Pokemon, Terrain, Weather } from "sulcalc";
import Vue from "vue";
import { State } from "./state";

interface ActivePayload {
  active: boolean;
}
interface SidePayload {
  side: "attacker" | "defender";
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
interface FieldPayload {
  field: Field;
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

export function addCustomPokemonSet(state: State, { pokemon }: PokemonPayload) {
  Vue.set(state.sets.custom[pokemon.gen], pokemon.id, {
    "Custom Set": pokemon.toSet()
  });
}

export function setSmogonSets(state: State, { active }: ActivePayload) {
  state.enabledSets.smogon = active;
}

export function setPokemonPerfectSets(state: State, { active }: ActivePayload) {
  state.enabledSets.pokemonPerfect = active;
}

export function setUsageSets(state: State, { active }: ActivePayload) {
  state.enabledSets.usage = active;
}

export function setCustomSets(state: State, { active }: ActivePayload) {
  state.enabledSets.custom = active;
}

export function setLongRolls(state: State, { active }: ActivePayload) {
  state.longRolls = active;
}

export function setFractions(state: State, { active }: ActivePayload) {
  state.fractions = active;
}

export function setSortByUsage(state: State, { active }: ActivePayload) {
  state.sortByUsage = active;
}

export function setGen(state: State, { gen }: GenPayload) {
  state.gen = gen;
}

export function setReportOverrideIndex(state: State, { index }: IndexPayload) {
  state.reportOverrideIndex = index;
}

export function setReportStick(state: State, { active }: ActivePayload) {
  state.reportStick = active;
}

export function setAttacker(state: State, { pokemon }: PokemonPayload) {
  state.attacker = pokemon;
}

export function setDefender(state: State, { pokemon }: PokemonPayload) {
  state.defender = pokemon;
}

export function setField(state: State, { field }: FieldPayload) {
  state.field = field;
}

export function setMultiBattle(state: State, { active }: ActivePayload) {
  state.field.multiBattle = active;
}

export function setInvertedBattle(state: State, { active }: ActivePayload) {
  state.field.invertedBattle = active;
}

export function setWaterSport(state: State, { active }: ActivePayload) {
  state.field.waterSport = active;
}

export function setMudSport(state: State, { active }: ActivePayload) {
  state.field.mudSport = active;
}

export function setGravity(state: State, { active }: ActivePayload) {
  state.field.gravity = active;
}

export function setFairyAura(state: State, { active }: ActivePayload) {
  state.field.fairyAura = active;
}

export function setDarkAura(state: State, { active }: ActivePayload) {
  state.field.darkAura = active;
}

export function setAuraBreak(state: State, { active }: ActivePayload) {
  state.field.auraBreak = active;
}

export function setIonDeluge(state: State, { active }: ActivePayload) {
  state.field.ionDeluge = active;
}

export function setWeather(state: State, { weather }: WeatherPayload) {
  state.field.weather = weather;
}

export function setTerrain(state: State, { terrain }: TerrainPayload) {
  state.field.terrain = terrain;
}

export function setStealthRock(
  state: State,
  { side, active }: SidePayload & ActivePayload
) {
  validateSide(side);
  state[side].stealthRock = active;
}

export function setReflect(
  state: State,
  { side, active }: SidePayload & ActivePayload
) {
  validateSide(side);
  state[side].reflect = active;
}

export function setLightScreen(
  state: State,
  { side, active }: SidePayload & ActivePayload
) {
  validateSide(side);
  state[side].lightScreen = active;
}

export function setForesight(
  state: State,
  { side, active }: SidePayload & ActivePayload
) {
  validateSide(side);
  state[side].foresight = active;
}

export function setFriendGuard(
  state: State,
  { side, active }: SidePayload & ActivePayload
) {
  validateSide(side);
  state[side].friendGuard = active;
}

export function setAuroraVeil(
  state: State,
  { side, active }: SidePayload & ActivePayload
) {
  validateSide(side);
  state[side].auroraVeil = active;
}

export function setBattery(
  state: State,
  { side, active }: SidePayload & ActivePayload
) {
  validateSide(side);
  state[side].battery = active;
}

export function setSpikes(
  state: State,
  { side, spikes }: SidePayload & SpikesPayload
) {
  validateSide(side);
  state[side].spikes = Number(spikes);
}

function validateSide(side: string) {
  if (side !== "attacker" && side !== "defender") {
    throw new RangeError("side must be 'attacker' or 'defender'");
  }
}
