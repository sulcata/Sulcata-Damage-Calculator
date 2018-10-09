import hgssCalculate from "sulcalc/calculate/hgssCalculate";
import Pokemon from "sulcalc/Pokemon";
import Move from "sulcalc/Move";
import Field from "sulcalc/Field";
import { Gens, Natures } from "sulcalc/utilities";

const gen = Gens.HGSS;

describe("hgssCalculate()", () => {
  let field;
  beforeEach(() => {
    field = new Field({ gen });
  });

  test("sanity check", () => {
    const attacker = new Pokemon({
      name: "Azelf",
      evs: [4, 0, 0, 252, 0, 252],
      nature: Natures.NAIVE,
      item: "Choice Band",
      gen
    });
    const defender = new Pokemon({
      name: "Skarmory",
      evs: [252, 0, 0, 0, 164, 92],
      nature: Natures.CAREFUL,
      gen
    });
    const move = new Move({ name: "Fire Blast", gen });
    const damage = hgssCalculate(attacker, defender, move, field);
    expect(Math.max(...damage)).toEqual(298);
  });
});
