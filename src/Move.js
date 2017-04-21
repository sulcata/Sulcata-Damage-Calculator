import clamp from "lodash/clamp";

import {Gens, DamageClasses, Stats, Types, Weathers, maxGen} from "./utilities";

import {
    moveId, moveName, movePower, moveDamageClass, moveType, moveCategory,
    recoil, flinchChance, moveHasFlags, statBoosts, minHits, maxHits,
    moveRange, isMoveUseful, zMovePower
} from "./info";

const {min, trunc} = Math;

const zMoves = new Set([
    "Breakneck Blitz",
    "All-Out Pummeling",
    "Supersonic Skystrike",
    "Acid Downpour",
    "Tectonic Rage",
    "Continental Crush",
    "Savage Spin-Out",
    "Never-Ending Nightmare",
    "Corkscrew Crash",
    "Inferno Overdrive",
    "Hydro Vortex",
    "Bloom Doom",
    "Gigavolt Havoc",
    "Shattered Psyche",
    "Subzero Slammer",
    "Devastating Drake",
    "Black Hole Eclipse",
    "Twinkle Tackle"
]);

const ohkoMoves = new Set([
    "Guillotine",
    "Horn Drill",
    "Fissure",
    "Sheer Cold"
]);

const rechargeMoves = new Set([
    "Hyper Beam",
    "Giga Impact",
    "Rock Wrecker",
    "Roar of Time",
    "Blast Burn",
    "Frenzy Plant",
    "Hydro Cannon"
]);

const nonCritMoves = new Set([
    "Reversal",
    "Flail",
    "Future Sight",
    "Doom Desire",
    "Spit Up"
]);

const nonParentalBondMoves = new Set([
    "Fling",
    "Self-Destruct",
    "Explosion",
    "Final Gambit",
    "Endeavor"
]);

export default class Move {

    constructor(move = {}, gen) {
        if (typeof move === "string") {
            this.name = move;
            move = {};
        } else if (move.id) {
            this.id = Number(move.id);
        } else if (move.name) {
            this.name = move.name;
        } else {
            this.id = 0;
        }

        this.gen = Number(gen) || Number(move.gen) || maxGen;

        this.critical = Boolean(move.critical);
        this.zMove = Boolean(move.zMove);
        this.numberOfHits = Number(move.numberOfHits) || 0;
        this.beatUpHit = Number(move.beatUpHit) || 0;
        this.secondHit = Boolean(move.secondHit);
        this.meFirst = Boolean(move.meFirst);
        this.furyCutter = Number(move.furyCutter) || 0;
        this.echoedVoice = Number(move.echoedVoice) || 0;
        this.trumpPP = Number(move.trumpPP) || 5;
        this.roundBoost = Boolean(move.roundBoost);
        this.minimize = Boolean(move.minimize);
        this.dig = Boolean(move.dig);
        this.dive = Boolean(move.dive);
        this.fly = Boolean(move.fly);
    }

    get name() {
        return this.zMove ? zMoves[this.type()] : moveName(this.id);
    }

    set name(moveName) {
        this.id = moveId(moveName);
    }

    power() {
        return this.zMove ? zMovePower(this.id) : movePower(this.id, this.gen);
    }

    type() {
        return moveType(this.id, this.gen);
    }

    damageClass() {
        return moveDamageClass(this.id, this.gen);
    }

    isPhysical() {
        return this.damageClass() === DamageClasses.PHYSICAL;
    }

    isSpecial() {
        return this.damageClass() === DamageClasses.SPECIAL;
    }

    isOther() {
        return this.gen > Gens.ADV && this.damageClass() === DamageClasses.OTHER
            || this.gen <= Gens.ADV && this.power() <= 0;
    }

    isPsyshockLike() {
        return this.name === "Psyshock"
            || this.name === "Psystrike"
            || this.name === "Secret Sword";
    }

    hasRecoil() {
        // negative is recoil, positive is recovery
        return !(this.gen >= Gens.HGSS && this.name === "Struggle")
            && recoil(this.id, this.gen) < 0;
    }

    flinchChance() {
        return flinchChance(this.id, this.gen);
    }

    affectedBySheerForce() {
        // OffensiveStatusInducingMove = 4
        // OffensiveStatChangingMove = 6
        // OffensiveSelfStatChangingMove = 7
        // Only stat boosts are included, not drops
        // Flinches are included
        const category = moveCategory(this.id, this.gen);
        return category === 4
            || category === 6
            || this.flinchChance() > 0
            || (category === 7 && statBoosts(this.id, this.gen)[0] > 0);
    }

    isPunch() {
        return moveHasFlags(this.id, 0x80, this.gen);
    }

