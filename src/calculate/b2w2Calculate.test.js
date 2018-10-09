import b2w2Calculate from "sulcalc/calculate/b2w2Calculate";
import Pokemon from "sulcalc/Pokemon";
import Move from "sulcalc/Move";
import Field from "sulcalc/Field";
import { Gens, Natures } from "sulcalc/utilities";

const gen = Gens.B2W2;

describe("b2w2Calculate()", () => {
  let field;
  beforeEach(() => {
    field = new Field({ gen });
  });

  test("sanity check", () => {
    const attacker = new Pokemon({
      name: "Heatran",
      evs: [252, 0, 0, 0, 4, 252],
      nature: Natures.TIMID,
      gen
    });
    const defender = new Pokemon({
      name: "Landorus-Therian",
      evs: [252, 0, 216, 0, 24, 16],
      nature: Natures.IMPISH,
      gen
    });
    const move = new Move({ name: "Lava Plume", gen });
    const damage = b2w2Calculate(attacker, defender, move, field);
    expect(Math.max(...damage)).toEqual(150);
  });
});
