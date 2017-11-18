import smogon from "../../../dist/setdex/smogon";
import pokemonPerfect from "../../../dist/setdex/pokemonPerfect";
import { Pokemon, Field, maxGen } from "sulcalc";

export default {
  sets: {
    smogon,
    pokemonPerfect,
    custom: Array(maxGen + 1)
      .fill(null)
      .map(() => ({}))
  },
  enabledSets: {
    smogon: true,
    pokemonPerfect: false,
    custom: true
  },
  longRolls: false,
  fractions: false,
  gen: maxGen,
  attacker: new Pokemon(),
  defender: new Pokemon(),
  field: new Field(),
  overrideReport: null
};
