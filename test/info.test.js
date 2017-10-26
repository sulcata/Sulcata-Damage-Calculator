import * as info from "../src/info";
import { Gens, Stats, Types } from "../src/utilities";

describe("info", () => {
  test("natureName()", () => {
    expect(info.natureName(0)).toEqual("Hardy");
    expect(info.natureName(3)).toEqual("Adamant");
    expect(info.natureName("toString")).toBeUndefined();
    expect(info.natureName(-1)).toBeUndefined();
    expect(info.natureName(1.5)).toBeUndefined();
  });

  test("natureId()", () => {
    expect(info.natureId("  adamant ")).toEqual(3);
    expect(info.natureId("Hardy")).toEqual(0);
    expect(info.natureId("  HAsTy")).toEqual(11);
    expect(info.natureId("toString")).toBeUndefined();
  });

  test("natures()", () => {
    const natures = info.natures();
    expect(natures).toEqual([
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24
    ]);
  });

  test("natureMultiplier()", () => {
    const adamantStatMultipliers = [0, 1, 0, -1, 0, 0];
    for (let i = 0; i < 6; i++) {
      expect(info.natureMultiplier(3, i)).toEqual(adamantStatMultipliers[i]);
    }

    for (let i = 0; i < 6; i++) {
      expect(info.natureMultiplier(0, i)).toEqual(0);
    }
  });

  test("natureStats()", () => {
    expect(info.natureStats(3)).toEqual([Stats.ATK, Stats.SATK]);
    expect(info.natureStats(0)).toEqual([-1, -1]);
  });

  test("releasedPokes()", () => {
    for (const gen of Object.values(Gens)) {
      expect(info.releasedPokes(gen)).toMatchSnapshot();
    }
  });

  test("releasedMoves()", () => {
    for (const gen of Object.values(Gens)) {
      expect(info.releasedMoves(gen)).toMatchSnapshot();
    }
  });

  test("releasedItems()", () => {
    for (const gen of Object.values(Gens)) {
      expect(info.releasedItems(gen)).toMatchSnapshot();
    }
  });

  test("releasedAbilities()", () => {
    for (const gen of Object.values(Gens)) {
      expect(info.releasedAbilities(gen)).toMatchSnapshot();
    }
  });

  test("types()", () => {
    for (const gen of Object.values(Gens)) {
      expect(info.types(gen)).toMatchSnapshot();
    }
  });

  test("pokeType1()", () => {
    expect(info.pokeType1("INVALID_ID")).toEqual(Types.CURSE);
  });
});
