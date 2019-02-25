import Field from "../Field";
import Move from "../Move";
import Pokemon from "../Pokemon";
import {
  applyMod,
  applyModAll,
  chainMod,
  damageVariation,
  Stat,
  Type
} from "../utilities";
import moveInfo from "./moveInfo";

/*
 * TODO
 * Moves:
 * Shell Trap
 * Guardian of Alola 75% HP
 * Revelation Dance
 * Sparkling Aria heals burns
 * Baneful Bunker poisons
 * Burn Up
 *
 * Abilities:
 * Stakeout
 * Soul-Heart
 * Shields Down
 * Schooling
 */
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

  const defStat = field.wonderRoom ? Stat.SDEF : Stat.DEF;
  const sdefStat = field.wonderRoom ? Stat.DEF : Stat.SDEF;
  const unawareA = attacker.ability.name === "Unaware";
  const unawareD = defender.ability.name === "Unaware";
  let atk, def, satk, sdef;
  if (move.name === "Foul Play") {
    if (unawareA) {
      def = defender.stat(defStat);
      sdef = defender.stat(sdefStat);
      atk = defender.stat(Stat.ATK);
    } else if (move.critical) {
      def = Math.min(defender.stat(defStat), defender.boostedStat(defStat));
      sdef = Math.min(defender.stat(sdefStat), defender.boostedStat(sdefStat));
      atk = Math.max(defender.stat(Stat.ATK), defender.boostedStat(Stat.ATK));
    } else {
      def = defender.boostedStat(defStat);
      sdef = defender.boostedStat(sdefStat);
      atk = defender.boostedStat(Stat.ATK);
    }

    if (unawareD) {
      satk = attacker.stat(Stat.SATK);
    } else if (move.critical) {
      satk = Math.max(
        attacker.stat(Stat.SATK),
        attacker.boostedStat(Stat.SATK)
      );
    } else {
      satk = attacker.boostedStat(Stat.SATK);
    }
  } else if (move.ignoresDefenseBoosts()) {
    def = defender.stat(defStat);
    sdef = defender.stat(sdefStat);

    if (unawareD) {
      atk = attacker.stat(Stat.ATK);
      satk = attacker.stat(Stat.SATK);
    } else if (move.critical) {
      atk = Math.max(attacker.stat(Stat.ATK), attacker.boostedStat(Stat.ATK));
      satk = Math.max(
        attacker.stat(Stat.SATK),
        attacker.boostedStat(Stat.SATK)
      );
    } else {
      atk = attacker.boostedStat(Stat.ATK);
      satk = attacker.boostedStat(Stat.SATK);
    }
  } else {
    if (unawareA) {
      def = defender.stat(defStat);
      sdef = defender.stat(sdefStat);
    } else if (move.critical) {
      def = Math.min(defender.stat(defStat), defender.boostedStat(defStat));
      sdef = Math.min(defender.stat(sdefStat), defender.boostedStat(sdefStat));
    } else {
      def = defender.boostedStat(defStat);
      sdef = defender.boostedStat(sdefStat);
    }

    if (unawareD) {
      atk = attacker.stat(Stat.ATK);
      satk = attacker.stat(Stat.SATK);
    } else if (move.critical) {
      atk = Math.max(attacker.stat(Stat.ATK), attacker.boostedStat(Stat.ATK));
      satk = Math.max(
        attacker.stat(Stat.SATK),
        attacker.boostedStat(Stat.SATK)
      );
    } else {
      atk = attacker.boostedStat(Stat.ATK);
      satk = attacker.boostedStat(Stat.SATK);
    }
  }

  let atkMod = 0x1000;
  let satkMod = 0x1000;

  if (
    defender.ability.name === "Thick Fat" &&
    (moveType === Type.FIRE || moveType === Type.ICE)
  ) {
    atkMod = chainMod(0x800, atkMod);
    satkMod = chainMod(0x800, satkMod);
  }

  switch (attacker.ability.name) {
    case "Guts":
      if (defender.status) atkMod = chainMod(0x1800, atkMod);
      break;
    case "Plus":
      if (attacker.minus) satkMod = chainMod(0x1800, satkMod);
      break;
    case "Minus":
      if (attacker.plus) satkMod = chainMod(0x1800, satkMod);
      break;
    case "Defeatist":
      if (attacker.currentHp * 2 <= attacker.stat(Stat.HP)) {
        atkMod = chainMod(0x800, atkMod);
        satkMod = chainMod(0x800, satkMod);
      }
      break;
    case "Huge Power":
    case "Pure Power":
      atkMod = chainMod(0x2000, atkMod);
      break;
    case "Solar Power":
      if (field.sun()) satkMod = chainMod(0x1800, satkMod);
      break;
    case "Hustle":
      atk = applyMod(0x1800, atk);
      break;
    case "Flash Fire":
      if (attacker.flashFire && moveType === Type.FIRE) {
        atkMod = chainMod(0x1800, atkMod);
        satkMod = chainMod(0x1800, satkMod);
      }
      break;
    case "Slow Start":
      if (attacker.slowStart) atkMod = chainMod(0x800, atkMod);
      break;
    default:
      if (attacker.pinchAbilityActivated(moveType)) {
        // blaze, torrent, overgrow, ...
        atkMod = chainMod(0x1800, atkMod);
        satkMod = chainMod(0x1800, satkMod);
      }
  }

  if (attacker.flowerGift && field.sun()) {
    atkMod = chainMod(0x1800, atkMod);
  }

  if (attacker.battery) {
    satkMod = chainMod(0x14cd, satkMod);
  }

  switch (attacker.item.name) {
    case "Deep Sea Tooth":
      if (attacker.name === "Clamperl") {
        satkMod = chainMod(0x2000, satkMod);
      }
      break;
    case "Choice Band":
      atkMod = chainMod(0x1800, atkMod);
      break;
    case "Choice Specs":
      satkMod = chainMod(0x1800, satkMod);
      break;
    default:
      if (attacker.thickClubBoosted()) {
        atkMod = chainMod(0x2000, atkMod);
      } else if (attacker.lightBallBoosted()) {
        atkMod = chainMod(0x2000, atkMod);
        satkMod = chainMod(0x2000, satkMod);
      }
  }

  atk = applyMod(atkMod, atk);
  satk = applyMod(satkMod, satk);

  if (field.sand() && defender.stab(Type.ROCK)) {
    sdef = applyMod(0x1800, sdef);
  }

  let defMod = 0x1000;
  let sdefMod = 0x1000;

  if (defender.ability.name === "Marvel Scale" && defender.status) {
    defMod = chainMod(0x1800, defMod);
  } else if (defender.ability.name === "Grass Pelt" && field.grassyTerrain()) {
    defMod = chainMod(0x1800, defMod);
  }

  if (defender.flowerGift && field.sun()) {
    sdefMod = chainMod(0x1800, sdefMod);
  }

  switch (defender.item.name) {
    case "Deep Sea Scale":
      if (defender.name === "Clamperl") {
        sdefMod = chainMod(0x1800, sdefMod);
      }
      break;
    case "Metal Powder":
      if (defender.name === "Ditto") {
        defMod = chainMod(0x2000, defMod);
      }
      break;
    case "Eviolite":
      if (defender.hasEvolution()) {
        defMod = chainMod(0x1800, defMod);
        sdefMod = chainMod(0x1800, sdefMod);
      }
      break;
    case "Assault Vest":
      sdefMod = chainMod(0x1800, sdefMod);
      break;
    /* no default */
  }

  def = applyMod(defMod, def);
  sdef = applyMod(sdefMod, sdef);

  let a, d;
  if (move.usesMaxAttackingStat()) {
    a = Math.max(atk, satk);
    d = sdef;
  } else if (move.isPsyshockLike()) {
    a = satk;
    d = def;
  } else if (move.isPhysical()) {
    a = atk;
    d = def;
  } else if (move.isSpecial()) {
    a = satk;
    d = sdef;
  } else {
    return [0];
  }

  let baseDamage = Math.trunc(
    Math.trunc((Math.trunc((2 * attacker.level) / 5 + 2) * movePower * a) / d) /
      50
  );
  baseDamage += 2;

  if (field.multiBattle && move.hasMultipleTargets()) {
    baseDamage = applyMod(0xc00, baseDamage);
  }

  if (move.name !== "Weather Ball") {
    if (
      (field.harshSun() && moveType === Type.WATER) ||
      (field.heavyRain() && moveType === Type.FIRE)
    ) {
      return [0];
    }
    if (field.sun()) {
      if (moveType === Type.FIRE) {
        baseDamage = applyMod(0x1800, baseDamage);
      } else if (moveType === Type.WATER) {
        baseDamage = applyMod(0x800, baseDamage);
      }
    } else if (field.rain()) {
      if (moveType === Type.WATER) {
        baseDamage = applyMod(0x1800, baseDamage);
      } else if (moveType === Type.FIRE) {
        baseDamage = applyMod(0x800, baseDamage);
      }
    }
  }

  if (
    ((field.grassyTerrain() && moveType === Type.GRASS) ||
      (field.electricTerrain() && moveType === Type.ELECTRIC) ||
      (field.psychicTerrain() && moveType === Type.PSYCHIC)) &&
    attacker.isGrounded(field)
  ) {
    baseDamage = applyMod(0x1800, baseDamage);
  }

  if (
    field.mistyTerrain() &&
    defender.isGrounded(field) &&
    moveType === Type.DRAGON
  ) {
    baseDamage = applyMod(0x800, baseDamage);
  }

  if (move.critical) {
    baseDamage = applyMod(0x1800, baseDamage);
  }

  let damages = damageVariation(baseDamage, 85, 100);

  if (attacker.stab(moveType) || attacker.ability.name === "Protean") {
    damages =
      attacker.ability.name === "Adaptability"
        ? applyModAll(0x2000, damages)
        : applyModAll(0x1800, damages);
  }

  damages = damages.map(d =>
    Math.trunc((d * effectiveness[0]) / effectiveness[1])
  );

  if (
    attacker.isBurned() &&
    move.isPhysical() &&
    attacker.ability.name !== "Guts" &&
    move.name !== "Facade"
  ) {
    damages = damages.map(d => Math.trunc(d / 2));
  }

  damages = damages.map(d => Math.max(1, d));

  let finalMod = 0x1000;

  if (!move.critical && attacker.ability.name !== "Infiltrator") {
    if (defender.reflect && (move.isPhysical() || move.isPsyshockLike())) {
      finalMod = chainMod(field.multiBattle ? 0xa8f : 0x800, finalMod);
    }
    if (defender.lightScreen && move.isSpecial() && !move.isPsyshockLike()) {
      finalMod = chainMod(field.multiBattle ? 0xa8f : 0x800, finalMod);
    }
  }

  if (defender.multiscaleIsActive()) {
    finalMod = chainMod(0x800, finalMod);
  }

  if (
    defender.ability.name === "Fur Coat" &&
    (move.isPhysical() || move.isPsyshockLike())
  ) {
    finalMod = chainMod(0x800, finalMod);
  }

  if (notVeryEffective && attacker.ability.name === "Tinted Lens") {
    finalMod = chainMod(0x2000, finalMod);
  }

  if (defender.friendGuard) {
    finalMod = chainMod(0xc00, finalMod);
  }

  if (defender.auroraVeil) {
    finalMod = chainMod(field.multiBattle ? 0xaaa : 0x800, finalMod);
  }

  if (attacker.ability.name === "Sniper" && move.critical) {
    finalMod = chainMod(0x1800, finalMod);
  }

  if (superEffective && defender.ability.reducesSuperEffective()) {
    finalMod = chainMod(0xc00, finalMod);
  }

  if (field.grassyTerrain() && move.weakenedByGrassyTerrain()) {
    finalMod = chainMod(0x800, finalMod);
  }

  switch (attacker.item.name) {
    case "Metronome":
      if (attacker.metronome <= 4) {
        const mod = 0x1000 + attacker.metronome * 0x333;
        finalMod = chainMod(mod, finalMod);
      } else {
        finalMod = chainMod(0x2000, finalMod);
      }
      break;
    case "Expert Belt":
      if (superEffective) {
        finalMod = chainMod(0x1333, finalMod);
      }
      break;
    case "Life Orb":
      finalMod = chainMod(0x14cc, finalMod);
      break;
    /* no default */
  }

  if (
    defender.item.berryTypeResist() === moveType &&
    (superEffective || moveType === Type.NORMAL)
  ) {
    finalMod = chainMod(0x800, finalMod);
    defender.item.used = true;
  }

  if (
    (move.dig && move.boostedByDig()) ||
    (move.dive && move.boostedByDive()) ||
    (move.minimize && move.boostedByMinimize())
  ) {
    finalMod = chainMod(0x2000, finalMod);
  }

  damages = applyModAll(finalMod, damages);

  return damages;
};
