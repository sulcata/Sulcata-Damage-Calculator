import { clamp } from "lodash";
import {
  hasBiteFlag,
  hasBulletFlag,
  hasContactFlag,
  hasPowderFlag,
  hasPulseFlag,
  hasPunchFlag,
  hasSecondaryEffect,
  hasSoundFlag,
  hitsMultipleTargets,
  isOhkoMove,
  maxHits,
  minHits,
  moveDamageClass,
  moveId,
  moveIgnoresAbilities,
  moveName,
  movePower,
  moveType,
  priority,
  recoil,
  requiresRecharge,
  zMovePower
} from "./info";
import Pokemon from "./Pokemon";
import {
  BaseStat,
  BoostList,
  DamageClass,
  Generation,
  maxGen,
  Stat,
  StatList,
  Type,
  Weather
} from "./utilities";

const zMoves: { [key in Type]?: string } = {
  [Type.NORMAL]: "Breakneck Blitz",
  [Type.FIGHTING]: "All-Out Pummeling",
  [Type.FLYING]: "Supersonic Skystrike",
  [Type.POISON]: "Acid Downpour",
  [Type.GROUND]: "Tectonic Rage",
  [Type.ROCK]: "Continental Crush",
  [Type.BUG]: "Savage Spin-Out",
  [Type.GHOST]: "Never-Ending Nightmare",
  [Type.STEEL]: "Corkscrew Crash",
  [Type.FIRE]: "Inferno Overdrive",
  [Type.WATER]: "Hydro Vortex",
  [Type.GRASS]: "Bloom Doom",
  [Type.ELECTRIC]: "Gigavolt Havoc",
  [Type.PSYCHIC]: "Shattered Psyche",
  [Type.ICE]: "Subzero Slammer",
  [Type.DRAGON]: "Devastating Drake",
  [Type.DARK]: "Black Hole Eclipse",
  [Type.FAIRY]: "Twinkle Tackle"
};

const hiddenPowerStatOrder: BaseStat[] = [
  Stat.SPD,
  Stat.SATK,
  Stat.HP,
  Stat.DEF,
  Stat.SDEF,
  Stat.ATK
];

function ivsCmp(a: StatList, b: StatList): number {
  for (const stat of hiddenPowerStatOrder) {
    if (a[stat] !== b[stat]) return b[stat] - a[stat];
  }
  /* istanbul ignore next */
  return 0;
}

export type MoveOptions = Partial<Move> & { name?: string };

export default class Move {
  public gen: Generation = maxGen;
  public id: string = "nomove";
  public user: Pokemon | undefined = undefined;
  public target: Pokemon | undefined = undefined;
  public critical: boolean = false;
  public zMove: boolean = false;
  public secondHit: boolean = false;
  public meFirst: boolean = false;
  public roundBoost: boolean = false;
  public minimize: boolean = false;
  public dig: boolean = false;
  public dive: boolean = false;
  public fly: boolean = false;
  public previouslyFainted: boolean = false;
  public fusionFlare: boolean = false;
  public fusionBolt: boolean = false;
  public pledgeBoost: boolean = false;
  public defenseCurl: boolean = false;
  public magnitude: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = 2;
  public tripleKickCount: number = 0;
  public rollout: number = 0;
  public beatUpHit: number = 0;
  public numberOfHits: number = 0;
  public furyCutter: number = 0;
  public echoedVoice: number = 0;
  public trumpPP: number = 5;
  public present: number = -1;

  constructor(move: Move | MoveOptions = {}) {
    const { id, name, numberOfHits, ...rest } = move;
    Object.assign(this, rest);

    if (typeof id === "string") {
      this.id = moveId(id);
    } else if (typeof name === "string") {
      this.name = name;
    }

    if (numberOfHits === undefined && this.user) {
      if (this.user.ability.name === "Skill Link") {
        this.numberOfHits = maxHits(this.id, this.gen);
      } else if (
        this.name === "Water Shuriken" &&
        this.user.name === "Greninja-Ash"
      ) {
        this.numberOfHits = 3;
      }
    } else if (numberOfHits !== undefined) {
      this.numberOfHits = numberOfHits;
    }
  }

