import Pokemon from "../src/Pokemon";
import {
  Gens,
  Genders,
  Stats,
  Statuses,
  Types,
  Weathers
} from "../src/utilities";
import matchers from "./matchers";

expect.extend(matchers);

describe("Pokemon", () => {
  let missingno;
  let mudkip;
  let marshtomp;
  let swampert;
  let megaSwampert;

  beforeEach(() => {
    missingno = new Pokemon();
    mudkip = new Pokemon({ name: "Mudkip" });
    marshtomp = new Pokemon({ name: "Marshtomp" });
    swampert = new Pokemon({ name: "Swampert" });
    megaSwampert = new Pokemon({ name: "Mega Swampert" });
  });

  test("#constructor()", () => {
    const snorlax = new Pokemon({ name: "Snorlax" });
    expect(snorlax).toMatchObject({
      id: "143:0",
      evs: [0, 0, 0, 0, 0, 0],
      ivs: [31, 31, 31, 31, 31, 31]
    });

    const gscSnorlax = new Pokemon({ id: "143:0", gen: Gens.GSC });
    expect(gscSnorlax).toMatchObject({
      id: "143:0",
      evs: [252, 252, 252, 252, 252, 252],
      ivs: [15, 15, 15, 15, 15, 15]
    });

    const smeargle = new Pokemon({
      name: "Smeargle",
      moves: [{ name: "Ice Beam" }],
      item: { name: "Leftovers" }
    });
    expect(smeargle).toMatchObject({
      moves: [{ id: 58 }, { id: 0 }, { id: 0 }, { id: 0 }],
      item: { id: 15 }
    });
  });

  describe(".fromImportable()", () => {
    test("handles simple importables", () => {
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
        Gens.ORAS
      );
      expect(arceusGround).toMatchObject({
        gen: 6,
        id: "493:4",
        gender: Genders.MALE,
        item: { id: 187, gen: 6 },
        ability: { id: 121, gen: 6 },
        level: 100,
        evs: [0, 0, 0, 252, 4, 252],
        ivs: [31, 0, 31, 31, 31, 31],
        nature: 10,
        moves: [
          { id: 449, gen: 6 },
          { id: 58, gen: 6 },
          { id: 287, gen: 6 },
          { id: 105, gen: 6 }
        ]
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
        id: "170:0",
        gender: Genders.FEMALE,
        level: 5
      });
    });

    test("handles GSC importables", () => {
      const snorlax = Pokemon.fromImportable(
        `zorofat (Snorlax) @ Leftovers
        - Toxic
        - Double-Edge
        - Flamethrower
        - Rest`,
        Gens.GSC
      );
      expect(snorlax).toMatchObject({
        gen: Gens.GSC,
        id: "143:0",
        gender: Genders.NO_GENDER,
        item: { id: 15, gen: Gens.GSC },
        level: 100,
        evs: [252, 252, 252, 252, 252, 252],
        ivs: [15, 15, 15, 15, 15, 15],
        moves: [
          { id: 92, gen: Gens.GSC },
          { id: 38, gen: Gens.GSC },
          { id: 53, gen: Gens.GSC },
          { id: 156, gen: Gens.GSC }
        ]
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
      expect(returnSnorlax.happiness).toEqual(255);

      const snorlax = Pokemon.fromImportable(
        `Snorlax
        - Waterfall`,
        Gens.ORAS
      );
      expect(snorlax.happiness).toEqual(0);
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
        { id: 237 },
        { id: 156 },
        { id: 0 },
        { id: 0 }
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
        id: "143:0",
        nickname: "zorofat",
        gender: Genders.NO_GENDER
      });

      expect(
        Pokemon.fromImportable(`  zorofat   (Snorlax) (M)`, Gens.SM)
      ).toMatchObject({
        id: "143:0",
        nickname: "zorofat",
        gender: Genders.MALE
      });

      expect(Pokemon.fromImportable(`Snorlax (M)`, Gens.SM)).toMatchObject({
        id: "143:0",
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
        natureName: "Careful",
        moves: ["Body Slam", "Curse", "Rest", "Earthquake"]
      });
      expect(snorlax.toImportable()).toEqualImportable(
        `Snorlax (M) @ Leftovers
        Ability: Immunity
        EVs: 252 HP / 212 Atk / 40 SpD
        Careful Nature
        - Body Slam
        - Curse
        - Rest
        - Earthquake`
      );

      const bronzong = new Pokemon({
        name: "Bronzong",
        item: "Leftovers",
        ability: "Levitate",
        evs: [252, 0, 4, 0, 252, 0],
        ivs: [31, 31, 31, 31, 31, 0],
        natureName: "Sassy",
        moves: ["Stealth Rock", "Gyro Ball", "Psywave", "Toxic"]
      });
      expect(bronzong.toImportable()).toEqualImportable(
        `Bronzong @ Leftovers
        Ability: Levitate
        EVs: 252 HP / 4 Def / 252 SpD
        IVs: 0 Spe
        Sassy Nature
        - Stealth Rock
        - Gyro Ball
        - Psywave
        - Toxic`
      );
    });

    test("handles sets with less than 4 moves", () => {
      const crobat = new Pokemon({
        name: "Crobat",
        gender: Genders.FEMALE,
        item: "Choice Band",
        ability: "Infiltrator",
        evs: [0, 252, 0, 0, 4, 252],
        natureName: "Jolly",
        moves: ["Brave Bird", "(No Move)", "U-turn", "Sleep Talk"]
      });
      expect(crobat.toImportable()).toEqualImportable(
        `Crobat (F) @ Choice Band
        Ability: Infiltrator
        EVs: 252 Atk / 4 SpD / 252 Spe
        Jolly Nature
        - Brave Bird
        - U-turn
        - Sleep Talk`
      );
    });

    test("optionally adds nature info", () => {
      const munchlax = new Pokemon({
        name: "Munchlax",
        gender: Genders.MALE,
        natureName: "Relaxed"
      });
      expect(munchlax.toImportable({ natureInfo: true })).toEqualImportable(
        `Munchlax (M) @ (No Item)
        Ability: (No Ability)
        Relaxed Nature (+Def, -Spe)`
      );
      munchlax.natureName = "Serious";
      expect(munchlax.toImportable({ natureInfo: true })).toEqualImportable(
        `Munchlax (M) @ (No Item)
        Ability: (No Ability)
        Serious Nature`
      );
    });

    test("handles LC sets", () => {
      const porygon = new Pokemon({
        name: "Porygon",
        item: "Eviolite",
        ability: "Trace",
        evs: [236, 0, 116, 0, 156, 0],
        natureName: "Calm",
        moves: ["Ice Beam", "Thunderbolt", "Recover", "Tri Attack"]
      });
      expect(porygon.toImportable()).toEqualImportable(
        `Porygon @ Eviolite
        Ability: Trace
        EVs: 236 HP / 116 Def / 156 SpD
        Calm Nature
        - Ice Beam
        - Thunderbolt
        - Recover
        - Tri Attack`
      );
    });

    test("handles GSC sets", () => {
      const zapdos = new Pokemon({
        name: "Zapdos",
        item: "Leftovers",
        ivs: [NaN, 15, 13, 15, 15, 15],
        moves: ["Thunder", "Hidden Power", "Rest", "Sleep Talk"],
        gen: Gens.GSC
      });
      expect(zapdos.toImportable()).toEqualImportable(
        `Zapdos @ Leftovers
        - Thunder
        - Hidden Power [Ice]
        - Rest
        - Sleep Talk`
      );

      zapdos.evs = [252, 252, 252, 40, NaN, 252];
      zapdos.ivs = [NaN, 15, 15, 11, NaN, 15];
      expect(zapdos.toImportable()).toEqualImportable(
        `Zapdos @ Leftovers
        EVs: 40 SpA / 40 SpD
        IVs: 11 SpA / 11 SpD
        - Thunder
        - Hidden Power [Dark]
        - Rest
        - Sleep Talk`
      );
    });

    test("handles RBY sets", () => {
      const tauros = new Pokemon({
        name: "Tauros",
        moves: ["Body Slam", "Hyper Beam", "Earthquake", "Blizzard"],
        gen: Gens.RBY
      });
      expect(tauros.toImportable()).toEqualImportable(
        `Tauros
        - Body Slam
        - Hyper Beam
        - Earthquake
        - Blizzard`
      );

      tauros.evs = [252, 252, 200, 40, NaN, 252];
      tauros.ivs = [NaN, 15, 10, 11, NaN, 15];
      expect(tauros.toImportable()).toEqualImportable(
        `Tauros
        EVs: 200 Def / 40 Spc
        IVs: 11 HP / 10 Def / 11 Spc
        - Body Slam
        - Hyper Beam
        - Earthquake
        - Blizzard`
      );
    });
  });

  test(".fromSet()", () => {
    expect(
      Pokemon.fromSet({
        name: "Arceus",
        gen: Gens.ORAS,
        set: {
          l: 42,
          n: 2,
          a: 66,
          i: 15,
          m: [449, 216, 287, 105],
          e: [63, 0, 63, 0, 1, 0],
          d: [0, 31, 31, 31, 31, 31]
        }
      })
    ).toMatchObject({
      id: "493:0",
      gen: Gens.ORAS,
      level: 42,
      nature: 2,
      ability: { id: 66 },
      item: { id: 15 },
      moves: [{ id: 449 }, { id: 216 }, { id: 287 }, { id: 105 }],
      evs: [252, 0, 252, 0, 4, 0],
      ivs: [0, 31, 31, 31, 31, 31],
      happiness: 255
    });

    expect(
      Pokemon.fromSet({
        id: "493:0",
        gen: Gens.ORAS,
        set: {}
      })
    ).toMatchObject({
      id: "493:0",
      gen: Gens.ORAS,
      level: 100,
      nature: 0,
      ability: { id: 0 },
      item: { id: 0 },
      moves: [{ id: 0 }, { id: 0 }, { id: 0 }, { id: 0 }],
      evs: [0, 0, 0, 0, 0, 0],
      ivs: [31, 31, 31, 31, 31, 31]
    });
  });

  test("#toSet()", () => {
    const arceus = new Pokemon({
      name: "Arceus",
      level: 80,
      natureName: "Timid",
      ability: "Multitype",
      item: "Earth Plate",
      moves: ["Judgment", "Ice Beam", "Recover", "Calm Mind"],
      evs: [4, 0, 0, 252, 0, 252],
      ivs: [31, 31, 31, 31, 31, 31],
      gen: Gens.SM
    });
    expect(arceus.toSet()).toMatchObject({
      l: 80,
      n: 10,
      a: 121,
      i: 187,
      m: [449, 58, 105, 347],
      e: [1, 0, 0, 63, 0, 63],
      d: [31, 31, 31, 31, 31, 31]
    });
  });

  test("#name", () => {
    expect(mudkip.name).toEqual("Mudkip");
    expect(missingno.name).toEqual("Missingno");

    const poke1 = new Pokemon();
    poke1.name = "   latias ";
    expect(poke1.id).toEqual("380:0");

    const poke2 = new Pokemon();
    poke2.name = " MEGA       laTIos ";
    expect(poke2.id).toEqual("381:1");

    const poke3 = new Pokemon();
    poke3.name = "SNOR LAX";
    expect(poke3.id).toEqual("0:0");
  });

  test("#natureName", () => {
    expect(mudkip.natureName).toEqual("Hardy");

    mudkip.nature = 5;
    expect(mudkip.natureName).toEqual("Bold");

    mudkip.natureName = " SAsSY   ";
    expect(mudkip.nature).toEqual(22);

    mudkip.natureName = "Bold";
    expect(mudkip.nature).toEqual(5);

    mudkip.natureName = "A damant";
    expect(mudkip.nature).toBeUndefined();
  });

  test("#num()", () => {
    expect(missingno.num()).toEqual(0);
    expect(mudkip.num()).toEqual(258);
    expect(megaSwampert.num()).toEqual(260);
  });

  test("#form()", () => {
    expect(missingno.form()).toEqual(0);
    expect(mudkip.form()).toEqual(0);
    expect(megaSwampert.form()).toEqual(1);
  });

  test("#stat()", () => {
    const nidoking = new Pokemon({
      name: "Nidoking",
      evs: [0, 0, 4, 252, 0, 252],
      ivs: [31, 0, 31, 31, 31, 31],
      natureName: "Modest"
    });
    expect(nidoking.stat(Stats.HP)).toEqual(303);
    expect(nidoking.stat(Stats.ATK)).toEqual(188);
    expect(nidoking.stat(Stats.DEF)).toEqual(191);
    expect(nidoking.stat(Stats.SATK)).toEqual(295);
    expect(nidoking.stat(Stats.SDEF)).toEqual(186);
    expect(nidoking.stat(Stats.SPD)).toEqual(269);

    nidoking.gen = 5;
    expect(nidoking.stat(Stats.HP)).toEqual(303);
    expect(nidoking.stat(Stats.ATK)).toEqual(170);
    expect(nidoking.stat(Stats.DEF)).toEqual(191);
    expect(nidoking.stat(Stats.SATK)).toEqual(295);
    expect(nidoking.stat(Stats.SDEF)).toEqual(186);
    expect(nidoking.stat(Stats.SPD)).toEqual(269);

    const shedinja = new Pokemon({
      name: "Shedinja",
      evs: [252, 252, 4, 0, 0, 0]
    });
    expect(shedinja.stat(Stats.HP)).toEqual(1);
    expect(shedinja.stat(Stats.ATK)).toEqual(279);
    expect(shedinja.stat(Stats.DEF)).toEqual(127);
    expect(shedinja.stat(Stats.SATK)).toEqual(96);
    expect(shedinja.stat(Stats.SDEF)).toEqual(96);
    expect(shedinja.stat(Stats.SPD)).toEqual(116);

    const gscSnorlax = new Pokemon({ name: "Snorlax", gen: Gens.GSC });
    expect(gscSnorlax.stat(Stats.HP)).toEqual(523);
    expect(gscSnorlax.stat(Stats.ATK)).toEqual(318);
    expect(gscSnorlax.stat(Stats.DEF)).toEqual(228);
    expect(gscSnorlax.stat(Stats.SATK)).toEqual(228);
    expect(gscSnorlax.stat(Stats.SDEF)).toEqual(318);
    expect(gscSnorlax.stat(Stats.SPD)).toEqual(158);
    gscSnorlax.evs[Stats.SPD] = 0;
    expect(gscSnorlax.stat(Stats.SPD)).toEqual(95);

    const gscZapdos = new Pokemon({ name: "Zapdos", gen: Gens.GSC });
    expect(gscZapdos.stat(Stats.HP)).toEqual(383);
    expect(gscZapdos.stat(Stats.ATK)).toEqual(278);
    expect(gscZapdos.stat(Stats.DEF)).toEqual(268);
    expect(gscZapdos.stat(Stats.SATK)).toEqual(348);
    expect(gscZapdos.stat(Stats.SDEF)).toEqual(278);
    expect(gscZapdos.stat(Stats.SPD)).toEqual(298);
    gscZapdos.ivs[Stats.DEF] = 13;
    expect(gscZapdos.stat(Stats.DEF)).toEqual(264);

    const rbyTauros = new Pokemon({ name: "Tauros", gen: Gens.RBY });
    expect(rbyTauros.stat(Stats.HP)).toEqual(353);
    expect(rbyTauros.stat(Stats.ATK)).toEqual(298);
    expect(rbyTauros.stat(Stats.DEF)).toEqual(288);
    expect(rbyTauros.stat(Stats.SPC)).toEqual(238);
    expect(rbyTauros.stat(Stats.SPD)).toEqual(318);

    const tauros = new Pokemon({ name: "Tauros", powerTrick: true });
    expect(tauros.stat(Stats.HP)).toEqual(291);
    expect(tauros.stat(Stats.ATK)).toEqual(226);
    expect(tauros.stat(Stats.DEF)).toEqual(236);
    expect(tauros.stat(Stats.SATK)).toEqual(116);
    expect(tauros.stat(Stats.SDEF)).toEqual(176);
    expect(tauros.stat(Stats.SPD)).toEqual(256);

    mudkip.overrideStats = [0, 0, 244, 0, 0, 0];
    expect(mudkip.stat(Stats.HP)).toEqual(241);
    expect(mudkip.stat(Stats.ATK)).toEqual(176);
    expect(mudkip.stat(Stats.DEF)).toEqual(244);
    expect(mudkip.stat(Stats.SATK)).toEqual(136);
    expect(mudkip.stat(Stats.SDEF)).toEqual(136);
    expect(mudkip.stat(Stats.SPD)).toEqual(116);
  });

  test("#boost()", () => {
    mudkip.boosts = [NaN, 2, 3, 0, 1, 2, -1, 6];
    mudkip.ability.name = "Simple";
    expect(mudkip.boost(Stats.ATK)).toEqual(2);
    expect(mudkip.boost(Stats.DEF)).toEqual(3);
    expect(mudkip.boost(Stats.SATK)).toEqual(0);
    expect(mudkip.boost(Stats.SDEF)).toEqual(1);
    expect(mudkip.boost(Stats.SPD)).toEqual(2);
    expect(mudkip.boost(Stats.ACC)).toEqual(-1);
    expect(mudkip.boost(Stats.EVA)).toEqual(6);

    mudkip.gen = 4;
    expect(mudkip.boost(Stats.ATK)).toEqual(4);
    expect(mudkip.boost(Stats.DEF)).toEqual(6);
    expect(mudkip.boost(Stats.SATK)).toEqual(0);
    expect(mudkip.boost(Stats.SDEF)).toEqual(2);
    expect(mudkip.boost(Stats.SPD)).toEqual(4);
    expect(mudkip.boost(Stats.ACC)).toEqual(-2);
    expect(mudkip.boost(Stats.EVA)).toEqual(6);
  });

  test("#boostedStat()", () => {
    const mew = new Pokemon({
      name: "Mew",
      evs: [4, 252, 0, 0, 0, 252],
      boosts: [NaN, 2, 0, 0, 0, 0, 0, 0]
    });
    expect(mew.boostedStat(Stats.ATK)).toEqual(598);

    const bidoof = new Pokemon({
      name: "Bidoof",
      ability: "Simple",
      boosts: [3, 2, 0, 0, -1, 0, 0, 0]
    });
    expect(bidoof.boostedStat(Stats.ATK)).toEqual(252);
    expect(bidoof.boostedStat(Stats.SDEF)).toEqual(77);
    expect(bidoof.boostedStat(Stats.HP)).toEqual(259);
    bidoof.gen = 4;
    bidoof.ability.gen = 4;
    expect(bidoof.boostedStat(Stats.ATK)).toEqual(378);
    expect(bidoof.boostedStat(Stats.SDEF)).toEqual(58);

    const gscSkarmory = new Pokemon({
      name: "Skarmory",
      boosts: [NaN, 1, 1, 0, 0, -1, 0, 0],
      gen: Gens.GSC
    });
    expect(gscSkarmory.boostedStat(Stats.SPD)).toEqual(157);

    const gscSnorlax = new Pokemon({ name: "Snorlax", gen: Gens.GSC });
    expect(gscSnorlax.boostedStat(Stats.SPD)).toEqual(158);
  });

  test("#baseStat()", () => {
    const nidoking = new Pokemon({ name: "Nidoking" });
    expect(nidoking.baseStat(Stats.HP)).toEqual(81);
    expect(nidoking.baseStat(Stats.ATK)).toEqual(102);
    expect(nidoking.baseStat(Stats.DEF)).toEqual(77);
    expect(nidoking.baseStat(Stats.SATK)).toEqual(85);
    expect(nidoking.baseStat(Stats.SDEF)).toEqual(75);
    expect(nidoking.baseStat(Stats.SPD)).toEqual(85);

    nidoking.gen = Gens.B2W2;
    expect(nidoking.baseStat(Stats.HP)).toEqual(81);
    expect(nidoking.baseStat(Stats.ATK)).toEqual(92);
    expect(nidoking.baseStat(Stats.DEF)).toEqual(77);
    expect(nidoking.baseStat(Stats.SATK)).toEqual(85);
    expect(nidoking.baseStat(Stats.SDEF)).toEqual(75);
    expect(nidoking.baseStat(Stats.SPD)).toEqual(85);

    const charizard = new Pokemon({ name: "Charizard" });
    expect(charizard.baseStat(Stats.HP)).toEqual(78);
    expect(charizard.baseStat(Stats.ATK)).toEqual(84);
    expect(charizard.baseStat(Stats.DEF)).toEqual(78);
    expect(charizard.baseStat(Stats.SATK)).toEqual(109);
    expect(charizard.baseStat(Stats.SDEF)).toEqual(85);
    expect(charizard.baseStat(Stats.SPD)).toEqual(100);

    charizard.gen = Gens.RBY;
    expect(charizard.baseStat(Stats.HP)).toEqual(78);
    expect(charizard.baseStat(Stats.ATK)).toEqual(84);
    expect(charizard.baseStat(Stats.DEF)).toEqual(78);
    expect(charizard.baseStat(Stats.SATK)).toEqual(85);
    expect(charizard.baseStat(Stats.SDEF)).toEqual(85);
    expect(charizard.baseStat(Stats.SPD)).toEqual(100);
  });

  test("#speed()", () => {
    mudkip.boosts = [NaN, 0, 0, 0, 0, 2, 0, 0];
    expect(mudkip.speed()).toEqual(232);

    const weatherAbilities = [
      ["Swift Swim", Weathers.RAIN],
      ["Chlorophyll", Weathers.SUN],
      ["Sand Rush", Weathers.SAND],
      ["Slush Rush", Weathers.HAIL]
    ];
    for (const [ability, weather] of weatherAbilities) {
      mudkip.ability.name = ability;
      expect(mudkip.speed()).toEqual(232);
      expect(mudkip.speed({ weather })).toEqual(464);
    }

    mudkip.ability.name = "Surge Surfer";
    expect(mudkip.speed()).toEqual(232);
    expect(mudkip.speed({ electricTerrain: true })).toEqual(464);

    mudkip.ability.name = "(No Ability)";
    mudkip.item.name = "Choice Scarf";
    expect(mudkip.speed()).toEqual(348);

    mudkip.item.name = "Quick Powder";
    expect(mudkip.speed()).toEqual(232);

    const ditto = new Pokemon({ name: "Ditto" });
    expect(ditto.speed()).toEqual(132);
    ditto.item.name = "Quick Powder";
    expect(ditto.speed()).toEqual(264);

    mudkip.item.name = "Iron Ball";
    expect(mudkip.speed()).toEqual(116);

    mudkip.status = Statuses.PARALYZED;
    expect(mudkip.speed()).toEqual(29);
    mudkip.ability.name = "Quick Feet";
    expect(mudkip.speed()).toEqual(174);

    mudkip.status = Statuses.NO_STATUS;
    mudkip.ability.name = "Slow Start";
    expect(mudkip.speed()).toEqual(116);
    mudkip.slowStart = true;
    expect(mudkip.speed()).toEqual(58);

    mudkip.ability.name = "Unburden";
    mudkip.item.name = "(No Item)";
    expect(mudkip.speed()).toEqual(232);
    mudkip.unburden = true;
    expect(mudkip.speed()).toEqual(464);

    mudkip.ability.name = "(No Ability)";
    mudkip.tailwind = true;
    expect(mudkip.speed()).toEqual(464);
  });

  test("#type1()", () => {
    expect(mudkip.type1()).toEqual(Types.WATER);
    expect(marshtomp.type1()).toEqual(Types.WATER);

    const sceptile = new Pokemon({ name: "Sceptile" });
    expect(sceptile.type1()).toEqual(Types.GRASS);

    const megaSceptile = new Pokemon({ name: "Mega Sceptile" });
    expect(megaSceptile.type1()).toEqual(Types.GRASS);
  });

  test("#type2()", () => {
    expect(mudkip.type2()).toEqual(Types.CURSE);
    expect(marshtomp.type2()).toEqual(Types.GROUND);

    const sceptile = new Pokemon({ name: "Sceptile" });
    expect(sceptile.type2()).toEqual(Types.CURSE);

    const megaSceptile = new Pokemon({ name: "Mega Sceptile" });
    expect(megaSceptile.type2()).toEqual(Types.DRAGON);
  });

  test("#overrideTypes", () => {
    mudkip.overrideTypes = [Types.NORMAL, Types.CURSE];
    expect(mudkip.type1()).toEqual(Types.NORMAL);
    expect(mudkip.type2()).toEqual(Types.CURSE);
    expect(mudkip.types()).toEqual([Types.NORMAL]);
  });

  test("#types()", () => {
    expect(mudkip.types()).toEqual([Types.WATER]);

    expect(swampert.types()).toEqual([Types.WATER, Types.GROUND]);

    const clefable = new Pokemon({ name: "Clefable" });
    expect(clefable.types()).toEqual([Types.FAIRY]);

    clefable.gen = 5;
    expect(clefable.types()).toEqual([Types.NORMAL]);

    clefable.addedType = Types.WATER;
    expect(clefable.types()).toEqual([Types.NORMAL, Types.WATER]);
  });

  test("#stab()", () => {
    expect(mudkip.stab(Types.WATER)).toBeTruthy();
    expect(mudkip.stab(Types.CURSE)).toBeFalsy();
    swampert.addedType = Types.FIRE;
    expect(swampert.stab(Types.WATER)).toBeTruthy();
    expect(swampert.stab(Types.GROUND)).toBeTruthy();
    expect(swampert.stab(Types.FIRE)).toBeTruthy();
  });

  test("#weight()", () => {
    expect(mudkip.weight()).toEqual(76);
    expect(marshtomp.weight()).toEqual(280);
    expect(swampert.weight()).toEqual(819);
    expect(megaSwampert.weight()).toEqual(1020);

    mudkip.autotomize = true;
    expect(mudkip.weight()).toEqual(1);

    mudkip.ability.name = "Light Metal";
    expect(mudkip.weight()).toEqual(1);

    megaSwampert.autotomize = true;
    expect(megaSwampert.weight()).toEqual(20);

    swampert.ability.name = "Light Metal";
    expect(swampert.weight()).toEqual(409);

    swampert.ability.name = "Heavy Metal";
    expect(swampert.weight()).toEqual(1638);

    swampert.ability.name = "(No Ability)";
    swampert.item.name = "Float Stone";
    expect(swampert.weight()).toEqual(409);
  });

  test("#hasEvolution()", () => {
    expect(mudkip.hasEvolution()).toBeTruthy();
    expect(marshtomp.hasEvolution()).toBeTruthy();
    expect(swampert.hasEvolution()).toBeFalsy();
    expect(megaSwampert.hasEvolution()).toBeFalsy();

    const togetic = new Pokemon({ name: "Togetic" });
    expect(togetic.hasEvolution()).toBeTruthy();
    togetic.gen = Gens.ADV;
    expect(togetic.hasEvolution()).toBeFalsy();

    const floette = new Pokemon({ name: "Floette" });
    expect(floette.hasEvolution()).toBeTruthy();
    const floetteEternal = new Pokemon({ name: "Floette-Eternal" });
    expect(floetteEternal.hasEvolution()).toBeFalsy();
  });

  test("#hasPreEvolution()", () => {
    expect(mudkip.hasPreEvolution()).toBeFalsy();
    expect(marshtomp.hasPreEvolution()).toBeTruthy();
    expect(swampert.hasPreEvolution()).toBeTruthy();
    expect(megaSwampert.hasPreEvolution()).toBeTruthy();

    const snorlax = new Pokemon({ name: "Snorlax" });
    expect(snorlax.hasPreEvolution()).toBeTruthy();
    snorlax.gen = Gens.ADV;
    expect(snorlax.hasPreEvolution()).toBeFalsy();
  });

  test("#isMega()", () => {
    const meganium = new Pokemon({ name: "Meganium" });
    expect(meganium.isMega()).toBeFalsy();
    expect(megaSwampert.isMega()).toBeTruthy();
  });

  test("#hasRequiredItem()", () => {
    const primalKyogre = new Pokemon({ name: "Primal Kyogre" });
    expect(primalKyogre.hasRequiredItem()).toBeFalsy();
    primalKyogre.item.name = "Blue Orb";
    expect(primalKyogre.hasRequiredItem()).toBeTruthy();
  });

  test("#hurtBySandstorm()", () => {
    expect(mudkip.hurtBySandstorm()).toBeTruthy();

    mudkip.item.name = "Safety Goggles";
    expect(mudkip.hurtBySandstorm()).toBeFalsy();

    mudkip.item.name = "(No Item)";
    mudkip.ability.name = "Sand Rush";
    expect(mudkip.hurtBySandstorm()).toBeFalsy();

    expect(marshtomp.hurtBySandstorm()).toBeFalsy();

    const tyranitar = new Pokemon({ name: "Tyranitar" });
    expect(tyranitar.hurtBySandstorm()).toBeFalsy();

    const scizor = new Pokemon({ name: "Scizor" });
    expect(scizor.hurtBySandstorm()).toBeFalsy();
  });

  test("#hurtByHail()", () => {
    expect(mudkip.hurtByHail()).toBeTruthy();

    mudkip.item.name = "Safety Goggles";
    expect(mudkip.hurtByHail()).toBeFalsy();

    mudkip.item.name = "(No Item)";
    mudkip.ability.name = "Ice Body";
    expect(mudkip.hurtByHail()).toBeFalsy();

    const froslass = new Pokemon({ name: "Froslass" });
    expect(froslass.hurtByHail()).toBeFalsy();
  });

  test("#isPoisoned()", () => {
    expect(mudkip.isPoisoned()).toBeFalsy();

    mudkip.status = Statuses.POISONED;
    expect(mudkip.isPoisoned()).toBeTruthy();

    mudkip.status = Statuses.BADLY_POISONED;
    expect(mudkip.isPoisoned()).toBeFalsy();
  });

  test("#isBadlyPoisoned()", () => {
    expect(mudkip.isBadlyPoisoned()).toBeFalsy();

    mudkip.status = Statuses.POISONED;
    expect(mudkip.isBadlyPoisoned()).toBeFalsy();

    mudkip.status = Statuses.BADLY_POISONED;
    expect(mudkip.isBadlyPoisoned()).toBeTruthy();
  });

  test("#isBurned()", () => {
    expect(mudkip.isBurned()).toBeFalsy();

    mudkip.status = Statuses.POISONED;
    expect(mudkip.isBurned()).toBeFalsy();

    mudkip.status = Statuses.BURNED;
    expect(mudkip.isBurned()).toBeTruthy();
  });

  test("#isParalyzed()", () => {
    expect(mudkip.isParalyzed()).toBeFalsy();

    mudkip.status = Statuses.POISONED;
    expect(mudkip.isParalyzed()).toBeFalsy();

    mudkip.status = Statuses.PARALYZED;
    expect(mudkip.isParalyzed()).toBeTruthy();
  });

  test("#isAsleep()", () => {
    expect(mudkip.isAsleep()).toBeFalsy();

    mudkip.status = Statuses.POISONED;
    expect(mudkip.isAsleep()).toBeFalsy();

    mudkip.status = Statuses.ASLEEP;
    expect(mudkip.isAsleep()).toBeTruthy();

    mudkip.status = Statuses.BURNED;
    expect(mudkip.isAsleep()).toBeFalsy();
    mudkip.ability.name = "Comatose";
    expect(mudkip.isAsleep()).toBeTruthy();
  });

  test("#isFrozen()", () => {
    expect(mudkip.isFrozen()).toBeFalsy();

    mudkip.status = Statuses.POISONED;
    expect(mudkip.isFrozen()).toBeFalsy();

    mudkip.status = Statuses.FROZEN;
    expect(mudkip.isFrozen()).toBeTruthy();
  });

  test("#isMale()", () => {
    expect(mudkip.isMale()).toBeFalsy();

    mudkip.gender = Genders.MALE;
    expect(mudkip.isMale()).toBeTruthy();

    mudkip.gender = Genders.FEMALE;
    expect(mudkip.isMale()).toBeFalsy();

    mudkip.gender = Genders.NO_GENDER;
    expect(mudkip.isMale()).toBeFalsy();
  });

  test("#isFemale()", () => {
    expect(mudkip.isFemale()).toBeFalsy();

    mudkip.gender = Genders.FEMALE;
    expect(mudkip.isFemale()).toBeTruthy();

    mudkip.gender = Genders.MALE;
    expect(mudkip.isFemale()).toBeFalsy();

    mudkip.gender = Genders.NO_GENDER;
    expect(mudkip.isFemale()).toBeFalsy();
  });

  test("#hasPlate()", () => {
    expect(swampert.hasPlate()).toBeFalsy();

    swampert.item.name = "Earth Plate";
    expect(swampert.hasPlate()).toBeTruthy();
  });

  test("#hasDrive()", () => {
    expect(swampert.hasDrive()).toBeFalsy();

    swampert.item.name = "Chill Drive";
    expect(swampert.hasDrive()).toBeTruthy();
  });

  test("#knockOff()", () => {
    expect(mudkip.knockOff()).toBeFalsy();

    mudkip.item.name = "Leftovers";
    expect(mudkip.knockOff()).toBeTruthy();

    mudkip.ability.name = "Sticky Hold";
    expect(mudkip.knockOff()).toBeFalsy();

    mudkip.ability.name = "(No Ability)";
    mudkip.item.disabled = true;
    expect(mudkip.knockOff()).toBeTruthy();

    mudkip.item.disabled = false;
    mudkip.item.used = true;
    expect(mudkip.knockOff()).toBeFalsy();

    mudkip.item.used = false;
    mudkip.item.name = "Swampertite";
    expect(mudkip.knockOff()).toBeTruthy();

    megaSwampert.item.name = "Swampertite";
    expect(megaSwampert.knockOff()).toBeFalsy();

    mudkip.item.name = "Griseous Orb";
    expect(mudkip.knockOff()).toBeTruthy();

    const giratina = new Pokemon({
      name: "Giratina",
      item: "Griseous Orb"
    });
    expect(giratina.knockOff()).toBeFalsy();

    const giratinaOrigin = new Pokemon({
      name: "Giratina-Origin",
      item: "Griseous Orb"
    });
    expect(giratinaOrigin.knockOff()).toBeFalsy();

    const genesectChill = new Pokemon({
      name: "Genesect-Chill",
      item: "Chill Drive"
    });
    expect(genesectChill.knockOff()).toBeFalsy();

    mudkip.ability.name = "Multitype";
    mudkip.item.name = "Earth Plate";
    expect(mudkip.knockOff()).toBeFalsy();
    mudkip.item.name = "Leftovers";
    expect(mudkip.knockOff()).toBeTruthy();

    const groudon = new Pokemon({
      name: "Groudon",
      item: "Red Orb"
    });
    expect(groudon.knockOff()).toBeFalsy();
    groudon.item.name = "Blue Orb";
    expect(groudon.knockOff()).toBeTruthy();

    const primalGroudon = new Pokemon({
      name: "Primal Groudon",
      item: "Red Orb"
    });
    expect(primalGroudon.knockOff()).toBeFalsy();
    primalGroudon.item.name = "Blue Orb";
    expect(primalGroudon.knockOff()).toBeTruthy();

    const kyogre = new Pokemon({
      name: "Kyogre",
      item: "Blue Orb"
    });
    expect(kyogre.knockOff()).toBeFalsy();
    kyogre.item.name = "Red Orb";
    expect(kyogre.knockOff()).toBeTruthy();

    const primalKyogre = new Pokemon({
      name: "Primal Kyogre",
      item: "Blue Orb"
    });
    expect(primalKyogre.knockOff()).toBeFalsy();
    primalKyogre.item.name = "Red Orb";
    expect(primalKyogre.knockOff()).toBeTruthy();

    const silvally = new Pokemon({ name: "Silvally", item: "Fire Memory" });
    expect(silvally.knockOff()).toBeFalsy();
    const silvallyFire = new Pokemon({
      name: "Silvally-Fire",
      item: "Fire Memory"
    });
    expect(silvallyFire.knockOff()).toBeFalsy();

    /* HGSS */
    const hgssMudkip = new Pokemon({ name: "Mudkip", gen: Gens.HGSS });

    expect(hgssMudkip.knockOff()).toBeFalsy();

    hgssMudkip.item.name = "Leftovers";
    expect(hgssMudkip.knockOff()).toBeTruthy();

    hgssMudkip.ability.name = "Sticky Hold";
    expect(hgssMudkip.knockOff()).toBeFalsy();

    hgssMudkip.ability.name = "(No Ability)";
    hgssMudkip.item.disabled = true;
    expect(hgssMudkip.knockOff()).toBeTruthy();

    hgssMudkip.item.disabled = false;
    hgssMudkip.item.used = true;
    expect(hgssMudkip.knockOff()).toBeFalsy();

    hgssMudkip.item.used = false;
    hgssMudkip.item.name = "Griseous Orb";
    expect(hgssMudkip.knockOff()).toBeTruthy();

    const hgssGiratina = new Pokemon({
      name: "Giratina",
      item: "Griseous Orb",
      gen: Gens.HGSS
    });
    expect(hgssGiratina.knockOff()).toBeFalsy();
    hgssGiratina.item.name = "Leftovers";
    expect(hgssGiratina.knockOff()).toBeTruthy();

    const hgssGiratinaOrigin = new Pokemon({
      name: "Giratina-Origin",
      item: "Griseous Orb",
      gen: Gens.HGSS
    });
    expect(hgssGiratinaOrigin.knockOff()).toBeFalsy();
    hgssGiratinaOrigin.item.name = "Leftovers";
    expect(hgssGiratinaOrigin.knockOff()).toBeTruthy();

    hgssMudkip.ability.name = "Multitype";
    hgssMudkip.item.name = "Earth Plate";
    expect(hgssMudkip.knockOff()).toBeFalsy();

    hgssMudkip.item.name = "Leftovers";
    expect(hgssMudkip.knockOff()).toBeFalsy();
  });

  test("#knockOffBoost()", () => {
    expect(mudkip.knockOffBoost()).toBeFalsy();

    mudkip.item.name = "Leftovers";
    expect(mudkip.knockOffBoost()).toBeTruthy();

    mudkip.ability.name = "Sticky Hold";
    expect(mudkip.knockOffBoost()).toBeTruthy();

    mudkip.ability.name = "(No Ability)";
    mudkip.item.disabled = true;
    expect(mudkip.knockOffBoost()).toBeTruthy();

    mudkip.item.disabled = false;
    mudkip.item.used = true;
    expect(mudkip.knockOffBoost()).toBeFalsy();

    mudkip.item.used = false;
    mudkip.item.name = "Swampertite";
    expect(mudkip.knockOffBoost()).toBeTruthy();

    megaSwampert.item.name = "Swampertite";
    expect(megaSwampert.knockOffBoost()).toBeFalsy();

    mudkip.item.name = "Griseous Orb";
    expect(mudkip.knockOffBoost()).toBeTruthy();

    const giratina = new Pokemon({
      name: "Giratina",
      item: "Griseous Orb"
    });
    expect(giratina.knockOffBoost()).toBeFalsy();

    const giratinaOrigin = new Pokemon({
      name: "Giratina-Origin",
      item: "Griseous Orb"
    });
    expect(giratinaOrigin.knockOffBoost()).toBeFalsy();

    const genesectChill = new Pokemon({
      name: "Genesect-Chill",
      item: "Chill Drive"
    });
    expect(genesectChill.knockOffBoost()).toBeFalsy();

    mudkip.ability.name = "Multitype";
    mudkip.item.name = "Earth Plate";
    expect(mudkip.knockOffBoost()).toBeFalsy();
    mudkip.item.name = "Leftovers";
    expect(mudkip.knockOffBoost()).toBeTruthy();

    const groudon = new Pokemon({
      name: "Groudon",
      item: "Red Orb"
    });
    expect(groudon.knockOffBoost()).toBeFalsy();
    groudon.item.name = "Blue Orb";
    expect(groudon.knockOffBoost()).toBeTruthy();

    const primalGroudon = new Pokemon({
      name: "Primal Groudon",
      item: "Red Orb"
    });
    expect(primalGroudon.knockOffBoost()).toBeFalsy();
    primalGroudon.item.name = "Blue Orb";
    expect(primalGroudon.knockOffBoost()).toBeTruthy();

    const kyogre = new Pokemon({
      name: "Kyogre",
      item: "Blue Orb"
    });
    expect(kyogre.knockOffBoost()).toBeFalsy();
    kyogre.item.name = "Red Orb";
    expect(kyogre.knockOffBoost()).toBeTruthy();

    const primalKyogre = new Pokemon({
      name: "Primal Kyogre",
      item: "Blue Orb"
    });
    expect(primalKyogre.knockOffBoost()).toBeFalsy();
    primalKyogre.item.name = "Red Orb";
    expect(primalKyogre.knockOffBoost()).toBeTruthy();
  });

  test("#pinchAbilityActivated()", () => {
    const swampert = new Pokemon({
      name: "Swampert",
      ability: "Torrent",
      evs: [4, 0, 0, 0, 0, 0]
    });
    swampert.currentHp = 115;
    expect(swampert.pinchAbilityActivated(Types.WATER)).toBeFalsy();
    swampert.currentHp = 114;
    expect(swampert.pinchAbilityActivated(Types.WATER)).toBeTruthy();
    expect(swampert.pinchAbilityActivated(Types.FIRE)).toBeFalsy();
  });

  test("#thickClubBoosted()", () => {
    const marowak = new Pokemon({ name: "marowak" });
    expect(marowak.thickClubBoosted()).toBeFalsy();
    marowak.item.name = "Thick Club";
    expect(marowak.thickClubBoosted()).toBeTruthy();
    const cubone = new Pokemon({ name: "Cubone", item: "Thick Club" });
    expect(cubone.thickClubBoosted()).toBeTruthy();
    const ditto = new Pokemon({ name: "Ditto" });
    expect(ditto.thickClubBoosted()).toBeFalsy();
  });

  test("#lightBallBoosted()", () => {
    const pikachu = new Pokemon({ name: "Pikachu" });
    expect(pikachu.lightBallBoosted()).toBeFalsy();
    pikachu.item.name = "Light Ball";
    expect(pikachu.lightBallBoosted()).toBeTruthy();
    const pichu = new Pokemon({ name: "Pichu", item: "Light Ball" });
    expect(pichu.lightBallBoosted()).toBeFalsy();
  });

  test("#isUseful()", () => {
    expect(missingno.isUseful()).toBeFalsy();
    expect(mudkip.isUseful()).toBeTruthy();
  });

  test(".calcHealthDv()", () => {
    expect(Pokemon.calcHealthDv([NaN, 15, 15, 15, 15, 15])).toEqual(15);
    expect(Pokemon.calcHealthDv([NaN, 15, 14, 15, 15, 15])).toEqual(11);
    expect(Pokemon.calcHealthDv([NaN, 15, 9, 8, 8, 15])).toEqual(14);
    expect(Pokemon.calcHealthDv([NaN, 1, 15, 5, 5, 4])).toEqual(13);
    expect(Pokemon.calcHealthDv([NaN, 0, 2, 4, 4, 8])).toEqual(0);
  });
});
