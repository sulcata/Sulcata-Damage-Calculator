import sulcalc from "../src/sulcalc";
import { Gens, Statuses, Natures, maxGen } from "../src/utilities";
import { NoPokemonError, NoMoveError } from "../src/errors";

describe("sulcalc()", () => {
  test("sanity check", () => {
    for (const gen of Object.values(Gens)) {
      const { summary, damage } = sulcalc(
        { name: "Snorlax", gen },
        { name: "Snorlax", gen },
        { name: "Body Slam", gen },
        { gen }
      );
      expect(summary).toMatchSnapshot();
      expect(damage).toMatchSnapshot();
    }
  });

  test("bail out on insufficient damage", () => {
    const gen = maxGen;
    const { summary } = sulcalc(
      { name: "Munchlax", gen },
      { name: "Aggron", gen },
      { name: "Pound", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("guaranteed KO", () => {
    const gen = Gens.GSC;
    const { summary } = sulcalc(
      { name: "Snorlax", gen },
      { name: "Raikou", gen },
      { name: "Self-Destruct", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("almost guaranteed KO", () => {
    const gen = Gens.GSC;
    const { summary } = sulcalc(
      {
        name: "Snorlax",
        evs: [252, 200, 252, 252, 252, 252],
        gen
      },
      { name: "Snorlax", gen },
      { name: "Double-Edge", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("negligible chance to KO", () => {
    const gen = Gens.GSC;
    const { summary } = sulcalc(
      {
        name: "Tauros",
        evs: [252, 176, 252, 252, 252, 252],
        gen
      },
      {
        name: "Snorlax",
        evs: [252, 252, 252, 252, 252, 252],
        gen
      },
      { name: "Body Slam", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("Light Screen", () => {
    const gen = maxGen;
    const { summary } = sulcalc(
      {
        name: "Heatran",
        item: "Choice Specs",
        nature: Natures.MODEST,
        evs: [4, 0, 0, 252, 0, 252],
        gen
      },
      {
        name: "Klefki",
        nature: Natures.CALM,
        evs: [252, 0, 100, 0, 156, 0],
        lightScreen: true,
        gen
      },
      { name: "Fire Blast", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("Reflect", () => {
    const gen = maxGen;
    const { summary } = sulcalc(
      {
        name: "Ferrothorn",
        nature: Natures.RELAXED,
        evs: [252, 40, 100, 0, 0, 0],
        gen
      },
      {
        name: "Starmie",
        nature: Natures.TIMID,
        evs: [4, 0, 0, 252, 0, 252],
        reflect: true,
        gen
      },
      { name: "Fire Blast", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("Psyshock", () => {
    const gen = maxGen;
    const { summary } = sulcalc(
      {
        name: "Latios",
        item: "Life Orb",
        nature: Natures.TIMID,
        evs: [4, 0, 0, 252, 0, 252],
        gen
      },
      {
        name: "Chansey",
        item: "Eviolite",
        nature: Natures.BOLD,
        evs: [252, 0, 252, 0, 4, 0],
        gen
      },
      { name: "Psyshock", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("Ability", () => {
    const gen = maxGen;
    const { summary } = sulcalc(
      {
        name: "Heracross",
        ability: "Guts",
        nature: Natures.ADAMANT,
        evs: [0, 252, 4, 0, 0, 252],
        boosts: [0, 2, 0, 0, 0, 0, 0, 0],
        status: Statuses.BURNED
      },
      {
        name: "Skarmory",
        ability: "Sturdy",
        nature: Natures.IMPISH,
        evs: [248, 0, 252, 0, 8, 0]
      },
      {
        name: "Close Combat",
        critical: true,
        gen
      },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("Explosion", () => {
    const gen = maxGen;
    const { roundedChances } = sulcalc(
      { name: "Snorlax", gen },
      { name: "Snorlax", gen },
      { name: "Explosion", gen },
      { gen }
    );
    expect(roundedChances.length).toEqual(1);
    const { summary } = sulcalc(
      { name: "Snorlax", gen },
      { name: "Skarmory", gen },
      { name: "Explosion", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });

  test("throws NoPokemonError when either Pokemon is invalid", () => {
    expect(() => {
      sulcalc({ id: "0:0" }, { id: "0:0" }, { id: 1 }, {});
    }).toThrow(NoPokemonError);

    expect(() => {
      sulcalc({ id: "233" }, { id: "233" }, { id: 1 }, {});
    }).toThrow(NoPokemonError);
  });

  test("throws NoMoveError when either Move is invalid", () => {
    expect(() => {
      sulcalc({ name: "Snorlax" }, { name: "Snorlax" }, { id: 0 }, {});
    }).toThrow(NoMoveError);

    expect(() => {
      sulcalc({ name: "Snorlax" }, { name: "Snorlax" }, { id: -1 }, {});
    }).toThrow(NoMoveError);
  });

  test("Variable BP fix", () => {
    const gen = Gens.GSC;
    const { summary } = sulcalc(
      {
        name: "Gyarados",
        item: "Polkadot Bow",
        currentHp: 15,
        gen
      },
      { name: "Articuno", gen },
      { name: "Flail", gen },
      { gen }
    );
    expect(summary).toMatchSnapshot();
  });
});
