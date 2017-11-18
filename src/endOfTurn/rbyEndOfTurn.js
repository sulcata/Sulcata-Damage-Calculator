import { Stats } from "../utilities";

export default (attacker, defender) => {
  const values = [];
  const messages = [];
  const hp = defender.stat(Stats.HP);
  if (defender.isBurned()) {
    values.push(-Math.max(1, Math.trunc(hp / 16)));
    messages.push("Burn");
  } else if (defender.isPoisoned()) {
    values.push(-Math.max(1, Math.trunc(hp / 16)));
    messages.push("Poison");
  } else if (defender.isBadlyPoisoned()) {
    values.push("toxic");
    messages.push("Toxic");
  }

  return {
    values,
    messages
  };
};
