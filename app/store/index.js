import state from "./state";
import * as mutations from "./mutations";
import * as getters from "./getters";
import { persistencePlugin } from "./plugins";

export default {
  strict: process.env.NODE_ENV !== "production",
  state,
  mutations,
  getters,
  plugins: [
    persistencePlugin({
      prefix: "sulcalc",
      saveOn: {
        changeGen: "gen",
        importPokemon: "sets.custom",
        toggleSmogonSets: "enabledSets.smogon",
        togglePokemonPerfectSets: "enabledSets.pokemonPerfect",
        toggleCustomSets: "enabledSets.custom",
        toggleLongRolls: "longRolls",
        toggleFractions: "fractions"
      },
      onLoad(store) {
        store.commit("changeGen", { gen: store.state.gen });
      }
    })
  ]
};
