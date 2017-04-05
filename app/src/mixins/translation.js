import Vue from "vue";
import VueI18n from "vue-i18n";

import languages from "../../translations/languages";
import en from "../../translations/en";

import {info} from "sulcalc";

const translations = {en};
Vue.use(VueI18n);
Vue.locale("en", translations.en);
Vue.config.lang = "en";
if (process.env.NODE_ENV === "production") {
    Vue.config.missingHandler = () => {};
}

export default {
    data() {
        return {languages};
    },
    methods: {
        async $setLocale(locale) {
            if (!translations.hasOwnProperty(locale)) {
                const module = await import(`../../translations/${locale}.js`);
                translations[locale] = module.default;
                Vue.locale(locale, translations[locale]);
            }
            Vue.config.lang = locale;
            return locale;
        },
        $tPokemon(pokemon) {
            const id = toId(pokemon, info.pokemonId);
            return this.$t(`pokemons[${JSON.stringify(id)}]`);
        },
        $tMove(move) {
            const id = toId(move, info.moveId);
            return this.$t(`moves[${JSON.stringify(id)}]`);
        },
        $tItem(item) {
            const id = toId(item, info.itemId);
            return this.$t(`items[${JSON.stringify(id)}]`);
        },
        $tNature(nature) {
            const id = toId(nature, info.natureId);
            return this.$t(`natures[${JSON.stringify(id)}]`);
        },
        $tAbility(ability) {
            const id = toId(ability, info.abilityId);
            return this.$t(`abilities[${JSON.stringify(id)}]`);
        },
        $tGen(gen) {
            return this.$t(`gens[${JSON.stringify(gen)}]`);
        },
        $tWeather(weather) {
            return this.$t(`weathers[${JSON.stringify(weather)}]`);
        }
    }
};

function toId(data, idFn) {
    if (typeof data === "string") {
        return idFn(data);
    }
    if (data.id !== undefined) {
        return data.id;
    }
    return idFn(data.name);
}
