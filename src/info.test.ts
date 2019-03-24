import * as info from "./info";
import { Generation, generations, Nature, Stat, Type } from "./utilities";

test.each<[Nature, string]>([
  // prettier-ignore
  [Nature.HARDY, "Hardy"],
  [Nature.ADAMANT, "Adamant"]
])("natureName(%p)", (natureId, expected) => {
  expect(info.natureName(natureId)).toBe(expected);
});

test.each<[string, Nature]>([
  // prettier-ignore
  ["  adamant ", Nature.ADAMANT],
  ["Hardy", Nature.HARDY],
  ["  HAsTy", Nature.HASTY],
  ["toString", Nature.HARDY]
])("natureId(%p)", (natureName, expected) => {
  expect(info.natureId(natureName)).toBe(expected);
});

test.each<[Generation, string]>([
  // prettier-ignore
  [Generation.RBY, "RBY"],
  [Generation.GSC, "GSC"],
  [Generation.ADV, "ADV"],
  [Generation.HGSS, "HGSS"],
  [Generation.B2W2, "B2W2"],
  [Generation.ORAS, "ORAS"],
  [Generation.SM, "SM"]
])("genName(%p)", (gen, expected) => {
  expect(info.genName(gen)).toBe(expected);
});

test.each<[Nature, Stat, number]>([
  // prettier-ignore
  [Nature.ADAMANT, Stat.HP, 0],
  [Nature.ADAMANT, Stat.ATK, 1],
  [Nature.ADAMANT, Stat.DEF, 0],
  [Nature.ADAMANT, Stat.SATK, -1],
  [Nature.ADAMANT, Stat.SDEF, 0],
  [Nature.ADAMANT, Stat.SPD, 0],
  [Nature.HARDY, Stat.HP, 0],
  [Nature.HARDY, Stat.ATK, 0],
  [Nature.HARDY, Stat.DEF, 0],
  [Nature.HARDY, Stat.SATK, 0],
  [Nature.HARDY, Stat.SDEF, 0],
  [Nature.HARDY, Stat.SPD, 0]
])("natureMultiplier(%p, %p)", (nature, stat, expected) => {
  expect(info.natureMultiplier(nature, stat)).toBe(expected);
});

test.each<[Nature, [Stat, Stat] | [-1, -1]]>([
  // prettier-ignore
  [Nature.ADAMANT, [Stat.ATK, Stat.SATK]],
  [Nature.HARDY, [-1, -1]]
])("natureStats(%p)", (nature, expected) => {
  expect(info.natureStats(nature)).toEqual(expected);
});

test.each(generations)("releasedPokes(%p)", gen => {
  expect(info.releasedPokes(gen)).toMatchSnapshot();
});

test.each<[string, Generation, Type]>([
  // prettier-ignore
  ["snorlax", Generation.SM, Type.NORMAL],
  ["not a pokemon id", Generation.SM, Type.CURSE]
])("pokeType1(%p, %p)", (pokeId, gen, expected) => {
  expect(info.pokeType1(pokeId, gen)).toBe(expected);
});

test.each<[string, Generation, Type]>([
  // prettier-ignore
  ["snorlax", Generation.SM, Type.CURSE],
  ["dragonite", Generation.SM, Type.FLYING],
  ["not a pokemon id", Generation.SM, Type.CURSE]
])("pokeType2(%p, %p)", (pokeId, gen, expected) => {
  expect(info.pokeType2(pokeId, gen)).toBe(expected);
});

test.each(generations)("releasedMoves(%p)", gen => {
  expect(info.releasedMoves(gen)).toMatchSnapshot();
});

test.each(generations)("releasedItems(%p)", gen => {
  expect(info.releasedItems(gen)).toMatchSnapshot();
});

test.each(generations)("releasedAbilities(%p)", gen => {
  expect(info.releasedAbilities(gen)).toMatchSnapshot();
});

test.each(generations)("types(%p)", gen => {
  expect(info.typesForGen(gen)).toMatchSnapshot();
});

test("isLustrousType()", () => {
  expect(info.isLustrousType(Type.WATER)).toBe(true);
  expect(info.isLustrousType(Type.DRAGON)).toBe(true);
  expect(info.isLustrousType(Type.NORMAL)).toBe(false);
});

test("isAdamantType()", () => {
  expect(info.isAdamantType(Type.STEEL)).toBe(true);
  expect(info.isAdamantType(Type.DRAGON)).toBe(true);
  expect(info.isAdamantType(Type.NORMAL)).toBe(false);
});

