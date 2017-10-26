import gscCalculate from "../../src/calculate/gscCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import { Gens, Stats, Statuses, Weathers } from "../../src/utilities";

const { max } = Math;
const gen = Gens.GSC;

describe("gscCalculate()", () => {
  let field, rain, sand, sun;
  beforeEach(() => {
    field = new Field({ gen });
    rain = new Field({ weather: Weathers.RAIN, gen });
    sand = new Field({ weather: Weathers.SAND, gen });
    sun = new Field({ weather: Weathers.SUN, gen });
  });

  describe("crit mechanics", () => {
    let machamp;
    let starmie;
    let crossChopCrit;
    beforeEach(() => {
      machamp = new Pokemon({ name: "Machamp", gen });
      starmie = new Pokemon({ name: "Starmie", gen });
      crossChopCrit = new Move({
        name: "Cross Chop",
        critical: true,
        gen
      });
    });

    test("doubles damage", () => {
      const damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(168);
    });

    test("only ignores modifiers if boosts are the same or worse", () => {
      machamp.boosts[Stats.ATK] = 6;
      starmie.boosts[Stats.DEF] = 5;
      let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(135);

      machamp.boosts[Stats.ATK] = 6;
      starmie.boosts[Stats.DEF] = 6;
      damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(168);

      machamp.boosts[Stats.ATK] = 5;
      starmie.boosts[Stats.DEF] = 6;
      damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(168);
    });

    test("ignoring includes Reflect", () => {
      starmie.reflect = true;

      let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(168);

      machamp.boosts[Stats.ATK] = 1;
      damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(127);
    });

    test("ignoring includes Light Screen", () => {
      starmie.lightScreen = true;
      const thunderCrit = new Move({
        name: "Thunder",
        critical: true,
        gen
      });

      let damage = gscCalculate(machamp, starmie, thunderCrit, field);
      expect(max(...damage)).toEqual(344);

      machamp.boosts[Stats.SATK] = 1;
      damage = gscCalculate(machamp, starmie, thunderCrit, field);
      expect(max(...damage)).toEqual(256);
    });

    test("ignoring includes Burn", () => {
      machamp.status = Statuses.BURNED;

      let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(168);

      machamp.boosts[Stats.ATK] = 1;
      damage = gscCalculate(machamp, starmie, crossChopCrit, field);
      expect(max(...damage)).toEqual(127);
    });
  });

  test("sanity check", () => {
    const doubleEdge = new Move({ name: "Double-Edge", gen });

    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const zapdos = new Pokemon({ name: "Zapdos", gen });
    expect(gscCalculate(snorlax, zapdos, doubleEdge, field)).toEqual([
      153,
      153,
      154,
      155,
      156,
      156,
      157,
      158,
      158,
      159,
      160,
      160,
      161,
      162,
      163,
      163,
      164,
      165,
      165,
      166,
      167,
      168,
      168,
      169,
      170,
      170,
      171,
      172,
      172,
      173,
      174,
      175,
      175,
      176,
      177,
      177,
      178,
      179,
      180
    ]);

    const umbreon = new Pokemon({ name: "Umbreon", gen });
    const blissey = new Pokemon({ name: "Blissey", gen });
    expect(gscCalculate(umbreon, blissey, doubleEdge, field)).toEqual([
      166,
      167,
      168,
      169,
      169,
      170,
      171,
      172,
      172,
      173,
      174,
      175,
      176,
      176,
      177,
      178,
      179,
      179,
      180,
      181,
      182,
      182,
      183,
      184,
      185,
      186,
      186,
      187,
      188,
      189,
      189,
      190,
      191,
      192,
      192,
      193,
      194,
      195,
      196
    ]);
  });

  test("pursuit doubles after variance", () => {
    const tyranitar = new Pokemon({ name: "Tyranitar", gen });
    const misdreavus = new Pokemon({ name: "Misdreavus", gen });
    const pursuit = new Move({ name: "Pursuit", gen });
    expect(gscCalculate(tyranitar, misdreavus, pursuit, field)).toEqual([
      97,
      97,
      97,
      98,
      98,
      99,
      99,
      100,
      100,
      101,
      101,
      101,
      102,
      102,
      103,
      103,
      104,
      104,
      105,
      105,
      105,
      106,
      106,
      107,
      107,
      108,
      108,
      109,
      109,
      109,
      110,
      110,
      111,
      111,
      112,
      112,
      113,
      113,
      114
    ]);
    misdreavus.switchedOut = true;
    expect(gscCalculate(tyranitar, misdreavus, pursuit, field)).toEqual([
      194,
      194,
      194,
      196,
      196,
      198,
      198,
      200,
      200,
      202,
      202,
      202,
      204,
      204,
      206,
      206,
      208,
      208,
      210,
      210,
      210,
      212,
      212,
      214,
      214,
      216,
      216,
      218,
      218,
      218,
      220,
      220,
      222,
      222,
      224,
      224,
      226,
      226,
      228
    ]);
  });

  test("explosion halves defense", () => {
    const cloyster = new Pokemon({ name: "Cloyster", gen });
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const explosion = new Move({ name: "Explosion", gen });
    const damage = gscCalculate(cloyster, snorlax, explosion, field);
    expect(max(...damage)).toEqual(542);
  });

  test("Hidden Power is physical for certain types", () => {
    const marowak = new Pokemon({
      name: "Marowak",
      item: "Thick Club",
      ivs: [15, 13, 13, 15, 15, 15],
      gen
    });
    const exeggutor = new Pokemon({ name: "Exeggutor", gen });
    const hiddenPower = new Move({ name: "Hidden Power", gen });
    const damage = gscCalculate(marowak, exeggutor, hiddenPower, field);
    expect(max(...damage)).toEqual(452);
  });

  test("Light Ball doubles Special Attack", () => {
    const pikachu = new Pokemon({
      name: "Pikachu",
      item: "Light Ball",
      gen
    });
    const zapdos = new Pokemon({ name: "Zapdos", gen });
    const thunder = new Move({ name: "Thunder", gen });
    const damage = gscCalculate(pikachu, zapdos, thunder, field);
    expect(max(...damage)).toEqual(219);
  });

  test("Solar Beam is reduced by rain", () => {
    const houndoom = new Pokemon({ name: "Houndoom", gen });
    const cloyster = new Pokemon({ name: "Cloyster", gen });
    const solarBeam = new Move({ name: "Solar Beam", gen });

    const damage = gscCalculate(houndoom, cloyster, solarBeam, field);
    expect(max(...damage)).toEqual(342);

    const sandDamage = gscCalculate(houndoom, cloyster, solarBeam, sand);
    expect(max(...sandDamage)).toEqual(342);

    const rainDamage = gscCalculate(houndoom, cloyster, solarBeam, rain);
    expect(max(...rainDamage)).toEqual(170);
  });

  test("Reversal and Flail have no damage variance", () => {
    const reversal = new Move({ name: "Reversal", gen });
    const flail = new Move({ name: "Flail", gen });
    const heracross = new Pokemon({
      name: "Heracross",
      currentHp: 1,
      gen
    });
    const skarmory = new Pokemon({ name: "Skarmory", gen });
    expect(gscCalculate(heracross, skarmory, reversal, field)).toEqual([235]);
    expect(gscCalculate(heracross, skarmory, flail, field)).toEqual([78]);
  });

  test("Rain and Sun affect Fire-type and Water-type damage", () => {
    const moltres = new Pokemon({ name: "Moltres", gen });
    const suicune = new Pokemon({ name: "Suicune", gen });

    const fireBlast = new Move({ name: "Fire Blast", gen });
    const sunBoosted = gscCalculate(moltres, suicune, fireBlast, sun);
    expect(max(...sunBoosted)).toEqual(121);
    const sunReduced = gscCalculate(moltres, suicune, fireBlast, rain);
    expect(max(...sunReduced)).toEqual(40);

    const hydroPump = new Move({ name: "Hydro Pump", gen });
    const rainBoosted = gscCalculate(suicune, moltres, hydroPump, rain);
    expect(max(...rainBoosted)).toEqual(470);
    const rainReduced = gscCalculate(suicune, moltres, hydroPump, sun);
    expect(max(...rainReduced)).toEqual(156);

    const doubleEdge = new Move({ name: "Double-Edge", gen });
    const rainUnboosted = gscCalculate(moltres, suicune, doubleEdge, rain);
    expect(max(...rainUnboosted)).toEqual(92);
    const sunUnboosted = gscCalculate(moltres, suicune, doubleEdge, sun);
    expect(max(...sunUnboosted)).toEqual(92);
  });

  test("Type boosting items increase damage by 10%", () => {
    const moltres = new Pokemon({
      name: "Moltres",
      item: "Charcoal",
      gen
    });
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const fireBlast = new Move({ name: "Fire Blast", gen });
    const damage = gscCalculate(moltres, snorlax, fireBlast, field);
    expect(max(...damage)).toEqual(186);
  });

  test("type immunity", () => {
    const snorlax = new Pokemon({ name: "Snorlax", gen });
    const gengar = new Pokemon({ name: "Gengar", gen });
    const bodySlam = new Move({ name: "Body Slam", gen });
    expect(gscCalculate(snorlax, gengar, bodySlam, field)).toEqual([0]);
  });
});
