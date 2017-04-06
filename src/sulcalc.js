import Pokemon from "./Pokemon";
import Item from "./Item";
import Move from "./Move";
import Field from "./Field";
import Multiset from "./Multiset";
import {Gens, Stats, Types, addStrs, divideStrs} from "./utilities";
import {physicalType, natureMultiplier, typeName, effective} from "./info";
import {MissingnoError, NoMoveError} from "./errors";

import calculate from "./calculate";
import endOfTurn from "./endOfTurn";

// eslint-disable-next-line no-duplicate-imports
import * as info from "./info";

const {max, min, round, trunc} = Math;

export {default as Multiset} from "./Multiset";
export {default as Pokemon} from "./Pokemon";
export {default as Ability} from "./Ability";
export {default as Item} from "./Item";
export {default as Move} from "./Move";
export {default as Field} from "./Field";
export * from "./errors";
export * from "./utilities";
export {info};
export const VERSION = process.libVersion;

export default function sulcalc(attacker, defender, move, field) {
    attacker = new Pokemon(attacker, field.gen);
    defender = new Pokemon(defender, field.gen);
    move = new Move(move, field.gen);
    field = new Field(field);

    const reportPokes = [];
    const reportDamage = [];
    const reportResult = [];

    if (attacker.name === "Missingno" || defender.name === "Missingno") {
        throw new MissingnoError();
    }

    if (move.name === "(No Move)") {
        throw new NoMoveError();
    }

    if (field.magicRoom || attacker.ability.name === "Klutz") {
        attacker.item.disabled = true;
    }
    if (field.magicRoom || defender.ability.name === "Klutz") {
        defender.item.disabled = true;
    }

    if (attacker.ability.name === "Air Lock"
        || defender.ability.name === "Air Lock") {
        field.airLock = true;
    }

    const effects = endOfTurn(attacker, defender, field);
    effects.messages.unshift("");
    effects.values.unshift(0);

    if ((attacker.ability.moldBreakerLike || move.ignoresAbilities)
        && defender.ability.ignorable) {
        defender.ability.disabled = false;
    }

    if (defender.ability.critArmor || defender.luckyChant
        || (field.gen >= Gens.GSC && field.gen < Gens.HGSS && !move.crits)) {
        move.critical = false;
    } else if (attacker.ability.name === "Merciless"
        && (defender.poisoned || defender.badlyPoisoned)) {
        move.critical = true;
    }

    const dmg = calculate(attacker, defender, move, field);

    attacker.item.disabled = false;
    attacker.item.used = false;
    defender.item.disabled = false;
    defender.item.used = false;
    defender.ability.disabled = false;

    const maxHp = defender.stat(Stats.HP);

    const minPercent = round(dmg[0].min() / maxHp * 1000) / 10;
    const maxPercent = round(dmg[0].max() / maxHp * 1000) / 10;

    let initDmg = defender.currentHpRange.map(v => max(0, maxHp - v));
    let initDmgBerry = defender.currentHpRangeBerry.map(v => max(0, maxHp - v));

    let moveType, movePower;
    if (move.name === "Hidden Power") {
        moveType = Move.hiddenPowerType(attacker.ivs, field.gen);
        movePower = Move.hiddenPowerBp(attacker.ivs, field.gen);
    } else if (move.name === "Weather Ball") {
        moveType = Move.weatherBall(field.effectiveWeather);
        // gen 3 multiplies damage, not BP
        movePower = field.gen >= Gens.HGSS && moveType ? 100 : 50;
    } else if (move.zMove) {
        moveType = move.type;
        movePower = move.power;
    } else {
        moveType = move.type;
        movePower = null; // we'll say null means non-var BP
    }

    let a, d;
    if (move.psyshock) {
        a = Stats.SATK;
        d = Stats.DEF;
    } else if (field.gen >= Gens.HGSS && move.physical
        || field.gen < Gens.HGSS && physicalType(moveType)) {
        a = Stats.ATK;
        d = Stats.DEF;
    } else {
        a = Stats.SATK;
        d = Stats.SDEF;
    }

    if (attacker.boosts[a]) {
        reportPokes.push(
            (attacker.boosts[a] > 0 ? "+" : "") + attacker.boosts[a]);
    }

    if (field.gen >= Gens.ADV || attacker.evs[a] < 252) {
        const mult = field.gen >= Gens.ADV
            ? natureMultiplier(attacker.nature, a) : 0;
        if (mult) {
            reportPokes.push(attacker.evs[a] + (mult > 0 ? "+" : "-"));
        } else {
            reportPokes.push(attacker.evs[a]);
        }
        reportPokes.push(a === Stats.ATK ? "Atk" : "SpA");
    }

    if (field.gen >= Gens.GSC && attacker.item.name !== "(No Item)"
        && !attacker.holdingRequiredItem()) {
        reportPokes.push(attacker.item.name);
    }

    if (field.gen >= Gens.ADV && attacker.ability.name !== "(No Ability)") {
        reportPokes.push(attacker.ability.name);
    }

    if (attacker.burned) {
        reportPokes.push("burned");
    }

    reportPokes.push(attacker.name);

    if (move.critical) {
        reportPokes.push("critical hit");
    }

    if (attacker.helpingHand) {
        reportPokes.push("Helping Hand");
    }

    reportPokes.push(move.name);

    if (move.name === "Hidden Power" && field.gen >= Gens.ORAS) {
        reportPokes.push(`(${typeName(moveType)})`);
    } else if (move.name === "Hidden Power") {
        reportPokes.push(`(${typeName(moveType)} ${movePower} BP)`);
    } else if (move.multipleHits && move.numberOfHits >= 1
        && move.name !== "Beat Up") {
        reportPokes.push(`[${move.numberOfHits} hits]`);
    } else if (move.zMove) {
        reportPokes.push(`(${movePower} BP)`);
    }

    reportPokes.push("vs.");

    if (defender.boosts[d]) {
        reportPokes.push(
            (defender.boosts[d] > 0 ? "+" : "") + defender.boosts[d]);
    }

    if (field.gen >= Gens.ADV
        || defender.evs[d] < 252
        || defender.evs[Stats.HP] < 252) {
        reportPokes.push(defender.evs[Stats.HP], "HP/");
        const mult = field.gen >= Gens.ADV
            ? natureMultiplier(defender.nature, d) : 0;
        if (mult) {
            reportPokes.push(defender.evs[d] + (mult > 0 ? "+" : "-"));
        } else {
            reportPokes.push(defender.evs[d]);
        }
        reportPokes.push(d === Stats.DEF ? "Def" : "SpD");
    }

    if (field.gen >= Gens.GSC && defender.item.name !== "(No Item)"
        && !defender.holdingRequiredItem()) {
        reportPokes.push(defender.item.name);
    }

    if (field.gen >= Gens.ADV && defender.ability.name !== "(No Ability)") {
        reportPokes.push(defender.ability.name);
    }

    reportPokes.push(defender.name);

    if (defender.currentHp < 100) {
        reportPokes.push(` at ${defender.currentHp}%`);
    }

    if (defender.reflect && d === Stats.DEF) {
        reportPokes.push("behind Reflect");
    } else if (defender.lightScreen && d === Stats.SDEF) {
        reportPokes.push("behind Light Screen");
    }

    const weatherMessages = [
        "",
        " in Hail",
        " in Rain",
        " in Sand",
        " in Sun",
        " in Heavy Rain",
        " in Harsh Sun",
        " in Strong Winds"
    ];

    reportDamage.push(
        weatherMessages[field.weather],
        `${dmg[0].min()} - ${dmg[0].max()}`,
        `(${minPercent} - ${maxPercent}%)`
    );

    // Remove field hazards from current HP for probability calculation
    if (defender.ability.name !== "Magic Guard") {
        let hazardsDmg = 0;
        if (defender.stealthRock) {
            const {num, den} = effective(
                Types.ROCK, defender.types, {gen: field.gen});
            hazardsDmg += trunc(maxHp * num / (den * 8));
        }
        if (defender.spikes > 0) {
            hazardsDmg += trunc(maxHp / (10 - 2 * defender.spikes));
        }
        initDmg = initDmg.map(v => min(maxHp, v + hazardsDmg));
        initDmgBerry = initDmgBerry.map(v => min(maxHp, v + hazardsDmg));
    }

    const chances = chanceToKo(defender, dmg, {
        initDmgRange: initDmg,
        initDmgRangeBerry: initDmgBerry,
        effects: effects.values,
        rechargeTurns: Number(move.recharge),
        toxicCounter: defender.toxicCounter
    });

    effects.messages = effects.messages.slice(1);
    effects.values = effects.values.slice(1);

    const displayChances = [];
    for (let i = 0; i < chances.roundedChances.length; i++) {
        const nhko = `${i ? i + 1 : "O"}HKO`;
        const fractionalChance = chances.fractionalChances[i];
        if (fractionalChance[0] === fractionalChance[1]) {
            if (displayChances.length === 0) {
                displayChances.push(`guaranteed ${nhko}`);
            }
            break;
        } else if (fractionalChance[0] !== "0") {
            const c = round(chances.roundedChances[i] * 1000) / 10;
            if (c === 100) {
                displayChances.push(`almost guaranteed ${nhko}`);
            } else if (c === 0) {
                displayChances.push(`negligible chance to ${nhko}`);
            } else {
                displayChances.push(`${c}% chance to ${nhko}`);
            }
        }
    }

    if (displayChances.length > 0) {
        reportResult.push(displayChances.join(", "));
        if (effects.messages.length > 0) {
            reportResult.push("after", effects.messages.join(", "));
        }
    } else {
        reportResult.push("this might take a while...");
    }

    const pokeInfo = reportPokes.join(" ");
    const damageInfo = reportDamage.join(" ");
    const resultInfo = reportResult.join(" ");

    return {
        report: `${pokeInfo}: ${damageInfo} -- ${resultInfo}`,
        attacker,
        defender,
        minPercent,
        maxPercent,
        damages: dmg.slice(0, dmg.length - 1),
        damage: dmg[0],
        remainingHealth: chances.remainingHealth,
        remainingHealthBerry: chances.remainingHealthBerry,
        effectValues: effects.values,
        effectMessages: effects.messages,
        fractionalChances: chances.fractionalChances,
        roundedChances: chances.roundedChances,
        toString() {
            return this.report;
        }
    };
}

