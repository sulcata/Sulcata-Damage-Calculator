import {defaultTo, isNil} from "lodash";
import {maxGen} from "./utilities";
import {
    abilityName, abilityId, isIgnoredByMoldBreaker, isAbilityUseful,
    abilityImmunityType, ignoresAbilities, abilityPinchType, abilityNormalToType
} from "./info";

const sandImmunityAbilities = new Set([
    "Magic Guard",
    "Overcoat",
    "Sand Veil",
    "Sand Rush",
    "Sand Force"
]);

const hailImmunityAbilities = new Set([
    "Magic Guard",
    "Overcoat",
    "Ice Body",
    "Snow Cloak",
    "Slush Rush"
]);

export default class Ability {
    constructor(ability = {}) {
        if (!isNil(ability.id)) {
            this.id = Number(ability.id);
        } else if (ability.name) {
            this.name = ability.name;
        }
        this.id = defaultTo(this.id, 0);
        this.gen = defaultTo(Number(ability.gen), maxGen);
        this.disabled = Boolean(ability.disabled);
    }

    get name() {
        return abilityName(this._effectiveId());
    }

    set name(abilityName) {
        this.id = abilityId(abilityName);
    }

    nonDisabledName() {
        return abilityName(this.id);
    }

    pinchType() {
        return abilityPinchType(this._effectiveId(), this.gen);
    }

    normalToType() {
        return abilityNormalToType(this._effectiveId(), this.gen);
    }

    immunityType() {
        return abilityImmunityType(this._effectiveId(), this.gen);
    }

    ignoresAbilities() {
        return ignoresAbilities(this._effectiveId(), this.gen);
    }

    isIgnorable() {
        return isIgnoredByMoldBreaker(this.id);
    }

    isSandImmunity() {
        return sandImmunityAbilities.has(this.name);
    }

    isHailImmunity() {
        return hailImmunityAbilities.has(this.name);
    }

    reducesSuperEffective() {
        return this.name === "Filter"
            || this.name === "Solid Rock"
            || this.name === "Prism Armor";
    }

    hasCritArmor() {
        return this.name === "Shell Armor" || this.name === "Battle Armor";
    }

    isUseful() {
        return isAbilityUseful(this.id);
    }

    _effectiveId() {
        return this.disabled ? 0 : this.id;
    }
}
