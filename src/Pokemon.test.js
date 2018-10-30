import Pokemon from "sulcalc/Pokemon";
import {
  Genders,
  Gens,
  Natures,
  Stats,
  Statuses,
  Terrains,
  Types,
  Weathers
} from "sulcalc/utilities";

let nopokemon, mudkip, marshtomp, swampert, megaSwampert;
beforeEach(() => {
  nopokemon = new Pokemon();
  mudkip = new Pokemon({ name: "Mudkip" });
  marshtomp = new Pokemon({ name: "Marshtomp" });
  swampert = new Pokemon({ name: "Swampert" });
  megaSwampert = new Pokemon({ name: "Swampert-Mega" });
});

test("#constructor()", () => {
  const snorlax = new Pokemon({ name: "Snorlax" });
  expect(snorlax).toMatchObject({
    id: "snorlax",
    evs: [0, 0, 0, 0, 0, 0],
    ivs: [31, 31, 31, 31, 31, 31]
  });

  const gscSnorlax = new Pokemon({ id: "snorlax", gen: Gens.GSC });
  expect(gscSnorlax).toMatchObject({
    id: "snorlax",
    evs: [252, 252, 252, 252, 252, 252],
    ivs: [15, 15, 15, 15, 15, 15]
  });

  const smeargle = new Pokemon({
    name: "Smeargle",
    moves: [{ name: "Ice Beam" }],
    item: { name: "Leftovers" }
  });
  expect(smeargle).toMatchObject({
    moves: [
      { id: "icebeam" },
      { id: "nomove" },
      { id: "nomove" },
      { id: "nomove" }
    ],
    item: { id: "leftovers" }
  });
});

describe(".fromImportable()", () => {
  test("handles simple importables", () => {
    const gen = Gens.ORAS;
    const arceusGround = Pokemon.fromImportable(
      `Arceus-Ground (M) @ Earth Plate
      Ability: Multitype
      EVs: 252 SpA / 4 SpD / 252 Spe
      Timid Nature
      IVs: 0 Atk
      - Judgment
      - Ice Beam
      - Refresh
      - Recover`,
      gen
    );
    expect(arceusGround).toMatchObject({
      id: "arceusground",
      gender: Genders.MALE,
      item: { id: "earthplate", gen },
      ability: { id: "multitype", gen },
      level: 100,
      evs: [0, 0, 0, 252, 4, 252],
      ivs: [31, 0, 31, 31, 31, 31],
      nature: Natures.TIMID,
      moves: [
        { id: "judgment", gen },
        { id: "icebeam", gen },
        { id: "refresh", gen },
        { id: "recover", gen }
      ],
      gen
    });
  });

  test("handles LC importables", () => {
    const chinchou = Pokemon.fromImportable(
      `sparkle (Chinchou) (F) @ Choice Scarf
      Ability: Volt Absorb
      Level: 5
      EVs: 52 Def / 232 SpA / 224 Spe
      Timid Nature
      - Volt Switch
      - Scald
      - Ice Beam
      - Hidden Power [GrOUnd  ]`,
      Gens.ORAS
    );
    expect(chinchou).toMatchObject({
      id: "chinchou",
      gender: Genders.FEMALE,
      level: 5
    });
  });

  test("handles GSC importables", () => {
    const gen = Gens.GSC;
    const snorlax = Pokemon.fromImportable(
      `zorofat (Snorlax) @ Leftovers
      - Toxic
      - Double-Edge
      - Flamethrower
      - Rest`,
      gen
    );
    expect(snorlax).toMatchObject({
      id: "snorlax",
      gender: Genders.NO_GENDER,
      item: { id: "leftovers", gen: Gens.GSC },
      level: 100,
      evs: [252, 252, 252, 252, 252, 252],
      ivs: [15, 15, 15, 15, 15, 15],
      moves: [
        { id: "toxic", gen: Gens.GSC },
        { id: "doubleedge", gen: Gens.GSC },
        { id: "flamethrower", gen: Gens.GSC },
        { id: "rest", gen: Gens.GSC }
      ],
      gen
    });
  });

  test("accounts for different IVs for Hidden Power", () => {
    const landorusTherian = Pokemon.fromImportable(
      `Landorus-Therian
      IVs: 30 Spd
      - Hidden Power [Ice]`,
      Gens.ORAS
    );
    expect(landorusTherian.ivs).toEqual([31, 31, 31, 31, 31, 30]);
  });

  test("sets happiness to 255 for Return, 0 otherwise", () => {
    const returnSnorlax = Pokemon.fromImportable(
      `Snorlax
      - Return`,
      Gens.ORAS
    );
    expect(returnSnorlax.happiness).toBe(255);

    const snorlax = Pokemon.fromImportable(
      `Snorlax
      - Waterfall`,
      Gens.ORAS
    );
    expect(snorlax.happiness).toBe(0);
  });

  test("puts (No Move) last", () => {
    const landorusTherian = Pokemon.fromImportable(
      `Landorus-Therian
      - Hidden Power [Ice]
      - asdfgrthr
      - (No Move)
      - Rest`,
      Gens.ORAS
    );
    expect(landorusTherian.moves).toMatchObject([
      { id: "hiddenpowerice" },
      { id: "rest" },
      { id: "nomove" },
      { id: "nomove" }
    ]);
  });

  test("ignores invalid properties", () => {
    expect(() =>
      Pokemon.fromImportable(
        `sparkle (Chinchou) (F) @ Choice Scarf
        Ability: Volt Absorb
        Level: 5
        EVs: 52 Def / 232 SpA / 224 Spe
        INVALID PROP: value
        Timid Nature
        - Volt Switch
        - Scald
        - Ice Beam
        - Hidden Power [Ground]`,
        Gens.ORAS
      )
    ).not.toThrow();
  });

  test("ignores invalid lines", () => {
    expect(() =>
      Pokemon.fromImportable(
        `sparkle (Chinchou) (F) @ Choice Scarf
        Ability: Volt Absorb
        Level: 5
        EVs: 52 Def / 232 SpA / 224 Spe
        NOT A PROPER LINE
        Timid Nature
        - Volt Switch
        - Scald
        - Ice Beam
        - Hidden Power [Ground]`,
        Gens.ORAS
      )
    ).not.toThrow();
  });

  test("clamps and gives default values for invalid EVs", () => {
    expect(
      Pokemon.fromImportable(
        `sparkle (Chinchou) (F) @ Choice Scarf
        Ability: Volt Absorb
        Level: 5
        EVs: 10 HP / -5 Atk / 552 Def / 232 SpA / NaN SpD / 224 Spee
        Timid Nature
        - Volt Switch
        - Scald
        - Ice Beam
        - Hidden Power [Ground]`,
        Gens.ORAS
      )
    ).toMatchObject({
      evs: [8, 0, 252, 232, 0, 0]
    });

    expect(
      Pokemon.fromImportable(
        `sparkle (Chinchou) (F) @ Leftovers
        Level: 5
        EVs: 10 HP / -5 Atk / 552 Def / 232 SpA / NaN SpD / 224 Spee
        - Surf
        - Thunderbolt
        - Ice Beam
        - Hidden Power [Ground]`,
        Gens.GSC
      )
    ).toMatchObject({
      evs: [8, 0, 252, 232, 252, 252]
    });
  });

  test("clamps and gives default values for invalid IVs", () => {
    expect(
      Pokemon.fromImportable(
        `Arceus-Ground (M) @ Earth Plate
        Ability: Multitype
        EVs: 252 SpA / 4 SpD / 252 Spe
        Timid Nature
        IVs: NaN Hp / 34 Atk / 0 NOTASTAT / -3 Spe
        - Judgment
        - Ice Beam
        - Refresh
        - Recover`,
        Gens.ORAS
      )
    ).toMatchObject({
      ivs: [31, 31, 31, 31, 31, 0]
    });

    expect(
      Pokemon.fromImportable(
        `Snorlax @ Leftovers
        IVs: NaN Hp / 16 Atk / 0 NOTASTAT / -3 Spe
        - Toxic
        - Double-Edge
        - Flamethrower
        - Rest`,
        Gens.GSC
      )
    ).toMatchObject({
      ivs: [15, 15, 15, 15, 15, 0]
    });
  });

  test("clamps and gives default value for an invalid level", () => {
    expect(
      Pokemon.fromImportable(
        `Snorlax
        Level: -5`,
        Gens.ORAS
      )
    ).toMatchObject({ level: 1 });

    expect(
      Pokemon.fromImportable(
        `Snorlax
        Level: 105`,
        Gens.ORAS
      )
    ).toMatchObject({ level: 100 });

    expect(
      Pokemon.fromImportable(
        `Snorlax
        Level: NaN`,
        Gens.ORAS
      )
    ).toMatchObject({ level: 100 });
  });

  test("records nickname if available", () => {
    expect(
      Pokemon.fromImportable(`  zorofat   (Snorlax)`, Gens.SM)
    ).toMatchObject({
      id: "snorlax",
      nickname: "zorofat",
      gender: Genders.NO_GENDER
    });

    expect(
      Pokemon.fromImportable(`  zorofat   (Snorlax) (M)`, Gens.SM)
    ).toMatchObject({
      id: "snorlax",
      nickname: "zorofat",
      gender: Genders.MALE
    });

    expect(Pokemon.fromImportable(`Snorlax (M)`, Gens.SM)).toMatchObject({
      id: "snorlax",
      nickname: "",
      gender: Genders.MALE
    });
  });
});

