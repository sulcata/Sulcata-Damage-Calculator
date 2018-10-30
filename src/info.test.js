import * as info from "sulcalc/info";
import { Gens, Natures, Stats, Types } from "sulcalc/utilities";

test.each([
  [0, "Hardy"],
  [3, "Adamant"],
  ["toString", "Hardy"],
  [-1, "Hardy"],
  [1.5, "Hardy"]
])("natureName(%p)", (natureId, expected) => {
  expect(info.natureName(natureId)).toBe(expected);
});

test.each([
  ["  adamant ", Natures.ADAMANT],
  ["Hardy", Natures.HARDY],
  ["  HAsTy", Natures.HASTY],
  ["toString", Natures.HARDY]
])("natureId(%p)", (natureName, expected) => {
  expect(info.natureId(natureName)).toBe(expected);
});

test.each([
  [Gens.RBY, "RBY"],
  [Gens.GSC, "GSC"],
  [Gens.ADV, "ADV"],
  [Gens.HGSS, "HGSS"],
  [Gens.B2W2, "B2W2"],
  [Gens.ORAS, "ORAS"],
  [Gens.SM, "SM"]
])("genName(%p)", (gen, expected) => {
  expect(info.genName(gen)).toBe(expected);
});

test.each([
  [Natures.ADAMANT, 0, 0],
  [Natures.ADAMANT, 1, 1],
  [Natures.ADAMANT, 2, 0],
  [Natures.ADAMANT, 3, -1],
  [Natures.ADAMANT, 4, 0],
  [Natures.ADAMANT, 5, 0],
  [Natures.HARDY, 0, 0],
  [Natures.HARDY, 1, 0],
  [Natures.HARDY, 2, 0],
  [Natures.HARDY, 3, 0],
  [Natures.HARDY, 4, 0],
  [Natures.HARDY, 5, 0]
])("natureMultiplier(%p, %p)", (nature, stat, expected) => {
  expect(info.natureMultiplier(nature, stat)).toBe(expected);
});

test.each([
  [Natures.ADAMANT, [Stats.ATK, Stats.SATK]],
  [Natures.HARDY, [-1, -1]]
])("natureStats(%p)", (nature, expected) => {
  expect(info.natureStats(nature)).toEqual(expected);
});

test.each(Object.values(Gens))("releasedPokes(%p)", gen => {
  expect(info.releasedPokes(gen)).toMatchSnapshot();
});

test.each([
  ["snorlax", Gens.SM, Types.NORMAL],
  ["not a pokemon id", Gens.SM, Types.CURSE]
])("pokeType1(%p, %p)", (pokeId, gen, expected) => {
  expect(info.pokeType1(pokeId, gen)).toBe(expected);
});

test.each([
  ["snorlax", Gens.SM, Types.CURSE],
  ["dragonite", Gens.SM, Types.FLYING],
  ["not a pokemon id", Gens.SM, Types.CURSE]
])("pokeType2(%p, %p)", (pokeId, gen, expected) => {
  expect(info.pokeType2(pokeId, gen)).toBe(expected);
});

test.each(Object.values(Gens))("releasedMoves(%p)", gen => {
  expect(info.releasedMoves(gen)).toMatchSnapshot();
});

test.each(Object.values(Gens))("releasedItems(%p)", gen => {
  expect(info.releasedItems(gen)).toMatchSnapshot();
});

test.each(Object.values(Gens))("releasedAbilities(%p)", gen => {
  expect(info.releasedAbilities(gen)).toMatchSnapshot();
});

test.each(Object.values(Gens))("types(%p)", gen => {
  expect(info.types(gen)).toMatchSnapshot();
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

  test("Grounded Pokemon are stripped of Flying-type", () => {
    expect(
      info.effectiveness(Types.ICE, [Types.WATER, Types.FLYING], {
        gen: Gens.SM,
        grounded: true
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
        grounded: true,
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
