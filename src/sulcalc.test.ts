import { NoMoveError, NoPokemonError } from "./errors";
import sulcalc from "./sulcalc";
import {
  Generation,
  generations,
  maxGen,
  Nature,
  Status,
  Terrain,
  Weather
} from "./utilities";

test("sanity check", () => {
  for (const gen of generations) {
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
  const gen = Generation.GSC;
  const { summary } = sulcalc(
    { name: "Snorlax", gen },
    { name: "Raikou", gen },
    { name: "Self-Destruct", gen },
    { gen }
  );
  expect(summary).toMatchSnapshot();
});

test("almost guaranteed KO", () => {
  const gen = Generation.GSC;
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
  const gen = Generation.GSC;
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
      nature: Nature.MODEST,
      evs: [4, 0, 0, 252, 0, 252],
      gen
    },
    {
      name: "Klefki",
      nature: Nature.CALM,
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
      nature: Nature.RELAXED,
      evs: [252, 40, 100, 0, 0, 0],
      gen
    },
    {
      name: "Starmie",
      nature: Nature.TIMID,
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
      nature: Nature.TIMID,
      evs: [4, 0, 0, 252, 0, 252],
      gen
    },
    {
      name: "Chansey",
      item: "Eviolite",
      nature: Nature.BOLD,
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
      nature: Nature.ADAMANT,
      evs: [0, 252, 4, 0, 0, 252],
      boosts: [0, 2, 0, 0, 0, 0, 0, 0],
      status: Status.BURNED
    },
    {
      name: "Skarmory",
      ability: "Sturdy",
      nature: Nature.IMPISH,
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
  expect(roundedChances.length).toBe(1);
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
    sulcalc({ id: "0:0" }, { id: "0:0" }, { id: "1" }, {});
  }).toThrow(NoPokemonError);

  expect(() => {
    sulcalc({ id: "233" }, { id: "233" }, { id: "1" }, {});
  }).toThrow(NoPokemonError);
});

test("throws NoMoveError when either Move is invalid", () => {
  expect(() => {
    sulcalc({ name: "Snorlax" }, { name: "Snorlax" }, { id: "0" }, {});
  }).toThrow(NoMoveError);
});

test("Variable BP fix", () => {
  const gen = Generation.GSC;
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
  const gen = Generation.GSC;
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
  for (const gen of generations.slice(Generation.B2W2)) {
    expect(
      sulcalc(
        {
          name: "Tapu Lele",
          nature: Nature.TIMID,
          evs: [0, 0, 0, 252, 4, 252],
          gen
        },
        {
          name: "Landorus-Therian",
          nature: Nature.ADAMANT,
          evs: [0, 252, 4, 0, 0, 252],
          gen
        },
        { name: "Psychic", gen },
        { terrain: Terrain.PSYCHIC_TERRAIN, gen }
      ).summary
    ).toMatchSnapshot();

    expect(
      sulcalc(
        {
          name: "Tapu Koko",
          nature: Nature.NAIVE,
          evs: [0, 252, 0, 4, 0, 252],
          gen
        },
        {
          name: "Diancie",
          nature: Nature.NAIVE,
          evs: [0, 4, 0, 252, 0, 252],
          gen
        },
        { name: "Wild Charge", gen },
        { terrain: Terrain.ELECTRIC_TERRAIN, gen }
      ).summary
    ).toMatchSnapshot();

    expect(
      sulcalc(
        {
          name: "Tapu Bulu",
          item: "Choice Band",
          nature: Nature.ADAMANT,
          evs: [0, 252, 4, 0, 0, 252],
          boosts: [0, -1, 0, 0, 0, 0, 0, 0],
          gen
        },
        {
          name: "Landorus-Therian",
          nature: Nature.IMPISH,
          evs: [252, 0, 216, 0, 24, 16],
          gen
        },
        { name: "Wood Hammer", gen },
        { terrain: Terrain.GRASSY_TERRAIN, gen }
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
        nature: Nature.TIMID,
        evs: [0, 0, 4, 252, 0, 252],
        gen
      },
      {
        name: "Tapu Koko",
        nature: Nature.NAIVE,
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
        nature: Nature.NAUGHTY,
        ability: "Skill Link",
        evs: [0, 252, 4, 0, 0, 252],
        gen
      },
      {
        name: "Rotom-Wash",
        nature: Nature.BOLD,
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
        nature: Nature.ADAMANT,
        evs: [4, 252, 0, 0, 0, 252],
        gen
      },
      {
        name: "Rotom-Wash",
        nature: Nature.BOLD,
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
        nature: Nature.ADAMANT,
        evs: [4, 252, 0, 0, 0, 252],
        gen
      },
      {
        name: "Rotom-Wash",
        nature: Nature.BOLD,
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
        nature: Nature.JOLLY,
        evs: [0, 252, 4, 0, 0, 252],
        gen
      },
      {
        name: "Chansey",
        item: "Eviolite",
        nature: Nature.BOLD,
        evs: [248, 0, 252, 0, 8, 0],
        gen
      },
      { name: "Horn Leech", gen },
      { terrain: Terrain.GRASSY_TERRAIN, gen }
    ).summary
  ).toMatchSnapshot();
});