  public get name(): string {
    if (this.zMove && this.user) {
      const transformsTo = this.user.item.zMoveTransformsTo();
      const transformsFrom = this.user.item.zMoveTransformsFrom();
      if (transformsTo && this.id === transformsFrom) {
        return moveName(transformsTo);
      }
    }
    if (this.zMove) {
      const zMoveName = zMoves[this.type()];
      if (zMoveName !== undefined) {
        return zMoveName;
      }
    }
    return moveName(this.id);
  }

  public set name(moveName: string) {
    this.id = moveId(moveName);
  }

  public power(): number {
    if (this.zMove) {
      const transformsFrom = this.user && this.user.item.zMoveTransformsFrom();
      const transformsTo = this.user && this.user.item.zMoveTransformsTo();
      if (this.id === transformsFrom && transformsTo) {
        return movePower(transformsTo, this.gen);
      }
      return zMovePower(this.id, this.gen);
    }
    return movePower(this.id, this.gen);
  }

  public type(): Type {
    return moveType(this.id, this.gen);
  }

  public damageClass(): DamageClass {
    return moveDamageClass(this.id, this.gen);
  }

  public isPhysical(): boolean {
    return this.damageClass() === DamageClass.PHYSICAL;
  }

  public isSpecial(): boolean {
    return this.damageClass() === DamageClass.SPECIAL;
  }

  public isOther(): boolean {
    return this.damageClass() === DamageClass.OTHER;
  }

  public priority(): number {
    return priority(this.id, this.gen);
  }

  public isPsyshockLike(): boolean {
    return ["Psyshock", "Psystrike", "Secret Sword"].includes(this.name);
  }

  public hasRecoil(): boolean {
    return Boolean(recoil(this.id, this.gen));
  }

  public affectedBySheerForce(): boolean {
    return hasSecondaryEffect(this.id, this.gen);
  }

  public isPunch(): boolean {
    return hasPunchFlag(this.id, this.gen);
  }

  public isContact(): boolean {
    return hasContactFlag(this.id, this.gen);
  }

  public isSound(): boolean {
    return hasSoundFlag(this.id, this.gen);
  }

  public isPowder(): boolean {
    return hasPowderFlag(this.id, this.gen);
  }

  public isBite(): boolean {
    return hasBiteFlag(this.id, this.gen);
  }

  public isPulse(): boolean {
    return hasPulseFlag(this.id, this.gen);
  }

  public isBall(): boolean {
    return hasBulletFlag(this.id, this.gen);
  }

  public minHits(): number {
    return minHits(this.id, this.gen);
  }

  public maxHits(): number {
    return maxHits(this.id, this.gen);
  }

  public hitsMultipleTimes(): boolean {
    return this.maxHits() > 1;
  }

  public hasMultipleTargets(): boolean {
    return hitsMultipleTargets(this.id, this.gen);
  }

  public isOhko(): boolean {
    return isOhkoMove(this.id, this.gen);
  }

  public isExplosion(): boolean {
    return ["Explosion", "Mind Blown", "Self-Destruct"].includes(this.name);
  }

  public requiresRecharge(): boolean {
    return requiresRecharge(this.id, this.gen);
  }

  public isRecklessBoosted(): boolean {
    return (
      this.hasRecoil() ||
      this.name === "Jump Kick" ||
      this.name === "High Jump Kick"
    );
  }

  public canCrit(): boolean {
    if (this.gen >= Generation.HGSS) return true;
    return ![
      "Reversal",
      "Flail",
      "Future Sight",
      "Doom Desire",
      "Spit Up"
    ].includes(this.name);
  }

