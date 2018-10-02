import smCalculate from "sulcalc/calculate/smCalculate";
import Pokemon from "sulcalc/Pokemon";
import Move from "sulcalc/Move";
import Field from "sulcalc/Field";
import { Gens, Natures, Terrains } from "sulcalc/utilities";

const gen = Gens.SM;

describe("smCalculate()", () => {
  let field;
  let landorusT;
  let heatran;
  let lavaPlume;
  let earthquake;
  beforeEach(() => {
    field = new Field({ gen });
    heatran = new Pokemon({
      name: "Heatran",
      evs: [252, 0, 0, 0, 4, 252],
      nature: Natures.TIMID,
      gen
    });
    landorusT = new Pokemon({
      name: "Landorus-Therian",
      evs: [252, 0, 216, 0, 24, 16],
      nature: Natures.IMPISH,
      gen
    });
    lavaPlume = new Move({ name: "Lava Plume", gen });
    earthquake = new Move({ name: "Earthquake", gen });
  });

  test("sanity check", () => {
    const damage = smCalculate(heatran, landorusT, lavaPlume, field);
    expect(Math.max(...damage)).toEqual(150);
  });

  test("Aurora Veil", () => {
    heatran.auroraVeil = true;
    const damageSingle = smCalculate(landorusT, heatran, earthquake, field);
    expect(damageSingle).toMatchSnapshot();

    field.multiBattle = true;
    const damageMulti = smCalculate(landorusT, heatran, earthquake, field);
    expect(damageMulti).toMatchSnapshot();

    expect(damageSingle).not.toEqual(damageMulti);
  });

  test("Fairy Aura is a move power mod", () => {
    const xerneas = new Pokemon({
      name: "Xerneas",
      item: "Life Orb",
      nature: Natures.MODEST,
      evs: [0, 0, 0, 252, 0, 0],
      gen
    });
    const genesect = new Pokemon({
      name: "Genesect",
      nature: Natures.NAIVE,
      gen
    });
    const moonblast = new Move({ name: "Moonblast", gen });
    const auraField = new Field({ fairyAura: true, gen });
    expect(
      smCalculate(xerneas, genesect, moonblast, auraField)
    ).toMatchSnapshot();
  });

  test("Neuroforce boosts super effective attacks", () => {
    const necrozma = new Pokemon({ name: "Necrozma-Dawn-Wings", gen });
    const surf = new Move({ name: "Surf", gen });
    const damage = smCalculate(necrozma, heatran, surf, field);
    necrozma.ability.name = "Neuroforce";
    const boostedDamage = smCalculate(necrozma, heatran, surf, field);
    expect(Math.max(...boostedDamage)).toBeGreaterThan(Math.max(...damage));
  });

  test("Psychic Terrain blocks priority", () => {
    const quickAttack = new Move({ name: "Quick Attack", gen });
    const psychicTerrain = new Field({
      terrain: Terrains.PSYCHIC_TERRAIN,
      gen
    });
    const damage = smCalculate(heatran, landorusT, quickAttack, psychicTerrain);
    expect(damage).not.toEqual([0]);

    landorusT.item.name = "Iron Ball";
    const notDamage = smCalculate(
      heatran,
      landorusT,
      quickAttack,
      psychicTerrain
    );
    expect(notDamage).toEqual([0]);
  });

  test("Knock Off should multiply base power by 1.5x if it gets rid of an item", () => {
    const knockOff = new Move({ name: "Knock Off", gen });
    const bisharp = new Pokemon({ name: "Bisharp", gen });
    const rotomW = new Pokemon({ name: "Rotom-Wash", gen });
    const damage = smCalculate(bisharp, rotomW, knockOff, field);
    expect(Math.max(...damage)).toEqual(96);
    rotomW.item.name = "Rocky Helmet";
    const boostedDamage = smCalculate(bisharp, rotomW, knockOff, field);
    expect(Math.max(...boostedDamage)).toEqual(142);
  });
});
