import Field from "../Field";
import Move from "../Move";
import Pokemon from "../Pokemon";
import { Generation, Nature } from "../utilities";
import b2w2Calculate from "./b2w2Calculate";

const gen = Generation.B2W2;

let field = new Field();
beforeEach(() => {
  field = new Field({ gen });
});

test("sanity check", () => {
  const attacker = new Pokemon({
    name: "Heatran",
    evs: [252, 0, 0, 0, 4, 252],
    nature: Nature.TIMID,
    gen
  });
  const defender = new Pokemon({
    name: "Landorus-Therian",
    evs: [252, 0, 216, 0, 24, 16],
    nature: Nature.IMPISH,
    gen
  });
  const move = new Move({ name: "Lava Plume", gen });
  const damage = b2w2Calculate(attacker, defender, move, field);
  expect(Math.max(...damage)).toBe(150);
});