  public affectedByParentalBond(): boolean {
    return ![
      "Endeavor",
      "Explosion",
      "Final Gambit",
      "Fling",
      "Self-Destruct"
    ].includes(this.name);
  }

  public optimalHappiness(): number {
    return this.name === "Return" ? 255 : 0;
  }

  public usesHappiness(): boolean {
    return this.name === "Return" || this.name === "Frustration";
  }

  public ignoresAbilities(): boolean {
    return moveIgnoresAbilities(this.id, this.gen);
  }

  public ignoresDefenseBoosts(): boolean {
    return ["Chip Away", "Sacred Sword", "Darkest Lariat"].includes(this.name);
  }

  public boostedByDig(): boolean {
    return this.name === "Earthquake" || this.name === "Magnitude";
  }

  public boostedByDive(): boolean {
    return this.name === "Surf" || this.name === "Whirlpool";
  }

  public boostedByFly(): boolean {
    return this.name === "Gust" || this.name === "Twister";
  }

  public boostedByMinimize(): boolean {
    switch (this.name) {
      case "Stomp":
        return this.gen >= Generation.GSC;
      case "Astonish":
      case "Extrasensory":
      case "Needle Arm":
        return this.gen === Generation.ADV;
      case "Steamroller":
        return this.gen >= Generation.B2W2;
      case "Body Slam":
      case "Dragon Rush":
      case "Flying Press":
      case "Shadow Force":
      case "Phantom Force":
        return this.gen >= Generation.ORAS;
      case "Heavy Slam":
        return this.gen >= Generation.SM;
      default:
        return false;
    }
  }

  public weakenedByGrassyTerrain(): boolean {
    return ["Bulldoze", "Earthquake", "Magnitude"].includes(this.name);
  }

  public usesMaxAttackingStat(): boolean {
    return ["Photon Geyser", "Light That Burns the Sky"].includes(this.name);
  }

  public isHiddenPower(): boolean {
    return this.name.startsWith("Hidden Power");
  }

