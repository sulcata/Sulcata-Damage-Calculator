import { clamp } from "lodash";
import Ability, { AbilityOptions } from "./Ability";
import Field from "./Field";
import {
  baseStats,
  hasEvolution,
  hasPreEvolution,
  isMega,
  moveId,
  moveName,
  natureId,
  natureMultiplier,
  natureName,
  natureStats,
  pokemonId,
  pokemonName,
  pokeType1,
  pokeType2,
  requiredItemForPoke,
  typeName,
  weight
} from "./info";
import Item, { ItemOptions } from "./Item";
import Move, { MoveOptions } from "./Move";
import Multiset from "./Multiset";
import {
  BaseStat,
  BoostList,
  Gender,
  Generation,
  hasOwn,
  maxGen,
  Nature,
  roundHalfToZero,
  Stat,
  StatList,
  Status,
  Type
} from "./utilities";

const statNames = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const genderShorthands = ["", "(M)", "(F)", ""];
const statMatches = new Map<string, BaseStat>([
  ["HP", Stat.HP],
  ["Atk", Stat.ATK],
  ["Def", Stat.DEF],
  ["SAtk", Stat.SATK],
  ["SpAtk", Stat.SATK],
  ["SpA", Stat.SATK],
  ["SDef", Stat.SDEF],
  ["SpDef", Stat.SDEF],
  ["SpD", Stat.SDEF],
  ["Spd", Stat.SPD],
  ["Spe", Stat.SPD],
  ["Spc", Stat.SPC]
]);

function parseMove(poke: Pokemon, move: Move, name: string) {
  move.name = moveName(moveId(name));
  if (move.isHiddenPower()) {
    const type = move.type();
    const ivs = Move.hiddenPowers(type, move.gen)[0];
    if (ivs && type !== Move.hiddenPowerType(poke.ivs, move.gen)) {
      poke.ivs = ivs;
    }
  }
}

function parseStats(
  statsString: string,
  {
    min,
    max,
    multipleOf = 1,
    defaultValue
  }: { min: number; max: number; multipleOf?: number; defaultValue: number }
): StatList {
  const stats = [0, 0, 0, 0, 0, 0].fill(defaultValue) as StatList;
  for (const statString of statsString.split("/").map(s => s.trim())) {
    let value = Number.parseInt(statString, 10);
    value = Number.isNaN(value)
      ? defaultValue
      : Math.trunc(clamp(value, min, max) / multipleOf) * multipleOf;
    const stat = statMatches.get(statString.split(" ")[1]);
    if (stat !== undefined) {
      stats[stat] = value;
    }
  }
  return stats;
}

const noMoveLast = (move1: Move, move2: Move): number =>
  (move1.name === "(No Move)" ? 1 : 0) - (move2.name === "(No Move)" ? 1 : 0);

const calcHealthDv = (ivs: StatList): number =>
  ((ivs[Stat.ATK] & 1) << 3) |
  ((ivs[Stat.DEF] & 1) << 2) |
  ((ivs[Stat.SPD] & 1) << 1) |
  (ivs[Stat.SPC] & 1);

function printIv(stat: BaseStat, iv: number, ivs: StatList, gen: Generation) {
  if (gen >= Generation.ADV) {
    return iv < 31 ? `${iv} ${statNames[stat]}` : "";
  }

  if (stat === Stat.HP) {
    iv = calcHealthDv(ivs);
  } else if (stat === Stat.SDEF) {
    if (gen < Generation.GSC) return "";
    iv = ivs[Stat.SPC];
  }

  if (iv >= 15) return "";

  return gen < Generation.GSC && stat === Stat.SPC
    ? `${iv} Spc`
    : `${iv} ${statNames[stat]}`;
}

function printEv(stat: BaseStat, ev: number, evs: StatList, gen: Generation) {
  if (gen >= Generation.ADV) {
    return ev > 0 ? `${ev} ${statNames[stat]}` : "";
  }

  if (stat === Stat.SDEF) {
    if (gen < Generation.GSC) return "";
    ev = evs[Stat.SPC];
  }

  if (ev >= 252) return "";

  return gen < Generation.GSC && stat === Stat.SPC
    ? `${ev} Spc`
    : `${ev} ${statNames[stat]}`;
}

