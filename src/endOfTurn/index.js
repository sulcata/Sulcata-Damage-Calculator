import rbyEndOfTurn from "./rbyEndOfTurn";
import gscEndOfTurn from "./gscEndOfTurn";
import advEndOfTurn from "./advEndOfTurn";
import hgssEndOfTurn from "./hgssEndOfTurn";
import b2w2EndOfTurn from "./b2w2EndOfTurn";
import orasEndOfTurn from "./orasEndOfTurn";
import smEndOfTurn from "./smEndOfTurn";

export default (attacker, defender, field) =>
  [
    undefined,
    rbyEndOfTurn,
    gscEndOfTurn,
    advEndOfTurn,
    hgssEndOfTurn,
    b2w2EndOfTurn,
    orasEndOfTurn,
    smEndOfTurn
  ][field.gen](attacker, defender, field);
