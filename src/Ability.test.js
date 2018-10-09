import Ability from "sulcalc/Ability";
import { Types, maxGen } from "sulcalc/utilities";

describe("Ability", () => {
  let noAbility;
  let swiftSwim;
  let sandRush;
  let magicGuard;
  let overcoat;
  let sandVeil;
  let sandForce;
  let iceBody;
  let snowCloak;
  let blaze;
  let swarm;
  let pixilate;
  let refrigerate;
  let waterAbsorb;
  let stormDrain;
  let sapSipper;
  let levitate;
  let motorDrive;
  let flashFire;
  let drySkin;

  beforeEach(() => {
    noAbility = new Ability();
    swiftSwim = new Ability({ name: "Swift Swim" });
    sandRush = new Ability({ name: "Sand Rush" });
    magicGuard = new Ability({ name: "Magic Guard" });
    overcoat = new Ability({ name: "Overcoat" });
    sandVeil = new Ability({ name: "Sand Veil" });
    sandForce = new Ability({ name: "Sand Force" });
    iceBody = new Ability({ name: "Ice Body" });
    snowCloak = new Ability({ name: "Snow Cloak" });
    blaze = new Ability({ name: "Blaze" });
    swarm = new Ability({ name: "Swarm" });
    pixilate = new Ability({ name: "Pixilate" });
    refrigerate = new Ability({ name: "Refrigerate" });
    waterAbsorb = new Ability({ name: "Water Absorb" });
    stormDrain = new Ability({ name: "Storm Drain" });
    sapSipper = new Ability({ name: "Sap Sipper" });
    levitate = new Ability({ name: "Levitate" });
    motorDrive = new Ability({ name: "Motor Drive" });
    flashFire = new Ability({ name: "Flash Fire" });
    drySkin = new Ability({ name: "Dry Skin" });
  });

  test("#constructor()", () => {
    const ability1 = new Ability({ name: "Effect Spore" });
    expect(ability1.id).toEqual("effectspore");

    const ability2 = new Ability({
      name: "Effect Spore",
      disabled: true
    });
    expect(ability2.id).toEqual("effectspore");
    expect(ability2.disabled).toBe(true);
    expect(ability2.gen).toEqual(maxGen);

    const ability3 = new Ability({
      id: 27,
      gen: 3
    });
    expect(ability3.id).toEqual("noability");
    expect(ability3.disabled).toBe(false);
    expect(ability3.gen).toEqual(3);
  });

  test("#name", () => {
    expect(noAbility.name).toEqual("(No Ability)");
    expect(swiftSwim.name).toEqual("Swift Swim");

    swiftSwim.disabled = true;
    expect(swiftSwim.name).toEqual("(No Ability)");

    const ability = new Ability();

    ability.name = "  drought";
    expect(ability.id).toEqual("drought");

    ability.name = "Swift Swim";
    expect(ability.id).toEqual("swiftswim");

    ability.name = "d  rought";
    expect(ability.id).toEqual("drought");
  });

  test("#pinchType()", () => {
    expect(blaze.pinchType()).toEqual(Types.FIRE);
    expect(swarm.pinchType()).toEqual(Types.BUG);
    expect(magicGuard.pinchType()).toEqual(-1);
    expect(noAbility.pinchType()).toEqual(-1);

    blaze.disabled = true;
    expect(blaze.pinchType()).toEqual(-1);
  });

  test("#normalToType()", () => {
    expect(pixilate.normalToType()).toEqual(Types.FAIRY);
    expect(refrigerate.normalToType()).toEqual(Types.ICE);
    expect(noAbility.normalToType()).toEqual(-1);

    pixilate.disabled = true;
    expect(pixilate.normalToType()).toEqual(-1);
  });

  test("#immunityType()", () => {
    expect(noAbility.immunityType()).toEqual(-1);
    expect(waterAbsorb.immunityType()).toEqual(Types.WATER);
    expect(stormDrain.immunityType()).toEqual(Types.WATER);
    expect(sapSipper.immunityType()).toEqual(Types.GRASS);
    expect(levitate.immunityType()).toEqual(Types.GROUND);
    expect(motorDrive.immunityType()).toEqual(Types.ELECTRIC);
    expect(flashFire.immunityType()).toEqual(Types.FIRE);
    expect(drySkin.immunityType()).toEqual(Types.WATER);

    stormDrain.disabled = true;
    expect(stormDrain.immunityType()).toEqual(-1);

    stormDrain.disabled = false;
    stormDrain.gen = 4;
    expect(stormDrain.immunityType()).toEqual(-1);

    const invalidAbility = new Ability({ id: -1 });
    expect(invalidAbility.immunityType()).toEqual(-1);
  });

  test("#ignoresAbilities()", () => {
    const moldBreaker = new Ability({ name: "Mold Breaker" });
    const turboblaze = new Ability({ name: "Turboblaze" });
    const teravolt = new Ability({ name: "Teravolt" });
    expect(noAbility.ignoresAbilities()).toBe(false);
    expect(moldBreaker.ignoresAbilities()).toBe(true);
    expect(turboblaze.ignoresAbilities()).toBe(true);
    expect(teravolt.ignoresAbilities()).toBe(true);
    moldBreaker.disabled = true;
    expect(moldBreaker.ignoresAbilities()).toBe(false);
  });

  test("#isIgnorable()", () => {
    const multiscale = new Ability({ name: "Multiscale" });
    expect(multiscale.isIgnorable()).toBe(true);
    expect(swiftSwim.isIgnorable()).toBe(false);
  });

  test("#isSandImmunity()", () => {
    expect(noAbility.isSandImmunity()).toBe(false);
    expect(magicGuard.isSandImmunity()).toBe(true);
    expect(overcoat.isSandImmunity()).toBe(true);
    expect(sandVeil.isSandImmunity()).toBe(true);
    expect(sandRush.isSandImmunity()).toBe(true);
    expect(sandForce.isSandImmunity()).toBe(true);

    magicGuard.disabled = true;
    expect(magicGuard.isSandImmunity()).toBe(false);
  });

  test("#isHailImmunity()", () => {
    expect(noAbility.isHailImmunity()).toBe(false);
    expect(magicGuard.isHailImmunity()).toBe(true);
    expect(overcoat.isHailImmunity()).toBe(true);
    expect(iceBody.isHailImmunity()).toBe(true);
    expect(snowCloak.isHailImmunity()).toBe(true);

    magicGuard.disabled = true;
    expect(magicGuard.isHailImmunity()).toBe(false);
  });

  test("#reducesSuperEffective()", () => {
    const filter = new Ability({ name: "Filter" });
    const solidRock = new Ability({ name: "Solid Rock" });
    const prismArmor = new Ability({ name: "Prism Armor" });
    expect(filter.reducesSuperEffective()).toBe(true);
    expect(solidRock.reducesSuperEffective()).toBe(true);
    expect(prismArmor.reducesSuperEffective()).toBe(true);
    expect(noAbility.reducesSuperEffective()).toBe(false);
    expect(magicGuard.reducesSuperEffective()).toBe(false);
  });

  test("#hasCritArmor()", () => {
    const battleArmor = new Ability({ name: "Battle Armor" });
    const shellArmor = new Ability({ name: "Shell Armor" });
    expect(battleArmor.hasCritArmor()).toBe(true);
    expect(shellArmor.hasCritArmor()).toBe(true);
    expect(noAbility.hasCritArmor()).toBe(false);
    expect(magicGuard.hasCritArmor()).toBe(false);
  });
});
