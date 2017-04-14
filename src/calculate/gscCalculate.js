import Move from "../Move";
import {isPhysicalType, isSpecialType, effectiveness} from "../info";

import {
    Gens, Stats, Types, damageVariation,
    scaleStat, needsScaling
} from "../utilities";

const {max, min, trunc} = Math;

export default function gscCalculate(attacker, defender, move, field) {
    let moveType = move.type();
    let movePower = move.power();

    if (movePower === 0) return [0];

    switch (move.name) {
        case "Hidden Power":
            moveType = Move.hiddenPowerType(attacker.ivs, Gens.GSC);
            movePower = Move.hiddenPowerBp(attacker.ivs, Gens.GSC);
            break;
        case "Reversal":
        case "Flail":
            movePower = Move.flail(attacker.currentHp,
                                   attacker.stat(Stats.HP),
                                   Gens.GSC);
            break;
        case "Frustration":
            movePower = Move.frustration(attacker.happiness);
            break;
        case "Return":
            movePower = Move.return(attacker.happiness);
            break;
        case "Future Sight":
            moveType = Types.CURSE;
            break;
        case "Magnitude":
            movePower = Move.magnitude(move.magnitude);
            break;
        case "Present":
            movePower = move.present;
            break;
        case "Rollout":
            movePower = 30 * 2 ** ((move.rollout - 1) % 5 + move.defenseCurl);
            break;
        case "Triple Kick":
            movePower = 10 * move.tripleKickCount;
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
        case "Psywave": {
            // according to crystal_, it really is 1-149
            const range = [];
            const maxPsywave = trunc(attacker.level * 3 / 2);
            for (let i = 1; i < maxPsywave; i++) {
                range.push(i);
            }
            return range;
        }
        case "Super Fang":
            return [max(1, trunc(defender.currentHp / 2))];
        default:
            if (move.isOhko()) return [65535];
    }

    if (move.dig && move.boostedByDig()
        || move.fly && move.boostedByFly()) {
        movePower *= 2;
    }

    let lvl = attacker.level;
    const defBoost = defender.boost(Stats.DEF);
    const atkBoost = attacker.boost(Stats.ATK);
    const sdefBoost = defender.boost(Stats.SDEF);
    const satkBoost = attacker.boost(Stats.SATK);

    // crits are weird. thanks to crystal_ and the gsc community on
    // the mt. silver boards for figuring them out.
    const ignorePhysicalBoosts = move.critical && atkBoost <= defBoost;
    const ignoreSpecialBoosts = move.critical && satkBoost <= sdefBoost;

    let atk, def;
    if (ignorePhysicalBoosts) {
        atk = attacker.stat(Stats.ATK);
        def = defender.stat(Stats.DEF);
    } else {
        atk = attacker.boostedStat(Stats.ATK);
        def = defender.boostedStat(Stats.DEF);
    }

    let satk, sdef;
    if (ignoreSpecialBoosts) {
        satk = attacker.stat(Stats.SATK);
        sdef = defender.stat(Stats.SDEF);
    } else {
        satk = attacker.boostedStat(Stats.SATK);
        sdef = defender.boostedStat(Stats.SDEF);
    }

    if (attacker.isBurned() && !ignorePhysicalBoosts) {
        atk = trunc(atk / 2);
    }

    if (defender.reflect && !ignorePhysicalBoosts) def *= 2;
    if (defender.lightScreen && !ignoreSpecialBoosts) sdef *= 2;

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
        d = max(1, scaleStat(d));
    }
    // in-game Crystal would repeatedly shift by 2 until it fits in a byte

    if (attacker.name === "Ditto" && attacker.item.name === "Metal Powder") {
        d = trunc(d * 3 / 2);
        if (needsScaling(d)) {
            a = scaleStat(a, 1);
            d = max(1, scaleStat(d, 1));
        }
    }

    if (move.name === "Explosion" || move.name === "Self-Destruct") {
        d = max(1, trunc(d / 2));
    }

    if (move.name === "Beat Up") {
        a = attacker.beatUpStats[move.beatUpHit];
        lvl = attacker.beatUpLevels[move.beatUpHit];
        d = defender.baseStat(Stats.DEF);
    }

    d = max(1, d);
    let baseDamage = trunc(trunc(trunc(2 * lvl / 5 + 2)
                                 * movePower * a / d) / 50);

    if (move.critical) {
        baseDamage *= 2;
    }

    if (attacker.item.boostedType() === moveType) {
        baseDamage = trunc(baseDamage * 110 / 100);
    }

    baseDamage = min(997, baseDamage) + 2;

    if (field.sun()) {
        if (moveType === Types.FIRE) {
            baseDamage = trunc(baseDamage * 3 / 2);
        } else if (moveType === Types.WATER) {
            baseDamage = trunc(baseDamage / 2);
        }
    } else if (field.rain()) {
        if (moveType === Types.WATER) {
            baseDamage = trunc(baseDamage * 3 / 2);
        } else if (moveType === Types.FIRE || move.name === "Solar Beam") {
            baseDamage = trunc(baseDamage / 2);
        }
    }

    if (attacker.stab(moveType)) {
        baseDamage = trunc(baseDamage * 3 / 2);
    }

    const eff = effectiveness(moveType, defender.types(), {
        gen: Gens.GSC,
        foresight: defender.foresight
    });
    if (eff.num === 0) return [0];
    baseDamage = trunc(baseDamage * eff.num / eff.den);

    // these don't have damage variance
    if (move.name === "Reversal" || move.name === "Flail") {
        return [baseDamage];
    }

    let damages = damageVariation(baseDamage, 217, 255);

    if (move.name === "Pursuit" && defender.switchedOut) {
        damages = damages.map(d => 2 * d);
    }

    return damages;
}
