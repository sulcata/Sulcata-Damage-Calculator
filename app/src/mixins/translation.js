import i18n from "../i18n";
import { info } from "sulcalc";

function toId(data, idFn) {
  if (typeof data === "string") {
    return idFn(data);
  }
  if (data.id !== undefined) {
    return data.id;
  }
  return idFn(data.name);
}

export default {
  methods: {
    $tPokemon(pokemon) {
      const id = toId(pokemon, info.pokemonId);
      return i18n.t(`pokemons[${JSON.stringify(id)}]`);
    },
    $tMove(move) {
      const id = toId(move, info.moveId);
      return i18n.t(`moves[${JSON.stringify(id)}]`);
    },
    $tItem(item) {
      const id = toId(item, info.itemId);
      return i18n.t(`items[${JSON.stringify(id)}]`);
    },
    $tNature(nature) {
      const id = toId(nature, info.natureId);
      return i18n.t(`natures[${JSON.stringify(id)}]`);
    },
    $tAbility(ability) {
      const id = toId(ability, info.abilityId);
      return i18n.t(`abilities[${JSON.stringify(id)}]`);
    },
    $tGen(gen) {
      return i18n.t(`gens[${JSON.stringify(gen)}]`);
    },
    $tWeather(weather) {
      return i18n.t(`weathers[${JSON.stringify(weather)}]`);
    }
  }
};