describe("#toImportable()", () => {
  test("handles simple sets", () => {
    const snorlax = new Pokemon({
      name: "Snorlax",
      gender: Genders.MALE,
      item: "Leftovers",
      ability: "Immunity",
      evs: [252, 212, 0, 0, 40, 0],
      nature: Natures.CAREFUL,
      moves: ["Body Slam", "Curse", "Rest", "Earthquake"]
    });
    expect(snorlax.toImportable()).toMatchSnapshot();

    const bronzong = new Pokemon({
      name: "Bronzong",
      item: "Leftovers",
      ability: "Levitate",
      evs: [252, 0, 4, 0, 252, 0],
      ivs: [31, 31, 31, 31, 31, 0],
      nature: Natures.SASSY,
      moves: ["Stealth Rock", "Gyro Ball", "Psywave", "Toxic"]
    });
    expect(bronzong.toImportable()).toMatchSnapshot();
  });

  test("handles sets with less than 4 moves", () => {
    const crobat = new Pokemon({
      name: "Crobat",
      gender: Genders.FEMALE,
      item: "Choice Band",
      ability: "Infiltrator",
      evs: [0, 252, 0, 0, 4, 252],
      nature: Natures.JOLLY,
      moves: ["Brave Bird", "(No Move)", "U-turn", "Sleep Talk"]
    });
    expect(crobat.toImportable()).toMatchSnapshot();
  });

  test("optionally adds nature info", () => {
    const munchlax = new Pokemon({
      name: "Munchlax",
      gender: Genders.MALE,
      nature: Natures.RELAXED
    });
    expect(munchlax.toImportable({ natureInfo: true })).toMatchSnapshot();
    munchlax.nature = Natures.SERIOUS;
    expect(munchlax.toImportable({ natureInfo: true })).toMatchSnapshot();
  });

  test("handles LC sets", () => {
    const porygon = new Pokemon({
      name: "Porygon",
      item: "Eviolite",
      ability: "Trace",
      evs: [236, 0, 116, 0, 156, 0],
      nature: Natures.CALM,
      moves: ["Ice Beam", "Thunderbolt", "Recover", "Tri Attack"]
    });
    expect(porygon.toImportable()).toMatchSnapshot();
  });

  test("handles GSC sets", () => {
    const zapdos = new Pokemon({
      name: "Zapdos",
      item: "Leftovers",
      ivs: [NaN, 15, 13, 15, 15, 15],
      moves: ["Thunder", "Hidden Power", "Rest", "Sleep Talk"],
      gen: Gens.GSC
    });
    expect(zapdos.toImportable()).toMatchSnapshot();

    zapdos.evs = [252, 252, 252, 40, NaN, 252];
    zapdos.ivs = [NaN, 15, 15, 11, NaN, 15];
    expect(zapdos.toImportable()).toMatchSnapshot();
  });

  test("handles RBY sets", () => {
    const tauros = new Pokemon({
      name: "Tauros",
      moves: ["Body Slam", "Hyper Beam", "Earthquake", "Blizzard"],
      gen: Gens.RBY
    });
    expect(tauros.toImportable()).toMatchSnapshot();

    tauros.evs = [252, 252, 200, 40, NaN, 252];
    tauros.ivs = [NaN, 15, 10, 11, NaN, 15];
    expect(tauros.toImportable()).toMatchSnapshot();
  });
});

