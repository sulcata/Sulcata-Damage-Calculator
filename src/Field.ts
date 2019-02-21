import { Generation, maxGen, Terrain, Weather } from "./utilities";

export type FieldOptions = Partial<Field>;

export default class Field {
  public gen: Generation = maxGen;
  public weather: Weather = Weather.CLEAR;
  public terrain: Terrain = Terrain.NO_TERRAIN;
  public multiBattle: boolean = false;
  public invertedBattle: boolean = false;
  public airLock: boolean = false;
  public waterSport: boolean = false;
  public mudSport: boolean = false;
  public magicRoom: boolean = false;
  public wonderRoom: boolean = false;
  public gravity: boolean = false;
  public fairyAura: boolean = false;
  public darkAura: boolean = false;
  public auraBreak: boolean = false;
  public ionDeluge: boolean = false;

  constructor(field: Field | FieldOptions = {}) {
    Object.assign(this, field);
  }

  public effectiveWeather(): Weather {
    return this.airLock ? Weather.CLEAR : this.weather;
  }

  public isClearWeather(): boolean {
    return this.effectiveWeather() === Weather.CLEAR;
  }

  public rain(): boolean {
    const weather = this.effectiveWeather();
    return weather === Weather.RAIN || weather === Weather.HEAVY_RAIN;
  }

  public sun(): boolean {
    const weather = this.effectiveWeather();
    return weather === Weather.SUN || weather === Weather.HARSH_SUN;
  }

  public sand(): boolean {
    return this.effectiveWeather() === Weather.SAND;
  }

  public hail(): boolean {
    return this.effectiveWeather() === Weather.HAIL;
  }

  public heavyRain(): boolean {
    return this.effectiveWeather() === Weather.HEAVY_RAIN;
  }

  public harshSun(): boolean {
    return this.effectiveWeather() === Weather.HARSH_SUN;
  }

  public strongWinds(): boolean {
    return this.effectiveWeather() === Weather.STRONG_WINDS;
  }

  public grassyTerrain(): boolean {
    return this.terrain === Terrain.GRASSY_TERRAIN;
  }

  public mistyTerrain(): boolean {
    return this.terrain === Terrain.MISTY_TERRAIN;
  }

  public electricTerrain(): boolean {
    return this.terrain === Terrain.ELECTRIC_TERRAIN;
  }

  public psychicTerrain(): boolean {
    return this.terrain === Terrain.PSYCHIC_TERRAIN;
  }
}
