import Field from "../Field";
import Move from "../Move";
import Pokemon from "../Pokemon";
import { Generation, Nature } from "../utilities";
import hgssCalculate from "./hgssCalculate";

const gen = Generation.HGSS;

let field = new Field();
beforeEach(() => {
  field = new Field({ gen });
});

test("sanity check", () => {
  const attacker = new Pokemon({
    name: "Azelf",
    evs: [4, 0, 0, 252, 0, 252],
    nature: Nature.NAIVE,
    item: "Choice Band",
    gen
  });
  const defender = new Pokemon({
    name: "Skarmory",
    evs: [252, 0, 0, 0, 164, 92],
    nature: Nature.CAREFUL,
    gen
  });
  const move = new Move({ name: "Fire Blast", gen });
  const damage = hgssCalculate(attacker, defender, move, field);
  expect(Math.max(...damage)).toBe(298);
});
