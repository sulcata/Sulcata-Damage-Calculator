import { isPhysicalType, effectiveness } from "../info";
import {
  Gens,
  Stats,
  damageVariation,
  scaleStat,
  needsScaling
} from "../utilities";

const { max, min, trunc } = Math;

export default (attacker, defender, move) => {
  let level, atk, def, spcA, spcD;
  if (move.critical) {
    level = 2 * attacker.level;
    atk = attacker.stat(Stats.ATK);
    def = defender.stat(Stats.DEF);
    spcA = attacker.stat(Stats.SPC);
    spcD = defender.stat(Stats.SPC);
  } else {
    level = attacker.level;
    atk = attacker.boostedStat(Stats.ATK);
    def = defender.boostedStat(Stats.DEF);
    spcA = attacker.boostedStat(Stats.SPC);
    spcD = defender.boostedStat(Stats.SPC);
    if (attacker.isBurned()) atk = trunc(atk / 2);
    if (defender.reflect) def *= 2;
    if (defender.lightScreen) spcD *= 2;
  }

  if (needsScaling(atk, def)) {
    atk = max(1, scaleStat(atk));
    def = scaleStat(def);
  }

  if (needsScaling(spcA, spcD)) {
    spcA = max(1, scaleStat(spcA));
    spcD = scaleStat(spcD);
  }

  if (move.isExplosion()) {
    def = trunc(def / 2);
  }

  let a, d;
  if (isPhysicalType(move.type())) {
    a = atk;
    d = def;
  } else {
    a = spcA;
    d = spcD;
  }

  // Technically the game would procede with division by zero and crash.
  // I might add a case to notify for this. Maybe an optional argument.
  d = max(1, d);

  let baseDamage = trunc(
    trunc(trunc(2 * level / 5 + 2) * move.power() * a / d) / 50
  );
  baseDamage = min(997, baseDamage) + 2;

  if (attacker.stab(move.type())) {
    baseDamage = trunc(baseDamage * 3 / 2);
  }

  const eff = effectiveness(move.type(), defender.types(), { gen: Gens.RBY });
  if (eff.num === 0) return [0];
  baseDamage = trunc(baseDamage * eff.num / eff.den);

  const damages = damageVariation(baseDamage, 217, 255);

  return damages;
};
