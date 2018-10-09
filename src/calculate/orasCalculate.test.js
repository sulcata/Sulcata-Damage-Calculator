import orasCalculate from "sulcalc/calculate/orasCalculate";
import Pokemon from "sulcalc/Pokemon";
import Move from "sulcalc/Move";
import Field from "sulcalc/Field";
import { Gens, Natures } from "sulcalc/utilities";

const gen = Gens.ORAS;

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
  const move = new Move({
    name: "Lava Plume",
    gen
  });
  const damage = orasCalculate(attacker, defender, move, field);
  expect(Math.max(...damage)).toEqual(150);
});

test("Fairy Aura is a move power mod", () => {
  const xerneas = new Pokemon({
    name: "Xerneas",
    item: "Life Orb",
    nature: Natures.MODEST,
    evs: [0, 0, 0, 252, 0, 0],
    gen
  });
  const genesect = new Pokemon({
    name: "Genesect",
    nature: Natures.NAIVE,
    gen
  });
  const moonblast = new Move({ name: "Moonblast", gen });
  const auraField = new Field({ fairyAura: true, gen });
  expect(
    orasCalculate(xerneas, genesect, moonblast, auraField)
  ).toMatchSnapshot();
});
