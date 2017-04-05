import {Gens, Types, maxGen} from "./utilities";
import {
    abilityEffects, abilityName, abilityId,
    ignoredByMoldBreaker, isAbilityUseful
} from "./info";

export default class Ability {

    constructor(ability = {}, gen) {
        if (typeof ability === "string") {
            this.name = ability;
            ability = {};
        } else if (ability.name) {
            this.name = ability.name;
        } else {
            this.id = Number(ability.id) || 0;
        }

        this.gen = Number(gen) || Number(ability.gen) || maxGen;
        this.disabled = Boolean(ability.disabled);
    }

    get name() {
        return abilityName(this.disabled ? 0 : this.id);
    }

    set name(abilityName) {
        this.id = abilityId(abilityName);
    }

    get nonDisabledName() {
        return abilityName(this.id);
    }

    get pinchType() {
        const v = this.disabled ? null : flagToValue(this.id, "7", this.gen);
        return v === null ? -1 : Number(v);
    }

    get normalToType() {
        const v = this.disabled ? null : flagToValue(this.id, "121", this.gen);
        return v === null ? -1 : Number(v);
    }

    get immunityType() {
        if (this.disabled) return -1;

        // water absorb, volt absorb, etc.
        let v = flagToValue(this.id, "70", this.gen);
        if (v !== null) return Number(v);

        // storm drain, lightning rod, etc.
        v = flagToValue(this.id, "38", this.gen);
        if (v !== null && this.gen >= Gens.B2W2) return Number(v);

        // sap sipper, etc.
        v = flagToValue(this.id, "68", this.gen);
        if (v !== null) return Number(v);

        if (hasFlag(this.id, "120", this.gen)) return Types.GROUND;
        if (hasFlag(this.id, "41", this.gen)) return Types.ELECTRIC;
        if (hasFlag(this.id, "19", this.gen)) return Types.FIRE;
        if (hasFlag(this.id, "15", this.gen)) return Types.WATER;

        return -1;
    }

    get moldBreakerLike() {
        return !this.disabled && hasFlag(this.id, "40", this.gen);
    }

    get ignorable() {
        return ignoredByMoldBreaker(this.id);
    }

    get sandImmunity() {
        return [
            "Magic Guard",
            "Overcoat",
            "Sand Veil",
            "Sand Rush",
            "Sand Force"
        ].includes(this.name);
    }

    get hailImmunity() {
        return [
            "Magic Guard",
            "Overcoat",
            "Ice Body",
            "Snow Cloak",
            "Slush Rush"
        ].includes(this.name);
    }

    get filterLike() {
        return [
            "Filter",
            "Solid Rock",
            "Prism Armor"
        ].includes(this.name);
    }

    get critArmor() {
        return [
            "Shell Armor",
            "Battle Armor"
        ].includes(this.name);
    }

    get useful() {
        return isAbilityUseful(this.id);
    }

}

function flagToValue(id, flag, gen) {
    const effects = abilityEffects(id, gen);

    if (effects !== undefined) {
        for (const effect of effects.split("|")) {
            const [flagId, value] = effect.split("-");
            if (flagId === flag) {
                return value;
            }
        }
    }

    return null;
}

function hasFlag(id, flag, gen) {
    const effects = abilityEffects(id, gen);

    if (effects !== undefined) {
        for (const effect of effects.split("|")) {
            if (effect.startsWith(flag)) {
                return true;
            }
        }
    }

    return false;
}