export interface IPokemonSet {
  e?: StatList;
  d?: StatList;
  m?: [string, string, string, string];
  a?: string;
  i?: string;
  n?: number;
  l?: number;
}

export type MoveInitializer = Move | MoveOptions | string;
export type MovesInitializer = [
  MoveInitializer,
  MoveInitializer,
  MoveInitializer,
  MoveInitializer
];
export type Moves = [Move, Move, Move, Move];
export type AbilityInitializer = Ability | AbilityOptions | string;
export type ItemInitializer = Item | ItemOptions | string;
export type OverrideTypes = [Type | -1, Type | -1];
// God Bless TypeScript's Turing complete type system
interface IAddedOptions {
  status?: Status;
  ability?: AbilityInitializer;
  item?: ItemInitializer;
  moves?: MovesInitializer;
  currentHp?: number;
  currentHpRange?: Multiset<number> | number[];
  currentHpRangeBerry?: Multiset<number> | number[];
}
export type PokemonOptions = Partial<
  Pick<Pokemon, Exclude<keyof Pokemon, keyof IAddedOptions>>
> &
  IAddedOptions;

export default class Pokemon {
  public gen: Generation = maxGen;
  public id: string = "nopokemon";
  public nickname: string = "";
  public evs: StatList;
  public ivs: StatList;
  public boosts: BoostList;
  public level: number = 100;
  public nature: Nature = Nature.HARDY;
  public gender: Gender = Gender.NO_GENDER;
  public ability: Ability;
  public item: Item;
  public moves: Moves;
  public overrideTypes: OverrideTypes;
  public overrideStats: number[] = [];
  public addedType: Type = Type.CURSE;
  public lightScreen: boolean = false;
  public reflect: boolean = false;
  public luckyChant: boolean = false;
  public stockpile: number = 0;
  public flashFire: boolean = false;
  public metronome: number = 0;
  public switchedOut: boolean = false;
  public movedFirst: boolean = false;
  public damagedPreviously: boolean = false;
  public damagedByPainSplit: boolean = false;
  public beatUpStats: number[];
  public beatUpLevels: number[];
  public plus: boolean = false;
  public minus: boolean = false;
  public electrify: boolean = false;
  public happiness: number = 0;
  public brokenMultiscale: boolean = false;
  public autotomize: boolean = false;
  public unburden: boolean = false;
  public tailwind: boolean = false;
  public slowStart: boolean = false;
  public toxicCounter: number = 0;
  public stealthRock: boolean = false;
  public spikes: number = 0;
  public flowerGift: boolean = false;
  public powerTrick: boolean = false;
  public foresight: boolean = false;
  public friendGuard: boolean = false;
  public battery: boolean = false;
  public charge: boolean = false;
  public helpingHand: boolean = false;
  public auroraVeil: boolean = false;
  public grounded: boolean = false;
  public ungrounded: boolean = false;
  public set: IPokemonSet | undefined;
  public _status: Status = Status.NO_STATUS;
  public _currentHp: number;
  public _currentHpRange: Multiset<number>;
  public _currentHpRangeBerry: Multiset<number>;

