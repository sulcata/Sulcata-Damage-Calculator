import * as info from "../src/info";
import { Gens, Natures, Stats, Types } from "../src/utilities";

describe("info", () => {
  test("natureName()", () => {
    expect(info.natureName(0)).toEqual("Hardy");
    expect(info.natureName(3)).toEqual("Adamant");
    expect(info.natureName("toString")).toEqual("Hardy");
    expect(info.natureName(-1)).toEqual("Hardy");
    expect(info.natureName(1.5)).toEqual("Hardy");
  });

  test("natureId()", () => {
    expect(info.natureId("  adamant ")).toEqual(Natures.ADAMANT);
    expect(info.natureId("Hardy")).toEqual(Natures.HARDY);
    expect(info.natureId("  HAsTy")).toEqual(Natures.HASTY);
    expect(info.natureId("toString")).toEqual(Natures.HARDY);
  });

  test("genName()", () => {
    expect(info.genName(Gens.RBY)).toEqual("RBY");
    expect(info.genName(Gens.GSC)).toEqual("GSC");
    expect(info.genName(Gens.ADV)).toEqual("ADV");
    expect(info.genName(Gens.HGSS)).toEqual("HGSS");
    expect(info.genName(Gens.B2W2)).toEqual("B2W2");
    expect(info.genName(Gens.ORAS)).toEqual("ORAS");
    expect(info.genName(Gens.SM)).toEqual("SM");
  });

  test("natureMultiplier()", () => {
    const adamantStatMultipliers = [0, 1, 0, -1, 0, 0];
    for (let i = 0; i < 6; i++) {
      expect(info.natureMultiplier(Natures.ADAMANT, i)).toEqual(
        adamantStatMultipliers[i]
      );
    }

    for (let i = 0; i < 6; i++) {
      expect(info.natureMultiplier(Natures.HARDY, i)).toEqual(0);
    }
  });

  test("natureStats()", () => {
    expect(info.natureStats(Natures.ADAMANT)).toEqual([Stats.ATK, Stats.SATK]);
    expect(info.natureStats(Natures.HARDY)).toEqual([-1, -1]);
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

  test("isLustrousType()", () => {
    expect(info.isLustrousType(Types.WATER)).toBe(true);
    expect(info.isLustrousType(Types.DRAGON)).toBe(true);
    expect(info.isLustrousType(Types.NORMAL)).toBe(false);
  });

  test("isAdamantType()", () => {
    expect(info.isAdamantType(Types.STEEL)).toBe(true);
    expect(info.isAdamantType(Types.DRAGON)).toBe(true);
    expect(info.isAdamantType(Types.NORMAL)).toBe(false);
  });

  test("isGriseousType()", () => {
    expect(info.isGriseousType(Types.GHOST)).toBe(true);
    expect(info.isGriseousType(Types.DRAGON)).toBe(true);
    expect(info.isGriseousType(Types.NORMAL)).toBe(false);
  });

  test("isSoulDewType()", () => {
    expect(info.isSoulDewType(Types.PSYCHIC)).toBe(true);
    expect(info.isSoulDewType(Types.DRAGON)).toBe(true);
    expect(info.isSoulDewType(Types.NORMAL)).toBe(false);
  });

  test("isSandForceType()", () => {
    expect(info.isSandForceType(Types.ROCK)).toBe(true);
    expect(info.isSandForceType(Types.GROUND)).toBe(true);
    expect(info.isSandForceType(Types.STEEL)).toBe(true);
    expect(info.isSandForceType(Types.NORMAL)).toBe(false);
  });

  describe("effectiveness()", () => {
    test("Foresight and Scrappy ignore Ghost immunities", () => {
      expect(
        info.effectiveness(Types.NORMAL, Types.GHOST, { gen: Gens.SM })
      ).toEqual([0, 1]);
      expect(
        info.effectiveness(Types.NORMAL, Types.GHOST, {
          gen: Gens.SM,
          foresight: true
        })
      ).toEqual([1, 1]);
      expect(
        info.effectiveness(Types.NORMAL, Types.GHOST, {
          gen: Gens.SM,
          scrappy: true
        })
      ).toEqual([1, 1]);
    });

    test("Gravity ignores Flying-type", () => {
      expect(
        info.effectiveness(Types.ICE, [Types.WATER, Types.FLYING], {
          gen: Gens.SM,
          gravity: true
        })
      ).toEqual([1, 2]);
    });

    test("Freeze-Dry is always super effective on Water", () => {
      expect(
        info.effectiveness(Types.ICE, [Types.WATER, Types.FLYING], {
          gen: Gens.SM,
          freezeDry: true
        })
      ).toEqual([4, 1]);
      expect(
        info.effectiveness(Types.ICE, [Types.WATER, Types.FLYING], {
          gen: Gens.SM,
          gravity: true,
          freezeDry: true
        })
      ).toEqual([2, 1]);
      expect(
        info.effectiveness(Types.ICE, [Types.WATER, Types.FLYING], {
          gen: Gens.SM,
          inverted: true,
          freezeDry: true
        })
      ).toEqual([1, 1]);
    });

    test("Strong Winds reduce damage taken by Flying-types", () => {
      expect(
        info.effectiveness(Types.ICE, [Types.DRAGON, Types.FLYING], {
          gen: Gens.SM,
          strongWinds: true
        })
      ).toEqual([2, 1]);
    });

    test("Inverted Battles invert type effectiveness", () => {
      expect(
        info.effectiveness(Types.NORMAL, [Types.GHOST, Types.ROCK], {
          gen: Gens.B2W2,
          inverted: true
        })
      ).toEqual([4, 1]);
      expect(
        info.effectiveness(Types.NORMAL, Types.NORMAL, {
          gen: Gens.B2W2,
          inverted: true
        })
      ).toEqual([1, 1]);
      expect(
        info.effectiveness(Types.ELECTRIC, Types.FLYING, {
          gen: Gens.B2W2,
          inverted: true
        })
      ).toEqual([1, 2]);
    });

    test("Type effectiveness changes across generations", () => {
      expect(
        info.effectiveness(Types.ICE, [Types.WATER, Types.FLYING], {
          gen: Gens.SM
        })
      ).toEqual([1, 1]);

      expect(
        info.effectiveness(Types.GHOST, Types.STEEL, { gen: Gens.B2W2 })
      ).toEqual([1, 2]);
      expect(
        info.effectiveness(Types.GHOST, Types.STEEL, { gen: Gens.ORAS })
      ).toEqual([1, 1]);

      expect(
        info.effectiveness(Types.ICE, Types.FIRE, { gen: Gens.RBY })
      ).toEqual([1, 1]);
      expect(
        info.effectiveness(Types.ICE, Types.FIRE, { gen: Gens.GSC })
      ).toEqual([1, 2]);
    });

    test("Generation defaults to most recent", () => {
      expect(info.effectiveness(Types.ICE, Types.FIRE)).toEqual([1, 2]);
    });
  });
});
