import Pokemon from "../Pokemon";
import Field from "../Field";
import { Generation } from "../utilities";
import rbyEndOfTurn from "./rbyEndOfTurn";
import gscEndOfTurn from "./gscEndOfTurn";
import advEndOfTurn from "./advEndOfTurn";
import hgssEndOfTurn from "./hgssEndOfTurn";
import b2w2EndOfTurn from "./b2w2EndOfTurn";
import orasEndOfTurn from "./orasEndOfTurn";
import smEndOfTurn from "./smEndOfTurn";

export interface IEndOfTurnEffects {
  values: (number | "toxic")[];
  messages: string[];
}

export default function endOfTurn(
  attacker: Pokemon,
  defender: Pokemon,
  field: Field
): IEndOfTurnEffects {
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
