import Vue from "vue";
import Vuex, {Store} from "vuex";
import state from "./state";
import * as mutations from "./mutations";
import * as getters from "./getters";
import * as actions from "./actions";
import {persistencePlugin, i18nPlugin} from "./plugins";

Vue.use(Vuex);

export default new Store({
    strict: process.env.NODE_ENV !== "production",
    state,
    mutations,
    getters,
    actions,
    plugins: [
        persistencePlugin({
            prefix: "sulcalc",
            saveOn: {
                addCustomSets: "sets.custom",
                setSmogonSets: "enabledSets.smogon",
                setPokemonPerfectSets: "enabledSets.pokemonPerfect",
                setCustomSets: "enabledSets.custom",
                setLongRolls: "longRolls",
                setFractions: "fractions"
            }
        }),
        i18nPlugin()
    ]
});
