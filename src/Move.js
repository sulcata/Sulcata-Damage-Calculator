import { clamp } from "lodash";
import {
  Gens,
  DamageClasses,
  Stats,
  Types,
  Weathers,
  maxGen
} from "./utilities";
import {
  moveId,
  moveName,
  movePower,
  moveDamageClass,
  moveType,
  priority,
  requiresRecharge,
  moveIgnoresAbilities,
  recoil,
  hasPunchFlag,
  hasContactFlag,
  hasSoundFlag,
  hasPowderFlag,
  hasBiteFlag,
  hasPulseFlag,
  hasBulletFlag,
  hasSecondaryEffect,
  minHits,
  maxHits,
  hitsMultipleTargets,
  zMovePower,
  isOhkoMove
} from "./info";

const zMoves = {
  [Types.NORMAL]: "Breakneck Blitz",
  [Types.FIGHTING]: "All-Out Pummeling",
  [Types.FLYING]: "Supersonic Skystrike",
  [Types.POISON]: "Acid Downpour",
  [Types.GROUND]: "Tectonic Rage",
  [Types.ROCK]: "Continental Crush",
  [Types.BUG]: "Savage Spin-Out",
  [Types.GHOST]: "Never-Ending Nightmare",
  [Types.STEEL]: "Corkscrew Crash",
  [Types.FIRE]: "Inferno Overdrive",
  [Types.WATER]: "Hydro Vortex",
  [Types.GRASS]: "Bloom Doom",
  [Types.ELECTRIC]: "Gigavolt Havoc",
  [Types.PSYCHIC]: "Shattered Psyche",
  [Types.ICE]: "Subzero Slammer",
  [Types.DRAGON]: "Devastating Drake",
  [Types.DARK]: "Black Hole Eclipse",
  [Types.FAIRY]: "Twinkle Tackle"
};

const hiddenPowerStatOrder = [
  Stats.SPD,
  Stats.SATK,
  Stats.HP,
  Stats.DEF,
  Stats.SDEF,
  Stats.ATK
];

function ivsCmp(a, b) {
  for (const stat of hiddenPowerStatOrder) {
    if (a[stat] !== b[stat]) return b[stat] - a[stat];
  }
  /* istanbul ignore next */
  return 0;
}

export default class Move {
  constructor(move = {}) {
    this.gen = Number(move.gen ?? maxGen);
    this.id = moveId(move.id);
    if (typeof move.name === "string") this.name = move.name;

    this.user = move.user;
    this.target = move.target;

    if (move.numberOfHits == null) {
      if (this.user && this.user.ability.name === "Skill Link") {
        this.numberOfHits = maxHits(this.id, this.gen);
      } else if (
        this.name === "Water Shuriken" &&
        this.user &&
        this.user.name === "Greninja-Ash"
      ) {
        this.numberOfHits = 3;
      } else {
        this.numberOfHits = 0;
      }
    } else {
      this.numberOfHits = Number(move.numberOfHits);
    }

    this.critical = Boolean(move.critical);
    this.zMove = Boolean(move.zMove);
    this.beatUpHit = Number(move.beatUpHit ?? 0);
    this.secondHit = Boolean(move.secondHit);
    this.meFirst = Boolean(move.meFirst);
    this.furyCutter = Number(move.furyCutter ?? 0);
    this.echoedVoice = Number(move.echoedVoice ?? 0);
    this.trumpPP = Number(move.trumpPP ?? 5);
    this.roundBoost = Boolean(move.roundBoost);
    this.minimize = Boolean(move.minimize);
    this.dig = Boolean(move.dig);
    this.dive = Boolean(move.dive);
    this.fly = Boolean(move.fly);
    this.present = Number(move.present ?? -1);
  }

  get name() {
    if (this.zMove) {
      if (this.user && this.id === this.user.item.zMoveTransformsFrom()) {
        return moveName(this.user.item.zMoveTransformsTo());
      }
      return zMoves[this.type()];
    }
    return moveName(this.id);
  }

  set name(moveName) {
    this.id = moveId(String(moveName));
  }

  power() {
    if (this.zMove) {
      if (this.user && this.id === this.user.item.zMoveTransformsFrom()) {
        return movePower(this.user.item.zMoveTransformsTo(), this.gen);
      }
      return zMovePower(this.id, this.gen);
    }
    return movePower(this.id, this.gen);
  }

  type() {
    return moveType(this.id, this.gen);
  }

  damageClass() {
    return moveDamageClass(this.id, this.gen);
  }

  isPhysical() {
    return this.damageClass() === DamageClasses.PHYSICAL;
  }

  isSpecial() {
    return this.damageClass() === DamageClasses.SPECIAL;
  }

  isOther() {
    return this.damageClass() === DamageClasses.OTHER;
  }

  priority() {
    return priority(this.id, this.gen);
  }

  isPsyshockLike() {
    return ["Psyshock", "Psystrike", "Secret Sword"].includes(this.name);
  }