test(".fromSet()", () => {
  const gen = Gens.ORAS;
  expect(
    Pokemon.fromSet({
      name: "Arceus",
      set: {
        l: 42,
        n: Natures.BRAVE,
        a: "blaze",
        i: "leftovers",
        m: ["judgment", "return", "refresh", "recover"],
        e: [63, 0, 63, 0, 1, 0],
        d: [0, 31, 31, 31, 31, 31]
      },
      gen
    })
  ).toMatchObject({
    id: "arceus",
    level: 42,
    nature: Natures.BRAVE,
    ability: { id: "blaze", gen },
    item: { id: "leftovers", gen },
    moves: [
      { id: "judgment", gen },
      { id: "return", gen },
      { id: "refresh", gen },
      { id: "recover", gen }
    ],
    evs: [252, 0, 252, 0, 4, 0],
    ivs: [0, 31, 31, 31, 31, 31],
    happiness: 255,
    gen
  });

  expect(
    Pokemon.fromSet({
      id: "arceus",
      set: {},
      gen
    })
  ).toMatchObject({
    id: "arceus",
    level: 100,
    nature: Natures.HARDY,
    ability: { id: "noability", gen },
    item: { id: "noitem", gen },
    moves: [
      { id: "nomove", gen },
      { id: "nomove", gen },
      { id: "nomove", gen },
      { id: "nomove", gen }
    ],
    evs: [0, 0, 0, 0, 0, 0],
    ivs: [31, 31, 31, 31, 31, 31],
    gen
  });
});

test("#toSet()", () => {
  const arceus = new Pokemon({
    name: "Arceus",
    level: 80,
    nature: Natures.TIMID,
    ability: "Multitype",
    item: "Earth Plate",
    moves: ["Judgment", "Ice Beam", "Recover", "Calm Mind"],
    evs: [4, 0, 0, 252, 0, 252],
    ivs: [31, 0, 31, 31, 31, 31],
    gen: Gens.SM
  });
  expect(arceus.toSet()).toEqual({
    l: 80,
    n: 10,
    a: "multitype",
    i: "earthplate",
    m: ["judgment", "icebeam", "recover", "calmmind"],
    e: [1, 0, 0, 63, 0, 63],
    d: [31, 0, 31, 31, 31, 31]
  });

  const noPokemon = new Pokemon({
    moves: ["Judgment", "Ice Beam", "Recover", "Calm Mind"],
    gen: Gens.SM
  });
  expect(noPokemon.toSet()).toEqual({
    m: ["judgment", "icebeam", "recover", "calmmind"]
  });

  const noPokemonGsc = new Pokemon({
    moves: ["Body Slam", "Earthquake", "Rest", "Curse"],
    gen: Gens.GSC
  });
  expect(noPokemonGsc.toSet()).toEqual({
    m: ["bodyslam", "earthquake", "rest", "curse"]
  });
});

test("#name", () => {
  expect(mudkip.name).toBe("Mudkip");
  expect(nopokemon.name).toBe("(No Pokemon)");

  const poke1 = new Pokemon();
  poke1.name = "   latias ";
  expect(poke1.id).toBe("latias");

  const poke2 = new Pokemon();
  poke2.name = " laTIos    MEGA      ";
  expect(poke2.id).toBe("latiosmega");

  const poke3 = new Pokemon();
  poke3.name = "SNOR LAX";
  expect(poke3.id).toBe("snorlax");
});

