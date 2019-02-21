import { maxGen, Generation, Type } from "./utilities";
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

export type AbilityOptions = Partial<Ability> & { name?: string };

export default class Ability {
  public gen: Generation = maxGen;
  public id: string = "noability";
  public disabled: boolean = false;

  constructor(ability: Ability | AbilityOptions = {}) {
    const { id, name, ...rest } = ability;
    Object.assign(this, rest);
    if (typeof id === "string") {
      this.id = abilityId(id);
    } else if (typeof name === "string") {
      this.name = name;
    }
  }

  public get name(): string {
    return abilityName(this.effectiveId());
  }

  public set name(abilityName: string) {
    this.id = abilityId(abilityName);
  }

  public nonDisabledName(): string {
    return abilityName(this.id);
  }

  public pinchType(): Type {
    return pinchType(this.effectiveId(), this.gen);
  }

  public normalToType(): Type {
    return normalToType(this.effectiveId(), this.gen);
  }

  public immunityType(): Type {
    return immunityType(this.effectiveId(), this.gen);
  }

  public ignoresAbilities(): boolean {
    return abilityIgnoresAbilities(this.effectiveId(), this.gen);
  }

  public isIgnorable(): boolean {
    return isIgnoredByMoldBreaker(this.id, this.gen);
  }

  public isSandImmunity(): boolean {
    return [
      "Magic Guard",
      "Overcoat",
      "Sand Veil",
      "Sand Rush",
      "Sand Force"
    ].includes(this.name);
  }

  public isHailImmunity(): boolean {
    return [
      "Magic Guard",
      "Overcoat",
      "Ice Body",
      "Snow Cloak",
      "Slush Rush"
    ].includes(this.name);
  }

  public reducesSuperEffective(): boolean {
    return ["Filter", "Solid Rock", "Prism Armor"].includes(this.name);
  }

  public hasCritArmor(): boolean {
    return critArmor(this.id, this.gen);
  }

  private effectiveId(): string {
    return this.disabled ? "noability" : this.id;
  }
}
