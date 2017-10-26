import { Pokemon } from "sulcalc";

export function copyWithEvent(pokemon) {
  const copy = new Pokemon(pokemon);
  copy.event = pokemon.event;
  return copy;
}
