import { Field, Generation, Pokemon, maxGen } from "sulcalc";
import pokemonPerfect from "../../dist/setdex/pokemonPerfect";
import smogon from "../../dist/setdex/smogon";
import usage from "../../dist/setdex/usage";

type Set = ReturnType<Pokemon["toSet"]>;
export interface GenSetdex {
  [pokeId: string]: {
    [setName: string]: Set;
  };
}

export interface Setdex {
  [Generation.RBY]: GenSetdex;
  [Generation.GSC]: GenSetdex;
  [Generation.ADV]: GenSetdex;
  [Generation.HGSS]: GenSetdex;
  [Generation.B2W2]: GenSetdex;
  [Generation.ORAS]: GenSetdex;
  [Generation.SM]: GenSetdex;
}

export type SetdexName = "smogon" | "pokemonPerfect" | "usage" | "custom";

export interface State {
  sets: { [name in SetdexName]: Setdex };
  enabledSets: { [name in SetdexName]: boolean };
  longRolls: boolean;
  fractions: boolean;
  gen: Generation;
  attacker: Pokemon;
  defender: Pokemon;
  field: Field;
  reportOverrideIndex: number;
  reportStick: boolean;
  [key: string]: unknown;
}

export default (): State => ({
  sets: {
    smogon: (smogon as unknown) as Setdex,
    pokemonPerfect: (pokemonPerfect as unknown) as Setdex,
    usage: (usage as unknown) as Setdex,
    custom: {
      [Generation.RBY]: {},
      [Generation.GSC]: {},
      [Generation.ADV]: {},
      [Generation.HGSS]: {},
      [Generation.B2W2]: {},
      [Generation.ORAS]: {},
      [Generation.SM]: {}
    }
  },
  enabledSets: {
    smogon: true,
    pokemonPerfect: false,
    usage: true,
    custom: true
  },
  longRolls: false,
  fractions: false,
  sortByUsage: false,
  gen: maxGen,
  attacker: new Pokemon(),
  defender: new Pokemon(),
  field: new Field(),
  reportOverrideIndex: -1,
  reportStick: false
});
