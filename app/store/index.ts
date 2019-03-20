import { Store, StoreOptions } from "vuex";
import * as actions from "./actions";
import * as getters from "./getters";
import * as mutations from "./mutations";
import { persistencePlugin } from "./plugins";
import state, { State } from "./state";

const store: StoreOptions<State> = {
  strict: process.env.NODE_ENV !== "production",
  state,
  mutations,
  getters,
  actions,
  plugins: [
    persistencePlugin<State>({
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
      async onLoad(store: Store<State>) {
        await store.dispatch("changeGen", { gen: store.state.gen });
      }
    })
  ]
};

export default store;
