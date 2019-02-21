import Field from "../Field";
import Move from "../Move";
import Pokemon from "../Pokemon";
import { Generation, Nature } from "../utilities";
import orasCalculate from "./orasCalculate";

const gen = Generation.ORAS;

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
  const move = new Move({
    name: "Lava Plume",
    gen
  });
  const damage = orasCalculate(attacker, defender, move, field);
  expect(Math.max(...damage)).toBe(150);
});

test("Fairy Aura is a move power mod", () => {
  const xerneas = new Pokemon({
    name: "Xerneas",
    item: "Life Orb",
    nature: Nature.MODEST,
    evs: [0, 0, 0, 252, 0, 0],
    gen
  });
  const genesect = new Pokemon({
    name: "Genesect",
    nature: Nature.NAIVE,
    gen
  });
  const moonblast = new Move({ name: "Moonblast", gen });
  const auraField = new Field({ fairyAura: true, gen });
  expect(
    orasCalculate(xerneas, genesect, moonblast, auraField)
  ).toMatchSnapshot();
});
