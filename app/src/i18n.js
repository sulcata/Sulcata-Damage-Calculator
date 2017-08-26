import Vue from "vue";
import VueI18n from "vue-i18n";
import en from "../translations/en";
import {info} from "sulcalc";

Vue.use(VueI18n);

const i18n = new VueI18n({
    locale: "en",
    fallbackLocale: "en",
    messages: {en}
});

export default i18n;

export function tPokemon(pokemon) {
    const id = toId(pokemon, info.pokemonId);
    return i18n.t(`pokemons[${JSON.stringify(id)}]`);
}

export function tMove(move) {
    const id = toId(move, info.moveId);
    return i18n.t(`moves[${JSON.stringify(id)}]`);
}

export function tItem(item) {
    const id = toId(item, info.itemId);
    return i18n.t(`items[${JSON.stringify(id)}]`);
}

export function tNature(nature) {
    const id = toId(nature, info.natureId);
    return i18n.t(`natures[${JSON.stringify(id)}]`);
}

export function tAbility(ability) {
    const id = toId(ability, info.abilityId);
    return i18n.t(`abilities[${JSON.stringify(id)}]`);
}

export function tGen(gen) {
    return i18n.t(`gens[${JSON.stringify(gen)}]`);
}

export function tWeather(weather) {
    return i18n.t(`weathers[${JSON.stringify(weather)}]`);
}

function toId(data, idFn) {
    if (typeof data === "string") {
        return idFn(data);
    }
    if (data.id !== undefined) {
        return data.id;
    }
    return idFn(data.name);
}