  constructor(pokemon: Pokemon | PokemonOptions = {}) {
    const {
      id,
      name,
      evs,
      ivs,
      boosts,
      ability,
      item,
      moves,
      beatUpLevels,
      beatUpStats,
      overrideStats,
      overrideTypes,
      currentHp,
      currentHpRange,
      currentHpRangeBerry,
      _currentHp,
      _currentHpRange,
      _currentHpRangeBerry,
      status,
      _status,
      ...rest
    } = pokemon;
    Object.assign(this, rest);

    if (typeof id === "string") {
      this.id = pokemonId(id);
    } else if (typeof name === "string") {
      this.name = name;
    }

    if (evs) {
      this.evs = evs.slice(0) as StatList;
    } else {
      const defaultEv = this.gen >= Generation.ADV ? 0 : 252;
      this.evs = [0, 0, 0, 0, 0, 0].fill(defaultEv) as StatList;
    }

    if (ivs) {
      this.ivs = ivs.slice(0) as StatList;
    } else {
      const defaultIv = this.gen >= Generation.ADV ? 31 : 15;
      this.ivs = [0, 0, 0, 0, 0, 0].fill(defaultIv) as StatList;
    }

    this.boosts = boosts
      ? (boosts.slice(0) as BoostList)
      : [0, 0, 0, 0, 0, 0, 0, 0];

    this.beatUpStats = beatUpStats ? beatUpStats.slice(0) : [0];
    this.beatUpLevels = beatUpLevels ? beatUpLevels.slice(0) : [1];

    if (status !== undefined && hasOwn(pokemon, "status")) {
      this._status = status;
    } else if (_status !== undefined) {
      this._status = _status;
    }

    this.ability =
      typeof ability === "string"
        ? new Ability({ name: ability, gen: this.gen })
        : new Ability({ ...(ability || {}), gen: this.gen });

    this.item =
      typeof item === "string"
        ? new Item({ name: item, gen: this.gen })
        : new Item({ ...(item || {}), gen: this.gen });

    const moveProto = { user: this, gen: this.gen };
    const moveInits: MovesInitializer = moves || [{}, {}, {}, {}];
    this.moves = moveInits.map(move =>
      typeof move === "string"
        ? new Move({ name: move, ...moveProto })
        : new Move({ ...(move || {}), ...moveProto })
    ) as Moves;

    this.overrideStats = overrideStats ? overrideStats.slice(0) : [];
    this.overrideTypes = overrideTypes
      ? (overrideTypes.slice(0) as OverrideTypes)
      : [-1, -1];

    if (currentHp !== undefined && hasOwn(pokemon, "currentHp")) {
      this._currentHp = currentHp;
      this._currentHpRange = new Multiset([currentHp]);
      this._currentHpRangeBerry = new Multiset();
    } else if (currentHpRange && hasOwn(pokemon, "currentHpRange")) {
      this._currentHpRange = new Multiset(currentHpRange);
      this._currentHpRangeBerry =
        currentHpRangeBerry && hasOwn(pokemon, "currentHpRangeBerry")
          ? new Multiset(currentHpRangeBerry)
          : new Multiset();
      const combined = this._currentHpRange.union(this._currentHpRangeBerry);
      this._currentHp = Multiset.average(combined, 0);
    } else if (
      currentHp !== undefined &&
      currentHpRange !== undefined &&
      currentHpRangeBerry !== undefined
    ) {
      this._currentHp = currentHp;
      this._currentHpRange = currentHpRange;
      this._currentHpRangeBerry = currentHpRangeBerry;
    } else {
      const maxHp = this.stat(Stat.HP);
      this._currentHp = maxHp;
      this._currentHpRange = new Multiset([maxHp]);
      this._currentHpRangeBerry = new Multiset();
    }
  }

  public toImportable(options: { natureInfo?: boolean } = {}): string {
    const importable = [];

    const firstLine = [];
    firstLine.push(this.name);
    if (this.gen >= Generation.ADV && this.gender) {
      firstLine.push(genderShorthands[this.gender]);
    }
    if (this.gen >= Generation.GSC) {
      firstLine.push("@", this.item.name);
    }
    importable.push(firstLine.join(" "));

    if (this.gen >= Generation.ADV) {
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
      this.gen >= Generation.GSC &&
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

    if (this.gen >= Generation.ADV) {
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
        importable.push(`- Hidden Power ${typeName(hiddenPowerType)}`);
      } else if (move.name !== "(No Move)") {
        importable.push(`- ${move.name}`);
      }
    }

    return importable.join("\n");
  }

  public toSet(): IPokemonSet {
    const set: IPokemonSet = {
      m: this.moves.map(move => move.id) as [string, string, string, string]
    };
    const defaultEv = this.gen >= Generation.ADV ? 0 : 252;
    const defaultIv = this.gen >= Generation.ADV ? 31 : 15;
    if (this.level !== 100) set.l = this.level;
    if (this.gen >= Generation.ADV && this.nature !== Nature.HARDY) {
      set.n = this.nature;
    }
    if (this.gen >= Generation.ADV && this.ability.name !== "(No Ability)") {
      set.a = this.ability.id;
    }
    if (this.gen >= Generation.GSC && this.item.name !== "(No Item)") {
      set.i = this.item.id;
    }
    if (this.evs.some(ev => ev !== defaultEv)) {
      set.e = this.evs.map(ev => Math.trunc(ev / 4)) as StatList;
    }
    if (this.ivs.some(iv => iv !== defaultIv)) {
      set.d = this.ivs.slice(0) as StatList;
    }
    return set;
  }