test("#stat()", () => {
  const nidoking = new Pokemon({
    name: "Nidoking",
    evs: [0, 0, 4, 252, 0, 252],
    ivs: [31, 0, 31, 31, 31, 31],
    nature: Natures.MODEST
  });
  expect(nidoking.stat(Stats.HP)).toBe(303);
  expect(nidoking.stat(Stats.ATK)).toBe(188);
  expect(nidoking.stat(Stats.DEF)).toBe(191);
  expect(nidoking.stat(Stats.SATK)).toBe(295);
  expect(nidoking.stat(Stats.SDEF)).toBe(186);
  expect(nidoking.stat(Stats.SPD)).toBe(269);

  nidoking.gen = Gens.B2W2;
  expect(nidoking.stat(Stats.HP)).toBe(303);
  expect(nidoking.stat(Stats.ATK)).toBe(170);
  expect(nidoking.stat(Stats.DEF)).toBe(191);
  expect(nidoking.stat(Stats.SATK)).toBe(295);
  expect(nidoking.stat(Stats.SDEF)).toBe(186);
  expect(nidoking.stat(Stats.SPD)).toBe(269);

  const shedinja = new Pokemon({
    name: "Shedinja",
    evs: [252, 252, 4, 0, 0, 0]
  });
  expect(shedinja.stat(Stats.HP)).toBe(1);
  expect(shedinja.stat(Stats.ATK)).toBe(279);
  expect(shedinja.stat(Stats.DEF)).toBe(127);
  expect(shedinja.stat(Stats.SATK)).toBe(96);
  expect(shedinja.stat(Stats.SDEF)).toBe(96);
  expect(shedinja.stat(Stats.SPD)).toBe(116);

  const gscSnorlax = new Pokemon({ name: "Snorlax", gen: Gens.GSC });
  expect(gscSnorlax.stat(Stats.HP)).toBe(523);
  expect(gscSnorlax.stat(Stats.ATK)).toBe(318);
  expect(gscSnorlax.stat(Stats.DEF)).toBe(228);
  expect(gscSnorlax.stat(Stats.SATK)).toBe(228);
  expect(gscSnorlax.stat(Stats.SDEF)).toBe(318);
  expect(gscSnorlax.stat(Stats.SPD)).toBe(158);
  gscSnorlax.evs[Stats.SPD] = 0;
  expect(gscSnorlax.stat(Stats.SPD)).toBe(95);

  const gscZapdos = new Pokemon({ name: "Zapdos", gen: Gens.GSC });
  expect(gscZapdos.stat(Stats.HP)).toBe(383);
  expect(gscZapdos.stat(Stats.ATK)).toBe(278);
  expect(gscZapdos.stat(Stats.DEF)).toBe(268);
  expect(gscZapdos.stat(Stats.SATK)).toBe(348);
  expect(gscZapdos.stat(Stats.SDEF)).toBe(278);
  expect(gscZapdos.stat(Stats.SPD)).toBe(298);
  gscZapdos.ivs[Stats.DEF] = 13;
  expect(gscZapdos.stat(Stats.DEF)).toBe(264);

  const rbyTauros = new Pokemon({ name: "Tauros", gen: Gens.RBY });
  expect(rbyTauros.stat(Stats.HP)).toBe(353);
  expect(rbyTauros.stat(Stats.ATK)).toBe(298);
  expect(rbyTauros.stat(Stats.DEF)).toBe(288);
  expect(rbyTauros.stat(Stats.SPC)).toBe(238);
  expect(rbyTauros.stat(Stats.SPD)).toBe(318);

  const tauros = new Pokemon({ name: "Tauros", powerTrick: true });
  expect(tauros.stat(Stats.HP)).toBe(291);
  expect(tauros.stat(Stats.ATK)).toBe(226);
  expect(tauros.stat(Stats.DEF)).toBe(236);
  expect(tauros.stat(Stats.SATK)).toBe(116);
  expect(tauros.stat(Stats.SDEF)).toBe(176);
  expect(tauros.stat(Stats.SPD)).toBe(256);

  mudkip.overrideStats = [0, 0, 244, 0, 0, 0];
  expect(mudkip.stat(Stats.HP)).toBe(241);
  expect(mudkip.stat(Stats.ATK)).toBe(176);
  expect(mudkip.stat(Stats.DEF)).toBe(244);
  expect(mudkip.stat(Stats.SATK)).toBe(136);
  expect(mudkip.stat(Stats.SDEF)).toBe(136);
  expect(mudkip.stat(Stats.SPD)).toBe(116);
});

test("#boost()", () => {
  mudkip.boosts = [NaN, 2, 3, 0, 1, 2, -1, 6];
  mudkip.ability.name = "Simple";
  expect(mudkip.boost(Stats.ATK)).toBe(2);
  expect(mudkip.boost(Stats.DEF)).toBe(3);
  expect(mudkip.boost(Stats.SATK)).toBe(0);
  expect(mudkip.boost(Stats.SDEF)).toBe(1);
  expect(mudkip.boost(Stats.SPD)).toBe(2);
  expect(mudkip.boost(Stats.ACC)).toBe(-1);
  expect(mudkip.boost(Stats.EVA)).toBe(6);

  mudkip.gen = 4;
  expect(mudkip.boost(Stats.ATK)).toBe(4);
  expect(mudkip.boost(Stats.DEF)).toBe(6);
  expect(mudkip.boost(Stats.SATK)).toBe(0);
  expect(mudkip.boost(Stats.SDEF)).toBe(2);
  expect(mudkip.boost(Stats.SPD)).toBe(4);
  expect(mudkip.boost(Stats.ACC)).toBe(-2);
  expect(mudkip.boost(Stats.EVA)).toBe(6);
});

test("#boostedStat()", () => {
  const mew = new Pokemon({
    name: "Mew",
    evs: [4, 252, 0, 0, 0, 252],
    boosts: [NaN, 2, 0, 0, 0, 0, 0, 0]
  });
  expect(mew.boostedStat(Stats.ATK)).toBe(598);

  const bidoof = new Pokemon({
    name: "Bidoof",
    ability: "Simple",
    boosts: [3, 2, 0, 0, -1, 0, 0, 0]
  });
  expect(bidoof.boostedStat(Stats.ATK)).toBe(252);
  expect(bidoof.boostedStat(Stats.SDEF)).toBe(77);
  expect(bidoof.boostedStat(Stats.HP)).toBe(259);
  bidoof.gen = 4;
  bidoof.ability.gen = 4;
  expect(bidoof.boostedStat(Stats.ATK)).toBe(378);
  expect(bidoof.boostedStat(Stats.SDEF)).toBe(58);

  const gscSkarmory = new Pokemon({
    name: "Skarmory",
    boosts: [NaN, 1, 1, 0, 0, -1, 0, 0],
    gen: Gens.GSC
  });
  expect(gscSkarmory.boostedStat(Stats.SPD)).toBe(157);

  const gscSnorlax = new Pokemon({ name: "Snorlax", gen: Gens.GSC });
  expect(gscSnorlax.boostedStat(Stats.SPD)).toBe(158);
});

