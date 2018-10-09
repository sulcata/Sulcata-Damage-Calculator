import gscCalculate from "sulcalc/calculate/gscCalculate";
import Pokemon from "sulcalc/Pokemon";
import Move from "sulcalc/Move";
import Field from "sulcalc/Field";
import { Gens, Stats, Statuses, Weathers } from "sulcalc/utilities";

const gen = Gens.GSC;

let field, rain, sand, sun;
beforeEach(() => {
  field = new Field({ gen });
  rain = new Field({ weather: Weathers.RAIN, gen });
  sand = new Field({ weather: Weathers.SAND, gen });
  sun = new Field({ weather: Weathers.SUN, gen });
});

describe("crit mechanics", () => {
  let machamp, starmie, crossChopCrit;
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
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(168);
  });

  test("only ignores modifiers if boosts are the same or worse", () => {
    machamp.boosts[Stats.ATK] = 6;
    starmie.boosts[Stats.DEF] = 5;
    let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(135);

    machamp.boosts[Stats.ATK] = 6;
    starmie.boosts[Stats.DEF] = 6;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(168);

    machamp.boosts[Stats.ATK] = 5;
    starmie.boosts[Stats.DEF] = 6;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(168);
  });

  test("ignoring includes Reflect", () => {
    starmie.reflect = true;

    let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(168);

    machamp.boosts[Stats.ATK] = 1;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(127);
  });

  test("ignoring includes Light Screen", () => {
    starmie.lightScreen = true;
    const thunderCrit = new Move({
      name: "Thunder",
      critical: true,
      gen
    });

    let damage = gscCalculate(machamp, starmie, thunderCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(344);

    machamp.boosts[Stats.SATK] = 1;
    damage = gscCalculate(machamp, starmie, thunderCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(256);
  });

  test("ignoring includes Burn", () => {
    machamp.status = Statuses.BURNED;

    let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(168);

    machamp.boosts[Stats.ATK] = 1;
    damage = gscCalculate(machamp, starmie, crossChopCrit, field);
    expect(damage).toHaveLength(39);
    expect(Math.max(...damage)).toEqual(127);
  });
});

test("sanity check", () => {
  const doubleEdge = new Move({ name: "Double-Edge", gen });

  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const zapdos = new Pokemon({ name: "Zapdos", gen });
  let damage = gscCalculate(snorlax, zapdos, doubleEdge, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toEqual(180);

  const umbreon = new Pokemon({ name: "Umbreon", gen });
  const blissey = new Pokemon({ name: "Blissey", gen });
  damage = gscCalculate(umbreon, blissey, doubleEdge, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toEqual(196);
});

test("Pursuit doubles after variance", () => {
  const tyranitar = new Pokemon({ name: "Tyranitar", gen });
  const misdreavus = new Pokemon({ name: "Misdreavus", gen });
  const pursuit = new Move({ name: "Pursuit", gen });

  expect(gscCalculate(tyranitar, misdreavus, pursuit, field)).toMatchSnapshot();

  misdreavus.switchedOut = true;
  expect(gscCalculate(tyranitar, misdreavus, pursuit, field)).toMatchSnapshot();
});

test("Explosion halves Defense", () => {
  const cloyster = new Pokemon({ name: "Cloyster", gen });
  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const explosion = new Move({ name: "Explosion", gen });
  const damage = gscCalculate(cloyster, snorlax, explosion, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toEqual(542);
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
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toEqual(452);
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
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toEqual(219);
});

test("Solar Beam is reduced by rain", () => {
  const houndoom = new Pokemon({ name: "Houndoom", gen });
  const cloyster = new Pokemon({ name: "Cloyster", gen });
  const solarBeam = new Move({ name: "Solar Beam", gen });

  const damage = gscCalculate(houndoom, cloyster, solarBeam, field);
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toEqual(342);

  const sandDamage = gscCalculate(houndoom, cloyster, solarBeam, sand);
  expect(sandDamage).toHaveLength(39);
  expect(Math.max(...sandDamage)).toEqual(342);

  const rainDamage = gscCalculate(houndoom, cloyster, solarBeam, rain);
  expect(rainDamage).toHaveLength(39);
  expect(Math.max(...rainDamage)).toEqual(170);
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
  const hydroPump = new Move({ name: "Hydro Pump", gen });
  const doubleEdge = new Move({ name: "Double-Edge", gen });

  const sunBoosted = gscCalculate(moltres, suicune, fireBlast, sun);
  expect(sunBoosted).toHaveLength(39);
  expect(Math.max(...sunBoosted)).toEqual(121);

  const sunReduced = gscCalculate(moltres, suicune, fireBlast, rain);
  expect(sunReduced).toHaveLength(39);
  expect(Math.max(...sunReduced)).toEqual(40);

  const rainBoosted = gscCalculate(suicune, moltres, hydroPump, rain);
  expect(rainBoosted).toHaveLength(39);
  expect(Math.max(...rainBoosted)).toEqual(470);

  const rainReduced = gscCalculate(suicune, moltres, hydroPump, sun);
  expect(rainReduced).toHaveLength(39);
  expect(Math.max(...rainReduced)).toEqual(156);

  const rainUnboosted = gscCalculate(moltres, suicune, doubleEdge, rain);
  expect(rainUnboosted).toHaveLength(39);
  expect(Math.max(...rainUnboosted)).toEqual(92);

  const sunUnboosted = gscCalculate(moltres, suicune, doubleEdge, sun);
  expect(sunUnboosted).toHaveLength(39);
  expect(Math.max(...sunUnboosted)).toEqual(92);
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
  expect(damage).toHaveLength(39);
  expect(Math.max(...damage)).toEqual(186);
});

test("Type immunity", () => {
  const snorlax = new Pokemon({ name: "Snorlax", gen });
  const gengar = new Pokemon({ name: "Gengar", gen });
  const bodySlam = new Move({ name: "Body Slam", gen });
  expect(gscCalculate(snorlax, gengar, bodySlam, field)).toEqual([0]);
});
