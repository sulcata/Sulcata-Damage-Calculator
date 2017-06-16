import {Gens, Types, maxGen} from "./utilities";
import {
    itemId, itemName, naturalGiftPower, naturalGiftType,
    flingPower, isItemUseful, itemEffects
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
            this.id = Number(item.id) || 0;
        }
        this.gen = Number(item.gen) || maxGen;
        this.used = Boolean(item.used);
        this.disabled = Boolean(item.disabled);
    }

    get name() {
        return itemName(this.used || this.disabled ? 0 : this.id);
    }

    set name(itemName) {
        this.id = itemId(itemName);
    }

    nonDisabledName() {
        return itemName(this.used ? 0 : this.id);
    }

    boostedType() {
        const v = this.used || this.disabled
            ? null : flagToValue(this.id, "10", this.gen);
        return v === null ? -1 : Number(v);
    }

    isBerry() {
        return !this.used && this.id >= 8000;
    }

    isPlate() {
        return this.nonDisabledName().endsWith(" Plate");
    }

    berryTypeResist() {
        if (this.used || this.disabled) return -1;

        let v = flagToValue(this.id, "4", this.gen);
        if (v !== null) return Number(v);

        v = flagToValue(this.id, "5", this.gen);
        if (v) return Types.NORMAL;

        return -1;
    }

    naturalGiftPower() {
        return naturalGiftPower(
            this.used || this.disabled ? 0 : this.id, this.gen);
    }

    naturalGiftType() {
        return naturalGiftType(
            this.used || this.disabled ? 0 : this.id);
    }

    flingPower() {
        return flingPower(this.used || this.disabled ? 0 : this.id);
    }

    gemType() {
        const v = this.used || this.disabled
            ? null : flagToValue(this.id, "37", this.gen);
        return v === null ? -1 : Number(v);
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
        return this.used ? null : flagToValue(this.id, "66", this.gen);
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
        return Number(flagToValue(this.id, "68", this.gen)) || Types.NORMAL;
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
}

function flagToValue(id, flag, gen) {
    const effects = itemEffects(id, gen);

    if (effects !== undefined) {
        for (const effect of effects.split("|")) {
            const [flagId, value] = effect.split("-");
            if (flagId === flag) {
                return value || true;
            }
        }
    }

    return null;
}