  public get name(): string {
    return pokemonName(this.id);
  }

  public set name(pokeName: string) {
    this.id = pokemonId(pokeName);
  }

  public stat(s: BaseStat): number {
    if (this.powerTrick && s === Stat.ATK) {
      s = Stat.DEF;
    } else if (this.powerTrick && s === Stat.DEF) {
      s = Stat.ATK;
    }

    if (this.overrideStats[s]) {
      return this.overrideStats[s];
    }

    const base = this.baseStat(s);
    const level = this.level;
    let ev, iv;
    if (this.gen < Generation.ADV && s === Stat.HP) {
      iv = calcHealthDv(this.ivs);
      ev = this.evs[s];
    } else if (this.gen < Generation.ADV && s === Stat.SDEF) {
      iv = this.ivs[Stat.SPC];
      ev = this.evs[Stat.SPC];
    } else {
      iv = this.ivs[s];
      ev = this.evs[s];
    }
    ev = Math.trunc(ev / 4);

    if (this.gen < Generation.ADV) {
      if (s === Stat.HP) {
        // (2*(iv+base) + ev/4) * level/100 + level + 10
        return Math.min(
          999,
          Math.trunc((((iv + base) * 2 + ev) * level) / 100) + level + 10
        );
      }
      // (2*(iv+base) + ev/4) * level/100 + 5
      return Math.min(
        999,
        Math.trunc((((iv + base) * 2 + ev) * level) / 100) + 5
      );
    }

    if (s === Stat.HP) {
      // shedinja
      if (base === 1) {
        return 1;
      }
      // (iv + 2*base + ev/4 + 100) * level/100 + 10
      return Math.trunc(((iv + 2 * base + ev + 100) * level) / 100) + 10;
    }

    // ((iv + 2*base + ev/4) * level/100 + 5)*nature
    const n = natureMultiplier(this.nature, s);
    const stat = Math.trunc(((iv + 2 * base + ev) * level) / 100) + 5;
    return Math.trunc((stat * (10 + n)) / 10);
  }

  public boost(s: Stat): number {
    if (this.gen < Generation.B2W2 && this.ability.name === "Simple") {
      return clamp(2 * this.boosts[s], -6, 6);
    }
    return this.boosts[s];
  }

  public boostedStat(s: BaseStat): number {
    const boost = this.boost(s);
    const stat = this.stat(s);

    if (s === Stat.HP) {
      return stat;
    }

    if (this.gen < Generation.ADV) {
      const numerator = Math.trunc(
        (Math.max(2, 2 + boost) / Math.max(2, 2 - boost)) * 100
      );
      return clamp(Math.trunc((stat * numerator) / 100), 1, 999);
    }

    return Math.trunc((stat * Math.max(2, 2 + boost)) / Math.max(2, 2 - boost));
  }

