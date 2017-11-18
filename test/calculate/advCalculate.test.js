import advCalculate from "../../src/calculate/advCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import { Gens, Natures } from "../../src/utilities";

const gen = Gens.ADV;

describe("advCalculate()", () => {
  let field;
  beforeEach(() => {
    field = new Field({ gen });
  });

  test("sanity check", () => {
    const aerodactyl = new Pokemon({
      name: "Aerodactyl",
      evs: [4, 252, 0, 0, 0, 252],
      nature: Natures.JOLLY,
      item: "Choice Band",
      gen
    });
    const skarmory = new Pokemon({
      name: "Skarmory",
      evs: [252, 0, 4, 0, 252, 0],
      nature: Natures.IMPISH,
      gen
    });
    const rockSlide = new Move({ name: "Rock Slide", gen });
    const damage = advCalculate(aerodactyl, skarmory, rockSlide, field);
    expect(Math.max(...damage)).toEqual(127);
  });

  test("ensure proper stats are used", () => {
    const celebi = new Pokemon({
      name: "Celebi",
      boosts: [0, 0, 0, 1, 0, 0],
      gen
    });
    const dugtrio = new Pokemon({
      name: "Dugtrio",
      evs: [8, 0, 0, 0, 60, 0],
      gen
    });
    const psychic = new Move({ name: "Psychic", gen });
    const damage = advCalculate(celebi, dugtrio, psychic, field);
    expect(Math.max(...damage)).toEqual(213);
  });

  test("minimize boost", () => {
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const blissey = new Pokemon({ name: "Blissey", gen });
    const stomp = new Move({
      name: "Stomp",
      minimize: true,
      gen
    });
    const damage = advCalculate(snorlax, blissey, stomp, field);
    expect(Math.max(...damage)).toEqual(753);
  });

  test("Pure Power and Huge Power boost attack", () => {
    const medicham = new Pokemon({
      name: "Medicham",
      item: "Choice Band",
      nature: Natures.ADAMANT,
      evs: [4, 252, 0, 0, 0, 252],
      gen
    });
    const snorlax = new Pokemon({
      name: "Snorlax",
      evs: [144, 68, 132, 0, 164, 0],
      gen
    });
    const brickBreak = new Move({ name: "Brick Break", gen });
    for (const ability of ["Huge Power", "Pure Power"]) {
      medicham.ability.name = ability;
      const damage = advCalculate(medicham, snorlax, brickBreak, field);
      expect(Math.max(...damage)).toEqual(686);
    }
  });

  test("Soul Dew boosts special attack and special defense", () => {
    const latias = new Pokemon({
      name: "Latias",
      item: "Soul Dew",
      nature: Natures.MODEST,
      evs: [4, 0, 0, 252, 0, 252],
      gen
    });
    const latios = new Pokemon({
      name: "Latios",
      item: "Soul Dew",
      nature: Natures.MODEST,
      evs: [4, 0, 0, 252, 0, 252],
      gen
    });
    const dragonClaw = new Move({ name: "Dragon Claw", gen });
    const latiasDamage = advCalculate(latias, latios, dragonClaw, field);
    const latiosDamage = advCalculate(latios, latias, dragonClaw, field);
    expect(Math.max(...latiasDamage)).toEqual(278);
    expect(Math.max(...latiosDamage)).toEqual(272);
  });
});