    isContact() {
        return moveHasFlags(this.id, 0x1, this.gen);
    }

    isSound() {
        return moveHasFlags(this.id, 0x100, this.gen);
    }

    isPowder() {
        return moveHasFlags(this.id, 0x8000, this.gen);
    }

    isBite() {
        return moveHasFlags(this.id, 0x4000, this.gen);
    }

    isPulse() {
        return moveHasFlags(this.id, 0x800, this.gen);
    }

    isBall() {
        return moveHasFlags(this.id, 0x10000, this.gen);
    }

    minHits() {
        return minHits(this.id, this.gen);
    }

    maxHits() {
        return maxHits(this.id, this.gen);
    }

    hitsMultipleTimes() {
        return this.maxHits > 1;
    }

    hasMultipleTargets() {
        const range = moveRange(this.id, this.gen);
        return range === 4 || range === 5;
    }

    isOhko() {
        return ohkoMoves.has(this.name);
    }

    requiresRecharge() {
        return rechargeMoves.has(this.name);
    }

    isRecklessBoosted() {
        return this.hasRecoil()
            || this.name === "Jump Kick"
            || this.name === "High Jump Kick";
    }

    canCrit() {
        return this.gen < Gens.GSC
            || this.gen >= Gens.HGSS
            || !nonCritMoves.has(this.name);
    }

    affectedByParentalBond() {
        return !nonParentalBondMoves.has(this.name);
    }

    isUseful() {
        return isMoveUseful(this.id, this.gen);
    }

    optimalHappiness() {
        return this.name === "Return" ? 255 : 0;
    }

    usesHappiness() {
        return this.name === "Return" || this.name === "Frustration";
    }

    ignoresAbilities() {
        return this.name === "Moongeist Beam"
            || this.name === "Sunsteel Strike";
    }

    ignoresDefenseBoosts() {
        return this.name === "Chip Away"
            || this.name === "Sacred Sword"
            || this.name === "Darkest Lariat";
    }

    boostedByDig() {
        return this.name === "Earthquake" || this.name === "Magnitude";
    }

    boostedByDive() {
        return this.name === "Surf" || this.name === "Whirlpool";
    }

    boostedByFly() {
        return this.name === "Gust" || this.name === "Twister";
    }

    boostedByMinimize() {
        switch (this.name) {
            case "Stomp":
                return this.gen >= Gens.GSC;
            case "Astonish":
            case "Extrasensory":
            case "Needle Arm":
                return this.gen === Gens.ADV;
            case "Steamroller":
                return this.gen >= Gens.B2W2;
            case "Body Slam":
            case "Dragon Rush":
            case "Flying Press":
            case "Shadow Force":
            case "Phantom Force":
                return this.gen >= Gens.ORAS;
            case "Heavy Slam":
                return this.gen >= Gens.SM;
            default:
                return false;
        }
    }

    weakenedByGrassyTerrain() {
        return this.name === "Earthquake"
            || this.name === "Magnitude"
            || this.name === "Bulldoze";
    }

    static hiddenPowers(typeId, gen) {
        if (gen < Gens.ADV) {
            if (typeId < 1 || typeId > 16) {
                return [];
            }
            const t = typeId - 1;
            return [[
                ((t & 4) << 1) | ((t & 1) << 2) | 3,
                (t >> 2) | 12,
                (t & 3) | 12,
                15,
                15,
                15
            ]];
        }

        const hiddenPowers = [];

        // check if each possible hidden power matches the type
        for (let i = 0; i < 64; i++) {
            const ivs = [
                (i & 1) ? 31 : 30, (i & 2) ? 31 : 30, (i & 4) ? 31 : 30,
                (i & 8) ? 31 : 30, (i & 16) ? 31 : 30, (i & 32) ? 31 : 30
            ];
            if (typeId === Move.hiddenPowerType(ivs)) {
                hiddenPowers.push(ivs);
            }
        }

        return hiddenPowers.sort(ivsCmp);
    }

    static hiddenPowerBp(ivs, gen) {
        // differs for gsc
        if (gen < Gens.ADV) {
            const bits = (ivs[Stats.SPC] >> 3)
                | ((ivs[Stats.SPD] >> 2) & 2)
                | ((ivs[Stats.DEF] >> 1) & 4)
                | (ivs[Stats.ATK] & 8);
            return 31 + trunc((5 * bits + (ivs[Stats.SPC] & 3)) / 2);
        }

        // just a weird formula involving the second bit of the pokemon's IVs
        if (gen < Gens.ORAS) {
            const bits = ((ivs[Stats.HP] & 2) >> 1)
                | (ivs[Stats.ATK] & 2)
                | ((ivs[Stats.DEF] & 2) << 1)
                | ((ivs[Stats.SPD] & 2) << 2)
                | ((ivs[Stats.SATK] & 2) << 3)
                | ((ivs[Stats.SDEF] & 2) << 4);
            return 30 + trunc(bits * 40 / 63);
        }

        // constant in oras
        return 60;
    }

