import {clamp} from "lodash";

import Multiset from "../Multiset";
import {Gens, Stats, multiplyStrs, divideStrs, cmpStrs} from "../utilities";

import rbyCalculate from "./rbyCalculate";
import gscCalculate from "./gscCalculate";
import advCalculate from "./advCalculate";
import hgssCalculate from "./hgssCalculate";
import b2w2Calculate from "./b2w2Calculate";
import orasCalculate from "./orasCalculate";
import smCalculate from "./smCalculate";

const {min} = Math;

export default function calculate(attacker, defender, move, field) {
    const dmg = [];
    if (move.name === "(No Move)") {
        dmg.push(new Multiset([0]));
        dmg.push(0);
    } else if (move.name === "Fury Cutter") {
        const tempCutter = move.furyCutter;
        while (move.furyCutter <= 5) {
            dmg.push(turnCalculate(attacker, defender, move, field));
            move.furyCutter++;
        }
        dmg.push(-1); // look at the last damage range
        move.furyCutter = tempCutter; // restore
    } else if (move.name === "Echoed Voice") {
        const tempVoice = move.echoedVoice;
        while (move.echoedVoice <= 4) {
            dmg.push(turnCalculate(attacker, defender, move, field));
            move.echoedVoice++;
        }
        dmg.push(-1); // look at the last damage range
        move.echoedVoice = tempVoice;
    } else if (move.name === "Trump Card") {
        const tempPP = move.trumpPP;
        dmg.push(turnCalculate(attacker, defender, move, field));
        while (move.trumpPP > 0) {
            if (defender.ability.name === "Pressure") {
                move.trumpPP -= min(2, move.trumpPP);
            } else {
                move.trumpPP--;
            }
            dmg.push(turnCalculate(attacker, defender, move, field));
        }
        dmg.push(0); // no more PP, no more damage ranges
        move.trumpPP = tempPP;
    } else if (move.name === "Explosion" || move.name === "Self-Destruct") {
        dmg.push(turnCalculate(attacker, defender, move, field));
        dmg.push(0); // ur dead
    } else if (move.name === "Rollout" || move.name === "Ice Ball") {
        const tempRollout = move.rollout;
        // repeat 5 times, The formulas wrap around automatically
        for (let i = 0; i < 5; i++) {
            dmg.push(turnCalculate(attacker, defender, move, field));
            move.rollout++;
        }
        dmg.push(-dmg.length);
        move.rollout = tempRollout;
    } else {
        dmg.push(turnCalculate(attacker, defender, move, field));
        // an item like a type-resist berry or a gem might get used
        dmg.push(turnCalculate(attacker, defender, move, field));
        dmg.push(-1); // only repeat the last roll
    }
    defender.brokenMultiscale = false; // reset multiscale
    return dmg;
}

function turnCalculate(attacker, defender, move, field) {
    let dmg;
    if (move.name === "Triple Kick") {
        dmg = new Multiset([0]);
        for (let i = 1; i <= 3; i++) {
            move.tripleKickCount = i; // Determine which turn it is.
            dmg = dmg.permute(genCalculate(attacker, defender, move, field));
            defender.brokenMultiscale = true;
        }
        move.tripleKickCount = 1; // Reset count for next calculation.
    } else if (move.name === "Beat Up") {
        dmg = new Multiset([0]);
        for (let i = 0; i < attacker.beatUpStats.length; i++) {
            move.beatUpHit = i;
            dmg = dmg.permute(genCalculate(attacker, defender, move, field));
            defender.brokenMultiscale = true;
        }
        move.beatUpHit = 0;
    } else if (attacker.ability.name === "Parental Bond"
        && move.maxHits() === 1 && move.affectedByParentalBond()
        && !(field.multiBattle && move.hasMultipleTargets())) {
        // Parental Bond has no effect on Multi Hit moves in all cases
        // or in Multiple Target moves during non-Singles battles.
        // Fixed damage moves are still fixed. Psywave is calculated twice.
        // Fling, Self-Destruct, Explosion, Final Gambit, and Endeavor
        // are excluded from the effect.
        // Hits once at full power, and once at half power.
        dmg = genCalculate(attacker, defender, move, field);
        move.secondHit = true;
        defender.brokenMultiscale = true;
        dmg = dmg.permute(genCalculate(attacker, defender, move, field));
        move.secondHit = false;
    } else if (move.maxHits() > 1) {
        // multi-hit moves
        const dmgs = [new Multiset([0])];

        for (let i = 1; i <= move.maxHits(); i++) {
            if (field.gen >= Gens.GSC) {
                dmgs.push(dmgs[i - 1].permute(
                    genCalculate(attacker, defender, move, field)));
            } else {
                dmgs.push(
                    genCalculate(attacker, defender, move, field)
                        .map(d => d * i));
            }
            defender.brokenMultiscale = true;
        }

        if (move.numberOfHits >= 1) {
            dmg = dmgs[clamp(move.numberOfHits,
                             move.minHits(),
                             move.maxHits())];
        } else if (move.maxHits() === 2) {
            dmg = dmgs[2];
        } else {
            /* before b2w2:
             * 2 hits (3/8), 3 hits (3/8), 4 hits (1/8), 5 hits (1/8)
             * after b2w2:
             * 2 hits (1/3), 3 hits (1/3), 4 hits (1/6), 5 hits (1/6)
             */
            const p = field.gen >= Gens.B2W2
                ? [0, 0, 2, 2, 1, 1] : [0, 0, 3, 3, 1, 1];
            const product = dmgs.map(dmg => dmg.size).reduce(multiplyStrs);
            const scaledDmgs = dmgs.map(dmg => {
                const multiplier = divideStrs(product, dmg.size)[0];
                return dmg.scale(multiplier);
            });
            dmg = new Multiset();
            for (let i = move.minHits(); i <= move.maxHits(); i++) {
                dmg = dmg.union(scaledDmgs[i].scale(p[i]));
            }
        }
    } else {
        // Simple move; default case.
        dmg = genCalculate(attacker, defender, move, field);
        defender.brokenMultiscale = true;
    }

    if (move.name === "Knock Off" && defender.knockOff()) {
        defender.item.used = true;
    }

    return cmpStrs(dmg.size, "39") <= 0 ? dmg : dmg.simplify();
}

function genCalculate(attacker, defender, move, field) {
    const calculateFns = [
        undefined, // i swear undefined is a function
        rbyCalculate,
        gscCalculate,
        advCalculate,
        hgssCalculate,
        b2w2Calculate,
        orasCalculate,
        smCalculate
    ];
    let damages = calculateFns[field.gen](attacker, defender, move, field);

    const maxHp = defender.stat(Stats.HP);
    if (defender.ability.name === "Sturdy" && defender.currentHp === maxHp) {
        damages = damages.map(d => min(maxHp - 1, d));
    }

    return new Multiset(damages);
}
