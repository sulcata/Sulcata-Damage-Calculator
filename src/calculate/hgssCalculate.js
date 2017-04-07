import Move from "../Move";
import {Gens, Stats, Types, damageVariation} from "../utilities";
import {
    isAdamantType, isLustrousType,
    isGriseousType, effectiveness
} from "../info";

const {max, min, trunc} = Math;

export default function hgssCalculate(attacker, defender, move, field) {
    let moveType = move.type();
    let movePower = move.power();

    if (movePower === 0) return [0];

    if (move.isSound() && defender.ability.name === "Soundproof") {
        return [0];
    }

    switch (move.name) {
        case "Hidden Power":
            movePower = Move.hiddenPowerBp(attacker.ivs, Gens.HGSS);
            moveType = Move.hiddenPowerType(attacker.ivs, Gens.HGSS);
            break;
        case "Reversal":
        case "Flail":
            movePower = Move.flail(attacker.currentHp,
                                   attacker.stat(Stats.HP),
                                   Gens.HGSS);
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
            movePower = moveType === Types.NORMAL ? 50 : 100;
            break;
        case "Rollout":
        case "Ice Ball":
            movePower = 30 * 2 ** ((move.rollout - 1) % 5 + move.defenseCurl);
            break;
        case "Triple Kick":
            movePower = 10 * move.tripleKickCount;
            break;
        case "Assurance":
            if (attacker.damagedPreviously) movePower *= 2;
            break;
        case "Avalanche":
        case "Revenge":
            if (attacker.damagedPreviously && !attacker.damagedByPainSplit) {
                movePower *= 2;
            }
            break;
        case "Wring Out":
        case "Crush Grip":
            movePower = 1 + trunc(defender.currentHp * 120
                                  / max(1, defender.stat(Stats.HP)));
            break;
        case "Water Spout":
        case "Eruption":
            movePower = Move.eruption(attacker.currentHp,
                                      attacker.stat(Stats.HP));
            break;
        case "Brine":
            if (defender.currentHp * 2 <= defender.stat(Stats.HP)) {
                movePower *= 2;
            }
            break;
        case "Echoed Voice":
            movePower = min(200, 40 + 40 * move.echoedVoice);
            break;
        case "Facade":
            if (attacker.status) movePower *= 2;
            break;
        case "Trump Card":
            movePower = Move.trumpCard(move.trumpPP);
            break;
        case "Wake-Up Slap":
            if (defender.isAsleep()) movePower *= 2;
            break;
        case "Smelling Salts":
            if (defender.isParalyzed()) movePower *= 2;
            break;
        case "Gyro Ball":
            movePower = Move.gyroBall(attacker.speed(), defender.speed());
            break;
        case "Low Kick":
        case "Grass Knot":
            movePower = Move.grassKnot(defender.weight());
            break;
        case "Fury Cutter":
            movePower = min(160, 10 * 2 ** move.furyCutter);
            break;
        case "Punishment":
            movePower = Move.punishment(defender.boosts);
            break;
        case "Pursuit":
            if (defender.switchedOut) movePower *= 2;
            break;
        case "Spit Up":
            if (attacker.stockpile === 0) return [0];
            movePower = 100 * attacker.stockpile;
            break;
        case "Natural Gift":
            if (attacker.item.disabled || !attacker.item.isBerry()) return [0];
            movePower = attacker.item.naturalGiftPower();
            moveType = attacker.item.naturalGiftType();
            break;
        case "Fling":
            movePower = attacker.item.flingPower();
            break;
        case "Beat Up":
            moveType = Types.CURSE;
            break;
        case "Judgment":
            if (attacker.item.plateType() > -1) {
                moveType = attacker.item.plateType();
            }
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
        || move.fly && move.boostedByFly()
        || move.minimize && move.boostedByMinimize()) {
        movePower *= 2;
    }

    if (attacker.helpingHand) {
        movePower = trunc(movePower * 3 / 2);
    }

    switch (attacker.item.name) {
        case "Muscle Band":
            if (move.isPhysical()) {
                movePower = trunc(movePower * 11 / 10);
            }
            break;
        case "Wise Glasses":
            if (move.isSpecial()) {
                movePower = trunc(movePower * 11 / 10);
            }
            break;
        case "Adamant Orb":
            if (attacker.name === "Dialga" && isAdamantType(moveType)) {
                movePower = trunc(movePower * 12 / 10);
            }
            break;
        case "Lustrous Orb":
            if (attacker.name === "Palkia" && isLustrousType(moveType)) {
                movePower = trunc(movePower * 12 / 10);
            }
            break;
        case "Griseous Orb":
            if (attacker.name.startsWith("Giratina")
                && isGriseousType(moveType)) {
                movePower = trunc(movePower * 12 / 10);
            }
            break;
        default:
            if (attacker.item.boostedType() === moveType) {
                movePower = trunc(movePower * 12 / 10);
            }
    }

    if (attacker.charge && moveType === Types.ELECTRIC) {
        movePower *= 2;
    }

    switch (attacker.ability.name) {
        case "Rivalry":
            if (attacker.gender && defender.gender) {
                movePower *= attacker.gender === defender.gender ? 3 : 5;
                movePower = trunc(movePower / 4);
            }
            break;
        case "Reckless":
            if (move.isRecklessBoosted()) {
                movePower = trunc(movePower * 12 / 10);
            }
            break;
        case "Iron Fist":
            if (move.isPunch()) movePower = trunc(movePower * 12 / 10);
            break;
        case "Technician":
            if (movePower <= 60) movePower = trunc(movePower * 3 / 2);
            break;
        /* no default */
    }

    switch (defender.ability.name) {
        case "Heatproof":
            if (moveType === Types.FIRE) {
                movePower = trunc(movePower / 2);
            }
            break;
        case "Thick Fat":
            if (moveType === Types.FIRE || moveType === Types.ICE) {
                movePower = trunc(movePower / 2);
            }
            break;
        case "Dry Skin":
            if (moveType === Types.FIRE) {
                movePower = trunc(movePower * 5 / 4);
            }
            break;
        /* no default */
    }

    if (field.mudSport && moveType === Types.ELECTRIC) {
        movePower = trunc(movePower / 2);
    }

    if (field.waterSport && moveType === Types.FIRE) {
        movePower = trunc(movePower / 2);
    }

    let atk, def, sdef, satk;
    const unawareA = attacker.ability.name === "Unaware";
    const unawareD = defender.ability.name === "Unaware";
    if (move.critical) {
        if (unawareA) {
            def = defender.stat(Stats.DEF);
            sdef = defender.stat(Stats.SDEF);
        } else {
            def = min(defender.stat(Stats.DEF),
                      defender.boostedStat(Stats.DEF));
            sdef = min(defender.stat(Stats.SDEF),
                       defender.boostedStat(Stats.SDEF));
        }
        if (unawareD) {
            atk = attacker.stat(Stats.ATK);
            satk = attacker.stat(Stats.SATK);
        } else {
            atk = max(attacker.stat(Stats.ATK),
                      attacker.boostedStat(Stats.ATK));
            satk = max(attacker.stat(Stats.SATK),
                       attacker.boostedStat(Stats.SATK));
        }
    } else {
        if (unawareA) {
            def = defender.stat(Stats.DEF);
            sdef = defender.stat(Stats.SDEF);
        } else {
            def = defender.boostedStat(Stats.DEF);
            sdef = defender.boostedStat(Stats.SDEF);
        }
        if (unawareD) {
            atk = attacker.stat(Stats.ATK);
            satk = attacker.stat(Stats.SATK);
        } else {
            atk = attacker.boostedStat(Stats.ATK);
            satk = attacker.boostedStat(Stats.SATK);
        }
    }

    if (attacker.ability.name === "Huge Power"
        || attacker.ability.name === "Pure Power") {
        atk *= 2;
    }

    if (attacker.flowerGift && field.sun()) {
        atk *= 2;
    }

    switch (attacker.ability.name) {
        case "Guts":
            if (attacker.status) atk = trunc(atk * 3 / 2);
            break;
        case "Hustle":
            atk = trunc(atk * 3 / 2);
            break;
        case "Slow Start":
            if (field.slowStart) atk = trunc(atk / 2);
            break;
        case "Plus":
            if (attacker.minus) satk = trunc(satk * 3 / 2);
            break;
        case "Minus":
            if (attacker.plus) satk = trunc(satk * 3 / 2);
            break;
        case "Solar Power":
            if (field.sun()) satk *= 2;
            break;
        /* no default */
    }

    switch (attacker.item.name) {
        case "Choice Band":
            atk = trunc(atk * 3 / 2);
            break;
        case "Choice Specs":
            satk = trunc(satk * 3 / 2);
            break;
        case "Soul Dew":
            if (attacker.name === "Latias" || attacker.name === "Latios") {
                satk = trunc(satk * 3 / 2);
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

    if (move.name === "Explosion" || move.name === "Self-Destruct") {
        if (defender.ability.name === "Damp") {
            return [0];
        }
        def = trunc(def / 2);
    }

    if (defender.ability.name === "Marvel Scale" && defender.status) {
        def = trunc(def * 3 / 2);
    }

    if (defender.flowerGift && field.sun()) {
        sdef = trunc(sdef * 3 / 2);
    }

    switch (defender.item.name) {
        case "Metal Powder":
            if (defender.name === "Ditto") def *= 2;
            break;
        case "Soul Dew":
            if (defender.name === "Latias" || defender.name === "Latios") {
                sdef = trunc(sdef * 3 / 2);
            }
            break;
        case "Deep Sea Scale":
            if (defender.name === "Clamperl") sdef *= 2;
            break;
        /* no default */
    }

    if (field.sand() && defender.stab(Types.ROCK)) {
        sdef = trunc(sdef * 3 / 2);
    }

    let a, d, lvl;
    if (move.name === "Beat Up") {
        a = attacker.beatUpStats[move.beatUpHit];
        d = defender.baseStat(Stats.DEF);
        lvl = attacker.beatUpLevels[move.beatUpHit];
    } else if (move.isPhysical()) {
        a = atk;
        d = def;
        lvl = attacker.level;
    } else if (move.isSpecial()) {
        a = satk;
        d = sdef;
        lvl = attacker.level;
    } else {
        return [0];
    }

    let baseDamage = trunc(trunc(trunc(2 * lvl / 5 + 2)
                                 * movePower * a / d) / 50);

    if (move.name !== "Beat Up") {
        if (attacker.isBurned() && move.isPhysical()
            && attacker.ability.name !== "Guts") {
            baseDamage = trunc(baseDamage / 2);
        }

        if (!move.critical
            && (defender.reflect && move.isPhysical()
                || defender.lightScreen && move.isSpecial())) {
            if (field.multiBattle) {
                baseDamage = trunc(baseDamage * 2 / 3);
            } else {
                baseDamage = trunc(baseDamage / 2);
            }
        }
    }

    if (field.multiBattle && move.hasMultipleTargets()) {
        baseDamage = trunc(baseDamage * 3 / 4);
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

    baseDamage += 2;

    if (move.critical) {
        baseDamage *= attacker.ability.name === "Sniper" ? 3 : 2;
    }

    if (move.name !== "Beat Up") {
        if (attacker.item.name === "Life Orb") {
            baseDamage = trunc(baseDamage * 13 / 10);
        } else if (attacker.item.name === "Metronome") {
            const m = min(20, 10 + attacker.metronome);
            baseDamage = trunc(baseDamage * m / 10);
        }

        if (move.meFirst) {
            baseDamage = trunc(baseDamage * 3 / 2);
        }
    }

    let damages = damageVariation(baseDamage, 85, 100);

    if (attacker.stab(moveType)) {
        damages = damages.map(d => trunc(d * 3 / 2));
    }

    let eff = effectiveness(moveType, defender.types(), {
        gen: Gens.HGSS,
        foresight: defender.foresight,
        scrappy: attacker.ability.name === "Scrappy",
        gravity: field.gravity
    });
    if (moveType === defender.ability.immunityType()) {
        eff = {num: 0, den: 2};
    }
    if (eff.num === 0) return [0];
    damages = damages.map(d => trunc(d * eff.num / eff.den));

    if (eff.num > eff.den) {
        if (defender.ability.reducesSuperEffective()) {
            damages = damages.map(d => trunc(d * 3 / 4));
        }

        if (attacker.item.name === "Expert Belt") {
            damages = damages.map(d => trunc(d * 12 / 10));
        }

        if (defender.item.berryTypeResist() === moveType) {
            damages = damages.map(d => trunc(d / 2));
        }
    } else if (eff.num < eff.den && attacker.ability.name === "Tinted Lens") {
        damages = damages.map(d => 2 * d);
    }

    if (defender.item.berryTypeResist() === Types.NORMAL
        && moveType === Types.NORMAL) {
        damages = damages.map(d => trunc(d / 2));
    }

    return damages;
}