function berryDamageMap(v) {
    for (let e = 0; e < this.effects.length && v < this.totalHp; e++) {
        if (this.effects[e] === "toxic") {
            // limit to at most enough to KO
            v += trunc((this.toxicCounter + 1) * this.totalHp / 16);
        } else {
            // limit to at most enough to KO, at least enough to fully heal
            v = max(0, v - this.effects[e]);
        }
    }
    return min(this.totalHp, v);
}

function damageMap(v, w, set, skip) {
    let berryUsed = false;
    for (let e = 0; e < this.effects.length && v < this.totalHp; e++) {
        if (this.effects[e] === "toxic") {
            // limit to at most enough to KO
            v += trunc((this.toxicCounter + 1) * this.totalHp / 16);
        } else {
            // limit to at most enough to KO, at least enough to fully heal
            v = max(0, v - this.effects[e]);
        }
        if (!berryUsed && this.berryHeal > 0
            && v < this.totalHp && 2 * v >= this.totalHp) {
            /* berry can be whatever amount for sitrus, oran, etc.
             * gen 3, 4, 5, & 6: apply at 1/2 or below
             * I've personally confirmed that for gens 3, 4, & 5 it
             * activates above 1/3, so I'm assuming it activates at <= 50%
             * tested with Emerald, Heart Gold, and White
             * tl;dr bulba lies, it was never 1/3
             */
            v = max(0, v - this.berryHeal);
            berryUsed = true;
        }
    }
    v = min(this.totalHp, v);
    // berry might not be the last effect added, so do this at the end
    if (berryUsed) {
        this.berryDmg.add(v, w); // separate berry modified value into berryDmg
        skip();
    }
    return v;
}