  public speed(field: Field): number {
    let speed = this.boostedStat(Stat.SPD);

    if (
      (field.rain() && this.ability.name === "Swift Swim") ||
      (field.sun() && this.ability.name === "Chlorophyll") ||
      (field.sand() && this.ability.name === "Sand Rush") ||
      (field.hail() && this.ability.name === "Slush Rush") ||
      (field.electricTerrain() && this.ability.name === "Surge Surfer")
    ) {
      speed *= 2;
    }

    switch (this.item.name) {
      case "Choice Scarf":
        speed = Math.trunc((speed * 3) / 2);
        break;
      case "Quick Powder":
        if (this.name === "Ditto") speed *= 2;
        break;
      default:
        if (this.item.isHeavy()) speed = Math.trunc(speed / 2);
    }

    if (this.status && this.ability.name === "Quick Feet") {
      speed = Math.trunc((speed * 3) / 2);
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

  public baseStat(stat: BaseStat): number {
    return baseStats(this.id, this.gen)[stat];
  }

  public get currentHp(): number {
    return this._currentHp;
  }

  public set currentHp(hp: number) {
    this._currentHp = hp;
    this._currentHpRange = new Multiset([hp]);
    this._currentHpRangeBerry = new Multiset();
  }

  public get currentHpRange(): Multiset<number> {
    return this._currentHpRange;
  }

  public set currentHpRange(hpRange: Multiset<number>) {
    this._currentHpRange = new Multiset(hpRange);
    const combined = hpRange.union(this.currentHpRangeBerry);
    this._currentHp = Multiset.average(combined, 0);
  }

  public get currentHpRangeBerry(): Multiset<number> {
    return this._currentHpRangeBerry;
  }

  public set currentHpRangeBerry(hpRange: Multiset<number>) {
    this._currentHpRangeBerry = new Multiset(hpRange);
    const combined = hpRange.union(this.currentHpRange);
    this._currentHp = Multiset.average(combined, 0);
  }

  public type1(): Type {
    if (this.overrideTypes[0] > -1) {
      return this.overrideTypes[0];
    }
    return pokeType1(this.id, this.gen);
  }

  public type2(): Type {
    if (this.overrideTypes[1] > -1) {
      return this.overrideTypes[1];
    }
    return pokeType2(this.id, this.gen);
  }

  public secondaryType(): Type {
    return this.type2() === Type.CURSE ? this.type1() : this.type2();
  }

  public types(): Type[] {
    return [this.type1(), this.type2(), this.addedType].filter(
      type => type !== Type.CURSE
    );
  }

  public stab(type: Type): boolean {
    return this.types().includes(type);
  }

  public weight(): number {
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

  public hasEvolution(): boolean {
    return hasEvolution(this.id, this.gen);
  }

  public hasPreEvolution(): boolean {
    return hasPreEvolution(this.id, this.gen);
  }

  public isMega(): boolean {
    return isMega(this.id, this.gen);
  }

  public isItemRequired(): boolean {
    const itemId = requiredItemForPoke(this.id, this.gen);
    return itemId === this.item.id;
  }

  public hurtBySandstorm(): boolean {
    return (
      !this.ability.isSandImmunity() &&
      this.item.name !== "Safety Goggles" &&
      !this.stab(Type.GROUND) &&
      !this.stab(Type.ROCK) &&
      !this.stab(Type.STEEL)
    );
  }

  public hurtByHail(): boolean {
    return (
      !this.ability.isHailImmunity() &&
      this.item.name !== "Safety Goggles" &&
      !this.stab(Type.ICE)
    );
  }

  public multiscaleIsActive(): boolean {
    return (
      !this.brokenMultiscale &&
      this.currentHp === this.stat(Stat.HP) &&
      (this.ability.name === "Multiscale" ||
        this.ability.name === "Shadow Shield")
    );
  }

  public get status(): Status {
    if (this.gen >= Generation.SM && this.ability.name === "Comatose") {
      return Status.ASLEEP;
    }
    return this._status;
  }

  public set status(status: Status) {
    this._status = status;
  }

  public isHealthy(): boolean {
    return this.status === Status.NO_STATUS;
  }

  public isPoisoned(): boolean {
    return this.status === Status.POISONED;
  }

  public isBadlyPoisoned(): boolean {
    return this.status === Status.BADLY_POISONED;
  }

  public isBurned(): boolean {
    return this.status === Status.BURNED;
  }

  public isParalyzed(): boolean {
    return this.status === Status.PARALYZED;
  }

  public isAsleep(): boolean {
    return this.status === Status.ASLEEP;
  }

  public isFrozen(): boolean {
    return this.status === Status.FROZEN;
  }

  public isMale(): boolean {
    return this.gender === Gender.MALE;
  }

  public isFemale(): boolean {
    return this.gender === Gender.FEMALE;
  }

  public hasPlate(): boolean {
    return this.item.isPlate();
  }

  public hasDrive(): boolean {
    return this.item.nonDisabledName().endsWith(" Drive");
  }

  public hasMemory(): boolean {
    return this.item.nonDisabledName().endsWith(" Memory");
  }

  public hasBlueOrb(): boolean {
    return this.item.nonDisabledName() === "Blue Orb";
  }

  public hasRedOrb(): boolean {
    return this.item.nonDisabledName() === "Red Orb";
  }

  public hasGriseousOrb(): boolean {
    return this.item.nonDisabledName() === "Griseous Orb";
  }

  public knockOff(): boolean {
    return (
      this.item.nonDisabledName() !== "(No Item)" &&
      this.ability.name !== "Sticky Hold" &&
      !this.itemLocked()
    );
  }

  public knockOffBoost(): boolean {
    return this.item.nonDisabledName() !== "(No Item)" && !this.itemLocked();
  }

  public itemLocked(): boolean {
    if (this.gen < Generation.B2W2) {
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

  public thickClubBoosted(): boolean {
    return (
      this.item.name === "Thick Club" &&
      (this.name.includes("Cubone") || this.name.includes("Marowak"))
    );
  }

  public lightBallBoosted(): boolean {
    return this.item.name === "Light Ball" && this.name.includes("Pikachu");
  }

  public hasCritArmor(): boolean {
    return this.ability.hasCritArmor() || this.luckyChant;
  }

  public pinchAbilityActivated(moveType: Type): boolean {
    return (
      this.ability.pinchType() === moveType &&
      this.stat(Stat.HP) >= this.currentHp * 3
    );
  }

  public isGrounded(field: Field): boolean {
    return (
      this.grounded ||
      field.gravity ||
      this.item.name === "Iron Ball" ||
      (!this.ungrounded &&
        this.ability.immunityType() !== Type.GROUND &&
        !this.types().includes(Type.FLYING) &&
        this.item.name !== "Air Balloon")
    );
  }

  public static fromImportable(importText: string, gen: Generation): Pokemon {
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
          const match = /.*?(?=\()/.exec(identifier);
          if (match) poke.name = match[0];
          poke.gender = gender;
        } else {
          poke.name = firstParens[1];
          poke.nickname = identifier.slice(0, firstParens.index).trim();
          poke.gender = Gender.NO_GENDER;
        }
      }
    } else {
      poke.name = identifier.replace("*", "");
    }

    if (gen >= Generation.GSC && item) {
      poke.item.name = item;
    }

    for (const line of lines.slice(1)) {
      const index = line.indexOf(":");
      if (index < 0) {
        if (line.startsWith("-") || line.startsWith("~")) {
          parseMove(poke, poke.moves[nextMove], line.slice(1));
          nextMove++;
        } else if (line.split(" ")[1].toLowerCase() === "nature") {
          poke.nature = natureId(line.split(" ")[0]);
        }
      } else {
        const key = line
          .slice(0, index)
          .trim()
          .toLowerCase();
        const value = line.slice(index + 1).trim();
        switch (key) {
          case "level":
            poke.level = clamp(Number.parseInt(value, 10), 1, 100) || 100;
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
              defaultValue: gen >= Generation.ADV ? 0 : 252
            });
            break;
          case "ivs":
            poke.ivs = parseStats(value, {
              min: 0,
              max: gen >= Generation.ADV ? 31 : 15,
              defaultValue: gen >= Generation.ADV ? 31 : 15
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

  public static fromSet({
    set,
    gen,
    id
  }: {
    set: IPokemonSet;
    gen: Generation;
    id: string;
  }): Pokemon {
    const options: PokemonOptions = { gen, id };
    if (set.l) options.level = set.l;
    if (set.n) options.nature = set.n;
    if (set.a) options.ability = { id: set.a, gen };
    if (set.i) options.item = { id: set.i, gen };
    if (set.m) {
      options.moves = set.m.map(id => ({ id, gen })) as MovesInitializer;
    }
    if (set.e) options.evs = set.e.map(ev => 4 * ev) as StatList;
    if (set.d) options.ivs = set.d as StatList;
    const pokemon = new Pokemon(options);

    pokemon.happiness = Math.max(
      ...pokemon.moves.map((move: Move) => move.optimalHappiness())
    );

    return pokemon;
  }

  public static calcHealthDv(ivs: StatList): number {
    return calcHealthDv(ivs);
  }
}
