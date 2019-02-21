import Field from "../Field";
import { isPhysicalType } from "../info";
import Move from "../Move";
import Pokemon from "../Pokemon";
import { damageVariation, needsScaling, scaleStat, Stat } from "../utilities";
import moveInfo from "./moveInfo";

export default (
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
): number[] => {
  const info = moveInfo(attacker, defender, move, field);
  if (info.fail || info.effectiveness[0] === 0) return [0];
  const { moveType, movePower, effectiveness } = info;

  let level, atk, def, spcA, spcD;
  if (move.critical) {
    level = 2 * attacker.level;
    atk = attacker.stat(Stat.ATK);
    def = defender.stat(Stat.DEF);
    spcA = attacker.stat(Stat.SPC);
    spcD = defender.stat(Stat.SPC);
  } else {
    level = attacker.level;
    atk = attacker.boostedStat(Stat.ATK);
    def = defender.boostedStat(Stat.DEF);
    spcA = attacker.boostedStat(Stat.SPC);
    spcD = defender.boostedStat(Stat.SPC);
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
