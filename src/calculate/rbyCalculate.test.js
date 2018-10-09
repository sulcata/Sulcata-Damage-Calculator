import rbyCalculate from "sulcalc/calculate/rbyCalculate";
import Pokemon from "sulcalc/Pokemon";
import Move from "sulcalc/Move";
import Field from "sulcalc/Field";
import { Gens, Statuses } from "sulcalc/utilities";

const gen = Gens.RBY;

describe("rbyCalculate()", () => {
  let field;
  beforeEach(() => {
    field = new Field({ gen });
  });

  test("physical", () => {
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const earthquake = new Move({ name: "Earthquake", gen });
    const damage = rbyCalculate(snorlax, snorlax, earthquake, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(118);
  });

  test("special", () => {
    const chansey = new Pokemon({ name: "Chansey", gen });
    const iceBeam = new Move({ name: "Ice Beam", gen });
    const damage = rbyCalculate(chansey, chansey, iceBeam, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(81);
  });

  test("critical", () => {
    const zapdos = new Pokemon({ name: "Zapdos", gen });
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const thunderCrit = new Move({ name: "Thunder", critical: true, gen });
    const damage = rbyCalculate(zapdos, snorlax, thunderCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(453);
  });

  test("STAB", () => {
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const bodySlam = new Move({ name: "Body Slam", gen });
    const damage = rbyCalculate(snorlax, snorlax, bodySlam, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(150);
  });

  test("Reflect", () => {
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const alakazam = new Pokemon({
      name: "Alakazam",
      reflect: true,
      gen
    });
    const bodySlam = new Move({ name: "Body Slam", gen });
    const damage = rbyCalculate(snorlax, alakazam, bodySlam, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(93);
  });

  test("Light Screen", () => {
    const tauros = new Pokemon({ name: "Tauros", gen });
    const zapdos = new Pokemon({
      name: "Zapdos",
      lightScreen: true,
      gen
    });
    const blizzard = new Move({ name: "Blizzard", gen });
    const damage = rbyCalculate(tauros, zapdos, blizzard, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(72);
  });

  test("burn", () => {
    const golem = new Pokemon({
      name: "Golem",
      status: Statuses.BURNED,
      gen
    });
    const moltres = new Pokemon({ name: "Moltres", gen });
    const rockSlide = new Move({ name: "Rock Slide", gen });
    const damage = rbyCalculate(golem, moltres, rockSlide, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(220);
  });

  test("type immunity", () => {
    const gengar = new Pokemon({ name: "Gengar", gen });
    const alakazam = new Pokemon({ name: "Alakazam", gen });
    const lick = new Move({ name: "Lick", gen });
    expect(rbyCalculate(gengar, alakazam, lick, field)).toEqual([0]);
  });

  test("Explosion and Self-Destruct", () => {
    const tauros = new Pokemon({ name: "Tauros", gen });

    const gengar = new Pokemon({ name: "Gengar", gen });
    const explosion = new Move({ name: "Explosion", gen });
    const gengarDamage = rbyCalculate(gengar, tauros, explosion, field);
    expect(gengarDamage).toHaveLength(39);
    expect(Math.max(...gengarDamage)).toEqual(228);

    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const selfDestruct = new Move({ name: "Self-Destruct", gen });
    const snorlaxDamage = rbyCalculate(snorlax, tauros, selfDestruct, field);
    expect(snorlaxDamage).toHaveLength(39);
    expect(Math.max(...snorlaxDamage)).toEqual(361);
  });
});