  hasRecoil() {
    return Boolean(recoil(this.id, this.gen));
  }

  affectedBySheerForce() {
    return hasSecondaryEffect(this.id, this.gen);
  }

  isPunch() {
    return hasPunchFlag(this.id, this.gen);
  }

  isContact() {
    return hasContactFlag(this.id, this.gen);
  }

  isSound() {
    return hasSoundFlag(this.id, this.gen);
  }

  isPowder() {
    return hasPowderFlag(this.id, this.gen);
  }

  isBite() {
    return hasBiteFlag(this.id, this.gen);
  }

  isPulse() {
    return hasPulseFlag(this.id, this.gen);
  }

  isBall() {
    return hasBulletFlag(this.id, this.gen);
  }

  minHits() {
    return minHits(this.id, this.gen);
  }

  maxHits() {
    return maxHits(this.id, this.gen);
  }

  hitsMultipleTimes() {
    return this.maxHits() > 1;
  }

  hasMultipleTargets() {
    return hitsMultipleTargets(this.id, this.gen);
  }

  isOhko() {
    return isOhkoMove(this.id, this.gen);
  }

  isExplosion() {
    return ["Explosion", "Mind Blown", "Self-Destruct"].includes(this.name);
  }

  requiresRecharge() {
    return requiresRecharge(this.id, this.gen);
  }

  isRecklessBoosted() {
    return (
      this.hasRecoil() ||
      this.name === "Jump Kick" ||
      this.name === "High Jump Kick"
    );
  }

  canCrit() {
    if (this.gen >= Gens.HGSS) return true;
    return ![
      "Reversal",
      "Flail",
      "Future Sight",
      "Doom Desire",
      "Spit Up"
    ].includes(this.name);
  }

  affectedByParentalBond() {
    return ![
      "Endeavor",
      "Explosion",
      "Final Gambit",
      "Fling",
      "Self-Destruct"
    ].includes(this.name);
  }

  optimalHappiness() {
    return this.name === "Return" ? 255 : 0;
  }

  usesHappiness() {
    return this.name === "Return" || this.name === "Frustration";
  }

  ignoresAbilities() {
    return moveIgnoresAbilities(this.id, this.gen);
  }

  ignoresDefenseBoosts() {
    return ["Chip Away", "Sacred Sword", "Darkest Lariat"].includes(this.name);
  }

  boostedByDig() {
    return this.name === "Earthquake" || this.name === "Magnitude";
  }

  boostedByDive() {
    return this.name === "Surf" || this.name === "Whirlpool";
  }

  boostedByFly() {
    return this.name === "Gust" || this.name === "Twister";
  }

  boostedByMinimize() {
    switch (this.name) {
      case "Stomp":
        return this.gen >= Gens.GSC;
      case "Astonish":
      case "Extrasensory":
      case "Needle Arm":
        return this.gen === Gens.ADV;
      case "Steamroller":
        return this.gen >= Gens.B2W2;
      case "Body Slam":
      case "Dragon Rush":
      case "Flying Press":
      case "Shadow Force":
      case "Phantom Force":
        return this.gen >= Gens.ORAS;
      case "Heavy Slam":
        return this.gen >= Gens.SM;
      default:
        return false;
    }
  }

  weakenedByGrassyTerrain() {
    return ["Bulldoze", "Earthquake", "Magnitude"].includes(this.name);
  }

  usesMaxAttackingStat() {
    return ["Photon Geyser", "Light That Burns the Sky"].includes(this.name);
  }

  isHiddenPower() {
    return this.name.startsWith("Hidden Power");
  }

  static hiddenPowers(typeId, gen) {
    if (gen < Gens.ADV) {
      if (typeId < 1 || typeId > 16) {
        return [];
      }
      const t = typeId - 1;
      return [
        [
          ((t & 4) << 1) | ((t & 1) << 2) | 3,
          (t >> 2) | 12,
          (t & 3) | 12,
          15,
          15,
          15
        ]
      ];
    }

    if (gen < Gens.SM) {
      const hiddenPowers = [];
      // check if each possible hidden power matches the type
      for (let i = 0; i < 64; i++) {
        const ivs = [
          i & 1 ? 31 : 30,
          i & 2 ? 31 : 30,
          i & 4 ? 31 : 30,
          i & 8 ? 31 : 30,
          i & 16 ? 31 : 30,
          i & 32 ? 31 : 30
        ];
        if (typeId === Move.hiddenPowerType(ivs)) {
          hiddenPowers.push(ivs);
        }
      }
      return hiddenPowers.sort(ivsCmp);
    }

    return [[31, 31, 31, 31, 31, 31]];
  }