test("isGriseousType()", () => {
  expect(info.isGriseousType(Type.GHOST)).toBe(true);
  expect(info.isGriseousType(Type.DRAGON)).toBe(true);
  expect(info.isGriseousType(Type.NORMAL)).toBe(false);
});

test("isSoulDewType()", () => {
  expect(info.isSoulDewType(Type.PSYCHIC)).toBe(true);
  expect(info.isSoulDewType(Type.DRAGON)).toBe(true);
  expect(info.isSoulDewType(Type.NORMAL)).toBe(false);
});

test("isSandForceType()", () => {
  expect(info.isSandForceType(Type.ROCK)).toBe(true);
  expect(info.isSandForceType(Type.GROUND)).toBe(true);
  expect(info.isSandForceType(Type.STEEL)).toBe(true);
  expect(info.isSandForceType(Type.NORMAL)).toBe(false);
});

describe("effectiveness()", () => {
  test("Foresight and Scrappy ignore Ghost immunities", () => {
    expect(
      info.effectiveness(Type.NORMAL, Type.GHOST, { gen: Generation.SM })
    ).toEqual([0, 1]);
    expect(
      info.effectiveness(Type.NORMAL, Type.GHOST, {
        gen: Generation.SM,
        foresight: true
      })
    ).toEqual([1, 1]);
    expect(
      info.effectiveness(Type.NORMAL, Type.GHOST, {
        gen: Generation.SM,
        scrappy: true
      })
    ).toEqual([1, 1]);
  });

  test("Grounded Pokemon are stripped of Flying-type", () => {
    expect(
      info.effectiveness(Type.ICE, [Type.WATER, Type.FLYING], {
        gen: Generation.SM,
        grounded: true
      })
    ).toEqual([1, 2]);
  });

  test("Freeze-Dry is always super effective on Water", () => {
    expect(
      info.effectiveness(Type.ICE, [Type.WATER, Type.FLYING], {
        gen: Generation.SM,
        freezeDry: true
      })
    ).toEqual([4, 1]);
    expect(
      info.effectiveness(Type.ICE, [Type.WATER, Type.FLYING], {
        gen: Generation.SM,
        grounded: true,
        freezeDry: true
      })
    ).toEqual([2, 1]);
    expect(
      info.effectiveness(Type.ICE, [Type.WATER, Type.FLYING], {
        gen: Generation.SM,
        inverted: true,
        freezeDry: true
      })
    ).toEqual([1, 1]);
  });

  test("Strong Winds reduce damage taken by Flying-types", () => {
    expect(
      info.effectiveness(Type.ICE, [Type.DRAGON, Type.FLYING], {
        gen: Generation.SM,
        strongWinds: true
      })
    ).toEqual([2, 1]);
  });

  test("Inverted Battles invert type effectiveness", () => {
    expect(
      info.effectiveness(Type.NORMAL, [Type.GHOST, Type.ROCK], {
        gen: Generation.B2W2,
        inverted: true
      })
    ).toEqual([4, 1]);
    expect(
      info.effectiveness(Type.NORMAL, Type.NORMAL, {
        gen: Generation.B2W2,
        inverted: true
      })
    ).toEqual([1, 1]);
    expect(
      info.effectiveness(Type.ELECTRIC, Type.FLYING, {
        gen: Generation.B2W2,
        inverted: true
      })
    ).toEqual([1, 2]);
  });

  test("Type effectiveness changes across generations", () => {
    expect(
      info.effectiveness(Type.ICE, [Type.WATER, Type.FLYING], {
        gen: Generation.SM
      })
    ).toEqual([1, 1]);

    expect(
      info.effectiveness(Type.GHOST, Type.STEEL, { gen: Generation.B2W2 })
    ).toEqual([1, 2]);
    expect(
      info.effectiveness(Type.GHOST, Type.STEEL, { gen: Generation.ORAS })
    ).toEqual([1, 1]);

    expect(
      info.effectiveness(Type.ICE, Type.FIRE, { gen: Generation.RBY })
    ).toEqual([1, 1]);
    expect(
      info.effectiveness(Type.ICE, Type.FIRE, { gen: Generation.GSC })
    ).toEqual([1, 2]);
  });

  test("Generation defaults to most recent", () => {
    expect(info.effectiveness(Type.ICE, Type.FIRE)).toEqual([1, 2]);
  });
});
