import { defaultTo } from "lodash";
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
  megaStone
} from "./info";

export default class Item {
  constructor(item = {}) {
    this.gen = defaultTo(Number(item.gen), maxGen);
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

  berryHeal(hp) {
    switch (this.name) {
      case "Sitrus Berry":
        return this.gen >= Gens.HGSS ? Math.trunc(hp / 4) : 30;
      case "Oran Berry":
      case "Berry":
        return 10;
      case "Figy Berry":
      case "Wiki Berry":
      case "Mago Berry":
      case "Aguav Berry":
      case "Iapapa Berry":
        return Math.trunc(hp / 8);
      case "Gold Berry":
        return 30;
      default:
        return 0;
    }
  }

  _effectiveId() {
    return this.used || this.disabled ? "noitem" : this.id;
  }
}