test("Defender health text shows for not completely healthy Pokemon", () => {
  const gen = Generation.RBY;
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
  const gen = Generation.GSC;
  expect(
    sulcalc(
      { name: "Moltres", gen },
      { name: "Snorlax", gen },
      { name: "Fire Blast", gen },
      { weather: Weather.SUN, gen }
    ).summary
  ).toMatch(/^.+? vs\. .+? in Sun: /);
});

test("Berry damage", () => {
  const gen = Generation.GSC;

  const { roundedChances: chancesWithoutBerry } = sulcalc(
    { name: "Pichu", gen },
    { name: "Pichu", gen },
    { name: "Double-Edge", gen },
    { gen }
  );
  expect(chancesWithoutBerry[0]).toBe(0);
  expect(chancesWithoutBerry[1]).toBeCloseTo(0.993, 3);
  expect(chancesWithoutBerry[2]).toBe(1);

  const { roundedChances: chancesWithBerry } = sulcalc(
    { name: "Pichu", gen },
    { name: "Pichu", item: "Berry", gen },
    { name: "Double-Edge", gen },
    { gen }
  );
  expect(chancesWithBerry[0]).toBe(0);
  expect(chancesWithBerry[1]).toBeCloseTo(0.871, 3);
  expect(chancesWithBerry[2]).toBe(1);
});

describe("Toxic damage", () => {
  const gen = Generation.B2W2;
  const { roundedChances } = sulcalc(
    { name: "Pichu", gen },
    { name: "Pichu", status: Status.BADLY_POISONED, gen },
    { name: "Attract", gen },
    { gen }
  );
  expect(roundedChances).toEqual([0, 0, 0, 0, 0, 1]);
});

describe("Stealth Rock damage", () => {
  const gen = Generation.B2W2;

  const { roundedChances: withoutRocks } = sulcalc(
    { name: "Starmie", gen },
    { name: "Volcarona", gen },
    { name: "Bubble Beam", gen },
    { gen }
  );
  expect(withoutRocks[0]).toBe(0);
  expect(withoutRocks[1]).toBeCloseTo(0.094, 3);
  expect(withoutRocks[2]).toBe(1);

  const { roundedChances: withRocks } = sulcalc(
    { name: "Starmie", gen },
    { name: "Volcarona", stealthRock: true, gen },
    { name: "Bubble Beam", gen },
    { gen }
  );
  expect(withRocks).toEqual([0.25, 1]);
});

test("Displays boosts", () => {
  const gen = Generation.RBY;

  expect(
    sulcalc(
      { name: "Alakazam", boosts: [0, 0, 0, 1, 0, 0, 0, 0], gen },
      { name: "Jynx", boosts: [0, 0, 0, -1, 0, 0, 0, 0], gen },
      { name: "Psychic", gen },
      { gen }
    ).summary
  ).toMatch(/^\+1 Alakazam .+ -1 Jynx/);

  expect(
    sulcalc(
      { name: "Tauros", boosts: [0, 1, 0, 0, 0, 0, 0, 0], gen },
      { name: "Jynx", boosts: [0, 0, 4, 0, 0, 0, 0, 0], gen },
      { name: "Body Slam", gen },
      { gen }
    ).summary
  ).toMatch(/^\+1 Tauros .+ \+4 Jynx/);
});

test("Light Screen", () => {
  const gen = Generation.RBY;
  expect(
    sulcalc(
      { name: "Alakazam", gen },
      { name: "Jynx", lightScreen: true, gen },
      { name: "Psychic", gen },
      { gen }
    ).summary
  ).toMatch(/^Alakazam .+ Jynx behind Light Screen/);
});

test("Light Screen", () => {
  const gen = Generation.RBY;
  expect(
    sulcalc(
      { name: "Tauros", gen },
      { name: "Jynx", reflect: true, gen },
      { name: "Body Slam", gen },
      { gen }
    ).summary
  ).toMatch(/^Tauros .+ Jynx behind Reflect/);
});
