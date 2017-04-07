import clamp from "lodash/clamp";

import Multiset from "./Multiset";
import Ability from "./Ability";
import Item from "./Item";
import Move from "./Move";
import Field from "./Field";

import {
    Gens, Genders, Stats, Statuses, Types,
    maxGen, roundHalfToZero, avg
} from "./utilities";

import {
    typeId, typeName, pokemonId, pokemonName, natureName, natureId,
    natureStats, natureMultiplier, baseStats, pokeType1, pokeType2,
    weight, evolutions, preEvolution, ability1, ability2, ability3,
    isPokeUseful, requiredItemForPoke
} from "./info";

import {
    ImportableEvError, ImportableIvError,
    ImportableLevelError, ImportableLineError
} from "./errors";

const {max, min, trunc} = Math;

const statNames = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"];
const genderShorthands = ["", "(M)", "(F)", ""];

export default class Pokemon {

    constructor(pokemon = {}, gen) {
        if (typeof pokemon === "string") {
            this.name = pokemon;
            pokemon = {};
        } else if (pokemon.name) {
            this.name = pokemon.name;
        } else {
            this.id = pokemon.id || "0:0";
        }

        gen = Number(gen) || Number(pokemon.gen) || maxGen;
        this.gen = gen;

        this.evs = pokemon.evs || Array(6).fill(gen >= Gens.ADV ? 0 : 252);
        this.ivs = pokemon.ivs || Array(6).fill(gen >= Gens.ADV ? 31 : 15);
        this.boosts = pokemon.boosts || Array(6).fill(0);
        this.level = Number(pokemon.level) || 100;
        if (pokemon.natureName) {
            this.natureName = pokemon.natureName;
        } else {
            this.nature = Number(pokemon.nature) || 0;
        }

        this.status = Number(pokemon.status) || Statuses.NO_STATUS;
        this.gender = Number(pokemon.gender) || Genders.NO_GENDER;
        this.ability = new Ability(pokemon.ability, gen);
        this.item = new Item(pokemon.item, gen);
        this.moves = (pokemon.moves || [
            {id: 0}, {id: 0}, {id: 0}, {id: 0}
        ]).map(move => new Move(move, gen));

        this.overrideTypes = pokemon.overrideTypes || [-1, -1];
        this.overrideStats = pokemon.overrideStats || [];

        this._currentHp = pokemon._currentHp || this.stat(Stats.HP);
        this._currentHpRange = new Multiset(pokemon._currentHpRange
                                            || [this.stat(Stats.HP)]);
        this._currentHpRangeBerry = new Multiset(pokemon._currentHpRangeBerry);

        // GHOST: Trick or Treat, GRASS: Forest's Curse, can't coexist
        this.addedType = Number(pokemon.addedType) || Types.CURSE;

        this.lightScreen = Boolean(pokemon.lightScreen);
        this.reflect = Boolean(pokemon.reflect);

        this.luckyChant = Boolean(pokemon.luckyChant);
        this.stockpile = Number(pokemon.stockpile) || 0;
        this.flashFire = Boolean(pokemon.flashFire);
        this.metronome = Number(pokemon.metronome) || 0;
        this.switchedOut = Boolean(pokemon.switchedOut);
        this.movedFirst = Boolean(pokemon.movedFirst);
        this.damagedPreviously = Boolean(pokemon.damagedPreviously);
        this.damagedByPainSplit = Boolean(pokemon.damagedByPainSplit);
        this.beatUpStats = pokemon.beatUpStats || [0];
        this.beatUpLevels = pokemon.beatUpLevels || [1];

        this.plus = Boolean(pokemon.plus);
        this.minus = Boolean(pokemon.minus);
        this.electrify = Boolean(pokemon.electrify);
        this.happiness = Number(pokemon.happiness) || 0;
        this.brokenMultiscale = Boolean(pokemon.brokenMultiscale);
        this.autotomize = Boolean(pokemon.autotomize);
        this.unburden = Boolean(pokemon.unburden);
        this.tailwind = Boolean(pokemon.tailwind);
        this.slowStart = Boolean(pokemon.slowStart);
        this.toxicCounter = Number(pokemon.toxicCounter) || 0;
        this.stealthRock = Boolean(pokemon.stealthRock);
        this.spikes = Number(pokemon.spikes) || 0;
        this.grounded = Boolean(pokemon.grounded);
        this.flowerGift = Boolean(pokemon.flowerGift);
        this.powerTrick = Boolean(pokemon.powerTrick);
        this.foresight = Boolean(pokemon.foresight);
        this.friendGuard = Boolean(pokemon.friendGuard);
        this.battery = Boolean(pokemon.battery);
        this.charge = Boolean(pokemon.charge);
        this.helpingHand = Boolean(pokemon.helpingHand);
    }

