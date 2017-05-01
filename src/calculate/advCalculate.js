import Move from "../Move";
import {Gens, Stats, Types, damageVariation} from "../utilities";
import {isPhysicalType, isSpecialType, effectiveness} from "../info";

const {max, min, trunc} = Math;

export default function advCalculate(attacker, defender, move, field) {
    let moveType = move.type();
    let movePower = move.power();

    if (movePower === 0) return [0];

    if (move.isSound() && defender.ability.name === "Soundproof") {
        return [0];
    }

    switch (move.name) {
        case "Hidden Power":
            movePower = Move.hiddenPowerBp(attacker.ivs, Gens.ADV);
            moveType = Move.hiddenPowerType(attacker.ivs, Gens.ADV);
            break;
        case "Reversal":
        case "Flail":
            movePower = Move.flail(attacker.currentHp,
                                   attacker.stat(Stats.HP),
                                   Gens.ADV);
            break;
        case "Frustration":
            movePower = Move.frustration(attacker.happiness);
            break;
        case "Return":
            movePower = Move.return(attacker.happiness);
            break;
        case "Future Sight":
        case "Doom Desire":
            moveType = Types.CURSE;
            break;
        case "Magnitude":
            movePower = Move.magnitude(move.magnitude);
            break;
        case "Present":
            movePower = move.present;
            break;
        case "Weather Ball":
            moveType = Move.weatherBall(field.effectiveWeather());
            break;
        case "Rollout":
        case "Ice Ball":
            movePower = 30 * 2 ** ((move.rollout - 1) % 5 + move.defenseCurl);
            break;
        case "Triple Kick":
            movePower = 10 * move.tripleKickCount;
            break;
        case "Water Spout":
        case "Eruption":
            movePower = Move.eruption(
                attacker.currentHp, attacker.stat(Stats.HP));
            break;
        case "Fury Cutter":
            movePower = min(160, 10 * 2 ** move.furyCutter);
            break;
        case "Beat Up":
            moveType = Types.CURSE;
            break;
        case "Seismic Toss":
        case "Night Shade":
            return [attacker.level];
        case "Dragon Rage":
            return [40];
        case "Sonic Boom":
            return [20];
        case "Endeavor":
            return [max(0, defender.currentHp - attacker.currentHp)];
        case "Psywave": {
            const range = [];
            for (let i = 0; i <= 10; i++) {
                range.push(max(1, trunc(attacker.level * (10 * i + 50) / 100)));
            }
            return range;
        }
        case "Super Fang":
            return [max(1, trunc(defender.currentHp / 2))];
        default:
            if (move.isOhko()) return [defender.stat(Stats.HP)];
    }

    if (move.dig && move.boostedByDig()
        || move.dive && move.boostedByDive()
        || move.fly && move.boostedByFly()) {
        movePower *= 2;
    }

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

    if (field.mudSport && moveType === Types.ELECTRIC) {
        movePower = trunc(movePower / 2);
    }

    if (field.waterSport && moveType === Types.FIRE) {
        movePower = trunc(movePower / 2);
    }

    if (attacker.pinchAbilityActivated(moveType)) {
        movePower = trunc(movePower * 3 / 2);
    }

    if (move.name === "Self-Destruct" || move.name === "Explosion") {
        if (defender.ability.name === "Damp") {
            return [0];
        }
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

    let a, d, lvl;
    if (move.name === "Beat Up") {
        a = attacker.beatUpStats[move.beatUpHit];
        lvl = attacker.beatUpLevels[move.beatUpHit];
        d = defender.baseStat(Stats.DEF);
    } else if (isPhysicalType(moveType)) {
        a = atk;
        lvl = attacker.level;
        d = def;
    } else if (isSpecialType(moveType)) {
        a = satk;
        lvl = attacker.level;
        d = sdef;
    } else {
        return [0];
    }

    let baseDamage = trunc(trunc(trunc(2 * lvl / 5 + 2)
                                 * movePower * a / d) / 50);

    if (move.name !== "Beat Up") {
        if (attacker.isBurned() && attacker.ability.name !== "Guts") {
            baseDamage = trunc(baseDamage / 2);
        }

        if (!move.critical
            && (defender.reflect && isPhysicalType(moveType)
                || defender.lightScreen && isSpecialType(moveType))) {
            baseDamage = trunc(field.multiBattle ? baseDamage * 2 / 3
                                                 : baseDamage / 2);
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

    if (move.name === "Spit Up") {
        return [attacker.stockpile > 0 ? baseDamage : 0];
    }

    const damages = damageVariation(baseDamage, 85, 100);

    return damages;
}
