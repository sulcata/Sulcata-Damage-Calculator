import Vue from "vue";
import VueI18n from "vue-i18n";
import languages from "../../translations/languages";
import en from "../../translations/en";
import {info} from "sulcalc";

Vue.use(VueI18n);

export const i18n = new VueI18n({
    locale: "en",
    fallbackLocale: "en",
    messages: {en}
});

export default {
    data() {
        return {languages};
    },
    methods: {
        async $setLocale(locale) {
            if (!i18n.messages.hasOwnProperty(locale)) {
                const module = await import(`../../translations/${locale}.js`);
                i18n.setLocaleMessage(locale, module.default);
            }
            i18n.locale = locale;
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