    static "import"(importText, gen = maxGen) {
        const poke = new Pokemon({gen});

        let nextMove = 0;

        const lines = importText.trim()
                                .replace("\r", "")
                                .replace(/ {2,}/g, " ")
                                .split("\n");

        const [identifier, item] = lines[0].split("@");

        const parensRegex = /\((.*?)\)/g;
        const firstParens = parensRegex.exec(identifier);
        if (firstParens) {
            const secondParens = parensRegex.exec(identifier);
            if (secondParens) {
                poke.name = firstParens[1];
                poke.gender = genderShorthands.indexOf(
                    secondParens[0].toUpperCase());
            } else {
                poke.gender = genderShorthands.indexOf(
                    firstParens[0].toUpperCase());
                if (poke.gender > -1) {
                    const name = identifier.match(/.*?(?=\()/)[0]
                                           .replace("*", "");
                    poke.name = name;
                } else {
                    poke.gender = 0;
                    poke.name = firstParens[1];
                }
            }
        } else {
            poke.name = identifier.replace("*", "");
        }

        if (poke.gen >= Gens.GSC && item) {
            poke.item.name = item;
        }

        for (const line of lines.slice(1)) {
            const idx = line.indexOf(":");
            const key = line.substring(0, idx)
                            .trim()
                            .toLowerCase();
            const value = line.substring(idx + 1).trim();
            switch (key) {
                case "level":
                    poke.level = parseInt(value, 10);
                    if (poke.level < 1 || poke.level > 100
                        || Number.isNaN(poke.level)) {
                        throw new ImportableLevelError(value);
                    }
                    break;
                case "ability":
                case "trait":
                    poke.ability.name = value;
                    break;
                case "evs":
                    for (const ev of value.split("/").map(s => s.trim())) {
                        const [stat, value] = parseEv(ev);
                        poke.evs[stat] = value;
                    }
                    break;
                case "ivs":
                    for (const iv of value.split("/").map(s => s.trim())) {
                        const [stat, value] = parseIv(iv, poke.gen);
                        poke.ivs[stat] = value;
                    }
                    break;
                case "shiny":
                    break;
                default:
                    if (key) throw new ImportableLineError(line);
                    if (value.charAt(0) === "-" || value.charAt(0) === "~") {
                        parseMove(value.slice(1), poke, nextMove);
                        nextMove++;
                    } else if (value.split(" ")[1].toLowerCase() === "nature") {
                        poke.natureName = value.split(" ")[0];
                    } else {
                        throw new ImportableLineError(line);
                    }
            }
        }

        poke.moves.sort(noMoveLast);

        if (poke.moves.some(move => move.name === "Return")) {
            poke.happiness = 255;
        }

        return poke;
    }

    static "export"(poke, options) {
        return poke.export(options);
    }

    "export"(options = {}) {
        const importable = [];

        const firstLine = [];
        firstLine.push(this.name);
        if (this.gen >= Gens.ADV && this.gender) {
            firstLine.push(genderShorthands[this.gender]);
        }
        if (this.gen >= Gens.GSC) {
            firstLine.push("@", this.item.name);
        }
        importable.push(firstLine.join(" "));

        if (this.gen >= Gens.ADV) {
            importable.push(`Ability: ${this.ability.name}`);
        }

        const evList = [];
        for (let i = 0; i < 6; i++) {
            const printedEv = printEv(i, this.evs[i], this.evs, this.gen);
            if (printedEv) evList.push(printedEv);
        }
        if (evList.length > 0) {
            importable.push(`EVs: ${evList.join(" / ")}`);
        }

        const hiddenPowerType = Move.hiddenPowerType(this.ivs, this.gen);
        const hiddenPower = Move.hiddenPowers(hiddenPowerType, this.gen)[0];
        const hasHiddenPower = this.gen >= Gens.GSC
            && this.moves.some(move => move.name === "Hidden Power");
        if (!hasHiddenPower
            || this.ivs.slice(1).join() !== hiddenPower.slice(1).join()) {
            const ivList = [];
            for (let i = 0; i < 6; i++) {
                const printedIv = printIv(i, this.ivs[i], this.ivs, this.gen);
                if (printedIv) ivList.push(printedIv);
            }
            if (ivList.length > 0) {
                importable.push(`IVs: ${ivList.join(" / ")}`);
            }
        }

        if (this.gen >= Gens.ADV) {
            let nature = `${this.natureName} Nature`;
            const n = natureStats(this.nature);
            if (n[0] > -1 && options.natureInfo) {
                const boosted = statNames[n[0]];
                const lowered = statNames[n[1]];
                nature += ` (+${boosted}, -${lowered})`;
            }
            importable.push(nature);
        }

        for (const move of this.moves) {
            if (move.name === "Hidden Power") {
                const type = typeName(hiddenPowerType);
                importable.push(`- Hidden Power [${type}]`);
            } else if (move.name !== "(No Move)") {
                importable.push(`- ${move.name}`);
            }
        }

        return importable.join("\n");
    }

    get name() {
        return pokemonName(this.id);
    }

    set name(pokeName) {
        this.id = pokemonId(pokeName);
    }

    get natureName() {
        return natureName(this.nature);
    }

    set natureName(natureName) {
        this.nature = natureId(natureName);
    }

    num() {
        return Number(this.id.split(":")[0]);
    }

    form() { // maybe we could call this genus?
        return Number(this.id.split(":")[1]);
    }

    stat(s) {
        if (this.powerTrick && (1 <= s && s <= 2)) {
            s = 3 - s;
        }

        if (this.overrideStats[s]) {
            return this.overrideStats[s];
        }

        const base = this.baseStat(s);
        const lvl = this.level;
        let ev, iv;
        if (this.gen < Gens.ADV && s === Stats.HP) {
            iv = calcHealthDv(this.ivs);
            ev = this.evs[s];
        } else if (this.gen < Gens.ADV && s === Stats.SDEF) {
            iv = this.ivs[Stats.SPC];
            ev = this.evs[Stats.SPC];
        } else {
            iv = this.ivs[s];
            ev = this.evs[s];
        }
        ev = trunc(ev / 4);

        if (this.gen < Gens.ADV) {
            if (s === Stats.HP) {
                // (2*(iv+base) + ev/4) * level/100 + level + 10
                return min(999, trunc(
                    ((iv + base) * 2 + ev) * lvl / 100) + lvl + 10);
            }
            // (2*(iv+base) + ev/4) * level/100 + 5
            return min(999, trunc(((iv + base) * 2 + ev) * lvl / 100) + 5);
        }

        if (s === Stats.HP) {
            // shedinja
            if (base === 1) {
                return 1;
            }
            // (iv + 2*base + ev/4 + 100) * level/100 + 10
            return trunc((iv + 2 * base + ev + 100) * lvl / 100) + 10;
        }

        // ((iv + 2*base + ev/4) * level/100 + 5)*nature
        const n = natureMultiplier(this.nature, s);
        const stat = trunc((iv + 2 * base + ev) * lvl / 100) + 5;
        return trunc(stat * (10 + n) / 10);
    }

    boost(s) {
        if (this.gen < Gens.B2W2 && this.ability.name === "Simple") {
            return clamp(2 * this.boosts[s], -6, 6);
        }
        return this.boosts[s];
    }

    boostedStat(s) {
        const boost = this.boost(s);
        const stat = this.stat(s);

        if (s === Stats.HP) {
            return stat;
        }

        if (this.gen < Gens.ADV) {
            const numerator = trunc(
                max(2, 2 + boost) / max(2, 2 - boost) * 100);
            return clamp(trunc(stat * numerator / 100), 1, 999);
        }

        return trunc(stat * max(2, 2 + boost) / max(2, 2 - boost));
    }

    speed(field = {}) {
        field = new Field(field);
        let speed = this.boostedStat(Stats.SPD);

        if (field.rain() && this.ability.name === "Swift Swim"
            || field.sun() && this.ability.name === "Chlorophyll"
            || field.sand() && this.ability.name === "Sand Rush"
            || field.hail() && this.ability.name === "Slush Rush"
            || field.electricTerrain && this.ability.name === "Surge Surfer") {
            speed *= 2;
        }

        switch (this.item.name) {
            case "Choice Scarf":
                speed = trunc(speed * 3 / 2);
                break;
            case "Quick Powder":
                if (this.name === "Ditto") speed *= 2;
                break;
            default:
                if (this.item.isHeavy()) speed = trunc(speed / 2);
        }

        if (this.status && this.ability.name === "Quick Feet") {
            speed = trunc(speed * 3 / 2);
        } else if (this.isParalyzed()) {
            speed = trunc(speed / 4);
        }

        if (this.ability.name === "Slow Start" && this.slowStart) {
            speed = trunc(speed / 2);
        }

        if (this.unburden && this.item.name === "(No Item)"
            && this.ability.name === "Unburden") {
            speed *= 2;
        }

        if (this.tailwind) {
            speed *= 2;
        }

        return speed;
    }

    baseStat(s) {
        return baseStats(this.id, this.gen)[s];
    }

    get currentHp() {
        return this._currentHp;
    }

    set currentHp(newHp) {
        this._currentHp = newHp;
        this._currentHpRange = new Multiset([newHp]);
        this._currentHpRangeBerry = new Multiset();
    }

    get currentHpRange() {
        return this._currentHpRange;
    }

    set currentHpRange(newHpRange) {
        this._currentHpRange = new Multiset(newHpRange);
        this._currentHp = avg(newHpRange.union(this.currentHpRangeBerry), 0);
    }

    get currentHpRangeBerry() {
        return this._currentHpRangeBerry;
    }

    set currentHpRangeBerry(newHpRange) {
        this._currentHpRangeBerry = new Multiset(newHpRange);
        this._currentHp = avg(newHpRange.union(this.currentHpRange), 0);
    }

    type1() {
        if (this.overrideTypes[0] > -1) {
            return this.overrideTypes[0];
        }
        return pokeType1(this.id, this.gen);
    }

    type2() {
        if (this.overrideTypes[1] > -1) {
            return this.overrideTypes[1];
        }
        return pokeType2(this.id, this.gen);
    }

    types() {
        return [
            this.type1(),
            this.type2(),
            this.addedType
        ].filter(type => type !== Types.CURSE);
    }

    stab(type) {
        return this.types().includes(type);
    }

    weight() {
        // given in 10 kg
        let w = weight(this.id);
        if (this.autotomize) {
            w = max(1, w - 1000);
        }
        if (this.ability.name === "Light Metal") {
            w = max(1, w / 2);
        } else if (this.ability.name === "Heavy Metal") {
            w *= 2;
        }
        if (this.item.name === "Float Stone") {
            w = max(1, w / 2);
        }
        return roundHalfToZero(w);
    }

    hasEvolution() {
        return Boolean(evolutions(this.id, this.gen).length);
    }

    hasPreEvolution() {
        return Boolean(preEvolution(this.id, this.gen));
    }

    isMega() {
        return this.name.startsWith("Mega ");
    }

    ability1() {
        return new Ability({
            id: ability1(this.id, this.gen),
            gen: this.gen
        });
    }

    ability2() {
        return new Ability({
            id: ability2(this.id, this.gen),
            gen: this.gen
        });
    }

    ability3() {
        return new Ability({
            id: ability3(this.id, this.gen),
            gen: this.gen
        });
    }

    holdingRequiredItem() {
        const item = new Item({
            id: requiredItemForPoke(this.id),
            gen: this.gen
        });
        return item.name === this.item.name;
    }

    hurtBySandstorm() {
        return !this.ability.isSandImmunity()
            && this.item.name !== "Safety Goggles"
            && !this.stab(Types.GROUND)
            && !this.stab(Types.ROCK)
            && !this.stab(Types.STEEL);
    }

    hurtByHail() {
        return !this.ability.isHailImmunity()
            && this.item.name !== "Safety Goggles"
            && !this.stab(Types.ICE);
    }

    multiscaleIsActive() {
        return !this.brokenMultiscale
            && this.currentHp === this.stat(Stats.HP)
            && (this.ability.name === "Multiscale"
                || this.ability.name === "Shadow Shield");
    }

    isPoisoned() {
        return this.status === Statuses.POISONED;
    }

    isBadlyPoisoned() {
        return this.status === Statuses.BADLY_POISONED;
    }

    isBurned() {
        return this.status === Statuses.BURNED;
    }

    isParalyzed() {
        return this.status === Statuses.PARALYZED;
    }

    isAsleep() {
        return this.status === Statuses.ASLEEP
            || this.ability.name === "Comatose";
    }

    isFrozen() {
        return this.status === Statuses.FROZEN;
    }

    isMale() {
        return this.gender === Genders.MALE;
    }

    isFemale() {
        return this.gender === Genders.FEMALE;
    }

    hasPlate() {
        return this.item.nonDisabledName().endsWith(" Plate");
    }

    hasDrive() {
        return this.item.nonDisabledName().endsWith(" Drive");
    }

    knockOff() {
        if (this.gen < Gens.B2W2) {
            return this.item.nonDisabledName() !== "(No Item)"
                && this.ability.name !== "Sticky Hold"
                && this.ability.name !== "Multitype"
                && !(this.item.nonDisabledName() === "Griseous Orb"
                    && this.name.includes("Giratina"));
        }
        return this.knockOffBoost() && this.ability.name !== "Sticky Hold";
    }

    knockOffBoost() {
        return this.item.nonDisabledName() !== "(No Item)"
            && !this.item.megaPoke()
            && !(this.item.nonDisabledName() === "Griseous Orb"
                && this.name.includes("Giratina"))
            && !(this.name.includes("Genesect") && this.hasDrive())
            && !(this.ability.name === "Multitype" && this.hasPlate())
            && !(this.name.includes("Kyogre")
                && this.item.nonDisabledName() === "Blue Orb")
            && !(this.name.includes("Groudon")
                && this.item.nonDisabledName() === "Red Orb");
    }

    thickClubBoosted() {
        return this.item.name === "Thick Club"
            && (this.name.includes("Cubone") || this.name.includes("Marowak"));
    }

    lightBallBoosted() {
        return this.item.name === "Light Ball" && this.name.includes("Pikachu");
    }

    isUseful() {
        return isPokeUseful(this.id);
    }

    hasCritArmor() {
        return this.ability.hasCritArmor() || this.luckyChant;
    }

    pinchAbilityActivated(moveType) {
        return this.ability.pinchType() === moveType
            && this.stat(Stats.HP) >= this.currentHp * 3;
    }

    static calcHealthDv(ivs) {
        return calcHealthDv(ivs);
    }

}

const hiddenPowerRegex = /Hidden Power( \[?(\w*)]?)?/i;

function parseMove(move, poke, nextMove) {
    const match = hiddenPowerRegex.exec(move);
    if (match) {
        poke.moves[nextMove].name = "Hidden Power";
        const type = typeId(match[2]);
        if (type !== Move.hiddenPowerType(poke.ivs, poke.gen)) {
            poke.ivs = Move.hiddenPowers(type, poke.gen)[0];
        }
    } else {
        poke.moves[nextMove].name = move;
    }
}

const statMatches = {
    HP: 0,
    Atk: 1,
    Def: 2,
    SAtk: 3,
    SpAtk: 3,
    SpA: 3,
    Spc: 3,
    SDef: 4,
    SpDef: 4,
    SpD: 4,
    Spd: 5,
    Spe: 5
};

function parseEv(ev) {
    const value = parseInt(ev, 10);
    const stat = statMatches[ev.split(" ")[1]];
    if (stat === undefined || Number.isNaN(value) || value < 0 || value > 255) {
        throw new ImportableEvError(ev);
    }
    return [stat, value];
}

function parseIv(iv, gen) {
    const max = gen >= Gens.ADV ? 31 : 15;
    const value = parseInt(iv, 10);
    const stat = statMatches[iv.split(" ")[1]];
    if (stat === undefined || Number.isNaN(value) || value < 0 || value > max) {
        throw new ImportableIvError(iv);
    }
    return [stat, value];
}

function noMoveLast(move1, move2) {
    return (move1.name === "(No Move)") - (move2.name === "(No Move)");
}

function calcHealthDv(ivs) {
    return ((ivs[Stats.ATK] & 1) << 3)
        | ((ivs[Stats.DEF] & 1) << 2)
        | ((ivs[Stats.SPD] & 1) << 1)
        | (ivs[Stats.SPC] & 1);
}

function printIv(stat, iv, ivs, gen) {
    if (gen >= Gens.ADV) {
        return iv < 31 ? `${iv} ${statNames[stat]}` : null;
    }

    if (stat === Stats.HP) {
        iv = calcHealthDv(ivs);
    } else if (stat === Stats.SDEF) {
        if (gen < Gens.GSC) return null;
        iv = ivs[Stats.SPC];
    }

    if (iv >= 15) return null;

    return gen < Gens.GSC && stat === Stats.SPC
        ? `${iv} Spc` : `${iv} ${statNames[stat]}`;
}

function printEv(stat, ev, evs, gen) {
    if (gen >= Gens.ADV) {
        return ev > 0 ? `${ev} ${statNames[stat]}` : null;
    }

    if (stat === Stats.SDEF) {
        if (gen < Gens.GSC) return null;
        ev = evs[Stats.SPC];
    }

    if (ev >= 252) return null;

    return gen < Gens.GSC && stat === Stats.SPC
        ? `${ev} Spc` : `${ev} ${statNames[stat]}`;
}
