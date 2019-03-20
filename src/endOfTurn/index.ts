import Field from "../Field";
import Pokemon from "../Pokemon";
import { Generation } from "../utilities";
import advEndOfTurn from "./advEndOfTurn";
import b2w2EndOfTurn from "./b2w2EndOfTurn";
import gscEndOfTurn from "./gscEndOfTurn";
import hgssEndOfTurn from "./hgssEndOfTurn";
import orasEndOfTurn from "./orasEndOfTurn";
import rbyEndOfTurn from "./rbyEndOfTurn";
import smEndOfTurn from "./smEndOfTurn";

export interface EndOfTurnEffects {
  values: (number | "toxic")[];
  messages: string[];
}

export default function endOfTurn(
  attacker: Pokemon,
  defender: Pokemon,
  field: Field
): EndOfTurnEffects {
  switch (field.gen) {
    case Generation.RBY:
      return rbyEndOfTurn(defender);
    case Generation.GSC:
      return gscEndOfTurn(defender, field);
    case Generation.ADV:
      return advEndOfTurn(defender, field);
    case Generation.HGSS:
      return hgssEndOfTurn(attacker, defender, field);
    case Generation.B2W2:
      return b2w2EndOfTurn(attacker, defender, field);
    case Generation.ORAS:
      return orasEndOfTurn(attacker, defender, field);
    case Generation.SM:
      return smEndOfTurn(attacker, defender, field);
    default:
      throw new RangeError(`${field.gen} is not a valid generation`);
  }
}