  public static hiddenPowers(type: Type, gen: Generation): StatList[] {
    if (gen < Generation.ADV) {
      if (type < Type.FIGHTING || type > Type.DARK) {
        return [];
      }
      const t = type - 1;
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

    if (gen < Generation.SM) {
      const hiddenPowers = [];
      // check if each possible hidden power matches the type
      for (let i = 0; i < 64; i++) {
        const ivs: StatList = [
          i & 1 ? 31 : 30,
          i & 2 ? 31 : 30,
          i & 4 ? 31 : 30,
          i & 8 ? 31 : 30,
          i & 16 ? 31 : 30,
          i & 32 ? 31 : 30
        ];
        if (type === Move.hiddenPowerType(ivs, Generation.ORAS)) {
          hiddenPowers.push(ivs);
        }
      }
      return hiddenPowers.sort(ivsCmp);
    }

    return [[31, 31, 31, 31, 31, 31]];
  }

  public static hiddenPowerBp(ivs: StatList, gen: Generation): number {
    // differs for gsc
    if (gen < Generation.ADV) {
      const bits =
        (ivs[Stat.SPC] >> 3) |
        ((ivs[Stat.SPD] >> 2) & 2) |
        ((ivs[Stat.DEF] >> 1) & 4) |
        (ivs[Stat.ATK] & 8);
      return 31 + Math.trunc((5 * bits + (ivs[Stat.SPC] & 3)) / 2);
    }

    // just a weird formula involving the second bit of the pokemon's IVs
    if (gen < Generation.ORAS) {
      const bits =
        ((ivs[Stat.HP] & 2) >> 1) |
        (ivs[Stat.ATK] & 2) |
        ((ivs[Stat.DEF] & 2) << 1) |
        ((ivs[Stat.SPD] & 2) << 2) |
        ((ivs[Stat.SATK] & 2) << 3) |
        ((ivs[Stat.SDEF] & 2) << 4);
      return 30 + Math.trunc((bits * 40) / 63);
    }

    // constant in oras
    return 60;
  }

  public static hiddenPowerType(ivs: StatList, gen: Generation): Type {
    // Another weird formula involving the first bit (even/odd) of the
    // pokemon's IVs. Also differs in gsc.
    if (gen < Generation.ADV) {
      return (1 + (((ivs[Stat.ATK] & 3) << 2) | (ivs[Stat.DEF] & 3))) as Type;
    }

    const bits =
      (ivs[Stat.HP] & 1) |
      ((ivs[Stat.ATK] & 1) << 1) |
      ((ivs[Stat.DEF] & 1) << 2) |
      ((ivs[Stat.SPD] & 1) << 3) |
      ((ivs[Stat.SATK] & 1) << 4) |
      ((ivs[Stat.SDEF] & 1) << 5);
    return (1 + Math.trunc((bits * 15) / 63)) as Type;
  }

  public static flail(
    currentHealth: number,
    totalHealth: number,
    gen: Generation
  ): number {
    if (gen === Generation.HGSS) {
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

  public static magnitude(magnitude: number): number {
    return [10, 30, 50, 70, 90, 110, 150][magnitude - 4];
  }

  public static weatherBall(weather: Weather): Type {
    if (weather === Weather.SUN || weather === Weather.HARSH_SUN) {
      return Type.FIRE;
    }
    if (weather === Weather.RAIN || weather === Weather.HEAVY_RAIN) {
      return Type.WATER;
    }
    if (weather === Weather.SAND) {
      return Type.ROCK;
    }
    if (weather === Weather.HAIL) {
      return Type.ICE;
    }
    return Type.NORMAL;
  }

  public static trumpCard(ppLeft: number): number {
    return [200, 80, 60, 50, 40][clamp(ppLeft, 0, 4)];
  }

  public static electroBall(
    attackerSpeed: number,
    defenderSpeed: number
  ): number {
    const s = Math.floor(attackerSpeed / Math.max(1, defenderSpeed));
    if (s >= 4) return 150;
    if (s >= 3) return 120;
    if (s >= 2) return 80;
    if (s >= 1) return 60;
    return 40;
  }

  public static gyroBall(attackerSpeed: number, defenderSpeed: number): number {
    return Math.min(
      150,
      Math.trunc((25 * defenderSpeed) / Math.max(attackerSpeed, 1))
    );
  }

  public static grassKnot(weight: number): number {
    // w in kg * 10
    if (weight >= 2000) return 120;
    if (weight >= 1000) return 100;
    if (weight >= 500) return 80;
    if (weight >= 250) return 60;
    if (weight >= 100) return 40;
    return 20;
  }

  public static heavySlam(
    attackerWeight: number,
    defenderWeight: number
  ): number {
    const w = Math.trunc(attackerWeight / defenderWeight);
    if (w >= 5) return 120;
    if (w === 4) return 100;
    if (w === 3) return 80;
    if (w === 2) return 60;
    return 40;
  }

  public static punishment(boosts: BoostList): number {
    let statBoostTotal = 0;
    for (const boost of boosts.slice(1, 8)) {
      if (boost > 0) {
        statBoostTotal += boost;
      }
    }
    return Math.min(120, 60 + 20 * statBoostTotal);
  }

  public static storedPower(boosts: BoostList): number {
    let statBoostTotal = 0;
    for (const boost of boosts.slice(1, 8)) {
      if (boost > 0) {
        statBoostTotal += boost;
      }
    }
    return 20 + 20 * statBoostTotal;
  }

  public static frustration(happiness: number): number {
    return Math.max(1, Math.trunc(((255 - happiness) * 10) / 25));
  }

  public static return(happiness: number): number {
    return Math.max(1, Math.trunc((happiness * 10) / 25));
  }

  public static eruption(hp: number, totalHp: number): number {
    return Math.max(1, Math.trunc((150 * hp) / totalHp));
  }
}
