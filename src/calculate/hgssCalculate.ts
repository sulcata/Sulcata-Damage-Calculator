import Field from "../Field";
import Move from "../Move";
import Pokemon from "../Pokemon";
import { damageVariation, Stat, Type } from "../utilities";
import moveInfo from "./moveInfo";

export default (
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
): number[] => {
  const info = moveInfo(attacker, defender, move, field);
  if (info.fail || info.effectiveness[0] === 0) return [0];
  const {
    moveType,
    movePower,
    effectiveness,
    superEffective,
    notVeryEffective
  } = info;

  let atk, def, sdef, satk;
  const unawareA = attacker.ability.name === "Unaware";
  const unawareD = defender.ability.name === "Unaware";
  if (move.critical) {
    if (unawareA) {
      def = defender.stat(Stat.DEF);
      sdef = defender.stat(Stat.SDEF);
    } else {
      def = Math.min(defender.stat(Stat.DEF), defender.boostedStat(Stat.DEF));
      sdef = Math.min(
        defender.stat(Stat.SDEF),
        defender.boostedStat(Stat.SDEF)
      );
    }
    if (unawareD) {
      atk = attacker.stat(Stat.ATK);
      satk = attacker.stat(Stat.SATK);
    } else {
      atk = Math.max(attacker.stat(Stat.ATK), attacker.boostedStat(Stat.ATK));
      satk = Math.max(
        attacker.stat(Stat.SATK),
        attacker.boostedStat(Stat.SATK)
      );
    }
  } else {
    if (unawareA) {
      def = defender.stat(Stat.DEF);
      sdef = defender.stat(Stat.SDEF);
    } else {
      def = defender.boostedStat(Stat.DEF);
      sdef = defender.boostedStat(Stat.SDEF);
    }
    if (unawareD) {
      atk = attacker.stat(Stat.ATK);
      satk = attacker.stat(Stat.SATK);
    } else {
      atk = attacker.boostedStat(Stat.ATK);
      satk = attacker.boostedStat(Stat.SATK);
    }
  }

  if (
    attacker.ability.name === "Huge Power" ||
    attacker.ability.name === "Pure Power"
  ) {
    atk *= 2;
  }

  if (attacker.flowerGift && field.sun()) {
    atk *= 2;
  }

  switch (attacker.ability.name) {
    case "Guts":
      if (attacker.status) atk = Math.trunc((atk * 3) / 2);
      break;
    case "Hustle":
      atk = Math.trunc((atk * 3) / 2);
      break;
    case "Slow Start":
      if (attacker.slowStart) atk = Math.trunc(atk / 2);
      break;
    case "Plus":
      if (attacker.minus) satk = Math.trunc((satk * 3) / 2);
      break;
    case "Minus":
      if (attacker.plus) satk = Math.trunc((satk * 3) / 2);
      break;
    case "Solar Power":
      if (field.sun()) satk *= 2;
      break;
    /* no default */
  }

  switch (attacker.item.name) {
    case "Choice Band":
      atk = Math.trunc((atk * 3) / 2);
      break;
    case "Choice Specs":
      satk = Math.trunc((satk * 3) / 2);
      break;
    case "Soul Dew":
      if (attacker.name === "Latias" || attacker.name === "Latios") {
        satk = Math.trunc((satk * 3) / 2);
      }
      break;
    case "Deep Sea Tooth":
      if (attacker.name === "Clamperl") satk *= 2;
      break;
    default:
      if (attacker.thickClubBoosted()) {
        atk *= 2;
      } else if (attacker.lightBallBoosted()) {
        atk *= 2;
        satk *= 2;
      }
  }

  if (move.isExplosion()) {
    def = Math.trunc(def / 2);
  }

  if (defender.ability.name === "Marvel Scale" && defender.status) {
    def = Math.trunc((def * 3) / 2);
  }

  if (defender.flowerGift && field.sun()) {
    sdef = Math.trunc((sdef * 3) / 2);
  }

  switch (defender.item.name) {
    case "Metal Powder":
      if (defender.name === "Ditto") def *= 2;
      break;
    case "Soul Dew":
      if (defender.name === "Latias" || defender.name === "Latios") {
        sdef = Math.trunc((sdef * 3) / 2);
      }
      break;
    case "Deep Sea Scale":
      if (defender.name === "Clamperl") sdef *= 2;
      break;
    /* no default */
  }

  if (field.sand() && defender.stab(Type.ROCK)) {
    sdef = Math.trunc((sdef * 3) / 2);
  }

  let a, d, level;
  if (move.name === "Beat Up") {
    a = attacker.beatUpStats[move.beatUpHit];
    d = defender.baseStat(Stat.DEF);
    level = attacker.beatUpLevels[move.beatUpHit];
  } else if (move.isPhysical()) {
    a = atk;
    d = def;
    level = attacker.level;
  } else if (move.isSpecial()) {
    a = satk;
    d = sdef;
    level = attacker.level;
  } else {
    return [0];
  }

  let baseDamage = Math.trunc(
    Math.trunc((Math.trunc((2 * level) / 5 + 2) * movePower * a) / d) / 50
  );

  if (move.name !== "Beat Up") {
    if (
      attacker.isBurned() &&
      move.isPhysical() &&
      attacker.ability.name !== "Guts"
    ) {
      baseDamage = Math.trunc(baseDamage / 2);
    }

    if (
      !move.critical &&
      ((defender.reflect && move.isPhysical()) ||
        (defender.lightScreen && move.isSpecial()))
    ) {
      baseDamage = field.multiBattle
        ? Math.trunc((baseDamage * 2) / 3)
        : Math.trunc(baseDamage / 2);
    }
  }

  if (field.multiBattle && move.hasMultipleTargets()) {
    baseDamage = Math.trunc((baseDamage * 3) / 4);
  }

  if (move.name !== "Weather Ball") {
    if (field.sun()) {
      if (moveType === Type.FIRE) {
        baseDamage = Math.trunc((baseDamage * 3) / 2);
      } else if (moveType === Type.WATER) {
        baseDamage = Math.trunc(baseDamage / 2);
      }
    } else if (field.rain()) {
      if (moveType === Type.WATER) {
        baseDamage = Math.trunc((baseDamage * 3) / 2);
      } else if (moveType === Type.FIRE) {
        baseDamage = Math.trunc(baseDamage / 2);
      }
    }
    if (!field.sun() && !field.isClearWeather() && move.name === "Solar Beam") {
      baseDamage = Math.trunc(baseDamage / 2);
    }
  }

  if (
    attacker.flashFire &&
    moveType === Type.FIRE &&
    attacker.ability.name === "Flash Fire"
  ) {
    baseDamage = Math.trunc((baseDamage * 3) / 2);
  }

  baseDamage += 2;

  if (move.critical) {
    baseDamage *= attacker.ability.name === "Sniper" ? 3 : 2;
  }

  if (move.name !== "Beat Up") {
    if (attacker.item.name === "Life Orb") {
      baseDamage = Math.trunc((baseDamage * 13) / 10);
    } else if (attacker.item.name === "Metronome") {
      const m = Math.min(20, 10 + attacker.metronome);
      baseDamage = Math.trunc((baseDamage * m) / 10);
    }

    if (move.meFirst) {
      baseDamage = Math.trunc((baseDamage * 3) / 2);
    }
  }

  let damages = damageVariation(baseDamage, 85, 100);

  if (attacker.stab(moveType)) {
    damages = damages.map(d => Math.trunc((d * 3) / 2));
  }

  damages = damages.map(d =>
    Math.trunc((d * effectiveness[0]) / effectiveness[1])
  );

  if (superEffective) {
    if (defender.ability.reducesSuperEffective()) {
      damages = damages.map(d => Math.trunc((d * 3) / 4));
    }

    if (attacker.item.name === "Expert Belt") {
      damages = damages.map(d => Math.trunc((d * 12) / 10));
    }

    if (moveType === defender.item.berryTypeResist()) {
      damages = damages.map(d => Math.trunc(d / 2));
    }
  } else if (notVeryEffective && attacker.ability.name === "Tinted Lens") {
    damages = damages.map(d => 2 * d);
  }

  if (
    defender.item.berryTypeResist() === Type.NORMAL &&
    moveType === Type.NORMAL
  ) {
    damages = damages.map(d => Math.trunc(d / 2));
  }

  return damages;
};
