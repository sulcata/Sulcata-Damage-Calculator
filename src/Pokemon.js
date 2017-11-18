import { clamp, defaultTo } from "lodash";
import Multiset from "./Multiset";
import Ability from "./Ability";
import Item from "./Item";
import Move from "./Move";
import Field from "./Field";
import {
  Gens,
  Genders,
  Natures,
  Stats,
  Statuses,
  Types,
  maxGen,
  roundHalfToZero
} from "./utilities";
import {
  typeId,
  typeName,
  pokemonId,
  pokemonName,
  natureName,
  natureId,
  natureStats,
  natureMultiplier,
  baseStats,
  pokeType1,
  pokeType2,
  weight,
  hasEvolution,
  hasPreEvolution,
  requiredItemForPoke,
  isMega
} from "./info";

const statNames = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const genderShorthands = ["", "(M)", "(F)", ""];
const hiddenPowerRegex = /Hidden Power( \[?(\w*)]?)?/i;
const statMatches = Object.assign(Object.create(null), {
  HP: Stats.HP,
  Atk: Stats.ATK,
  Def: Stats.DEF,
  SAtk: Stats.SATK,
  SpAtk: Stats.SATK,
  SpA: Stats.SATK,
  SDef: Stats.SDEF,
  SpDef: Stats.SDEF,
  SpD: Stats.SDEF,
  Spd: Stats.SPD,
  Spe: Stats.SPD,
  Spc: Stats.SPC
});

function parseMove(move, poke, nextMove) {
  const match = hiddenPowerRegex.exec(move);
  if (match) {
    poke.moves[nextMove].name = "Hidden Power";
    const type = typeId(match[2]);
    if (type !== Move.hiddenPowerType(poke.ivs, poke.gen)) {
      poke.ivs = Move.hiddenPowers(type, poke.gen)[0];
    }
  } else {
    poke.moves[nextMove].name = move;
  }
}

function parseStats(statsString, { min, max, multipleOf = 1, defaultValue }) {
  const stats = Array(6).fill(defaultValue);
  for (const statString of statsString.split("/").map(s => s.trim())) {
    let value = parseInt(statString, 10);
    if (Number.isNaN(value)) {
      value = defaultValue;
    } else {
      value = Math.trunc(clamp(value, min, max) / multipleOf) * multipleOf;
    }
    const stat = statMatches[statString.split(" ")[1]];
    if (stat !== undefined) {
      stats[stat] = value;
    }
  }
  return stats;
}

const noMoveLast = (move1, move2) =>
  (move1.name === "(No Move)") - (move2.name === "(No Move)");

const calcHealthDv = ivs =>
  ((ivs[Stats.ATK] & 1) << 3) |
  ((ivs[Stats.DEF] & 1) << 2) |
  ((ivs[Stats.SPD] & 1) << 1) |
  (ivs[Stats.SPC] & 1);

function printIv(stat, iv, ivs, gen) {
  if (gen >= Gens.ADV) {
    return iv < 31 ? `${iv} ${statNames[stat]}` : null;
  }

  if (stat === Stats.HP) {
    iv = calcHealthDv(ivs);
  } else if (stat === Stats.SDEF) {
    if (gen < Gens.GSC) return null;
    iv = ivs[Stats.SPC];
  }

  if (iv >= 15) return null;

  return gen < Gens.GSC && stat === Stats.SPC
    ? `${iv} Spc`
    : `${iv} ${statNames[stat]}`;
}

function printEv(stat, ev, evs, gen) {
  if (gen >= Gens.ADV) {
    return ev > 0 ? `${ev} ${statNames[stat]}` : null;
  }

  if (stat === Stats.SDEF) {
    if (gen < Gens.GSC) return null;
    ev = evs[Stats.SPC];
  }

  if (ev >= 252) return null;

  return gen < Gens.GSC && stat === Stats.SPC
    ? `${ev} Spc`
    : `${ev} ${statNames[stat]}`;
}

