import { isPhysicalType } from "../info";
import { Stats, damageVariation, scaleStat, needsScaling } from "../utilities";
import moveInfo from "./moveInfo";

export default (attacker, defender, move, field) => {
  const { moveType, movePower, effectiveness, fail } = moveInfo(
    attacker,
    defender,
    move,
    field
  );
  if (fail || effectiveness[0] === 0) return [0];

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
    if (attacker.isBurned()) atk = Math.trunc(atk / 2);
    if (defender.reflect) def *= 2;
    if (defender.lightScreen) spcD *= 2;
  }

  if (needsScaling(atk, def)) {
    atk = Math.max(1, scaleStat(atk));
    def = scaleStat(def);
  }

  if (needsScaling(spcA, spcD)) {
    spcA = Math.max(1, scaleStat(spcA));
    spcD = scaleStat(spcD);
  }

  if (move.isExplosion()) {
    def = Math.trunc(def / 2);
  }

  let a, d;
  if (isPhysicalType(moveType)) {
    a = atk;
    d = def;
  } else {
    a = spcA;
    d = spcD;
  }

  // Technically the game would procede with division by zero and crash.
  // I might add a case to notify for this. Maybe an optional argument.
  d = Math.max(1, d);

  let baseDamage = Math.trunc(
    Math.trunc((Math.trunc((2 * level) / 5 + 2) * movePower * a) / d) / 50
  );
  baseDamage = Math.min(997, baseDamage) + 2;

  if (attacker.stab(moveType)) {
    baseDamage = Math.trunc((baseDamage * 3) / 2);
  }

  baseDamage = Math.trunc((baseDamage * effectiveness[0]) / effectiveness[1]);

  const damages = damageVariation(baseDamage, 217, 255);

  return damages;
};