  static hiddenPowerBp(ivs, gen) {
    // differs for gsc
    if (gen < Gens.ADV) {
      const bits =
        (ivs[Stats.SPC] >> 3) |
        ((ivs[Stats.SPD] >> 2) & 2) |
        ((ivs[Stats.DEF] >> 1) & 4) |
        (ivs[Stats.ATK] & 8);
      return 31 + Math.trunc((5 * bits + (ivs[Stats.SPC] & 3)) / 2);
    }

    // just a weird formula involving the second bit of the pokemon's IVs
    if (gen < Gens.ORAS) {
      const bits =
        ((ivs[Stats.HP] & 2) >> 1) |
        (ivs[Stats.ATK] & 2) |
        ((ivs[Stats.DEF] & 2) << 1) |
        ((ivs[Stats.SPD] & 2) << 2) |
        ((ivs[Stats.SATK] & 2) << 3) |
        ((ivs[Stats.SDEF] & 2) << 4);
      return 30 + Math.trunc((bits * 40) / 63);
    }

    // constant in oras
    return 60;
  }

  static hiddenPowerType(ivs, gen) {
    // Another weird formula involving the first bit (even/odd) of the
    // pokemon's IVs. Also differs in gsc.
    if (gen < Gens.ADV) {
      return 1 + (((ivs[Stats.ATK] & 3) << 2) | (ivs[Stats.DEF] & 3));
    }

    const bits =
      (ivs[Stats.HP] & 1) |
      ((ivs[Stats.ATK] & 1) << 1) |
      ((ivs[Stats.DEF] & 1) << 2) |
      ((ivs[Stats.SPD] & 1) << 3) |
      ((ivs[Stats.SATK] & 1) << 4) |
      ((ivs[Stats.SDEF] & 1) << 5);
    return 1 + Math.trunc((bits * 15) / 63);
  }

  static flail(currentHealth, totalHealth, gen) {
    if (gen === Gens.HGSS) {
      const p = Math.trunc((64 * currentHealth) / totalHealth);
      if (p < 2) return 200;
      if (p < 6) return 150;
      if (p < 13) return 100;
      if (p < 22) return 80;
      if (p < 43) return 40;
      return 20;
    }

    const p = Math.trunc((48 * currentHealth) / totalHealth);
    if (p <= 1) return 200;
    if (p <= 4) return 150;
    if (p <= 9) return 100;
    if (p <= 16) return 80;
    if (p <= 32) return 40;
    return 20;
  }

  static magnitude(magnitude) {
    return [10, 30, 50, 70, 90, 110, 150][magnitude - 4];
  }

  static weatherBall(weather) {
    if (weather === Weathers.SUN || weather === Weathers.HARSH_SUN) {
      return Types.FIRE;
    }
    if (weather === Weathers.RAIN || weather === Weathers.HEAVY_RAIN) {
      return Types.WATER;
    }
    if (weather === Weathers.SAND) {
      return Types.ROCK;
    }
    if (weather === Weathers.HAIL) {
      return Types.ICE;
    }
    return Types.NORMAL;
  }

  static trumpCard(ppLeft) {
    return [200, 80, 60, 50, 40][clamp(ppLeft, 0, 4)];
  }

  static electroBall(attackerSpeed, defenderSpeed) {
    const s = attackerSpeed / Math.max(1, defenderSpeed);
    if (s >= 4) return 150;
    if (s >= 3) return 120;
    if (s >= 2) return 80;
    if (s >= 1) return 60;
    return 40;
  }

  static gyroBall(attackerSpeed, defenderSpeed) {
    return Math.min(
      150,
      Math.trunc((25 * defenderSpeed) / Math.max(attackerSpeed, 1))
    );
  }

  static grassKnot(weight) {
    // w in kg * 10
    if (weight >= 2000) return 120;
    if (weight >= 1000) return 100;
    if (weight >= 500) return 80;
    if (weight >= 250) return 60;
    if (weight >= 100) return 40;
    return 20;
  }

  static heavySlam(attackerWeight, defenderWeight) {
    const w = Math.trunc(attackerWeight / defenderWeight);
    if (w >= 5) return 120;
    if (w === 4) return 100;
    if (w === 3) return 80;
    if (w === 2) return 60;
    return 40;
  }

  static punishment(boosts) {
    let statBoostTotal = 0;
    for (const boost of boosts.slice(1, 8)) {
      if (boost > 0) {
        statBoostTotal += boost;
      }
    }
    return Math.min(120, 60 + 20 * statBoostTotal);
  }

  static storedPower(boosts) {
    let statBoostTotal = 0;
    for (const boost of boosts.slice(1, 8)) {
      if (boost > 0) {
        statBoostTotal += boost;
      }
    }
    return 20 + 20 * statBoostTotal;
  }

  static frustration(happiness) {
    return Math.max(1, Math.trunc(((255 - happiness) * 10) / 25));
  }

  static return(happiness) {
    return Math.max(1, Math.trunc((happiness * 10) / 25));
  }

  static eruption(hp, totalHp) {
    return Math.max(1, Math.trunc((150 * hp) / totalHp));
  }
}
