import Pokemon from "../Pokemon";
import Move from "../Move";
import Field from "../Field";
import { isPhysicalType, isSpecialType } from "../info";
import {
  Stat,
  Type,
  damageVariation,
  scaleStat,
  needsScaling
} from "../utilities";
import moveInfo from "./moveInfo";

const typeToPresent: { [key in Type]?: number } = {
  [Type.NORMAL]: 0,
  [Type.FIGHTING]: 1,
  [Type.FLYING]: 2,
  [Type.POISON]: 3,
  [Type.GROUND]: 4,
  [Type.ROCK]: 5,
  [Type.BUG]: 7,
  [Type.GHOST]: 8,
  [Type.STEEL]: 9,
  [Type.FIRE]: 20,
  [Type.WATER]: 21,
  [Type.GRASS]: 22,
  [Type.ELECTRIC]: 23,
  [Type.PSYCHIC]: 24,
  [Type.ICE]: 25,
  [Type.DRAGON]: 26,
  [Type.DARK]: 27
};

export default (
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
): number[] => {
  const info = moveInfo(attacker, defender, move, field);
  if (info.fail || info.effectiveness[0] === 0) return [0];
  const { moveType, movePower, effectiveness } = info;

  let level = attacker.level;
  const atkBoost = attacker.boost(Stat.ATK);
  const defBoost = defender.boost(Stat.DEF);
  const satkBoost = attacker.boost(Stat.SATK);
  const sdefBoost = defender.boost(Stat.SDEF);

  let atk, def;
  if (move.critical && atkBoost <= defBoost) {
    atk = attacker.stat(Stat.ATK);
    def = defender.stat(Stat.DEF);
  } else {
    atk = attacker.boostedStat(Stat.ATK);
    def = defender.boostedStat(Stat.DEF);
    if (attacker.isBurned()) atk = Math.trunc(atk / 2);
    if (defender.reflect) def *= 2;
  }

  let satk, sdef;
  if (move.critical && satkBoost <= sdefBoost) {
    satk = attacker.stat(Stat.SATK);
    sdef = defender.stat(Stat.SDEF);
  } else {
    satk = attacker.boostedStat(Stat.SATK);
    sdef = defender.boostedStat(Stat.SDEF);
    if (defender.lightScreen) sdef *= 2;
  }

  if (attacker.thickClubBoosted()) atk *= 2;
  if (attacker.lightBallBoosted()) satk *= 2;

  let a, d;
  if (isPhysicalType(moveType)) {
    a = atk;
    d = def;
  } else if (isSpecialType(moveType)) {
    a = satk;
    d = sdef;
  } else {
    return [0];
  }

  if (needsScaling(a, d)) {
    a = scaleStat(a);
    d = Math.max(1, scaleStat(d));
  }
  // in-game Crystal would repeatedly shift by 2 until it fits in a byte

  if (attacker.name === "Ditto" && attacker.item.name === "Metal Powder") {
    d = Math.trunc((d * 3) / 2);
    if (needsScaling(d)) {
      a = scaleStat(a, 1);
      d = Math.max(1, scaleStat(d, 1));
    }
  }

  if (move.isExplosion()) {
    d = Math.max(1, Math.trunc(d / 2));
  }

  if (move.name === "Beat Up") {
    a = attacker.beatUpStats[move.beatUpHit];
    d = defender.baseStat(Stat.DEF);
    level = attacker.beatUpLevels[move.beatUpHit];
  } else if (move.name === "Present") {
    a = Math.floor((10 * effectiveness[0]) / effectiveness[1]);
    // intentionally switches the attacker and defender's secondary types
    d = typeToPresent[attacker.secondaryType()] || 0;
    level = typeToPresent[defender.secondaryType()] || 0;
  }

  d = Math.max(1, d);
  let baseDamage = Math.trunc(
    Math.trunc((Math.trunc((2 * level) / 5 + 2) * movePower * a) / d) / 50
  );

  if (move.critical) {
    baseDamage *= 2;
  }

  if (attacker.item.boostedType() === moveType) {
    baseDamage = Math.trunc((baseDamage * 110) / 100);
  }

  baseDamage = Math.min(997, baseDamage) + 2;

  if (field.sun()) {
    if (moveType === Type.FIRE) {
      baseDamage = Math.trunc((baseDamage * 3) / 2);
    } else if (moveType === Type.WATER) {
      baseDamage = Math.trunc(baseDamage / 2);
    }
  } else if (field.rain()) {
    if (moveType === Type.WATER) {
      baseDamage = Math.trunc((baseDamage * 3) / 2);
    } else if (moveType === Type.FIRE || move.name === "Solar Beam") {
      baseDamage = Math.trunc(baseDamage / 2);
    }
  }

  if (attacker.stab(moveType)) {
    baseDamage = Math.trunc((baseDamage * 3) / 2);
  }

  baseDamage = Math.trunc((baseDamage * effectiveness[0]) / effectiveness[1]);

  // these don't have damage variance
  if (move.name === "Reversal" || move.name === "Flail") {
    return [baseDamage];
  }

  let damages = damageVariation(baseDamage, 217, 255);

  if (move.name === "Pursuit" && defender.switchedOut) {
    damages = damages.map(d => 2 * d);
  }

  return damages;
};
