import {effectiveness} from "../info";
import {
    Gens, Stats, Types, damageVariation,
    applyMod, chainMod
} from "../utilities";
import moveInfo from "./moveInfo";

const {max, min, trunc} = Math;

export default function orasCalculate(attacker, defender, move, field) {
    const {moveType, movePower, fail} = moveInfo(attacker, defender,
                                                 move, field);
    if (fail) return [0];

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
    } else if (move.ignoresDefenseBoosts()) {
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
            if (field.sun()) satkMod = chainMod(0x1800, satkMod);
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
            if (attacker.pinchAbilityActivated(moveType)) {
                // blaze, torrent, overgrow, ...
                atkMod = chainMod(0x1800, atkMod);
                satkMod = chainMod(0x1800, satkMod);
            }
    }

    if (attacker.flowerGift && field.sun()) {
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
            if (attacker.thickClubBoosted()) {
                atkMod = chainMod(0x2000, atkMod);
            } else if (attacker.lightBallBoosted()) {
                atkMod = chainMod(0x2000, atkMod);
                satkMod = chainMod(0x2000, satkMod);
            }
    }

    atk = applyMod(atkMod, atk);
    satk = applyMod(satkMod, satk);

    if (field.sand() && defender.stab(Types.ROCK)) {
        sdef = applyMod(0x1800, sdef);
    }

    let defMod = 0x1000;
    let sdefMod = 0x1000;

    if (defender.ability.name === "Marvel Scale" && defender.status) {
        defMod = chainMod(0x1800, defMod);
    } else if (defender.ability.name === "Grass Pelt" && field.grassyTerrain) {
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
    if (move.isPsyshockLike()) {
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

    let baseDamage = trunc(trunc(trunc(2 * attacker.level / 5 + 2)
                                 * movePower * a / d) / 50) + 2;

    if (field.multiBattle && move.hasMultipleTargets()) {
        baseDamage = applyMod(0xC00, baseDamage);
    }

    if (move.name !== "Weather Ball") {
        if (field.harshSun() && moveType === Types.WATER) {
            return [0];
        } else if (field.heavyRain() && moveType === Types.FIRE) {
            return [0];
        } else if (field.sun()) {
            if (moveType === Types.FIRE) {
                baseDamage = applyMod(0x1800, baseDamage);
            } else if (moveType === Types.WATER) {
                baseDamage = applyMod(0x800, baseDamage);
            }
        } else if (field.rain()) {
            if (moveType === Types.WATER) {
                baseDamage = applyMod(0x1800, baseDamage);
            } else if (moveType === Types.FIRE) {
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
    let eff = effectiveness(moveTypes, defender.types(), {
        gen: Gens.ORAS,
        foresight: defender.foresight,
        scrappy: attacker.ability.name === "Scrappy",
        gravity: field.gravity,
        freezeDry: move.name === "Freeze-Dry",
        inverted: field.invertedBattle,
        strongWinds: field.strongWinds()
    });
    if (moveTypes.includes(defender.ability.immunityType())) {
        eff = {num: 0, den: 2};
    }
    if (eff.num === 0 && move.name === "Thousand Arrows") {
        eff = {num: 2, den: 2};
    }
    if (eff.num === 0) return [0];

    damages = damages.map(d => trunc(d * eff.num / eff.den));

    if (attacker.isBurned() && move.isPhysical()
        && attacker.ability.name !== "Guts"
        && move.name !== "Facade") {
        damages = damages.map(d => trunc(d / 2));
    }

    damages = damages.map(d => max(1, d));

    let finalMod = 0x1000;

    if (!move.critical && attacker.ability.name !== "Infiltrator") {
        if (defender.reflect && (move.isPhysical() || move.isPsyshockLike())) {
            finalMod = chainMod(field.multiBattle ? 0xA8F : 0x800, finalMod);
        }
        if (defender.lightScreen && move.isSpecial()
            && !move.isPsyshockLike()) {
            finalMod = chainMod(field.multiBattle ? 0xA8F : 0x800, finalMod);
        }
    }

    if (defender.multiscaleIsActive()) {
        finalMod = chainMod(0x800, finalMod);
    }

    if (defender.ability.name === "Fur Coat"
        && (move.isPhysical() || move.isPsyshockLike())) {
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

    if (eff.num > eff.den && defender.ability.reducesSuperEffective()) {
        finalMod = chainMod(0xC00, finalMod);
    }

    if (field.grassyTerrain && move.weakenedByGrassyTerrain()) {
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
            if (eff.num > eff.den) {
                finalMod = chainMod(0x1333, finalMod);
            }
            break;
        case "Life Orb":
            finalMod = chainMod(0x14CC, finalMod);
            break;
        /* no default */
    }

    if (moveType === defender.item.berryTypeResist()
        && (eff.num > eff.den || moveType === Types.NORMAL)) {
        finalMod = chainMod(0x800, finalMod);
        defender.item.used = true;
    }

    if (move.dig && move.boostedByDig()
        || move.dive && move.boostedByDive()
        || move.minimize && move.boostedByMinimize()) {
        finalMod = chainMod(0x2000, finalMod);
    }

    damages = applyMod(finalMod, damages);

    return damages;
}
