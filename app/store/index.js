import state from "./state";
import * as mutations from "./mutations";
import * as getters from "./getters";
import * as actions from "./actions";
import { persistencePlugin } from "./plugins";

export default {
  strict: process.env.NODE_ENV !== "production",
  state,
  mutations,
  getters,
  actions,
  plugins: [
    persistencePlugin({
      prefix: "sulcalc",
      saveOn: {
        setGen: "gen",
        addCustomPokemonSet: "sets.custom",
        setSmogonSets: "enabledSets.smogon",
        setPokemonPerfectSets: "enabledSets.pokemonPerfect",
        setCustomSets: "enabledSets.custom",
        setLongRolls: "longRolls",
        setFractions: "fractions"
      },
      onLoad(store) {
        store.dispatch("changeGen", { gen: store.state.gen });
      }
    })
  ]
};
