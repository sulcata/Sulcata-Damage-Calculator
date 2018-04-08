import smogon from "../../../dist/setdex/smogon";
import pokemonPerfect from "../../../dist/setdex/pokemonPerfect";
import { maxGen } from "sulcalc";

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
  attacker: null,
  defender: null,
  field: null,
  overrideReport: null
};
