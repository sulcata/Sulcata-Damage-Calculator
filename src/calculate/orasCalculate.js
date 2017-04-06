import Move from "../Move";

import {
    Gens, Stats, Types, applyMod, chainMod,
    roundHalfToZero, damageVariation
} from "../utilities";

import {
    sandForceType, lustrousType, adamantType,
    griseousType, effective
} from "../info";

const {max, min, trunc} = Math;

export default function orasCalculate(attacker, defender, move, field) {
    let moveType = move.type;
    let movePower = move.power;

    if (movePower === 0) return [0];

    switch (move.name) {
        case "Weather Ball":
            moveType = Move.weatherBall(field.effectiveWeather);
            movePower = moveType === Types.NORMAL ? 50 : 100;
            break;
        case "Frustration":
            movePower = Move.frustration(attacker.happiness);
            break;
        case "Return":
            movePower = Move.return(attacker.happiness);
            break;
        case "Payback":
            if (defender.movedFirst) movePower *= 2;
            break;
        case "Electro Ball":
            movePower = Move.electroBall(attacker.speed(), defender.speed());
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
        case "Gyro Ball":
            movePower = Move.gyroBall(attacker.speed(), defender.speed());
            break;
        case "Water Spout":
        case "Eruption":
            movePower = Move.eruption(attacker.currentHp,
                                      attacker.stat(Stats.HP));
            break;
        case "Punishment":
            movePower = Move.punishment(defender.boosts);
            break;
        case "Fury Cutter":
            movePower = min(160, 40 * 2 ** move.furyCutter);
            break;
        case "Low Kick":
        case "Grass Knot":
            movePower = Move.grassKnot(defender.weight);
            break;
        case "Echoed Voice":
            movePower = min(200, 40 + 40 * move.echoedVoice);
            break;
        case "Hex":
            if (defender.status) movePower *= 2;
            break;
        case "Wring Out":
        case "Crush Grip":
            movePower = max(1, roundHalfToZero(120 * defender.currentHp
                                               / defender.stat(Stats.HP)));
            break;
        case "Heavy Slam":
        case "Heat Crash":
            movePower = Move.heavySlam(attacker.weight, defender.weight);
            break;
        case "Stored Power":
            movePower = Move.storedPower(attacker.boosts);
            break;
        case "Flail":
        case "Reversal":
            movePower = Move.flail(attacker.currentHp,
                                   attacker.stat(Stats.HP),
                                   Gens.ORAS);
            break;
        case "Trump Card":
            movePower = Move.trumpCard(move.trumpPP);
            break;
        case "Round":
            if (move.roundBoost) movePower *= 2;
            break;
        case "Wake-Up Slap":
            if (defender.asleep) movePower *= 2;
            break;
        case "Smelling Salts":
            if (defender.paralyzed) movePower *= 2;
            break;
        case "Beat Up": {
            const stat = attacker.beatUpStats[move.beatUpHit];
            movePower = trunc(stat / 10) + 5;
            break;
        }
        case "Hidden Power":
            movePower = Move.hiddenPowerBp(attacker.ivs, Gens.ORAS);
            moveType = Move.hiddenPowerType(attacker.ivs, Gens.ORAS);
            break;
        case "Spit Up":
            if (attacker.stockpile === 0) return [0];
            movePower = 100 * attacker.stockpile;
            break;
        case "Pursuit":
            movePower *= 2;
            break;
        case "Present":
            movePower = move.present;
            break;
        case "Natural Gift":
            if (attacker.item.disabled || !attacker.item.isBerry()) return [0];
            movePower = attacker.item.naturalGiftPower;
            moveType = attacker.item.naturalGiftType;
            break;
        case "Magnitude":
            movePower = Move.magnitude(move.magnitude);
            break;
        case "Rollout":
        case "Ice Ball":
            movePower = 30 * 2 ** ((move.rollout - 1) % 5 + move.defenseCurl);
            break;
        case "Fling":
            movePower = attacker.item.flingPower;
            break;
        case "Fire Pledge":
        case "Water Pledge":
        case "Grass Pledge":
            if (move.pledgeBoost) movePower *= 2;
            break;
        case "Triple Kick":
            movePower = 10 * move.tripleKickCount;
            break;
        case "Judgment":
            if (attacker.item.plateType !== -1) {
                moveType = attacker.item.plateType;
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
            for (let i = 0; i <= 100; i++) {
                range.push(max(1, trunc(attacker.level * (i + 50) / 100)));
            }
            return range;
        }
        case "Super Fang":
            return [max(1, trunc(defender.currentHp / 2))];
        case "Self-Destruct":
        case "Explosion":
            if (defender.ability.name === "Damp") return [0];
            break;
        case "Final Gambit":
            return [attacker.currentHp];
        default:
            if (move.ohko) {
                return [defender.stat(Stats.HP)];
            }
            if (move.sound && defender.ability.name === "Soundproof"
                || move.ball && defender.ability.name === "Bulletproof") {
                return [0];
            }
            if (move.fly && move.boostedByFly) {
                movePower *= 2;
            }
    }

    const gemBoost = moveType === attacker.item.gemType;
    attacker.item.used = attacker.item.used || gemBoost;

    if (move.name === "Acrobatics" && attacker.item.name === "(No Item)") {
        movePower *= 2;
    }

    let movePowerMod = 0x1000;

    switch (attacker.ability.name) {
        case "Technician":
            if (movePower <= 60) {
                movePowerMod = chainMod(0x1800, movePowerMod);
            }
            break;
        case "Flare Boost":
            if (attacker.burned && move.special) {
                movePowerMod = chainMod(0x1800, movePowerMod);
            }
            break;
        case "Analytic":
            if (defender.movedFirst) {
                movePowerMod = chainMod(0x14CD, movePowerMod);
            }
            break;
        case "Reckless":
            if (move.reckless) {
                movePowerMod = chainMod(0x1333, movePowerMod);
            }
            break;
        case "Iron Fist":
            if (move.punch) {
                movePowerMod = chainMod(0x1333, movePowerMod);
            }
            break;
        case "Toxic Boost":
            if ((attacker.poisoned || attacker.badlyPoisoned)
                && move.physical) {
                movePowerMod = chainMod(0x1800, movePowerMod);
            }
            break;
        case "Rivalry":
            if (attacker.gender && defender.gender) {
                const m = attacker.gender === defender.gender ? 0xC00 : 0x1400;
                movePowerMod = chainMod(m, movePowerMod);
            }
            break;
        case "Sand Force":
            if (field.sand && sandForceType(moveType)) {
                movePowerMod = chainMod(0x14CD, movePowerMod);
            }
            break;
        case "Normalize":
            moveType = Types.NORMAL;
            break;
        case "Tough Claws":
            if (move.contact) {
                movePowerMod = chainMod(0x1555, movePowerMod);
            }
            break;
        case "Strong Jaw":
            if (move.bite) {
                movePowerMod = chainMod(0x1800, movePowerMod);
            }
            break;
        case "Mega Launcher":
            if (move.pulse) {
                movePowerMod = chainMod(0x1800, movePowerMod);
            }
            break;
        case "Parental Bond":
            if (move.secondHit) {
                movePowerMod = chainMod(0x800, movePowerMod);
            }
            break;
        default:
            if (attacker.ability.normalToType > -1
                && moveType === Types.NORMAL) {
                // refrigerate, etc.
                movePowerMod = chainMod(0x14CD, movePowerMod);
                moveType = attacker.ability.normalToType;
            }
    }

    if (moveType === Types.FIRE) {
        if (defender.ability.name === "Heatproof") {
            movePowerMod = chainMod(0x800, movePowerMod);
        } else if (defender.ability.name === "Dry Skin") {
            movePowerMod = chainMod(0x1400, movePowerMod);
        }
    }

    if (attacker.ability.name === "Sheer Force" && move.sheerForce) {
        movePowerMod = chainMod(0x14CD, movePowerMod);
    }

    switch (attacker.item.name) {
        case "Muscle Band":
            if (move.physical) {
                movePowerMod = chainMod(0x1199, movePowerMod);
            }
            break;
        case "Wise Glasses":
            if (move.special) {
                movePowerMod = chainMod(0x1199, movePowerMod);
            }
            break;
        case "Adamant Orb":
            if (attacker.name === "Dialga" && adamantType(moveType)) {
                movePowerMod = chainMod(0x1333, movePowerMod);
            }
            break;
        case "Lustrous Orb":
            if (attacker.name === "Palkia" && lustrousType(moveType)) {
                movePowerMod = chainMod(0x1333, movePowerMod);
            }
            break;
        case "Griseous Orb":
            if (attacker.name.startsWith("Giratina")
                && griseousType(moveType)) {
                movePowerMod = chainMod(0x1333, movePowerMod);
            }
            break;
        default:
            if (gemBoost) {
                movePowerMod = chainMod(0x14CD, movePowerMod);
            } else if (attacker.item.typeBoosted === moveType) {
                movePowerMod = chainMod(0x1333, movePowerMod);
            }
    }

    switch (move.name) {
        case "Facade":
            if (attacker.status) {
                movePowerMod = chainMod(0x2000, movePowerMod);
            }
            break;
        case "Brine":
            if (defender.currentHp * 2 <= defender.stat(Stats.HP)) {
                movePowerMod = chainMod(0x2000, movePowerMod);
            }
            break;
        case "Venoshock":
            if (attacker.poisoned || attacker.badlyPoisoned) {
                movePowerMod = chainMod(0x2000, movePowerMod);
            }
            break;
        case "Retaliate":
            if (move.previouslyFainted) {
                movePowerMod = chainMod(0x2000, movePowerMod);
            }
            break;
        case "Fusion Bolt":
            if (move.fusionFlare) {
                movePowerMod = chainMod(0x2000, movePowerMod);
            }
            break;
        case "Fusion Flare":
            if (move.fusionBolt) {
                movePowerMod = chainMod(0x2000, movePowerMod);
            }
            break;
        case "Knock Off":
            if (defender.knockOffBoost()) {
                movePowerMod = chainMod(0x1800, movePowerMod);
            }
            break;
        case "Earthquake":
        case "Magnitude":
        case "Bulldoze":
            if (field.grassyTerrain) {
                movePowerMod = chainMod(0x800, movePowerMod);
            }
            break;
        /* no default */
    }

    if (move.meFirst) {
        movePowerMod = chainMod(0x1800, movePowerMod);
    }

    if (!field.sun && !field.clearWeather && move.name === "Solar Beam") {
        movePowerMod = chainMod(0x800, movePowerMod);
    }

    if (attacker.charge && moveType === Types.ELECTRIC) {
        movePowerMod = chainMod(0x2000, movePowerMod);
    }

    if (attacker.helpingHand) {
        movePowerMod = chainMod(0x1800, movePowerMod);
    }

    if (field.waterSport && moveType === Types.FIRE) {
        movePowerMod = chainMod(0x548, movePowerMod);
    }

    if (field.mudSport && moveType === Types.ELECTRIC) {
        movePowerMod = chainMod(0x548, movePowerMod);
    }

    if (field.grassyTerrain && attacker.grounded && moveType === Types.GRASS) {
        movePowerMod = chainMod(0x1800, movePowerMod);
    }

    if (field.electricTerrain && attacker.grounded
        && moveType === Types.ELECTRIC) {
        movePowerMod = chainMod(0x1800, movePowerMod);
    }

    if (field.mistyTerrain && defender.grounded && moveType === Types.DRAGON) {
        movePowerMod = chainMod(0x800, movePowerMod);
    }

    if (field.ionDeluge && moveType === Types.NORMAL) {
        moveType = Types.ELECTRIC;
    }

    if (attacker.electrify) {
        moveType = Types.ELECTRIC;
    }

    movePower = max(1, applyMod(movePowerMod, movePower));

    const defStat = field.wonderRoom ? Stats.SDEF : Stats.DEF;
    const sdefStat = field.wonderRoom ? Stats.DEF : Stats.SDEF;
    const unawareA = attacker.ability.name === "Unaware";
    const unawareD = defender.ability.name === "Unaware";
    let atk, def, satk, sdef;
    if (move.name === "Foul Play") {
        if (unawareA) {
            def = defender.stat(defStat);
            sdef = defender.stat(sdefStat);
            atk = defender.stat(Stats.ATK);
        } else if (move.critical) {
            def = min(defender.stat(defStat),
                      defender.boostedStat(defStat));
            sdef = min(defender.stat(sdefStat),
                       defender.boostedStat(sdefStat));
            atk = max(defender.stat(Stats.ATK),
                      defender.boostedStat(Stats.ATK));
        } else {
            def = defender.boostedStat(defStat);
            sdef = defender.boostedStat(sdefStat);
            atk = defender.boostedStat(Stats.ATK);
        }

        if (unawareD) {
            satk = attacker.stat(Stats.SATK);
        } else if (move.critical) {
            satk = max(attacker.stat(Stats.SATK),
                       attacker.boostedStat(Stats.SATK));
        } else {
            satk = attacker.boostedStat(Stats.SATK);
        }
    } else if (move.name === "Chip Away" || move.name === "Sacred Sword") {
        def = defender.stat(defStat);
        sdef = defender.stat(sdefStat);

        if (unawareD) {
            atk = attacker.stat(Stats.ATK);
            satk = attacker.stat(Stats.SATK);
        } else if (move.critical) {
            atk = max(attacker.stat(Stats.ATK),
                      attacker.boostedStat(Stats.ATK));
            satk = max(attacker.stat(Stats.SATK),
                       attacker.boostedStat(Stats.SATK));
        } else {
            atk = attacker.boostedStat(Stats.ATK);
            satk = attacker.boostedStat(Stats.SATK);
        }
    } else {
        if (unawareA) {
            def = defender.stat(defStat);
            sdef = defender.stat(sdefStat);
        } else if (move.critical) {
            def = min(defender.stat(defStat),
                      defender.boostedStat(defStat));
            sdef = min(defender.stat(sdefStat),
                       defender.boostedStat(sdefStat));
        } else {
            def = defender.boostedStat(defStat);
            sdef = defender.boostedStat(sdefStat);
        }

        if (unawareD) {
            atk = attacker.stat(Stats.ATK);
            satk = attacker.stat(Stats.SATK);
        } else if (move.critical) {
            atk = max(attacker.stat(Stats.ATK),
                      attacker.boostedStat(Stats.ATK));
            satk = max(attacker.stat(Stats.SATK),
                       attacker.boostedStat(Stats.SATK));
        } else {
            atk = attacker.boostedStat(Stats.ATK);
            satk = attacker.boostedStat(Stats.SATK);
        }
    }

    let atkMod = 0x1000;
    let satkMod = 0x1000;

    if (defender.ability.name === "Thick Fat"
        && (moveType === Types.FIRE || moveType === Types.ICE)) {
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
            if (attacker.currentHp * 2 <= attacker.stat(Stats.HP)) {
                atkMod = chainMod(0x800, atkMod);
                satkMod = chainMod(0x800, satkMod);
            }
            break;
        case "Huge Power":
        case "Pure Power":
            atkMod = chainMod(0x2000, atkMod);
            break;
        case "Solar Power":
            if (field.sun) satkMod = chainMod(0x1800, satkMod);
            break;
        case "Hustle":
            atk = applyMod(0x1800, atk);
            break;
        case "Flash Fire":
            if (attacker.flashFire && moveType === Types.FIRE) {
                atkMod = chainMod(0x1800, atkMod);
                satkMod = chainMod(0x1800, satkMod);
            }
            break;
        case "Slow Start":
            if (attacker.slowStart) atkMod = chainMod(0x800, atkMod);
            break;
        default:
            if (attacker.ability.pinchType === moveType
                && attacker.stat(Stats.HP) >= attacker.currentHp * 3) {
                // blaze, torrent, overgrow, ...
                atkMod = chainMod(0x1800, atkMod);
                satkMod = chainMod(0x1800, satkMod);
            }
    }

    if (attacker.flowerGift && field.sun) {
        atkMod = chainMod(0x1800, atkMod);
    }

    switch (attacker.item.name) {
        case "Deep Sea Tooth":
            if (attacker.name === "Clamperl") {
                satkMod = chainMod(0x2000, satkMod);
            }
            break;
        case "Soul Dew":
            if (attacker.name === "Latias" || attacker.name === "Latios") {
                satkMod = chainMod(0x1800, satkMod);
            }
            break;
        case "Choice Band":
            atkMod = chainMod(0x1800, atkMod);
            break;
        case "Choice Specs":
            satkMod = chainMod(0x1800, satkMod);
            break;
        default:
            if (attacker.thickClubBoosted) {
                atkMod = chainMod(0x2000, atkMod);
            } else if (attacker.lightBallBoosted) {
                atkMod = chainMod(0x2000, atkMod);
                satkMod = chainMod(0x2000, satkMod);
            }
    }

    atk = applyMod(atkMod, atk);
    satk = applyMod(satkMod, satk);

    if (field.sand && defender.stab(Types.ROCK)) {
        sdef = applyMod(0x1800, sdef);
    }

    let defMod = 0x1000;
    let sdefMod = 0x1000;

    if (defender.ability.name === "Marvel Scale" && defender.status) {
        defMod = chainMod(0x1800, defMod);
    } else if (defender.ability.name === "Grass Pelt" && field.grassyTerrain) {
        defMod = chainMod(0x1800, defMod);
    }

    if (defender.flowerGift && field.sun) {
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
        case "Soul Dew":
            if (defender.name === "Latias" || defender.name === "Latios") {
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

    let a = 0, d = 0;
    if (move.psyshock) {
        a = satk;
        d = def;
    } else if (move.physical) {
        a = atk;
        d = def;
    } else if (move.special) {
        a = satk;
        d = sdef;
    } else {
        return [0];
    }

    let baseDamage = trunc(trunc(trunc(2 * attacker.level / 5 + 2)
                                 * movePower * a / d) / 50) + 2;

    if (field.multiBattle && move.multipleTargets) {
        baseDamage = applyMod(0xC00, baseDamage);
    }

    if (move.name !== "Weather Ball") {
        if (field.harshSun && moveType === Types.WATER) {
            return [0];
        } else if (field.heavyRain && moveType === Types.FIRE) {
            return [0];
        } else if (field.sun) {
            if (moveType === Types.FIRE) {
                baseDamage = applyMod(0x1800, baseDamage);
            } else if (moveType === Types.WATER) {
                baseDamage = applyMod(0x800, baseDamage);
            }
        } else if (field.rain) {
            if (moveType === Types.WATER) {
                baseDamage = applyMod(0x1800, baseDamage);
            } else if (moveType === Types.FIRE) {
                baseDamage = applyMod(0x800, baseDamage);
            }
        } else if (field.strongWinds && defender.stab(Types.FLYING)) {
            const eff = effective(moveType, Types.FLYING, {gen: Gens.ORAS});
            if (eff.num > eff.den) {
                baseDamage = applyMod(0x800, baseDamage);
            }
        }
    }

    if (move.critical) {
        baseDamage = applyMod(0x1800, baseDamage);
    }

    let damages = damageVariation(baseDamage, 85, 100);

    if (attacker.stab(moveType) || attacker.ability.name === "Protean") {
        if (attacker.ability.name === "Adaptability") {
            damages = applyMod(0x2000, damages);
        } else {
            damages = applyMod(0x1800, damages);
        }
    }

    const moveTypes = [moveType];
    if (move.name === "Flying Press") {
        moveTypes.push(Types.FLYING);
    }
    let eff = effective(moveTypes, defender.types, {
        gen: Gens.ORAS,
        foresight: defender.foresight,
        scrappy: attacker.ability.name === "Scrappy",
        gravity: field.gravity,
        freezeDry: move.name === "Freeze-Dry",
        inverted: field.invertedBattle,
        thousandArrows: move.name === "Thousand Arrows"
    });
    if (moveTypes.includes(defender.ability.immunityType)) {
        eff = {num: 0, den: 2};
    }
    if (eff.num === 0 && move.name === "Thousand Arrows") {
        eff = {num: 2, den: 2};
    }
    if (eff.num === 0) return [0];

    damages = damages.map(d => trunc(d * eff.num / eff.den));

    if (attacker.burned && move.physical
        && attacker.ability.name !== "Guts"
        && move.name !== "Facade") {
        damages = damages.map(d => trunc(d / 2));
    }

    damages = damages.map(d => max(1, d));

    let finalMod = 0x1000;

    if (!move.critical && attacker.ability.name !== "Infiltrator") {
        if (defender.reflect && (move.physical || move.psyshock)) {
            finalMod = chainMod(field.multiBattle ? 0xA8F : 0x800, finalMod);
        }
        if (defender.lightScreen && move.special && !move.psyshock) {
            finalMod = chainMod(field.multiBattle ? 0xA8F : 0x800, finalMod);
        }
    }

    if (defender.multiscale) {
        finalMod = chainMod(0x800, finalMod);
    }

    if (defender.ability.name === "Fur Coat"
        && (move.physical || move.psyshock)) {
        finalMod = chainMod(0x800, finalMod);
    }

    if (attacker.ability.name === "Tinted Lens" && eff.num < eff.den) {
        finalMod = chainMod(0x2000, finalMod);
    }

    if (defender.friendGuard) {
        finalMod = chainMod(0xC00, finalMod);
    }

    if (attacker.ability.name === "Sniper" && move.critical) {
        finalMod = chainMod(0x1800, finalMod);
    }

    if (eff.num > eff.den && defender.ability.filterLike) {
        finalMod = chainMod(0xC00, finalMod);
    }

    if (field.fairyAura && moveType === Types.FAIRY
        || field.darkAura && moveType === Types.DARK) {
        finalMod = chainMod(field.auraBreak ? 0xAAA : 0x1555, finalMod);
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
            if (eff.num > eff.den) {
                finalMod = chainMod(0x1333, finalMod);
            }
            break;
        case "Life Orb":
            finalMod = chainMod(0x14CC, finalMod);
            break;
        /* no default */
    }

    if (defender.item.berryTypeResist === moveType
        && (eff.num > eff.den || moveType === Types.NORMAL)) {
        finalMod = chainMod(0x800, finalMod);
        defender.item.used = true;
    }

    if (move.dig && move.boostedByDig
        || move.dive && move.boostedByDive
        || move.minimize && move.boostedByMinimize) {
        finalMod = chainMod(0x2000, finalMod);
    }

    damages = applyMod(finalMod, damages);

    return damages;
}