test("#baseStat()", () => {
  const nidoking = new Pokemon({ name: "Nidoking" });
  expect(nidoking.baseStat(Stats.HP)).toBe(81);
  expect(nidoking.baseStat(Stats.ATK)).toBe(102);
  expect(nidoking.baseStat(Stats.DEF)).toBe(77);
  expect(nidoking.baseStat(Stats.SATK)).toBe(85);
  expect(nidoking.baseStat(Stats.SDEF)).toBe(75);
  expect(nidoking.baseStat(Stats.SPD)).toBe(85);

  nidoking.gen = Gens.B2W2;
  expect(nidoking.baseStat(Stats.HP)).toBe(81);
  expect(nidoking.baseStat(Stats.ATK)).toBe(92);
  expect(nidoking.baseStat(Stats.DEF)).toBe(77);
  expect(nidoking.baseStat(Stats.SATK)).toBe(85);
  expect(nidoking.baseStat(Stats.SDEF)).toBe(75);
  expect(nidoking.baseStat(Stats.SPD)).toBe(85);

  const charizard = new Pokemon({ name: "Charizard" });
  expect(charizard.baseStat(Stats.HP)).toBe(78);
  expect(charizard.baseStat(Stats.ATK)).toBe(84);
  expect(charizard.baseStat(Stats.DEF)).toBe(78);
  expect(charizard.baseStat(Stats.SATK)).toBe(109);
  expect(charizard.baseStat(Stats.SDEF)).toBe(85);
  expect(charizard.baseStat(Stats.SPD)).toBe(100);

  charizard.gen = Gens.RBY;
  expect(charizard.baseStat(Stats.HP)).toBe(78);
  expect(charizard.baseStat(Stats.ATK)).toBe(84);
  expect(charizard.baseStat(Stats.DEF)).toBe(78);
  expect(charizard.baseStat(Stats.SATK)).toBe(85);
  expect(charizard.baseStat(Stats.SDEF)).toBe(85);
  expect(charizard.baseStat(Stats.SPD)).toBe(100);
});

test("#speed()", () => {
  mudkip.boosts = [NaN, 0, 0, 0, 0, 2, 0, 0];
  expect(mudkip.speed()).toBe(232);

  const weatherAbilities = [
    ["Swift Swim", Weathers.RAIN],
    ["Chlorophyll", Weathers.SUN],
    ["Sand Rush", Weathers.SAND],
    ["Slush Rush", Weathers.HAIL]
  ];
  for (const [ability, weather] of weatherAbilities) {
    mudkip.ability.name = ability;
    expect(mudkip.speed()).toBe(232);
    expect(mudkip.speed({ weather })).toBe(464);
  }

  mudkip.ability.name = "Surge Surfer";
  expect(mudkip.speed()).toBe(232);
  expect(mudkip.speed({ terrain: Terrains.ELECTRIC_TERRAIN })).toBe(464);

  mudkip.ability.name = "(No Ability)";
  mudkip.item.name = "Choice Scarf";
  expect(mudkip.speed()).toBe(348);

  mudkip.item.name = "Quick Powder";
  expect(mudkip.speed()).toBe(232);

  const ditto = new Pokemon({ name: "Ditto" });
  expect(ditto.speed()).toBe(132);
  ditto.item.name = "Quick Powder";
  expect(ditto.speed()).toBe(264);

  mudkip.item.name = "Iron Ball";
  expect(mudkip.speed()).toBe(116);

  mudkip.status = Statuses.PARALYZED;
  expect(mudkip.speed()).toBe(29);
  mudkip.ability.name = "Quick Feet";
  expect(mudkip.speed()).toBe(174);

  mudkip.status = Statuses.NO_STATUS;
  mudkip.ability.name = "Slow Start";
  expect(mudkip.speed()).toBe(116);
  mudkip.slowStart = true;
  expect(mudkip.speed()).toBe(58);

  mudkip.ability.name = "Unburden";
  mudkip.item.name = "(No Item)";
  expect(mudkip.speed()).toBe(232);
  mudkip.unburden = true;
  expect(mudkip.speed()).toBe(464);

  mudkip.ability.name = "(No Ability)";
  mudkip.tailwind = true;
  expect(mudkip.speed()).toBe(464);
});

test("#type1()", () => {
  expect(mudkip.type1()).toBe(Types.WATER);
  expect(marshtomp.type1()).toBe(Types.WATER);

  const sceptile = new Pokemon({ name: "Sceptile" });
  expect(sceptile.type1()).toBe(Types.GRASS);

  const megaSceptile = new Pokemon({ name: "Sceptile-Mega" });
  expect(megaSceptile.type1()).toBe(Types.GRASS);
});

test("#type2()", () => {
  expect(mudkip.type2()).toBe(Types.CURSE);
  expect(marshtomp.type2()).toBe(Types.GROUND);

  const sceptile = new Pokemon({ name: "Sceptile" });
  expect(sceptile.type2()).toBe(Types.CURSE);

  const megaSceptile = new Pokemon({ name: "Sceptile-Mega" });
  expect(megaSceptile.type2()).toBe(Types.DRAGON);
});

test("#overrideTypes", () => {
  mudkip.overrideTypes = [Types.NORMAL, Types.CURSE];
  expect(mudkip.type1()).toBe(Types.NORMAL);
  expect(mudkip.type2()).toBe(Types.CURSE);
  expect(mudkip.types()).toEqual([Types.NORMAL]);
});

test("#types()", () => {
  expect(mudkip.types()).toEqual([Types.WATER]);

  expect(swampert.types()).toEqual([Types.WATER, Types.GROUND]);

  const clefable = new Pokemon({ name: "Clefable" });
  expect(clefable.types()).toEqual([Types.FAIRY]);

  clefable.gen = Gens.B2W2;
  expect(clefable.types()).toEqual([Types.NORMAL]);

  clefable.addedType = Types.WATER;
  expect(clefable.types()).toEqual([Types.NORMAL, Types.WATER]);

  const mrMime = new Pokemon({ name: "Mr. Mime" });
  expect(mrMime.types()).toEqual([Types.PSYCHIC, Types.FAIRY]);

  mrMime.gen = Gens.GSC;
  expect(mrMime.types()).toEqual([Types.PSYCHIC]);
});