export default class Pokemon {
  constructor(pokemon = {}) {
    const gen = defaultTo(Number(pokemon.gen), maxGen);
    this.gen = gen;

    this.id = pokemonId(pokemon.id);
    if (typeof pokemon.name === "string") this.name = pokemon.name;

    this.nickname = String(defaultTo(pokemon.nickname, ""));

    if (pokemon.evs) {
      this.evs = [...pokemon.evs];
    } else {
      this.evs = Array(6).fill(gen >= Gens.ADV ? 0 : 252);
    }

    if (pokemon.ivs) {
      this.ivs = [...pokemon.ivs];
    } else {
      this.ivs = Array(6).fill(gen >= Gens.ADV ? 31 : 15);
    }

    this.boosts = pokemon.boosts || Array(6).fill(0);
    this.level = defaultTo(Number(pokemon.level), 100);
    this.nature = defaultTo(Number(pokemon.nature), Natures.HARDY);

    this._status = defaultTo(
      Number(defaultTo(pokemon.status, pokemon._status)),
      Statuses.NO_STATUS
    );
    this.gender = defaultTo(Number(pokemon.gender), Genders.NO_GENDER);

    if (typeof pokemon.ability === "string") {
      this.ability = new Ability({ name: pokemon.ability, gen });
    } else if (pokemon.item) {
      this.ability = new Ability(pokemon.ability);
    } else {
      this.ability = new Ability({ gen });
    }

    if (typeof pokemon.item === "string") {
      this.item = new Item({ name: pokemon.item, gen });
    } else if (pokemon.item) {
      this.item = new Item(pokemon.item);
    } else {
      this.item = new Item({ gen });
    }

    this.moves = (pokemon.moves || []).map(
      move => new Move(typeof move === "string" ? { name: move, gen } : move)
    );
    while (this.moves.length < 4) {
      this.moves.push(new Move({ gen }));
    }
    this.moves.length = 4;

    this.overrideTypes = pokemon.overrideTypes || [-1, -1];
    this.overrideStats = pokemon.overrideStats || [];

    const hp = this.stat(Stats.HP);
    this._currentHp = defaultTo(
      defaultTo(pokemon.currentHp, pokemon._currentHp),
      hp
    );
    this._currentHpRange = new Multiset(
      pokemon.currentHpRange || pokemon._currentHpRange || [hp]
    );
    this._currentHpRangeBerry = new Multiset(
      pokemon.currentHpRangeBerry || pokemon._currentHpRangeBerry || []
    );

    // GHOST: Trick or Treat, GRASS: Forest's Curse, can't coexist
    this.addedType = defaultTo(Number(pokemon.addedType), Types.CURSE);

    this.lightScreen = Boolean(pokemon.lightScreen);
    this.reflect = Boolean(pokemon.reflect);

    this.luckyChant = Boolean(pokemon.luckyChant);
    this.stockpile = defaultTo(Number(pokemon.stockpile), 0);
    this.flashFire = Boolean(pokemon.flashFire);
    this.metronome = defaultTo(Number(pokemon.metronome), 0);
    this.switchedOut = Boolean(pokemon.switchedOut);
    this.movedFirst = Boolean(pokemon.movedFirst);
    this.damagedPreviously = Boolean(pokemon.damagedPreviously);
    this.damagedByPainSplit = Boolean(pokemon.damagedByPainSplit);
    this.beatUpStats = pokemon.beatUpStats || [0];
    this.beatUpLevels = pokemon.beatUpLevels || [1];

    this.plus = Boolean(pokemon.plus);
    this.minus = Boolean(pokemon.minus);
    this.electrify = Boolean(pokemon.electrify);
    this.happiness = defaultTo(Number(pokemon.happiness), 0);
    this.brokenMultiscale = Boolean(pokemon.brokenMultiscale);
    this.autotomize = Boolean(pokemon.autotomize);
    this.unburden = Boolean(pokemon.unburden);
    this.tailwind = Boolean(pokemon.tailwind);
    this.slowStart = Boolean(pokemon.slowStart);
    this.toxicCounter = defaultTo(Number(pokemon.toxicCounter), 0);
    this.stealthRock = Boolean(pokemon.stealthRock);
    this.spikes = defaultTo(Number(pokemon.spikes), 0);
    this.grounded = Boolean(pokemon.grounded);
    this.flowerGift = Boolean(pokemon.flowerGift);
    this.powerTrick = Boolean(pokemon.powerTrick);
    this.foresight = Boolean(pokemon.foresight);
    this.friendGuard = Boolean(pokemon.friendGuard);
    this.battery = Boolean(pokemon.battery);
    this.charge = Boolean(pokemon.charge);
    this.helpingHand = Boolean(pokemon.helpingHand);
    this.auroraVeil = Boolean(pokemon.auroraVeil);
  }