    static hiddenPowerType(ivs, gen) {
        // Another weird formula involving the first bit (even/odd) of the
        // pokemon's IVs. Also differs in gsc.
        if (gen < Gens.ADV) {
            return 1 + (((ivs[Stats.ATK] & 3) << 2) | (ivs[Stats.DEF] & 3));
        }

        const bits = (ivs[Stats.HP] & 1)
            | ((ivs[Stats.ATK] & 1) << 1)
            | ((ivs[Stats.DEF] & 1) << 2)
            | ((ivs[Stats.SPD] & 1) << 3)
            | ((ivs[Stats.SATK] & 1) << 4)
            | ((ivs[Stats.SDEF] & 1) << 5);
        return 1 + trunc(bits * 15 / 63);
    }

    static flail(currentHealth, totalHealth, gen) {
        if (gen === Gens.HGSS) {
            const p = trunc(64 * currentHealth / totalHealth);
            if (p < 2) return 200;
            if (p < 6) return 150;
            if (p < 13) return 100;
            if (p < 22) return 80;
            if (p < 43) return 40;
            return 20;
        }

        const p = trunc(48 * currentHealth / totalHealth);
        if (p <= 1) return 200;
        if (p <= 4) return 150;
        if (p <= 9) return 100;
        if (p <= 16) return 80;
        if (p <= 32) return 40;
        return 20;
    }

    static magnitude(magnitude) {
        return [10, 30, 50, 70, 90, 110, 150][magnitude - 4];
    }

    static weatherBall(weather) {
        if (weather === Weathers.SUN || weather === Weathers.HARSH_SUN) {
            return Types.FIRE;
        }
        if (weather === Weathers.RAIN || weather === Weathers.HEAVY_RAIN) {
            return Types.WATER;
        }
        if (weather === Weathers.SAND) {
            return Types.ROCK;
        }
        if (weather === Weathers.HAIL) {
            return Types.ICE;
        }
        return Types.NORMAL;
    }

    static trumpCard(ppLeft) {
        return [200, 80, 60, 50, 40][clamp(ppLeft, 0, 4)];
    }

    static electroBall(attackerSpeed, defenderSpeed) {
        const s = attackerSpeed / (defenderSpeed || 1);
        if (s >= 4) return 150;
        if (s >= 3) return 120;
        if (s >= 2) return 80;
        if (s >= 1) return 60;
        return 40;
    }

    static gyroBall(attackerSpeed, defenderSpeed) {
        return min(150, trunc(25 * defenderSpeed / (attackerSpeed || 1)));
    }

    static grassKnot(weight) {
        // w in kg * 10
        if (weight >= 2000) return 120;
        if (weight >= 1000) return 100;
        if (weight >= 500) return 80;
        if (weight >= 250) return 60;
        if (weight >= 100) return 40;
        return 20;
    }

    static heavySlam(attackerWeight, defenderWeight) {
        const w = trunc(attackerWeight / defenderWeight);
        if (w >= 5) return 120;
        if (w === 4) return 100;
        if (w === 3) return 80;
        if (w === 2) return 60;
        return 40;
    }

    static punishment(boosts) {
        let statBoostTotal = 0;
        for (const boost of boosts.slice(1, 8)) {
            if (boost > 0) {
                statBoostTotal += boost;
            }
        }
        return min(120, 60 + 20 * statBoostTotal);
    }

    static storedPower(boosts) {
        let statBoostTotal = 0;
        for (const boost of boosts.slice(1, 8)) {
            if (boost > 0) {
                statBoostTotal += boost;
            }
        }
        return 20 + 20 * statBoostTotal;
    }

    static frustration(happiness) {
        return trunc((255 - happiness) * 10 / 25) || 1;
    }

    static return(happiness) {
        return trunc(happiness * 10 / 25) || 1;
    }

    static eruption(hp, totalHp) {
        return trunc(150 * hp / totalHp) || 1;
    }

}

// Determines how good IVs are in comparison to each other
// Sort for ideal perfect IVs: Speed > SpA > HP > Def > SpD > Atk
function ivsCmp(a, b) {
    const stats = [
        Stats.SPD,
        Stats.SATK,
        Stats.HP,
        Stats.DEF,
        Stats.SDEF,
        Stats.ATK
    ];
    for (const stat of stats) {
        if (a[stat] !== b[stat]) return b[stat] - a[stat];
    }
    return 0;
}
