import { defaultTo } from "lodash";
import { maxGen } from "./utilities";
import {
  abilityId,
  abilityIgnoresAbilities,
  abilityName,
  critArmor,
  immunityType,
  isIgnoredByMoldBreaker,
  normalToType,
  pinchType
} from "./info";

export default class Ability {
  constructor(ability = {}) {
    this.gen = defaultTo(Number(ability.gen), maxGen);
    this.id = abilityId(ability.id);
    if (typeof ability.name === "string") this.name = ability.name;
    this.disabled = Boolean(ability.disabled);
  }

  get name() {
    return abilityName(this._effectiveId());
  }

  set name(abilityName) {
    this.id = abilityId(String(abilityName));
  }

  nonDisabledName() {
    return abilityName(this.id);
  }

  pinchType() {
    return pinchType(this._effectiveId(), this.gen);
  }

  normalToType() {
    return normalToType(this._effectiveId(), this.gen);
  }

  immunityType() {
    return immunityType(this._effectiveId(), this.gen);
  }

  ignoresAbilities() {
    return abilityIgnoresAbilities(this._effectiveId(), this.gen);
  }

  isIgnorable() {
    return isIgnoredByMoldBreaker(this.id, this.gen);
  }

  isSandImmunity() {
    return [
      "Magic Guard",
      "Overcoat",
      "Sand Veil",
      "Sand Rush",
      "Sand Force"
    ].includes(this.name);
  }

  isHailImmunity() {
    return [
      "Magic Guard",
      "Overcoat",
      "Ice Body",
      "Snow Cloak",
      "Slush Rush"
    ].includes(this.name);
  }

  reducesSuperEffective() {
    return ["Filter", "Solid Rock", "Prism Armor"].includes(this.name);
  }

  hasCritArmor() {
    return critArmor(this.id, this.gen);
  }

  _effectiveId() {
    return this.disabled ? "noability" : this.id;
  }
}
