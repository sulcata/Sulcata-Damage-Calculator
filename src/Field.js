import {Weathers, maxGen} from "./utilities";

export default class Field {

    constructor(field = {}) {
        this.gen = Number(field.gen) || maxGen;
        this.multiBattle = Boolean(field.multiBattle);
        this.invertedBattle = Boolean(field.invertedBattle);

        this.weather = Number(field.weather) || Weathers.CLEAR;
        this.airLock = Boolean(field.airLock);

        this.waterSport = Boolean(field.waterSport);
        this.mudSport = Boolean(field.mudSport);

        this.magicRoom = Boolean(field.magicRoom);
        this.wonderRoom = Boolean(field.wonderRoom);

        this.grassyTerrain = Boolean(field.grassyTerrain);
        this.mistyTerrain = Boolean(field.mistyTerrain);
        this.electricTerrain = Boolean(field.electricTerrain);
        this.psychicTerrain = Boolean(field.psychicTerrain);

        this.fairyAura = Boolean(field.fairyAura);
        this.darkAura = Boolean(field.darkAura);
        this.auraBreak = Boolean(field.auraBreak);

        this.ionDeluge = Boolean(field.ionDeluge);
    }

    get effectiveWeather() {
        return this.airLock ? Weathers.CLEAR : this.weather;
    }

    get clearWeather() {
        return this.effectiveWeather === Weathers.CLEAR;
    }

    get rain() {
        return [
            Weathers.RAIN,
            Weathers.HEAVY_RAIN
        ].includes(this.effectiveWeather);
    }

    get sun() {
        return [
            Weathers.SUN,
            Weathers.HARSH_SUN
        ].includes(this.effectiveWeather);
    }

    get sand() {
        return this.effectiveWeather === Weathers.SAND;
    }

    get hail() {
        return this.effectiveWeather === Weathers.HAIL;
    }

    get heavyRain() {
        return this.effectiveWeather === Weathers.HEAVY_RAIN;
    }

    get harshSun() {
        return this.effectiveWeather === Weathers.HARSH_SUN;
    }

    get strongWinds() {
        return this.effectiveWeather === Weathers.STRONG_WINDS;
    }

}
