import {defaultTo} from "lodash";
import {Gens, maxGen} from "./utilities";
import {
    itemId, itemName, naturalGiftPower, naturalGiftType,
    flingPower, isItemUseful, itemBoostedType, berryTypeResist,
    gemType, itemMega, memoryType
} from "./info";

const {trunc} = Math;

const heavyItems = new Set([
    "Iron Ball",
    "Macho Brace",
    "Power Bracer",
    "Power Belt",
    "Power Lens",
    "Power Band",
    "Power Anklet",
    "Power Weight"
]);

export default class Item {
    constructor(item = {}) {
        if (item.name) {
            this.name = item.name;
        } else {
            this.id = defaultTo(Number(item.id), 0);
        }
        this.gen = defaultTo(Number(item.gen), maxGen);
        this.used = Boolean(item.used);
        this.disabled = Boolean(item.disabled);
    }

    get name() {
        return itemName(this._effectiveId());
    }

    set name(itemName) {
        this.id = itemId(itemName);
    }

    nonDisabledName() {
        return itemName(this.used ? 0 : this.id);
    }

    boostedType() {
        return itemBoostedType(this._effectiveId(), this.gen);
    }

    isBerry() {
        return !this.used && this.id >= 8000;
    }

    isPlate() {
        return this.nonDisabledName().endsWith(" Plate");
    }

    berryTypeResist() {
        return berryTypeResist(this._effectiveId(), this.gen);
    }

    naturalGiftPower() {
        return naturalGiftPower(this._effectiveId(), this.gen);
    }

    naturalGiftType() {
        return naturalGiftType(this._effectiveId());
    }

    flingPower() {
        return flingPower(this._effectiveId());
    }

    gemType() {
        return gemType(this._effectiveId(), this.gen);
    }

    megaPokeNum() {
        const v = this.megaPoke();
        return v === null ? null : Number(v.split(":")[0]);
    }

    megaPokeForm() {
        const v = this.megaPoke();
        return v === null ? null : Number(v.split(":")[1]);
    }

    megaPoke() {
        return itemMega(this.id, this.gen);
    }

    plateType() {
        return this.isPlate() ? this.boostedType() : -1;
    }

    isHeavy() {
        return heavyItems.has(this.nonDisabledName());
    }

    isUseful() {
        return isItemUseful(this.id);
    }

    memoryType() {
        return memoryType(this.id, this.gen);
    }

    berryHeal(hp) {
        switch (this.name) {
            case "Sitrus Berry":
                return this.gen >= Gens.HGSS ? trunc(hp / 4) : 30;
            case "Oran Berry":
            case "Berry":
                return 10;
            case "Figy Berry":
            case "Wiki Berry":
            case "Mago Berry":
            case "Aguav Berry":
            case "Iapapa Berry":
                return trunc(hp / 8);
            case "Gold Berry":
                return 30;
            default:
                return 0;
        }
    }

    _effectiveId() {
        return this.used || this.disabled ? 0 : this.id;
    }
}
