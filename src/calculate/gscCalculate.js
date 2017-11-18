import { isPhysicalType, isSpecialType } from "../info";
import {
  Stats,
  Types,
  damageVariation,
  scaleStat,
  needsScaling
} from "../utilities";
import moveInfo from "./moveInfo";

export default (attacker, defender, move, field) => {
  const { moveType, movePower, effectiveness, fail } = moveInfo(
    attacker,
    defender,
    move,
    field
  );
  if (fail || effectiveness[0] === 0) return [0];

  let level = attacker.level;
  const atkBoost = attacker.boost(Stats.ATK);
  const defBoost = defender.boost(Stats.DEF);
  const satkBoost = attacker.boost(Stats.SATK);
  const sdefBoost = defender.boost(Stats.SDEF);

  let atk, def;
  if (move.critical && atkBoost <= defBoost) {
    atk = attacker.stat(Stats.ATK);
    def = defender.stat(Stats.DEF);
  } else {
    atk = attacker.boostedStat(Stats.ATK);
    def = defender.boostedStat(Stats.DEF);
    if (attacker.isBurned()) atk = Math.trunc(atk / 2);
    if (defender.reflect) def *= 2;
  }

  let satk, sdef;
  if (move.critical && satkBoost <= sdefBoost) {
    satk = attacker.stat(Stats.SATK);
    sdef = defender.stat(Stats.SDEF);
  } else {
    satk = attacker.boostedStat(Stats.SATK);
    sdef = defender.boostedStat(Stats.SDEF);
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
    d = Math.trunc(d * 3 / 2);
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
    d = defender.baseStat(Stats.DEF);
    level = attacker.beatUpLevels[move.beatUpHit];
  }

  d = Math.max(1, d);
  let baseDamage = Math.trunc(
    Math.trunc(Math.trunc(2 * level / 5 + 2) * movePower * a / d) / 50
  );

  if (move.critical) {
    baseDamage *= 2;
  }

  if (attacker.item.boostedType() === moveType) {
    baseDamage = Math.trunc(baseDamage * 110 / 100);
  }

  baseDamage = Math.min(997, baseDamage) + 2;

  if (field.sun()) {
    if (moveType === Types.FIRE) {
      baseDamage = Math.trunc(baseDamage * 3 / 2);
    } else if (moveType === Types.WATER) {
      baseDamage = Math.trunc(baseDamage / 2);
    }
  } else if (field.rain()) {
    if (moveType === Types.WATER) {
      baseDamage = Math.trunc(baseDamage * 3 / 2);
    } else if (moveType === Types.FIRE || move.name === "Solar Beam") {
      baseDamage = Math.trunc(baseDamage / 2);
    }
  }

  if (attacker.stab(moveType)) {
    baseDamage = Math.trunc(baseDamage * 3 / 2);
  }

  baseDamage = Math.trunc(baseDamage * effectiveness[0] / effectiveness[1]);

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