test("#stab()", () => {
  expect(mudkip.stab(Types.WATER)).toBe(true);
  expect(mudkip.stab(Types.CURSE)).toBe(false);
  swampert.addedType = Types.FIRE;
  expect(swampert.stab(Types.WATER)).toBe(true);
  expect(swampert.stab(Types.GROUND)).toBe(true);
  expect(swampert.stab(Types.FIRE)).toBe(true);
});

test("#weight()", () => {
  expect(mudkip.weight()).toBe(76);
  expect(marshtomp.weight()).toBe(280);
  expect(swampert.weight()).toBe(819);
  expect(megaSwampert.weight()).toBe(1020);

  mudkip.autotomize = true;
  expect(mudkip.weight()).toBe(1);

  mudkip.ability.name = "Light Metal";
  expect(mudkip.weight()).toBe(1);

  megaSwampert.autotomize = true;
  expect(megaSwampert.weight()).toBe(20);

  swampert.ability.name = "Light Metal";
  expect(swampert.weight()).toBe(409);

  swampert.ability.name = "Heavy Metal";
  expect(swampert.weight()).toBe(1638);

  swampert.ability.name = "(No Ability)";
  swampert.item.name = "Float Stone";
  expect(swampert.weight()).toBe(409);
});

test("#hasEvolution()", () => {
  expect(mudkip.hasEvolution()).toBe(true);
  expect(marshtomp.hasEvolution()).toBe(true);
  expect(swampert.hasEvolution()).toBe(false);
  expect(megaSwampert.hasEvolution()).toBe(false);

  const togetic = new Pokemon({ name: "Togetic" });
  expect(togetic.hasEvolution()).toBe(true);
  togetic.gen = Gens.ADV;
  expect(togetic.hasEvolution()).toBe(false);

  const floette = new Pokemon({ name: "Floette" });
  expect(floette.hasEvolution()).toBe(true);
  const floetteEternal = new Pokemon({ name: "Floette-Eternal" });
  expect(floetteEternal.hasEvolution()).toBe(false);
});

test("#hasPreEvolution()", () => {
  expect(mudkip.hasPreEvolution()).toBe(false);
  expect(marshtomp.hasPreEvolution()).toBe(true);
  expect(swampert.hasPreEvolution()).toBe(true);
  expect(megaSwampert.hasPreEvolution()).toBe(true);

  const snorlax = new Pokemon({ name: "Snorlax" });
  expect(snorlax.hasPreEvolution()).toBe(true);
  snorlax.gen = Gens.ADV;
  expect(snorlax.hasPreEvolution()).toBe(false);
});

test("#isMega()", () => {
  const meganium = new Pokemon({ name: "Meganium" });
  expect(meganium.isMega()).toBe(false);
  expect(megaSwampert.isMega()).toBe(true);
});

test("#isItemRequired()", () => {
  const primalKyogre = new Pokemon({ name: "Kyogre-Primal" });
  expect(primalKyogre.isItemRequired()).toBe(false);
  primalKyogre.item.name = "Blue Orb";
  expect(primalKyogre.isItemRequired()).toBe(true);
});

test("#hurtBySandstorm()", () => {
  expect(mudkip.hurtBySandstorm()).toBe(true);

  mudkip.item.name = "Safety Goggles";
  expect(mudkip.hurtBySandstorm()).toBe(false);

  mudkip.item.name = "(No Item)";
  mudkip.ability.name = "Sand Rush";
  expect(mudkip.hurtBySandstorm()).toBe(false);

  expect(marshtomp.hurtBySandstorm()).toBe(false);

  const tyranitar = new Pokemon({ name: "Tyranitar" });
  expect(tyranitar.hurtBySandstorm()).toBe(false);

  const scizor = new Pokemon({ name: "Scizor" });
  expect(scizor.hurtBySandstorm()).toBe(false);
});

test("#hurtByHail()", () => {
  expect(mudkip.hurtByHail()).toBe(true);

  mudkip.item.name = "Safety Goggles";
  expect(mudkip.hurtByHail()).toBe(false);

  mudkip.item.name = "(No Item)";
  mudkip.ability.name = "Ice Body";
  expect(mudkip.hurtByHail()).toBe(false);

  const froslass = new Pokemon({ name: "Froslass" });
  expect(froslass.hurtByHail()).toBe(false);
});

test("#isPoisoned()", () => {
  expect(mudkip.isPoisoned()).toBe(false);

  mudkip.status = Statuses.POISONED;
  expect(mudkip.isPoisoned()).toBe(true);

  mudkip.status = Statuses.BADLY_POISONED;
  expect(mudkip.isPoisoned()).toBe(false);
});

test("#isBadlyPoisoned()", () => {
  expect(mudkip.isBadlyPoisoned()).toBe(false);

  mudkip.status = Statuses.POISONED;
  expect(mudkip.isBadlyPoisoned()).toBe(false);

  mudkip.status = Statuses.BADLY_POISONED;
  expect(mudkip.isBadlyPoisoned()).toBe(true);
});

test("#isBurned()", () => {
  expect(mudkip.isBurned()).toBe(false);

  mudkip.status = Statuses.POISONED;
  expect(mudkip.isBurned()).toBe(false);

  mudkip.status = Statuses.BURNED;
  expect(mudkip.isBurned()).toBe(true);
});

test("#isParalyzed()", () => {
  expect(mudkip.isParalyzed()).toBe(false);

  mudkip.status = Statuses.POISONED;
  expect(mudkip.isParalyzed()).toBe(false);

  mudkip.status = Statuses.PARALYZED;
  expect(mudkip.isParalyzed()).toBe(true);
});

