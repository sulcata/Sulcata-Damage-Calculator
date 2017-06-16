import Move from "../Move";
import {
    roundHalfToZero, applyMod, chainMod,
    Gens, Stats, Statuses, Types
} from "../utilities";
import {
    isSandForceType, isLustrousType, isAdamantType,
    isGriseousType, isSoulDewType
} from "../info";

const {max, min, trunc} = Math;

export default function moveInfo(attacker, defender, move, field) {
    const gen = field.gen;
    let moveType = move.type();
    let movePower = move.power();

    switch (move.name) {
        case "Assurance":
            if (attacker.damagedPreviously) movePower *= 2;
            break;
        case "Avalanche":
        case "Revenge":
            if (attacker.damagedPreviously && !attacker.damagedByPainSplit) {
                movePower *= 2;
            }
            break;
        case "Beat Up":
            if (gen <= Gens.HGSS) {
                moveType = Types.CURSE;
            } else {
                const stat = attacker.beatUpStats[move.beatUpHit];
                movePower = trunc(stat / 10) + 5;
            }
            break;
        case "Brine":
            if (defender.currentHp * 2 <= defender.stat(Stats.HP)) {
                movePower *= 2;
            }
            break;
        case "Echoed Voice":
            movePower = min(200, 40 + 40 * move.echoedVoice);
            break;
        case "Electro Ball":
            movePower = Move.electroBall(attacker.speed(), defender.speed());
            break;
        case "Facade":
            if (attacker.status !== Statuses.NO_STATUS) movePower *= 2;
            break;
        case "Fire Pledge":
        case "Water Pledge":
        case "Grass Pledge":
            if (move.pledgeBoost) movePower *= 2;
            break;
        case "Flail":
        case "Reversal":
            movePower = Move.flail(attacker.currentHp,
                                   attacker.stat(Stats.HP),
                                   gen);
            break;
        case "Fling":
            movePower = attacker.item.flingPower();
            break;
        case "Frustration":
            movePower = Move.frustration(attacker.happiness);
            break;
        case "Fury Cutter":
            movePower = min(160, movePower * 2 ** move.furyCutter);
            break;
        case "Future Sight":
        case "Doom Desire":
            if (gen <= Gens.HGSS) moveType = Types.CURSE;
            break;
        case "Gyro Ball":
            movePower = Move.gyroBall(attacker.speed(), defender.speed());
            break;
        case "Hex":
            if (defender.status) movePower *= 2;
            break;
        case "Hidden Power":
            moveType = Move.hiddenPowerType(attacker.ivs, gen);
            movePower = Move.hiddenPowerBp(attacker.ivs, gen);
            break;
        case "Heavy Slam":
        case "Heat Crash":
            movePower = Move.heavySlam(attacker.weight(), defender.weight());
            break;
        case "Judgment":
            if (attacker.item.isPlate()) moveType = attacker.item.plateType();
            break;
        case "Low Kick":
        case "Grass Knot":
            movePower = Move.grassKnot(defender.weight());
            break;
        case "Magnitude":
            movePower = Move.magnitude(move.magnitude);
            break;
        case "Natural Gift":
            if (attacker.item.disabled || !attacker.item.isBerry()) {
                return {fail: true};
            }
            moveType = attacker.item.naturalGiftType();
            movePower = attacker.item.naturalGiftPower();
            break;
        case "Present":
            movePower = move.present;
            break;
        case "Payback":
            if (defender.movedFirst) movePower *= 2;
            break;
        case "Punishment":
            movePower = Move.punishment(defender.boosts);
            break;
        case "Pursuit":
            if (gen >= Gens.ADV && defender.switchedOut) movePower *= 2;
            break;
        case "Return":
            movePower = Move.return(attacker.happiness);
            break;
        case "Rollout":
        case "Ice Ball":
            movePower *= 2 ** ((move.rollout - 1) % 5 + move.defenseCurl);
            break;
        case "Round":
            if (move.roundBoost) movePower *= 2;
            break;
        case "Smelling Salts":
            if (defender.isParalyzed()) movePower *= 2;
            break;
        case "Spit Up":
            if (attacker.stockpile === 0) return {fail: true};
            movePower *= attacker.stockpile;
            break;
        case "Stored Power":
        case "Power Trip":
            movePower = Move.storedPower(attacker.boosts);
            break;
        case "Triple Kick":
            movePower *= move.tripleKickCount;
            break;
        case "Trump Card":
            movePower = Move.trumpCard(move.trumpPP);
            break;
        case "Wake-Up Slap":
            if (defender.isAsleep()) movePower *= 2;
            break;
        case "Water Spout":
        case "Eruption":
            movePower = Move.eruption(attacker.currentHp,
                                      attacker.stat(Stats.HP));
            break;
        case "Weather Ball":
            moveType = Move.weatherBall(field.effectiveWeather());
            if (gen >= Gens.HGSS && moveType !== Types.NORMAL) {
                movePower *= 2;
            }
            break;
        case "Wring Out":
        case "Crush Grip": {
            const r = 120 * defender.currentHp / defender.stat(Stats.HP);
            if (gen <= Gens.HGSS) {
                movePower = 1 + trunc(r);
            } else {
                movePower = max(1, roundHalfToZero(r));
            }
            break;
        }
        default:
            if (gen >= Gens.B2W2) {
                if (move.fly && move.boostedByFly()) {
                    movePower *= 2;
                } else if (attacker.ability.name === "Liquid Voice"
                           && move.isSound()) {
                    moveType = Types.WATER;
                } else if (move.name === "Multi-Attack") {
                    moveType = attacker.item.memoryType();
                }
            }
    }

    if (Gens.GSC <= gen && gen <= Gens.ADV) {
        if (move.dig && move.boostedByDig()
            || move.dive && move.boostedByDive()
            || move.fly && move.boostedByFly()) {
            movePower *= 2;
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
    } else if (gen === Gens.HGSS) {
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
                if (move.isPhysical()) movePower = trunc(movePower * 11 / 10);
                break;
            case "Wise Glasses":
                if (move.isSpecial()) movePower = trunc(movePower * 11 / 10);
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
                if (moveType === attacker.item.boostedType()) {
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
                if (moveType === Types.FIRE) movePower = trunc(movePower / 2);
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
        if (field.mudSport && moveType === Types.ELECTRIC
            || field.waterSport && moveType === Types.FIRE) {
            movePower = trunc(movePower / 2);
        }
    } else if (gen >= Gens.B2W2) {
        const gemBoost = moveType === attacker.item.gemType();
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
                if (attacker.isBurned() && move.isSpecial()) {
                    movePowerMod = chainMod(0x1800, movePowerMod);
                }
                break;
            case "Analytic":
                if (defender.movedFirst) {
                    movePowerMod = chainMod(0x14CD, movePowerMod);
                }
                break;
            case "Reckless":
                if (move.isRecklessBoosted()) {
                    movePowerMod = chainMod(0x1333, movePowerMod);
                }
                break;
            case "Iron Fist":
                if (move.isPunch()) {
                    movePowerMod = chainMod(0x1333, movePowerMod);
                }
                break;
            case "Toxic Boost":
                if ((attacker.isPoisoned() || attacker.isBadlyPoisoned())
                    && move.isPhysical()) {
                    movePowerMod = chainMod(0x1800, movePowerMod);
                }
                break;
            case "Rivalry":
                if (attacker.gender && defender.gender) {
                    if (attacker.gender === defender.gender) {
                        movePowerMod = chainMod(0xC00, movePowerMod);
                    } else {
                        movePowerMod = chainMod(0x1400, movePowerMod);
                    }
                }
                break;
            case "Sand Force":
                if (field.sand() && isSandForceType(moveType)) {
                    movePowerMod = chainMod(0x14CD, movePowerMod);
                }
                break;
            case "Normalize":
                moveType = Types.NORMAL;
                break;
            case "Tough Claws":
                if (move.isContact()) {
                    movePowerMod = chainMod(0x1555, movePowerMod);
                }
                break;
            case "Strong Jaw":
                if (move.isBite()) {
                    movePowerMod = chainMod(0x1800, movePowerMod);
                }
                break;
            case "Mega Launcher":
                if (move.isPulse()) {
                    movePowerMod = chainMod(0x1800, movePowerMod);
                }
                break;
            case "Parental Bond":
                if (move.secondHit) {
                    const mod = gen <= Gens.ORAS ? 0x800 : 0x400;
                    movePowerMod = chainMod(mod, movePowerMod);
                }
                break;
            case "Steelworker":
                if (moveType === Types.STEEL) {
                    movePowerMod = chainMod(0x1800, movePowerMod);
                }
                break;
            case "Water Bubble":
                if (moveType === Types.WATER) {
                    movePowerMod = chainMod(0x1800, movePowerMod);
                }
                break;
            default:
                if (moveType === Types.NORMAL
                    && attacker.ability.normalToType() > -1) {
                    // refrigerate, etc.
                    movePowerMod = chainMod(0x14CD, movePowerMod);
                    moveType = attacker.ability.normalToType();
                }
        }
        if (moveType === Types.FIRE) {
            switch (defender.ability.name) {
                case "Heatproof":
                case "Water Bubble":
                    movePowerMod = chainMod(0x800, movePowerMod);
                    break;
                case "Dry Skin":
                    movePowerMod = chainMod(0x1400, movePowerMod);
                    break;
                /* no default */
            }
        }
        if (attacker.ability.name === "Sheer Force"
            && move.affectedBySheerForce()) {
            movePowerMod = chainMod(0x14CD, movePowerMod);
        }
        switch (attacker.item.name) {
            case "Muscle Band":
                if (move.isPhysical()) {
                    movePowerMod = chainMod(0x1199, movePowerMod);
                }
                break;
            case "Wise Glasses":
                if (move.isSpecial()) {
                    movePowerMod = chainMod(0x1199, movePowerMod);
                }
                break;
            case "Adamant Orb":
                if (attacker.name === "Dialga" && isAdamantType(moveType)) {
                    movePowerMod = chainMod(0x1333, movePowerMod);
                }
                break;
            case "Lustrous Orb":
                if (attacker.name === "Palkia" && isLustrousType(moveType)) {
                    movePowerMod = chainMod(0x1333, movePowerMod);
                }
                break;
            case "Griseous Orb":
                if (attacker.name.startsWith("Giratina")
                    && isGriseousType(moveType)) {
                    movePowerMod = chainMod(0x1333, movePowerMod);
                }
                break;
            case "Soul Dew":
                if (gen >= Gens.SM
                    && isSoulDewType(moveType)
                    && (attacker.name === "Latias"
                        || attacker.name === "Latios")) {
                    movePowerMod = chainMod(0x1333, movePowerMod);
                }
                break;
            default:
                if (gemBoost) {
                    const mod = gen === Gens.B2W2 ? 0x1800 : 0x14CD;
                    movePowerMod = chainMod(mod, movePowerMod);
                } else if (moveType === attacker.item.boostedType()) {
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
                if (attacker.isPoisoned() || attacker.isBadlyPoisoned()) {
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
                if (gen >= Gens.ORAS && defender.knockOffBoost()) {
                    movePowerMod = chainMod(0x1800, movePowerMod);
                }
                break;
            /* no default */
        }
        if (move.meFirst) {
            movePowerMod = chainMod(0x1800, movePowerMod);
        }
        if (move.name === "Solar Beam" && !field.sun()
            && !field.isClearWeather()) {
            movePowerMod = chainMod(0x800, movePowerMod);
        }
        if (attacker.charge && moveType === Types.ELECTRIC) {
            movePowerMod = chainMod(0x2000, movePowerMod);
        }
        if (attacker.helpingHand) {
            movePowerMod = chainMod(0x1800, movePowerMod);
        }
        if (field.waterSport && moveType === Types.FIRE
            || field.mudSport && moveType === Types.ELECTRIC) {
            movePowerMod = chainMod(0x548, movePowerMod);
        }
        if ((field.grassyTerrain && moveType === Types.GRASS
            || field.electricTerrain && moveType === Types.ELECTRIC)
            && attacker.grounded) {
            movePowerMod = chainMod(0x1800, movePowerMod);
        }
        if (field.mistyTerrain && defender.grounded
            && moveType === Types.DRAGON) {
            movePowerMod = chainMod(0x800, movePowerMod);
        }
        if (field.ionDeluge && moveType === Types.NORMAL
            || attacker.electrify) {
            moveType = Types.ELECTRIC;
        }
        if (field.fairyAura && moveType === Types.FAIRY
            || field.darkAura && moveType === Types.DARK) {
            const mod = field.auraBreak ? 0xC00 : 0x1547;
            movePowerMod = chainMod(mod, movePowerMod);
        }
        movePower = max(1, applyMod(movePowerMod, movePower));
    }

    return {moveType, movePower};
}