function chanceToKo(poke, damageRanges, params) {
    const chances = [];
    const totalHp = poke.stat(Stats.HP);
    const berryHeal = poke.item.berryHeal(totalHp);
    const maxTurns = params.maxTurns || 9;
    const rechargeTurns = params.rechargeTurns || 0;
    const effects = params.effects || [0];

    let dmg = new Multiset(params.initDmgRange || [0]);
    let berryDmg = new Multiset(params.initDmgRangeBerry);
    let toxicCounter = params.toxicCounter || 0;

    let remainingHealth, remainingHealthBerry;

    const hasFainted = value => value >= totalHp;
    const damageToHealth = value => totalHp - value;

    for (let turn = 0, i = 0; turn < maxTurns; turn++, i++) {
        if (typeof damageRanges[i] === "number") {
            if (damageRanges[i] === 0) break;
            i += damageRanges[i];
        }

        dmg = dmg.permute(damageRanges[i]).simplify();
        berryDmg = berryDmg.permute(damageRanges[i]).simplify();

        for (let j = 0; j <= rechargeTurns; j++) {
            /* because effects always has a 0 value passed in the first index,
             * berry check runs right after damage is applied, as well as after
             * every added effect. Separating damages with berries applied
             * prevents extra applications.
             */
            // berries go first to prevent double effect application
            berryDmg = berryDmg.map(berryDamageMap, {
                effects,
                toxicCounter,
                totalHp
            });

            dmg = dmg.map(damageMap, {
                effects,
                toxicCounter,
                totalHp,
                berryHeal,
                berryDmg
            });

            toxicCounter++;
        }

        chances.push([
            addStrs(dmg.count(hasFainted), berryDmg.count(hasFainted)),
            addStrs(dmg.size, berryDmg.size)
        ]);

        if (!turn) {
            remainingHealth = dmg.map(damageToHealth);
            remainingHealthBerry = berryDmg.map(damageToHealth);
        }

        if (chances[chances.length - 1][0] === chances[chances.length - 1][1]) {
            break;
        }
    }

    return {
        fractionalChances: chances,
        roundedChances: chances.map(([num, den]) => {
            if (num === "0") return 0;
            return Number(divideStrs(num + "000000", den)[0]) / 1000000;
        }),
        remainingHealth,
        remainingHealthBerry
    };
}
