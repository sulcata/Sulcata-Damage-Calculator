import { Gens, maxGen } from "./utilities";
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

export default class Item {
  constructor(item = {}) {
    this.gen = Number(item.gen ?? maxGen);
    this.id = itemId(item.id);
    if (typeof item.name === "string") this.name = item.name;
    this.used = Boolean(item.used);
    this.disabled = Boolean(item.disabled);
  }

  get name() {
    return itemName(this._effectiveId());
  }

  set name(itemName) {
    this.id = itemId(String(itemName));
  }

  nonDisabledName() {
    return itemName(this.used ? "noitem" : this.id);
  }

  boostedType() {
    return itemBoostedType(this._effectiveId(), this.gen);
  }

  isBerry() {
    return isBerry(this.used ? "noitem" : this.id, this.gen);
  }

  isPlate() {
    return isPlate(this.used ? "noitem" : this.id, this.gen);
  }

  berryTypeResist() {
    return berryTypeResist(this._effectiveId(), this.gen);
  }

  naturalGiftPower() {
    return naturalGiftPower(this._effectiveId(), this.gen);
  }

  naturalGiftType() {
    return naturalGiftType(this._effectiveId(), this.gen);
  }

  flingPower() {
    return flingPower(this._effectiveId(), this.gen);
  }

  gemType() {
    return gemType(this._effectiveId(), this.gen);
  }

  isHeavy() {
    return isHeavy(this.used ? "noitem" : this.id, this.gen);
  }

  mega() {
    return megaStone(this.id, this.gen);
  }

  memoryType() {
    return memoryType(this.id, this.gen);
  }

  berryHeal(maxHp) {
    const name = this.name;
    switch (name) {
      case "Sitrus Berry":
        return this.gen >= Gens.HGSS ? Math.trunc(maxHp / 4) : 30;
      case "Oran Berry":
      case "Berry":
        return 10;
      case "Gold Berry":
        return 30;
      default:
        if (flavorBerries.has(name)) {
          return Math.trunc(maxHp / (this.gen >= Gens.SM ? 2 : 8));
        }
        return 0;
    }
  }

  berryHealThreshold(maxHp) {
    if (this.gen >= Gens.SM && flavorBerries.has(this.name)) {
      return Math.floor(maxHp / 4);
    }
    return Math.floor(maxHp / 2);
  }

  zMoveTransformsTo() {
    return zMoveTransformsTo(this.id, this.gen);
  }

  zMoveTransformsFrom() {
    return zMoveTransformsFrom(this.id, this.gen);
  }

  _effectiveId() {
    return this.used || this.disabled ? "noitem" : this.id;
  }
}