  static fromImportable(importText, gen) {
    const poke = new Pokemon({ gen });

    let nextMove = 0;

    const lines = importText
      .trim()
      .replace("\r", "")
      .replace(/ {2,}/g, " ")
      .split("\n")
      .map(line => line.trim());

    const [identifier, item] = lines[0].split("@");

    const parensRegex = /\((.*?)\)/g;
    const firstParens = parensRegex.exec(identifier);
    if (firstParens) {
      const secondParens = parensRegex.exec(identifier);
      if (secondParens) {
        poke.name = firstParens[1];
        poke.nickname = identifier.slice(0, firstParens.index).trim();
        poke.gender = genderShorthands.indexOf(secondParens[0].toUpperCase());
      } else {
        const gender = genderShorthands.indexOf(firstParens[0].toUpperCase());
        if (gender > -1) {
          poke.name = identifier.match(/.*?(?=\()/)[0];
          poke.gender = gender;
        } else {
          poke.name = firstParens[1];
          poke.nickname = identifier.slice(0, firstParens.index).trim();
          poke.gender = Genders.NO_GENDER;
        }
      }
    } else {
      poke.name = identifier.replace("*", "");
    }

    if (gen >= Gens.GSC && item) {
      poke.item.name = item;
    }

    for (const line of lines.slice(1)) {
      const idx = line.indexOf(":");
      if (idx < 0) {
        if (line.startsWith("-") || line.startsWith("~")) {
          parseMove(line.slice(1), poke, nextMove);
          nextMove++;
        } else if (line.split(" ")[1].toLowerCase() === "nature") {
          poke.nature = natureId(line.split(" ")[0]);
        }
      } else {
        const key = line
          .slice(0, idx)
          .trim()
          .toLowerCase();
        const value = line.slice(idx + 1).trim();
        switch (key) {
          case "level":
            poke.level = clamp(parseInt(value, 10), 1, 100) || 100;
            break;
          case "ability":
          case "trait":
            poke.ability.name = value;
            break;
          case "evs":
            poke.evs = parseStats(value, {
              min: 0,
              max: 252,
              multipleOf: 4,
              defaultValue: gen >= Gens.ADV ? 0 : 252
            });
            break;
          case "ivs":
            poke.ivs = parseStats(value, {
              min: 0,
              max: gen >= Gens.ADV ? 31 : 15,
              defaultValue: gen >= Gens.ADV ? 31 : 15
            });
            break;
          /* no default */
        }
      }
    }

    poke.moves.sort(noMoveLast);

    poke.happiness = Math.max(
      ...poke.moves.map(move => move.optimalHappiness())
    );

    return poke;
  }

  toImportable(options = {}) {
    const importable = [];

    const firstLine = [];
    firstLine.push(this.name);
    if (this.gen >= Gens.ADV && this.gender) {
      firstLine.push(genderShorthands[this.gender]);
    }
    if (this.gen >= Gens.GSC) {
      firstLine.push("@", this.item.name);
    }
    importable.push(firstLine.join(" "));

    if (this.gen >= Gens.ADV) {
      importable.push(`Ability: ${this.ability.name}`);
    }

    const evList = [];
    for (let i = 0; i < 6; i++) {
      const printedEv = printEv(i, this.evs[i], this.evs, this.gen);
      if (printedEv) evList.push(printedEv);
    }
    if (evList.length > 0) {
      importable.push(`EVs: ${evList.join(" / ")}`);
    }

    const hiddenPowerType = Move.hiddenPowerType(this.ivs, this.gen);
    const hiddenPower = Move.hiddenPowers(hiddenPowerType, this.gen)[0];
    const hasHiddenPower =
      this.gen >= Gens.GSC &&
      this.moves.some(move => move.name === "Hidden Power");
    if (
      !hasHiddenPower ||
      this.ivs.slice(1).join() !== hiddenPower.slice(1).join()
    ) {
      const ivList = [];
      for (let i = 0; i < 6; i++) {
        const printedIv = printIv(i, this.ivs[i], this.ivs, this.gen);
        if (printedIv) ivList.push(printedIv);
      }
      if (ivList.length > 0) {
        importable.push(`IVs: ${ivList.join(" / ")}`);
      }
    }

    if (this.gen >= Gens.ADV) {
      let nature = `${natureName(this.nature)} Nature`;
      const n = natureStats(this.nature);
      if (n[0] > -1 && options.natureInfo) {
        const boosted = statNames[n[0]];
        const lowered = statNames[n[1]];
        nature += ` (+${boosted}, -${lowered})`;
      }
      importable.push(nature);
    }

    for (const move of this.moves) {
      if (move.name === "Hidden Power") {
        const type = typeName(hiddenPowerType);
        importable.push(`- Hidden Power [${type}]`);
      } else if (move.name !== "(No Move)") {
        importable.push(`- ${move.name}`);
      }
    }

    return importable.join("\n");
  }

  static fromSet(options) {
    const { set, gen } = options;

    const pokemon = new Pokemon({
      gen,
      id: options.id,
      name: options.name,
      level: set.l,
      nature: set.n,
      ability: set.a ? { id: set.a, gen } : undefined,
      item: set.i ? { id: set.i, gen } : undefined,
      moves: set.m ? set.m.map(id => ({ id, gen })) : undefined,
      evs: set.e ? set.e.map(ev => 4 * ev) : undefined,
      ivs: set.d ? set.d.slice() : undefined
    });

    pokemon.happiness = Math.max(
      ...pokemon.moves.map(move => move.optimalHappiness())
    );

    return pokemon;
  }

  toSet() {
    const set = {};
    const defaultEv = this.gen >= Gens.ADV ? 0 : 252;
    const defaultIv = this.gen >= Gens.ADV ? 31 : 15;
    if (this.level !== 100) set.l = this.level;
    if (this.nature !== Natures.HARDY) set.n = this.nature;
    if (this.ability.name !== "(No Ability)") set.a = this.ability.id;
    if (this.item.name !== "(No Item)") set.i = this.item.id;
    set.m = this.moves.map(move => move.id);
    if (this.evs.some(ev => ev !== defaultEv)) {
      set.e = this.evs.map(ev => Math.trunc(ev / 4));
    }
    if (this.ivs.some(iv => iv !== defaultIv)) {
      set.d = this.ivs.slice();
    }
    return set;
  }

  get name() {
    return pokemonName(this.id);
  }

  set name(pokeName) {
    this.id = pokemonId(String(pokeName));
  }

  stat(s) {
    if (this.powerTrick && (1 <= s && s <= 2)) {
      s = 3 - s;
    }

    if (this.overrideStats[s]) {
      return this.overrideStats[s];
    }

    const base = this.baseStat(s);
    const level = this.level;
    let ev, iv;
    if (this.gen < Gens.ADV && s === Stats.HP) {
      iv = calcHealthDv(this.ivs);
      ev = this.evs[s];
    } else if (this.gen < Gens.ADV && s === Stats.SDEF) {
      iv = this.ivs[Stats.SPC];
      ev = this.evs[Stats.SPC];
    } else {
      iv = this.ivs[s];
      ev = this.evs[s];
    }
    ev = Math.trunc(ev / 4);

    if (this.gen < Gens.ADV) {
      if (s === Stats.HP) {
        // (2*(iv+base) + ev/4) * level/100 + level + 10
        return Math.min(
          999,
          Math.trunc(((iv + base) * 2 + ev) * level / 100) + level + 10
        );
      }
      // (2*(iv+base) + ev/4) * level/100 + 5
      return Math.min(
        999,
        Math.trunc(((iv + base) * 2 + ev) * level / 100) + 5
      );
    }

    if (s === Stats.HP) {
      // shedinja
      if (base === 1) {
        return 1;
      }
      // (iv + 2*base + ev/4 + 100) * level/100 + 10
      return Math.trunc((iv + 2 * base + ev + 100) * level / 100) + 10;
    }

    // ((iv + 2*base + ev/4) * level/100 + 5)*nature
    const n = natureMultiplier(this.nature, s);
    const stat = Math.trunc((iv + 2 * base + ev) * level / 100) + 5;
    return Math.trunc(stat * (10 + n) / 10);
  }

  boost(s) {
    if (this.gen < Gens.B2W2 && this.ability.name === "Simple") {
      return clamp(2 * this.boosts[s], -6, 6);
    }
    return this.boosts[s];
  }

  boostedStat(s) {
    const boost = this.boost(s);
    const stat = this.stat(s);

    if (s === Stats.HP) {
      return stat;
    }

    if (this.gen < Gens.ADV) {
      const numerator = Math.trunc(
        Math.max(2, 2 + boost) / Math.max(2, 2 - boost) * 100
      );
      return clamp(Math.trunc(stat * numerator / 100), 1, 999);
    }

    return Math.trunc(stat * Math.max(2, 2 + boost) / Math.max(2, 2 - boost));
  }

  speed(field = {}) {
    field = new Field(field);
    let speed = this.boostedStat(Stats.SPD);

    if (
      (field.rain() && this.ability.name === "Swift Swim") ||
      (field.sun() && this.ability.name === "Chlorophyll") ||
      (field.sand() && this.ability.name === "Sand Rush") ||
      (field.hail() && this.ability.name === "Slush Rush") ||
      (field.electricTerrain && this.ability.name === "Surge Surfer")
    ) {
      speed *= 2;
    }

    switch (this.item.name) {
      case "Choice Scarf":
        speed = Math.trunc(speed * 3 / 2);
        break;
      case "Quick Powder":
        if (this.name === "Ditto") speed *= 2;
        break;
      default:
        if (this.item.isHeavy()) speed = Math.trunc(speed / 2);
    }

    if (this.status && this.ability.name === "Quick Feet") {
      speed = Math.trunc(speed * 3 / 2);
    } else if (this.isParalyzed()) {
      speed = Math.trunc(speed / 4);
    }

    if (this.ability.name === "Slow Start" && this.slowStart) {
      speed = Math.trunc(speed / 2);
    }

    if (
      this.unburden &&
      this.item.name === "(No Item)" &&
      this.ability.name === "Unburden"
    ) {
      speed *= 2;
    }

    if (this.tailwind) {
      speed *= 2;
    }

    return speed;
  }

  baseStat(stat) {
    return baseStats(this.id, this.gen)[stat];
  }

  get currentHp() {
    return this._currentHp;
  }

  set currentHp(newHp) {
    this._currentHp = newHp;
    this._currentHpRange = new Multiset([newHp]);
    this._currentHpRangeBerry = new Multiset();
  }

  get currentHpRange() {
    return this._currentHpRange;
  }

  set currentHpRange(newHpRange) {
    this._currentHpRange = new Multiset(newHpRange);
    const combined = newHpRange.union(this.currentHpRangeBerry);
    this._currentHp = Multiset.average(combined, 0);
  }

  get currentHpRangeBerry() {
    return this._currentHpRangeBerry;
  }

  set currentHpRangeBerry(newHpRange) {
    this._currentHpRangeBerry = new Multiset(newHpRange);
    const combined = newHpRange.union(this.currentHpRange);
    this._currentHp = Multiset.average(combined, 0);
  }

  type1() {
    if (this.overrideTypes[0] > -1) {
      return this.overrideTypes[0];
    }
    return pokeType1(this.id, this.gen);
  }

  type2() {
    if (this.overrideTypes[1] > -1) {
      return this.overrideTypes[1];
    }
    return pokeType2(this.id, this.gen);
  }

  types() {
    return [this.type1(), this.type2(), this.addedType].filter(
      type => type !== Types.CURSE
    );
  }

  stab(type) {
    return this.types().includes(type);
  }

  weight() {
    // given in 10 kg
    let w = weight(this.id, this.gen);
    if (this.autotomize) {
      w = Math.max(1, w - 1000);
    }
    if (this.ability.name === "Light Metal") {
      w = Math.max(1, w / 2);
    } else if (this.ability.name === "Heavy Metal") {
      w *= 2;
    }
    if (this.item.name === "Float Stone") {
      w = Math.max(1, w / 2);
    }
    return roundHalfToZero(w);
  }

  hasEvolution() {
    return hasEvolution(this.id, this.gen);
  }

  hasPreEvolution() {
    return hasPreEvolution(this.id, this.gen);
  }

  isMega() {
    return isMega(this.id, this.gen);
  }

  isItemRequired() {
    const itemId = requiredItemForPoke(this.id, this.gen);
    return itemId === this.item.id;
  }

  hurtBySandstorm() {
    return (
      !this.ability.isSandImmunity() &&
      this.item.name !== "Safety Goggles" &&
      !this.stab(Types.GROUND) &&
      !this.stab(Types.ROCK) &&
      !this.stab(Types.STEEL)
    );
  }

  hurtByHail() {
    return (
      !this.ability.isHailImmunity() &&
      this.item.name !== "Safety Goggles" &&
      !this.stab(Types.ICE)
    );
  }

  multiscaleIsActive() {
    return (
      !this.brokenMultiscale &&
      this.currentHp === this.stat(Stats.HP) &&
      (this.ability.name === "Multiscale" ||
        this.ability.name === "Shadow Shield")
    );
  }

  get status() {
    if (this.gen >= Gens.SM && this.ability.name === "Comatose") {
      return Statuses.ASLEEP;
    }
    return this._status;
  }

  set status(newStatus) {
    this._status = newStatus;
  }

  isHealthy() {
    return this.status === Statuses.NO_STATUS;
  }

  isPoisoned() {
    return this.status === Statuses.POISONED;
  }

  isBadlyPoisoned() {
    return this.status === Statuses.BADLY_POISONED;
  }

  isBurned() {
    return this.status === Statuses.BURNED;
  }

  isParalyzed() {
    return this.status === Statuses.PARALYZED;
  }

  isAsleep() {
    return this.status === Statuses.ASLEEP;
  }

  isFrozen() {
    return this.status === Statuses.FROZEN;
  }

  isMale() {
    return this.gender === Genders.MALE;
  }

  isFemale() {
    return this.gender === Genders.FEMALE;
  }

  hasPlate() {
    return this.item.nonDisabledName().endsWith(" Plate");
  }

  hasDrive() {
    return this.item.nonDisabledName().endsWith(" Drive");
  }

  hasMemory() {
    return this.item.nonDisabledName().endsWith(" Memory");
  }

  hasBlueOrb() {
    return this.item.nonDisabledName() === "Blue Orb";
  }

  hasRedOrb() {
    return this.item.nonDisabledName() === "Red Orb";
  }

  hasGriseousOrb() {
    return this.item.nonDisabledName() === "Griseous Orb";
  }

  knockOff() {
    return (
      this.item.nonDisabledName() !== "(No Item)" &&
      this.ability.name !== "Sticky Hold" &&
      !this.itemLocked()
    );
  }

  knockOffBoost() {
    return this.item.nonDisabledName() !== "(No Item)" && !this.itemLocked();
  }

  itemLocked() {
    if (this.gen < Gens.B2W2) {
      return (
        this.ability.name === "Multitype" ||
        (this.hasGriseousOrb() && this.name.includes("Giratina"))
      );
    }
    return (
      this.item.mega() === this.id ||
      (this.hasPlate() && this.ability.name === "Multitype") ||
      (this.hasBlueOrb() && this.name.includes("Kyogre")) ||
      (this.hasRedOrb() && this.name.includes("Groudon")) ||
      (this.hasMemory() && this.name.includes("Silvally")) ||
      (this.hasDrive() && this.name.includes("Genesect")) ||
      (this.hasGriseousOrb() && this.name.includes("Giratina"))
    );
  }

  thickClubBoosted() {
    return (
      this.item.name === "Thick Club" &&
      (this.name.includes("Cubone") || this.name.includes("Marowak"))
    );
  }

  lightBallBoosted() {
    return this.item.name === "Light Ball" && this.name.includes("Pikachu");
  }

  hasCritArmor() {
    return this.ability.hasCritArmor() || this.luckyChant;
  }

  pinchAbilityActivated(moveType) {
    return (
      this.ability.pinchType() === moveType &&
      this.stat(Stats.HP) >= this.currentHp * 3
    );
  }

  static calcHealthDv(ivs) {
    return calcHealthDv(ivs);
  }
}
