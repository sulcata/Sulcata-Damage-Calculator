import {Gens, Stats, Types, damageVariation} from "../utilities";
import {isPhysicalType, isSpecialType, effectiveness} from "../info";
import moveInfo from "./moveInfo";

const {max, trunc} = Math;

export default function advCalculate(attacker, defender, move, field) {
    const {moveType, movePower, fail} = moveInfo(attacker, defender,
                                                 move, field);
    if (fail) return [0];

    let atk = attacker.stat(Stats.ATK);
    let satk = attacker.stat(Stats.SATK);
    let def = defender.stat(Stats.DEF);
    let sdef = defender.stat(Stats.SDEF);

    if (attacker.ability.name === "Huge Power"
        || attacker.ability.name === "Pure Power") {
        atk *= 2;
    }

    switch (attacker.item.name) {
        case "Choice Band":
            atk = trunc(atk * 3 / 2);
            break;
        case "Soul Dew":
            if (attacker.name === "Latias" || attacker.name === "Latios") {
                satk = trunc(satk * 3 / 2);
            }
            break;
        case "Deep Sea Tooth":
            if (attacker.name === "Clamperl") satk *= 2;
            break;
        case "Sea Incense":
            satk = trunc(satk * 105 / 100);
            break;
        default:
            if (attacker.item.boostedType() === moveType) {
                // make sure we are boosting the right stat
                if (isPhysicalType(moveType)) {
                    atk = trunc(atk * 110 / 100);
                } else {
                    satk = trunc(satk * 110 / 100);
                }
            } else if (attacker.thickClubBoosted()) {
                atk *= 2;
            } else if (attacker.lightBallBoosted()) {
                satk *= 2;
            }
    }

    switch (defender.item.name) {
        case "Soul Dew":
            if (defender.name === "Latias" || defender.name === "Latios") {
                sdef = trunc(sdef * 3 / 2);
            }
            break;
        case "Deep Sea Scale":
            if (defender.name === "Clamperl") sdef *= 2;
            break;
        case "Metal Powder":
            if (defender.name === "Ditto") def *= 2;
            break;
        /* no default */
    }

    switch (attacker.ability.name) {
        case "Hustle":
            atk = trunc(atk * 3 / 2);
            break;
        case "Plus":
            if (attacker.minus) satk = trunc(satk * 3 / 2);
            break;
        case "Minus":
            if (attacker.plus) satk = trunc(satk * 3 / 2);
            break;
        case "Guts":
            if (attacker.status) atk = trunc(atk * 3 / 2);
            break;
        /* no default */
    }

    switch (defender.ability.name) {
        case "Thick Fat":
            if (moveType === Types.FIRE || moveType === Types.ICE) {
                satk = trunc(satk / 2);
            }
            break;
        case "Marvel Scale":
            if (defender.status) def = trunc(def * 3 / 2);
            break;
        /* no default */
    }

    if (move.isExplosion()) {
        def = max(1, trunc(def / 2));
    }

    if (move.critical) {
        atk = trunc(atk * max(2, 2 + attacker.boosts[Stats.ATK]) / 2);
        satk = trunc(satk * max(2, 2 + attacker.boosts[Stats.SATK]) / 2);
        def = trunc(def * 2 / max(2, 2 - defender.boosts[Stats.DEF]));
        sdef = trunc(sdef * 2 / max(2, 2 - defender.boosts[Stats.SDEF]));
    } else {
        atk = trunc(atk * max(2, 2 + attacker.boosts[Stats.ATK])
                        / max(2, 2 - attacker.boosts[Stats.ATK]));
        satk = trunc(satk * max(2, 2 + attacker.boosts[Stats.SATK])
                          / max(2, 2 - attacker.boosts[Stats.SATK]));
        def = trunc(def * max(2, 2 + defender.boosts[Stats.DEF])
                        / max(2, 2 - defender.boosts[Stats.DEF]));
        sdef = trunc(sdef * max(2, 2 + defender.boosts[Stats.SDEF])
                          / max(2, 2 - defender.boosts[Stats.SDEF]));
    }

    let a, d, level;
    if (move.name === "Beat Up") {
        a = attacker.beatUpStats[move.beatUpHit];
        d = defender.baseStat(Stats.DEF);
        level = attacker.beatUpLevels[move.beatUpHit];
    } else if (isPhysicalType(moveType)) {
        a = atk;
        d = def;
        level = attacker.level;
    } else if (isSpecialType(moveType)) {
        a = satk;
        d = sdef;
        level = attacker.level;
    } else {
        return [0];
    }

    let baseDamage = trunc(trunc(trunc(2 * level / 5 + 2)
                                 * movePower * a / d) / 50);

    if (move.name !== "Beat Up") {
        if (attacker.isBurned() && attacker.ability.name !== "Guts") {
            baseDamage = trunc(baseDamage / 2);
        }

        if (!move.critical
            && (defender.reflect && isPhysicalType(moveType)
                || defender.lightScreen && isSpecialType(moveType))) {
            baseDamage = trunc(
                field.multiBattle ? baseDamage * 2 / 3 : baseDamage / 2);
        }
    }

    if (field.multiBattle && move.hasMultipleTargets()) {
        baseDamage = trunc(baseDamage / 2);
    }

    if (move.name !== "Weather Ball") {
        if (field.sun()) {
            if (moveType === Types.FIRE) {
                baseDamage = trunc(baseDamage * 3 / 2);
            } else if (moveType === Types.WATER) {
                baseDamage = trunc(baseDamage / 2);
            }
        } else if (field.rain()) {
            if (moveType === Types.WATER) {
                baseDamage = trunc(baseDamage * 3 / 2);
            } else if (moveType === Types.FIRE) {
                baseDamage = trunc(baseDamage / 2);
            }
        }
        if (!field.sun() && !field.isClearWeather()
            && move.name === "Solar Beam") {
            baseDamage = trunc(baseDamage / 2);
        }
    }

    if (attacker.flashFire && moveType === Types.FIRE
        && attacker.ability.name === "Flash Fire") {
        baseDamage = trunc(baseDamage * 3 / 2);
    }

    if (isPhysicalType(moveType)) {
        baseDamage = max(1, baseDamage);
    }

    baseDamage += 2;

    if (move.critical) {
        baseDamage *= 2;
    }

    switch (move.name) {
        case "Facade":
            if (attacker.status) baseDamage *= 2;
            break;
        case "Pursuit":
            if (defender.switchedOut) baseDamage *= 2;
            break;
        case "Revenge":
            if (attacker.damagedPreviously) baseDamage *= 2;
            break;
        case "Smelling Salts":
            if (defender.isParalyzed()) baseDamage *= 2;
            break;
        case "Weather Ball":
            if (!field.isClearWeather()) baseDamage *= 2;
            break;
        /* no default */
    }

    if (move.minimize && move.boostedByMinimize()) {
        baseDamage *= 2;
    }

    if (attacker.charge && moveType === Types.ELECTRIC) {
        baseDamage *= 2;
    }

    if (attacker.helpingHand) {
        baseDamage = trunc(baseDamage * 3 / 2);
    }

    if (attacker.stab(moveType)) {
        baseDamage = trunc(baseDamage * 3 / 2);
    }

    let eff = effectiveness(moveType, defender.types(), {
        gen: Gens.ADV,
        foresight: defender.foresight
    });
    if (moveType === defender.ability.immunityType()) {
        eff = {num: 0, den: 2};
    }
    if (eff.num === 0) return [0];
    baseDamage = trunc(baseDamage * eff.num / eff.den);

    if (move.name === "Spit Up") return [baseDamage];

    const damages = damageVariation(baseDamage, 85, 100);

    return damages;
}
