import Pokemon from "../Pokemon";
import { Stat } from "../utilities";

export default (defender: Pokemon) => {
  const values: (number | "toxic")[] = [];
  const messages = [];
  const hp = defender.stat(Stat.HP);
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
