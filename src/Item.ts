import { Generation, maxGen, Type } from "./utilities";
import {
  itemId,
  itemName,
  naturalGiftPower,
  naturalGiftType,
  flingPower,
  itemBoostedType,
  berryTypeResist,
  gemType,
  memoryType,
  isBerry,
  isHeavy,
  isPlate,
  zMoveTransformsTo,
  zMoveTransformsFrom,
  megaStone
} from "./info";

const flavorBerries = new Set([
  "Figy Berry",
  "Wiki Berry",
  "Mago Berry",
  "Aguav Berry",
  "Iapapa Berry"
]);

export type ItemOptions = Partial<Item> & { name?: string };

export default class Item {
  public gen: Generation = maxGen;
  public id: string = "noitem";
  public used: boolean = false;
  public disabled: boolean = false;

  constructor(item: Item | ItemOptions = {}) {
    const { id, name, ...rest } = item;
    Object.assign(this, rest);
    if (typeof id === "string") {
      this.id = itemId(id);
    } else if (typeof name === "string") {
      this.name = name;
    }
  }

  public get name(): string {
    return itemName(this.effectiveId());
  }

  public set name(itemName: string) {
    this.id = itemId(itemName);
  }

  public nonDisabledName(): string {
    return itemName(this.used ? "noitem" : this.id);
  }

  public boostedType(): Type {
    return itemBoostedType(this.effectiveId(), this.gen);
  }

  public isBerry(): boolean {
    return isBerry(this.used ? "noitem" : this.id, this.gen);
  }

  public isPlate(): boolean {
    return isPlate(this.used ? "noitem" : this.id, this.gen);
  }

  public berryTypeResist(): Type {
    return berryTypeResist(this.effectiveId(), this.gen);
  }

  public naturalGiftPower(): number {
    return naturalGiftPower(this.effectiveId(), this.gen);
  }

  public naturalGiftType(): Type {
    return naturalGiftType(this.effectiveId(), this.gen);
  }

  public flingPower(): number {
    return flingPower(this.effectiveId(), this.gen);
  }

  public gemType(): Type {
    return gemType(this.effectiveId(), this.gen);
  }

  public isHeavy(): boolean {
    return isHeavy(this.used ? "noitem" : this.id, this.gen);
  }

  public mega(): string {
    return megaStone(this.id, this.gen);
  }

  public memoryType(): Type {
    return memoryType(this.id, this.gen);
  }

  public berryHeal(maxHp: number = NaN): number {
    const name = this.name;
    switch (name) {
      case "Sitrus Berry":
        return this.gen >= Generation.HGSS ? Math.trunc(maxHp / 4) : 30;
      case "Oran Berry":
      case "Berry":
        return 10;
      case "Gold Berry":
        return 30;
      default:
        if (flavorBerries.has(name)) {
          return this.gen >= Generation.SM
            ? Math.trunc(maxHp / 2)
            : Math.trunc(maxHp / 8);
        }
        return 0;
    }
  }

  public berryHealThreshold(maxHp: number): number {
    return this.gen >= Generation.SM && flavorBerries.has(this.name)
      ? Math.floor(maxHp / 4)
      : Math.floor(maxHp / 2);
  }

  public zMoveTransformsTo(): string | undefined {
    return zMoveTransformsTo(this.id, this.gen);
  }

  public zMoveTransformsFrom(): string | undefined {
    return zMoveTransformsFrom(this.id, this.gen);
  }

  private effectiveId(): string {
    return this.used || this.disabled ? "noitem" : this.id;
  }
}