test("#isAsleep()", () => {
  expect(mudkip.isAsleep()).toBe(false);

  mudkip.status = Statuses.POISONED;
  expect(mudkip.isAsleep()).toBe(false);

  mudkip.status = Statuses.ASLEEP;
  expect(mudkip.isAsleep()).toBe(true);

  mudkip.status = Statuses.BURNED;
  expect(mudkip.isAsleep()).toBe(false);
  mudkip.ability.name = "Comatose";
  expect(mudkip.isAsleep()).toBe(true);
});

test("#isFrozen()", () => {
  expect(mudkip.isFrozen()).toBe(false);

  mudkip.status = Statuses.POISONED;
  expect(mudkip.isFrozen()).toBe(false);

  mudkip.status = Statuses.FROZEN;
  expect(mudkip.isFrozen()).toBe(true);
});

test("#isMale()", () => {
  expect(mudkip.isMale()).toBe(false);

  mudkip.gender = Genders.MALE;
  expect(mudkip.isMale()).toBe(true);

  mudkip.gender = Genders.FEMALE;
  expect(mudkip.isMale()).toBe(false);

  mudkip.gender = Genders.NO_GENDER;
  expect(mudkip.isMale()).toBe(false);
});

test("#isFemale()", () => {
  expect(mudkip.isFemale()).toBe(false);

  mudkip.gender = Genders.FEMALE;
  expect(mudkip.isFemale()).toBe(true);

  mudkip.gender = Genders.MALE;
  expect(mudkip.isFemale()).toBe(false);

  mudkip.gender = Genders.NO_GENDER;
  expect(mudkip.isFemale()).toBe(false);
});

test("#hasPlate()", () => {
  expect(swampert.hasPlate()).toBe(false);

  swampert.item.name = "Earth Plate";
  expect(swampert.hasPlate()).toBe(true);
});

test("#hasDrive()", () => {
  expect(swampert.hasDrive()).toBe(false);

  swampert.item.name = "Chill Drive";
  expect(swampert.hasDrive()).toBe(true);
});

test("#knockOff()", () => {
  expect(mudkip.knockOff()).toBe(false);

  mudkip.item.name = "Leftovers";
  expect(mudkip.knockOff()).toBe(true);

  mudkip.ability.name = "Sticky Hold";
  expect(mudkip.knockOff()).toBe(false);

  mudkip.ability.name = "(No Ability)";
  mudkip.item.disabled = true;
  expect(mudkip.knockOff()).toBe(true);

  mudkip.item.disabled = false;
  mudkip.item.used = true;
  expect(mudkip.knockOff()).toBe(false);

  mudkip.item.used = false;
  mudkip.item.name = "Swampertite";
  expect(mudkip.knockOff()).toBe(true);

  megaSwampert.item.name = "Swampertite";
  expect(megaSwampert.knockOff()).toBe(false);

  mudkip.item.name = "Griseous Orb";
  expect(mudkip.knockOff()).toBe(true);

  const giratina = new Pokemon({
    name: "Giratina",
    item: "Griseous Orb"
  });
  expect(giratina.knockOff()).toBe(false);

  const giratinaOrigin = new Pokemon({
    name: "Giratina-Origin",
    item: "Griseous Orb"
  });
  expect(giratinaOrigin.knockOff()).toBe(false);

  const genesectChill = new Pokemon({
    name: "Genesect-Chill",
    item: "Chill Drive"
  });
  expect(genesectChill.knockOff()).toBe(false);

  mudkip.ability.name = "Multitype";
  mudkip.item.name = "Earth Plate";
  expect(mudkip.knockOff()).toBe(false);
  mudkip.item.name = "Leftovers";
  expect(mudkip.knockOff()).toBe(true);

  const groudon = new Pokemon({
    name: "Groudon",
    item: "Red Orb"
  });
  expect(groudon.knockOff()).toBe(false);
  groudon.item.name = "Blue Orb";
  expect(groudon.knockOff()).toBe(true);

  const primalGroudon = new Pokemon({
    name: "Groudon-Primal",
    item: "Red Orb"
  });
  expect(primalGroudon.knockOff()).toBe(false);
  primalGroudon.item.name = "Blue Orb";
  expect(primalGroudon.knockOff()).toBe(true);

  const kyogre = new Pokemon({
    name: "Kyogre",
    item: "Blue Orb"
  });
  expect(kyogre.knockOff()).toBe(false);
  kyogre.item.name = "Red Orb";
  expect(kyogre.knockOff()).toBe(true);

  const primalKyogre = new Pokemon({
    name: "Kyogre-Primal",
    item: "Blue Orb"
  });
  expect(primalKyogre.knockOff()).toBe(false);
  primalKyogre.item.name = "Red Orb";
  expect(primalKyogre.knockOff()).toBe(true);

  const silvally = new Pokemon({ name: "Silvally", item: "Fire Memory" });
  expect(silvally.knockOff()).toBe(false);
  const silvallyFire = new Pokemon({
    name: "Silvally-Fire",
    item: "Fire Memory"
  });
  expect(silvallyFire.knockOff()).toBe(false);

  /* HGSS */
  const hgssMudkip = new Pokemon({ name: "Mudkip", gen: Gens.HGSS });

  expect(hgssMudkip.knockOff()).toBe(false);

  hgssMudkip.item.name = "Leftovers";
  expect(hgssMudkip.knockOff()).toBe(true);

  hgssMudkip.ability.name = "Sticky Hold";
  expect(hgssMudkip.knockOff()).toBe(false);

  hgssMudkip.ability.name = "(No Ability)";
  hgssMudkip.item.disabled = true;
  expect(hgssMudkip.knockOff()).toBe(true);

  hgssMudkip.item.disabled = false;
  hgssMudkip.item.used = true;
  expect(hgssMudkip.knockOff()).toBe(false);

  hgssMudkip.item.used = false;
  hgssMudkip.item.name = "Griseous Orb";
  expect(hgssMudkip.knockOff()).toBe(true);

  const hgssGiratina = new Pokemon({
    name: "Giratina",
    item: "Griseous Orb",
    gen: Gens.HGSS
  });
  expect(hgssGiratina.knockOff()).toBe(false);
  hgssGiratina.item.name = "Leftovers";
  expect(hgssGiratina.knockOff()).toBe(true);

  const hgssGiratinaOrigin = new Pokemon({
    name: "Giratina-Origin",
    item: "Griseous Orb",
    gen: Gens.HGSS
  });
  expect(hgssGiratinaOrigin.knockOff()).toBe(false);
  hgssGiratinaOrigin.item.name = "Leftovers";
  expect(hgssGiratinaOrigin.knockOff()).toBe(true);

  hgssMudkip.ability.name = "Multitype";
  hgssMudkip.item.name = "Earth Plate";
  expect(hgssMudkip.knockOff()).toBe(false);

  hgssMudkip.item.name = "Leftovers";
  expect(hgssMudkip.knockOff()).toBe(false);
});

