import Pokemon from "../Pokemon";
import Field from "../Field";
import { Stat, Type } from "../utilities";

export default (attacker: Pokemon, defender: Pokemon, field: Field) => {
  const values: (number | "toxic")[] = [];
  const messages = [];
  const hp = defender.stat(Stat.HP);

  if (field.sand() && defender.hurtBySandstorm()) {
    values.push(-Math.max(1, Math.trunc(hp / 16)));
    messages.push("Sandstorm");
  } else if (field.hail() && defender.hurtByHail()) {
    values.push(-Math.max(1, Math.trunc(hp / 16)));
    messages.push("Hail");
  }

  if (defender.ability.name === "Dry Skin") {
    if (field.sun()) {
      values.push(-Math.max(1, Math.trunc(hp / 8)));
      messages.push("Dry Skin");
    } else if (field.rain()) {
      values.push(Math.max(1, Math.trunc(hp / 8)));
      messages.push("Dry Skin");
    }
  } else if (field.rain() && defender.ability.name === "Rain Dish") {
    values.push(Math.max(1, Math.trunc(hp / 16)));
    messages.push("Rain Dish");
  } else if (field.hail() && defender.ability.name === "Ice Body") {
    values.push(Math.max(1, Math.trunc(hp / 16)));
    messages.push("Ice Body");
  }
  // fire pledge + grass pledge damage
  if (defender.item.name === "Leftovers") {
    values.push(Math.max(1, Math.trunc(hp / 16)));
    messages.push("Leftovers");
  } else if (defender.item.name === "Black Sludge") {
    if (defender.stab(Type.POISON)) {
      values.push(Math.max(1, Math.trunc(hp / 16)));
    } else {
      values.push(-Math.max(1, Math.trunc(hp / 16)));
    }
    messages.push("Black Sludge");
  }
  if (field.grassyTerrain() && defender.isGrounded(field)) {
    values.push(Math.max(1, Math.trunc(hp / 16)));
    messages.push("Grassy Terrain");
  }
  // aqua ring
  // ingrain
  // leech seed
  if (
    defender.ability.nonDisabledName() === "Heatproof" &&
    defender.isBurned()
  ) {
    values.push(-Math.max(1, Math.trunc(hp / 32)));
    messages.push("Burn");
  } else if (defender.isBurned()) {
    values.push(-Math.max(1, Math.trunc(hp / 16)));
    messages.push("Burn");
  } else if (defender.isPoisoned()) {
    values.push(-Math.max(1, Math.trunc(hp / 8)));
    messages.push("Poison");
  } else if (defender.isBadlyPoisoned()) {
    values.push("toxic");
    messages.push("Toxic");
  }
  // nightmare
  // curse
  // multi turns -- whirlpool, flame wheel, etc
  if (defender.isAsleep() && attacker.ability.name === "Bad Dreams") {
    values.push(-Math.max(1, Math.trunc(hp / 8)));
    messages.push("Bad Dreams");
  }
  if (defender.item.name === "Sticky Barb") {
    values.push(-Math.max(1, Math.trunc(hp / 8)));
    messages.push("Sticky Barb");
  }

  if (defender.ability.name === "Magic Guard") {
    for (let i = 1; i < values.length; i++) {
      if (values[i] < 0) {
        values.splice(i, 1);
        messages.splice(i, 1);
      }
    }
  }

  return {
    values,
    messages
  };
};
