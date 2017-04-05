import {Gens, Types, maxGen} from "./utilities";

import {
    itemId, itemName, naturalGiftPower, naturalGiftType,
    flingPower, isItemUseful, itemEffects
} from "./info";

const {trunc} = Math;

const heavyItems = [
    "Iron Ball",
    "Macho Brace",
    "Power Bracer",
    "Power Belt",
    "Power Lens",
    "Power Band",
    "Power Anklet",
    "Power Weight"
];

const redundantItems = {
    // Don't exclude plates & orbs as those affect damage
    // Genesect
    "649:1": "Douse Drive",
    "649:2": "Shock Drive",
    "649:3": "Burn Drive",
    "649:4": "Chill Drive",
    // Megas
    "460:1": "Abomasite",
    "359:1": "Absolite",
    "142:1": "Aerodactylite",
    "306:1": "Aggronite",
    "65:1":  "Alakazite",
    "334:1": "Altarianite",
    "181:1": "Ampharosite",
    "531:1": "Audinite",
    "354:1": "Banettite",
    "15:1":  "Beedrillite",
    "9:1":   "Blastoisinite",
    "257:1": "Blazikenite",
    "323:1": "Cameruptite",
    "6:1":   "Charizardite X",
    "6:2":   "Charizardite Y",
    "719:1": "Diancite",
    "475:1": "Galladite",
    "445:1": "Garchompite",
    "282:1": "Gardevoirite",
    "94:1":  "Gengarite",
    "362:1": "Glalitite",
    "130:1": "Gyaradosite",
    "214:1": "Heracronite",
    "229:1": "Houndoominite",
    "115:1": "Kangaskhanite",
    "380:1": "Latiasite",
    "381:1": "Latiosite",
    "428:1": "Lopunnity",
    "448:1": "Lucarionite",
    "310:1": "Manectite",
    "303:1": "Mawilite",
    "308:1": "Medichamite",
    "376:1": "Metagrossite",
    "150:1": "Mewtwonite X",
    "150:2": "Mewtwonite Y",
    "18:1":  "Pidgeotite",
    "127:1": "Pinsirite",
    "302:1": "Sablenite",
    "373:1": "Salamencite",
    "254:1": "Sceptilite",
    "212:1": "Scizorite",
    "319:1": "Sharpedonite",
    "80:1":  "Slowbronite",
    "208:1": "Steelixite",
    "260:1": "Swampertite",
    "248:1": "Tyranitarite",
    "3:1":   "Venusaurite",
    // Primals
    "383:1": "Red Orb",
    "382:1": "Blue Orb"
};

export default class Item {

    constructor(item = {}, gen) {
        if (typeof item === "string") {
            this.name = item;
            item = {};
        } else if (item.name) {
            this.name = item.name;
        } else {
            this.id = Number(item.id) || 0;
        }

        this.gen = Number(gen) || Number(item.gen) || maxGen;
        this.used = Boolean(item.used);
        this.disabled = Boolean(item.disabled);
    }

    get name() {
        return itemName(this.used || this.disabled ? 0 : this.id);
    }

    set name(itemName) {
        this.id = itemId(itemName);
    }

    get nonDisabledName() {
        return itemName(this.used ? 0 : this.id);
    }

    get typeBoosted() {
        const v = this.used || this.disabled
            ? null : flagToValue(this.id, "10", this.gen);
        return v === null ? -1 : Number(v);
    }

    isBerry() {
        return !this.used && this.id >= 8000;
    }

    isPlate() {
        return this.nonDisabledName.endsWith(" Plate");
    }

    get berryTypeResist() {
        if (this.used || this.disabled) return -1;

        let v = flagToValue(this.id, "4", this.gen);
        if (v !== null) return Number(v);

        v = flagToValue(this.id, "5", this.gen);
        if (v) return Types.NORMAL;

        return -1;
    }

    get naturalGiftPower() {
        return naturalGiftPower(
            this.used || this.disabled ? 0 : this.id, this.gen);
    }

    get naturalGiftType() {
        return naturalGiftType(
            this.used || this.disabled ? 0 : this.id);
    }

    get flingPower() {
        return flingPower(
            this.used || this.disabled ? 0 : this.id);
    }

    get gemType() {
        const v = this.used || this.disabled
            ? null : flagToValue(this.id, "37", this.gen);
        return v === null ? -1 : Number(v);
    }

    get megaPokeNum() {
        const v = this.megaPoke;
        return v === null ? null : Number(v.split(":")[0]);
    }

    get megaPokeForm() {
        const v = this.megaPoke;
        return v === null ? null : Number(v.split(":")[1]);
    }

    get megaPoke() {
        return this.used ? null : flagToValue(this.id, "66", this.gen);
    }

    get plateType() {
        return this.isPlate() ? this.typeBoosted : -1;
    }

    get heavy() {
        return heavyItems.includes(this.nonDisabledName);
    }

    get useful() {
        return isItemUseful(this.id);
    }

    isRedundant(pokeId) {
        return redundantItems[pokeId] === this.name;
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

    static get redundantItems() {
        return redundantItems;
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