test("#knockOffBoost()", () => {
  expect(mudkip.knockOffBoost()).toBe(false);

  mudkip.item.name = "Leftovers";
  expect(mudkip.knockOffBoost()).toBe(true);

  mudkip.ability.name = "Sticky Hold";
  expect(mudkip.knockOffBoost()).toBe(true);

  mudkip.ability.name = "(No Ability)";
  mudkip.item.disabled = true;
  expect(mudkip.knockOffBoost()).toBe(true);

  mudkip.item.disabled = false;
  mudkip.item.used = true;
  expect(mudkip.knockOffBoost()).toBe(false);

  mudkip.item.used = false;
  mudkip.item.name = "Swampertite";
  expect(mudkip.knockOffBoost()).toBe(true);

  megaSwampert.item.name = "Swampertite";
  expect(megaSwampert.knockOffBoost()).toBe(false);

  mudkip.item.name = "Griseous Orb";
  expect(mudkip.knockOffBoost()).toBe(true);

  const giratina = new Pokemon({
    name: "Giratina",
    item: "Griseous Orb"
  });
  expect(giratina.knockOffBoost()).toBe(false);

  const giratinaOrigin = new Pokemon({
    name: "Giratina-Origin",
    item: "Griseous Orb"
  });
  expect(giratinaOrigin.knockOffBoost()).toBe(false);

  const genesectChill = new Pokemon({
    name: "Genesect-Chill",
    item: "Chill Drive"
  });
  expect(genesectChill.knockOffBoost()).toBe(false);

  mudkip.ability.name = "Multitype";
  mudkip.item.name = "Earth Plate";
  expect(mudkip.knockOffBoost()).toBe(false);
  mudkip.item.name = "Leftovers";
  expect(mudkip.knockOffBoost()).toBe(true);

  const groudon = new Pokemon({
    name: "Groudon",
    item: "Red Orb"
  });
  expect(groudon.knockOffBoost()).toBe(false);
  groudon.item.name = "Blue Orb";
  expect(groudon.knockOffBoost()).toBe(true);

  const primalGroudon = new Pokemon({
    name: "Groudon-Primal",
    item: "Red Orb"
  });
  expect(primalGroudon.knockOffBoost()).toBe(false);
  primalGroudon.item.name = "Blue Orb";
  expect(primalGroudon.knockOffBoost()).toBe(true);

  const kyogre = new Pokemon({
    name: "Kyogre",
    item: "Blue Orb"
  });
  expect(kyogre.knockOffBoost()).toBe(false);
  kyogre.item.name = "Red Orb";
  expect(kyogre.knockOffBoost()).toBe(true);

  const primalKyogre = new Pokemon({
    name: "Kyogre-Primal",
    item: "Blue Orb"
  });
  expect(primalKyogre.knockOffBoost()).toBe(false);
  primalKyogre.item.name = "Red Orb";
  expect(primalKyogre.knockOffBoost()).toBe(true);
});

test("#pinchAbilityActivated()", () => {
  const swampert = new Pokemon({
    name: "Swampert",
    ability: "Torrent",
    evs: [4, 0, 0, 0, 0, 0]
  });
  swampert.currentHp = 115;
  expect(swampert.pinchAbilityActivated(Types.WATER)).toBe(false);
  swampert.currentHp = 114;
  expect(swampert.pinchAbilityActivated(Types.WATER)).toBe(true);
  expect(swampert.pinchAbilityActivated(Types.FIRE)).toBe(false);
});

test("#thickClubBoosted()", () => {
  const marowak = new Pokemon({ name: "marowak" });
  expect(marowak.thickClubBoosted()).toBe(false);
  marowak.item.name = "Thick Club";
  expect(marowak.thickClubBoosted()).toBe(true);
  const cubone = new Pokemon({ name: "Cubone", item: "Thick Club" });
  expect(cubone.thickClubBoosted()).toBe(true);
  const ditto = new Pokemon({ name: "Ditto" });
  expect(ditto.thickClubBoosted()).toBe(false);
});

test("#lightBallBoosted()", () => {
  const pikachu = new Pokemon({ name: "Pikachu" });
  expect(pikachu.lightBallBoosted()).toBe(false);
  const pikachuWithLightBall = new Pokemon({
    name: "Pikachu",
    item: "Light Ball"
  });
  expect(pikachuWithLightBall.lightBallBoosted()).toBe(true);
  const pichuWithLightBall = new Pokemon({
    name: "Pichu",
    item: "Light Ball"
  });
  expect(pichuWithLightBall.lightBallBoosted()).toBe(false);
});

test.each([
  [[NaN, 15, 15, 15, 15, 15], 15],
  [[NaN, 15, 14, 15, 15, 15], 11],
  [[NaN, 15, 9, 8, 8, 15], 14],
  [[NaN, 1, 15, 5, 5, 4], 13],
  [[NaN, 0, 2, 4, 4, 8], 0]
])(".calcHealthDv(%p)", (dvs, expected) => {
  expect(Pokemon.calcHealthDv(dvs)).toBe(expected);
});
