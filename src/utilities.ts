export type OneOrMany<T> = T | T[];

export enum Generation {
  RBY = 1,
  GSC,
  ADV,
  HGSS,
  B2W2,
  ORAS,
  SM
}
export const generations: Readonly<Generation[]> = [
  Generation.RBY,
  Generation.GSC,
  Generation.ADV,
  Generation.HGSS,
  Generation.B2W2,
  Generation.ORAS,
  Generation.SM
];
export const maxGen = Generation.SM;

export enum Stat {
  HP = 0,
  ATK = 1,
  DEF = 2,
  SATK = 3,
  SDEF = 4,
  SPD = 5,
  ACC = 6,
  EVA = 7,
  SPC = 3
}
export const stats: Readonly<Stat[]> = [
  Stat.HP,
  Stat.ATK,
  Stat.DEF,
  Stat.SATK,
  Stat.SDEF,
  Stat.SPD
];
export const statsGen1: Readonly<Stat[]> = [
  Stat.HP,
  Stat.ATK,
  Stat.DEF,
  Stat.SPC,
  Stat.SPD
];
export type BaseStat = Exclude<Stat, Stat.ACC | Stat.EVA>;
export type StatList = [number, number, number, number, number, number];
export type BoostList = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

export enum Gender {
  NO_GENDER = 0,
  MALE,
  FEMALE
}
export const genders: Readonly<Gender[]> = [
  Gender.NO_GENDER,
  Gender.MALE,
  Gender.FEMALE
];

export enum DamageClass {
  OTHER = 0,
  PHYSICAL,
  SPECIAL
}
export const damageClasses: Readonly<DamageClass[]> = [
  DamageClass.OTHER,
  DamageClass.PHYSICAL,
  DamageClass.SPECIAL
];

export enum Status {
  NO_STATUS = 0,
  POISONED,
  BADLY_POISONED,
  BURNED,
  PARALYZED,
  ASLEEP,
  FROZEN
}
export const statuses: Readonly<Status[]> = [
  Status.NO_STATUS,
  Status.POISONED,
  Status.BADLY_POISONED,
  Status.BURNED,
  Status.PARALYZED,
  Status.ASLEEP,
  Status.FROZEN
];

export enum Type {
  NORMAL = 0,
  FIGHTING,
  FLYING,
  POISON,
  GROUND,
  ROCK,
  BUG,
  GHOST,
  STEEL,
  FIRE,
  WATER,
  GRASS,
  ELECTRIC,
  PSYCHIC,
  ICE,
  DRAGON,
  DARK,
  FAIRY,
  CURSE
}
export const types: Readonly<Type[]> = [
  Type.NORMAL,
  Type.FIGHTING,
  Type.FLYING,
  Type.POISON,
  Type.GROUND,
  Type.ROCK,
  Type.BUG,
  Type.GHOST,
  Type.STEEL,
  Type.FIRE,
  Type.WATER,
  Type.GRASS,
  Type.ELECTRIC,
  Type.PSYCHIC,
  Type.ICE,
  Type.DRAGON,
  Type.DARK,
  Type.FAIRY,
  Type.CURSE
];

export enum Weather {
  CLEAR = 0,
  HAIL,
  RAIN,
  SAND,
  SUN,
  HEAVY_RAIN,
  HARSH_SUN,
  STRONG_WINDS
}
export const weathers: Readonly<Weather[]> = [
  Weather.CLEAR,
  Weather.SUN,
  Weather.RAIN,
  Weather.SAND,
  Weather.HAIL,
  Weather.HARSH_SUN,
  Weather.HEAVY_RAIN,
  Weather.STRONG_WINDS
];

export enum Nature {
  HARDY = 0,
  LONELY,
  BRAVE,
  ADAMANT,
  NAUGHTY,
  BOLD,
  DOCILE,
  RELAXED,
  IMPISH,
  LAX,
  TIMID,
  HASTY,
  SERIOUS,
  JOLLY,
  NAIVE,
  MODEST,
  MILD,
  QUIET,
  BASHFUL,
  RASH,
  CALM,
  GENTLE,
  SASSY,
  CAREFUL,
  QUIRKY
}
export const natures: Readonly<Nature[]> = [
  Nature.HARDY,
  Nature.LONELY,
  Nature.BRAVE,
  Nature.ADAMANT,
  Nature.NAUGHTY,
  Nature.BOLD,
  Nature.DOCILE,
  Nature.RELAXED,
  Nature.IMPISH,
  Nature.LAX,
  Nature.TIMID,
  Nature.HASTY,
  Nature.SERIOUS,
  Nature.JOLLY,
  Nature.NAIVE,
  Nature.MODEST,
  Nature.MILD,
  Nature.QUIET,
  Nature.BASHFUL,
  Nature.RASH,
  Nature.CALM,
  Nature.GENTLE,
  Nature.SASSY,
  Nature.CAREFUL,
  Nature.QUIRKY
];

export enum Terrain {
  NO_TERRAIN,
  GRASSY_TERRAIN,
  MISTY_TERRAIN,
  ELECTRIC_TERRAIN,
  PSYCHIC_TERRAIN
}
export const terrains: Readonly<Terrain[]> = [
  Terrain.NO_TERRAIN,
  Terrain.GRASSY_TERRAIN,
  Terrain.MISTY_TERRAIN,
  Terrain.ELECTRIC_TERRAIN,
  Terrain.PSYCHIC_TERRAIN
];

export const roundHalfToZero = (n: number): number =>
  Math.trunc(n) + (n % 1 > 0.5 ? 1 : 0) - (n % 1 < -0.5 ? 1 : 0);

export const chainMod = (modifier1: number, modifier2: number): number =>
  (modifier1 * modifier2 + 0x800) >> 12;

export const applyMod = (modifier: number, value: number): number =>
  roundHalfToZero((value * modifier) / 0x1000);

export const applyModAll = (modifier: number, values: number[]): number[] =>
  values.map(v => applyMod(modifier, v));

export function damageVariation(
  baseDamage: number,
  min: number,
  max: number
): number[] {
  const damages = [];
  for (let i = min; i <= max; i++) {
    damages.push(Math.trunc((baseDamage * i) / max));
  }
  return damages;
}

export const needsScaling = (...stats: number[]): boolean =>
  stats.some(stat => stat > 255);

export const scaleStat = (stat: number, bits: number = 2): number =>
  (stat >> bits) & 0xff;

export const hasOwn = (obj: object, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key);
