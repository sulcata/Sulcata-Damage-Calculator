export const Gens = {
  RBY: 1,
  GSC: 2,
  ADV: 3,
  HGSS: 4,
  B2W2: 5,
  ORAS: 6,
  SM: 7
};

export const maxGen = Math.max(...Object.values(Gens));

export const Stats = {
  HP: 0,
  ATK: 1,
  DEF: 2,
  SATK: 3,
  SDEF: 4,
  SPD: 5,
  ACC: 6,
  EVA: 7,
  SPC: 3
};

export const Genders = {
  NO_GENDER: 0,
  MALE: 1,
  FEMALE: 2
};

export const DamageClasses = {
  OTHER: 0,
  PHYSICAL: 1,
  SPECIAL: 2
};

export const Statuses = {
  NO_STATUS: 0,
  POISONED: 1,
  BADLY_POISONED: 2,
  BURNED: 3,
  PARALYZED: 4,
  ASLEEP: 5,
  FROZEN: 6
};

export const Types = {
  NORMAL: 0,
  FIGHTING: 1,
  FLYING: 2,
  POISON: 3,
  GROUND: 4,
  ROCK: 5,
  BUG: 6,
  GHOST: 7,
  STEEL: 8,
  FIRE: 9,
  WATER: 10,
  GRASS: 11,
  ELECTRIC: 12,
  PSYCHIC: 13,
  ICE: 14,
  DRAGON: 15,
  DARK: 16,
  FAIRY: 17,
  CURSE: 18
};

export const Weathers = {
  CLEAR: 0,
  SUN: 4,
  RAIN: 2,
  SAND: 3,
  HAIL: 1,
  HARSH_SUN: 6,
  HEAVY_RAIN: 5,
  STRONG_WINDS: 7
};

export const Natures = {
  HARDY: 0,
  LONELY: 1,
  BRAVE: 2,
  ADAMANT: 3,
  NAUGHTY: 4,
  BOLD: 5,
  DOCILE: 6,
  RELAXED: 7,
  IMPISH: 8,
  LAX: 9,
  TIMID: 10,
  HASTY: 11,
  SERIOUS: 12,
  JOLLY: 13,
  NAIVE: 14,
  MODEST: 15,
  MILD: 16,
  QUIET: 17,
  BASHFUL: 18,
  RASH: 19,
  CALM: 20,
  GENTLE: 21,
  SASSY: 22,
  CAREFUL: 23,
  QUIRKY: 24
};

export const Terrains = {
  NO_TERRAIN: Symbol("sulcalc.Terrains.NO_TERRAIN"),
  GRASSY_TERRAIN: Symbol("sulcalc.Terrains.GRASSY_TERRAIN"),
  MISTY_TERRAIN: Symbol("sulcalc.Terrains.MISTY_TERRAIN"),
  ELECTRIC_TERRAIN: Symbol("sulcalc.Terrains.ELECTRIC_TERRAIN"),
  PSYCHIC_TERRAIN: Symbol("sulcalc.Terrains.PSYCHIC_TERRAIN")
};

export const roundHalfToZero = n =>
  Math.trunc(n) + (n % 1 > 0.5) - (n % 1 < -0.5);

export const chainMod = (modifier1, modifier2) =>
  (modifier1 * modifier2 + 0x800) >> 12;

export const applyMod = (modifier, value) =>
  Array.isArray(value)
    ? value.map(v => roundHalfToZero((v * modifier) / 0x1000))
    : roundHalfToZero((value * modifier) / 0x1000);

export function damageVariation(baseDamage, min, max) {
  const damages = [];
  for (let i = min; i <= max; i++) {
    damages.push(Math.trunc((baseDamage * i) / max));
  }
  return damages;
}

export const needsScaling = (...stats) => stats.some(stat => stat > 255);

export const scaleStat = (stat, bits = 2) => (stat >> bits) & 0xff;
