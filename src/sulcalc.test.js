import sulcalc from "sulcalc/sulcalc";
import {
  Gens,
  Natures,
  Statuses,
  Terrains,
  Weathers,
  maxGen
} from "sulcalc/utilities";
import { NoPokemonError, NoMoveError } from "sulcalc/errors";

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

test("Present GSC", () => {
  const gen = Gens.GSC;
  for (const defenderName of ["Raikou", "Vaporeon", "Zapdos"]) {
    for (let present = -1; present <= 3; present++) {
      expect(
        sulcalc(
          { name: "Blissey", gen },
          { name: defenderName, gen },
          { name: "Present", present, gen },
          { gen }
        ).summary
      ).toMatchSnapshot();
    }
  }
});

test("Terrains boost types", () => {
  for (let gen = Gens.ORAS; gen <= maxGen; gen++) {
    expect(
      sulcalc(
        {
          name: "Tapu Lele",
          nature: Natures.TIMID,
          evs: [0, 0, 0, 252, 4, 252],
          gen
        },
        {
          name: "Landorus-Therian",
          nature: Natures.ADAMANT,
          evs: [0, 252, 4, 0, 0, 252],
          gen
        },
        { name: "Psychic", gen },
        { terrain: Terrains.PSYCHIC_TERRAIN, gen }
      ).summary
    ).toMatchSnapshot();

    expect(
      sulcalc(
        {
          name: "Tapu Koko",
          nature: Natures.NAIVE,
          evs: [0, 252, 0, 4, 0, 252],
          gen
        },
        {
          name: "Diancie",
          nature: Natures.NAIVE,
          evs: [0, 4, 0, 252, 0, 252],
          gen
        },
        { name: "Wild Charge", gen },
        { terrain: Terrains.ELECTRIC_TERRAIN, gen }
      ).summary
    ).toMatchSnapshot();

    expect(
      sulcalc(
        {
          name: "Tapu Bulu",
          item: "Choice Band",
          nature: Natures.ADAMANT,
          evs: [0, 252, 4, 0, 0, 252],
          boosts: [0, -1, 0, 0, 0, 0, 0, 0],
          gen
        },
        {
          name: "Landorus-Therian",
          nature: Natures.IMPISH,
          evs: [252, 0, 216, 0, 24, 16],
          gen
        },
        { name: "Wood Hammer", gen },
        { terrain: Terrains.GRASSY_TERRAIN, gen }
      ).summary
    ).toMatchSnapshot();
  }
});

test("Greninja-Ash Water Shuriken", () => {
  const gen = maxGen;
  expect(
    sulcalc(
      {
        name: "Greninja-Ash",
        item: "Choice Specs",
        nature: Natures.TIMID,
        evs: [0, 0, 4, 252, 0, 252],
        gen
      },
      {
        name: "Tapu Koko",
        nature: Natures.NAIVE,
        evs: [0, 252, 0, 4, 0, 252],
        gen
      },
      { name: "Water Shuriken", gen },
      { gen }
    ).summary
  ).toMatchSnapshot();
});

test("Skill Link", () => {
  const gen = maxGen;
  expect(
    sulcalc(
      {
        name: "Cloyster",
        nature: Natures.NAUGHTY,
        ability: "Skill Link",
        evs: [0, 252, 4, 0, 0, 252],
        gen
      },
      {
        name: "Rotom-Wash",
        nature: Natures.BOLD,
        evs: [248, 0, 200, 0, 0, 60],
        gen
      },
      { name: "Icicle Spear", gen },
      { gen }
    ).summary
  ).toMatchSnapshot();
});

test("Thousand Arrows", () => {
  const gen = maxGen;
  expect(
    sulcalc(
      {
        name: "Zygarde",
        item: "Choice Band",
        nature: Natures.ADAMANT,
        evs: [4, 252, 0, 0, 0, 252],
        gen
      },
      {
        name: "Rotom-Wash",
        nature: Natures.BOLD,
        ability: "Levitate",
        evs: [248, 0, 200, 0, 0, 60],
        gen
      },
      { name: "Thousand Arrows", gen },
      { gen }
    ).summary
  ).toMatchSnapshot();
});

test("Levitate immunity to Ground moves", () => {
  const gen = maxGen;
  expect(
    sulcalc(
      {
        name: "Zygarde",
        item: "Choice Band",
        nature: Natures.ADAMANT,
        evs: [4, 252, 0, 0, 0, 252],
        gen
      },
      {
        name: "Rotom-Wash",
        nature: Natures.BOLD,
        ability: "Levitate",
        evs: [248, 0, 200, 0, 0, 60],
        gen
      },
      { name: "Earthquake", gen },
      { gen }
    ).summary
  ).toMatchSnapshot();
});

test("Grassy Terrain recovery", () => {
  const gen = maxGen;
  expect(
    sulcalc(
      {
        name: "Tapu Bulu",
        nature: Natures.JOLLY,
        evs: [0, 252, 4, 0, 0, 252],
        gen
      },
      {
        name: "Chansey",
        item: "Eviolite",
        nature: Natures.BOLD,
        evs: [248, 0, 252, 0, 8, 0],
        gen
      },
      { name: "Horn Leech", gen },
      { terrain: Terrains.GRASSY_TERRAIN, gen }
    ).summary
  ).toMatchSnapshot();
});

test("Defender health text shows for not completely healthy Pokemon", () => {
  const gen = Gens.RBY;
  expect(
    sulcalc(
      { name: "Tauros", gen },
      { name: "Snorlax", currentHp: 40, gen },
      { name: "Hyper Beam", gen },
      { gen }
    ).summary
  ).toContain("at 7%");
});

test("Arceus Judgment with plate", () => {
  const gen = maxGen;
  expect(
    sulcalc(
      {
        name: "Arceus-Dark",
        item: "Dread Plate",
        evs: [0, 0, 0, 8, 0, 0],
        gen
      },
      {
        name: "Abomasnow",
        evs: [252, 0, 0, 0, 0, 0],
        gen
      },
      { name: "Judgment", gen },
      { gen }
    ).summary
  ).toMatchSnapshot();
});

test("Weather is reported during Pokemon description", () => {
  const gen = Gens.GSC;
  expect(
    sulcalc(
      { name: "Moltres", gen },
      { name: "Snorlax", gen },
      { name: "Fire Blast", gen },
      { weather: Weathers.SUN, gen }
    ).summary
  ).toMatch(/^.+? vs\. .+? in Sun: /);
});
