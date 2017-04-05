import {physicalType, effective} from "../info";

import {
    Gens, Stats, damageVariation,
    scaleStat, needsScaling
} from "../utilities";

const {max, min, trunc} = Math;

export default function rbyCalculate(attacker, defender, move) {
    if (move.other) return [0];

    switch (move.name) {
        case "Seismic Toss":
        case "Night Shade":
            return [attacker.level];
        case "Dragon Rage":
            return [40];
        case "Sonic Boom":
            return [20];
        case "Psywave": {
            // intentionally 1-149
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
            if (move.ohko) return [65535];
    }

    let lvl, atk, def, spcA, spcD;
    if (move.critical) {
        lvl = 2 * attacker.level;
        atk = attacker.stat(Stats.ATK);
        def = defender.stat(Stats.DEF);
        spcA = attacker.stat(Stats.SPC);
        spcD = defender.stat(Stats.SPC);
    } else {
        lvl = attacker.level;
        atk = attacker.boostedStat(Stats.ATK);
        if (attacker.burned) atk = trunc(atk / 2);
        def = defender.boostedStat(Stats.DEF);
        spcA = attacker.boostedStat(Stats.SPC);
        spcD = defender.boostedStat(Stats.SPC);
    }

    if (defender.reflect && !move.critical) def *= 2;
    if (defender.lightScreen && !move.critical) spcD *= 2;

    if (needsScaling(atk, def)) {
        atk = max(1, scaleStat(atk));
        def = scaleStat(def);
    }
    if (needsScaling(spcA, spcD)) {
        spcA = max(1, scaleStat(spcA));
        spcD = scaleStat(spcD);
    }

    if (move.name === "Explosion" || move.name === "Self-Destruct") {
        def = trunc(def / 2);
    }

    let a, d;
    if (physicalType(move.type)) {
        a = atk;
        d = def;
    } else {
        a = spcA;
        d = spcD;
    }

    // Technically the game would procede with division by zero and crash.
    // I might add a case to notify for this. Maybe an optional argument.
    d = max(1, d);

    let baseDamage = trunc(trunc(trunc(2 * lvl / 5 + 2)
                                 * move.power * a / d) / 50);

    baseDamage = min(997, baseDamage) + 2;

    if (attacker.stab(move.type)) {
        baseDamage = trunc(baseDamage * 3 / 2);
    }

    const eff = effective(move.type, defender.types, {gen: Gens.RBY});
    if (!eff.num) return [0];
    baseDamage = trunc(baseDamage * eff.num / eff.den);

    const damages = damageVariation(baseDamage, 217, 255);

    return damages;
}
