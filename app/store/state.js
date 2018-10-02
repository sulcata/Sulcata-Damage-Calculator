import smogon from "../../dist/setdex/smogon";
import pokemonPerfect from "../../dist/setdex/pokemonPerfect";
import usage from "../../dist/setdex/usage";
import { maxGen } from "sulcalc";

export default {
  sets: {
    smogon,
    pokemonPerfect,
    usage,
    custom: Array(maxGen + 1)
      .fill(null)
      .map(() => ({}))
  },
  enabledSets: {
    smogon: true,
    pokemonPerfect: false,
    usage: true,
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
