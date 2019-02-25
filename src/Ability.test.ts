import Ability from "./Ability";
import { Generation, maxGen, Type } from "./utilities";

const placeholderAbility = new Ability();
let noAbility = placeholderAbility;
let pickpocket = placeholderAbility;
beforeEach(() => {
  noAbility = new Ability();
  pickpocket = new Ability({ name: "Pickpocket" });
});

test("#constructor()", () => {
  const ability1 = new Ability({ name: "Effect Spore" });
  expect(ability1.id).toBe("effectspore");

  const ability2 = new Ability({
    name: "Effect Spore",
    disabled: true
  });
  expect(ability2.id).toBe("effectspore");
  expect(ability2.disabled).toBe(true);
  expect(ability2.gen).toBe(maxGen);

  const ability3 = new Ability({ id: "27", gen: Generation.ADV });
  expect(ability3.id).toBe("noability");
  expect(ability3.disabled).toBe(false);
  expect(ability3.gen).toBe(3);
});

test("#name", () => {
  expect(noAbility.name).toBe("(No Ability)");
  expect(pickpocket.name).toBe("Pickpocket");

  pickpocket.disabled = true;
  expect(pickpocket.name).toBe("(No Ability)");

  const ability = new Ability();

  ability.name = "  drought";
  expect(ability.id).toBe("drought");

  ability.name = "Swift Swim";
  expect(ability.id).toBe("swiftswim");

  ability.name = "d  rought";
  expect(ability.id).toBe("drought");
});

test("#pinchType()", () => {
  const blaze = new Ability({ name: "Blaze" });
  const swarm = new Ability({ name: "Swarm" });

  expect(blaze.pinchType()).toBe(Type.FIRE);
  expect(swarm.pinchType()).toBe(Type.BUG);
  expect(pickpocket.pinchType()).toBe(-1);
  expect(noAbility.pinchType()).toBe(-1);

  blaze.disabled = true;
  expect(blaze.pinchType()).toBe(-1);
});

test("#normalToType()", () => {
  const pixilate = new Ability({ name: "Pixilate" });
  const refrigerate = new Ability({ name: "Refrigerate" });

  expect(pixilate.normalToType()).toBe(Type.FAIRY);
  expect(refrigerate.normalToType()).toBe(Type.ICE);
  expect(noAbility.normalToType()).toBe(-1);

  pixilate.disabled = true;
  expect(pixilate.normalToType()).toBe(-1);
});

test("#immunityType()", () => {
  const waterAbsorb = new Ability({ name: "Water Absorb" });
  const stormDrain = new Ability({ name: "Storm Drain" });
  const drySkin = new Ability({ name: "Dry Skin" });
  const sapSipper = new Ability({ name: "Sap Sipper" });
  const levitate = new Ability({ name: "Levitate" });
  const motorDrive = new Ability({ name: "Motor Drive" });
  const flashFire = new Ability({ name: "Flash Fire" });

  expect(noAbility.immunityType()).toBe(-1);
  expect(waterAbsorb.immunityType()).toBe(Type.WATER);
  expect(stormDrain.immunityType()).toBe(Type.WATER);
  expect(drySkin.immunityType()).toBe(Type.WATER);
  expect(sapSipper.immunityType()).toBe(Type.GRASS);
  expect(levitate.immunityType()).toBe(Type.GROUND);
  expect(motorDrive.immunityType()).toBe(Type.ELECTRIC);
  expect(flashFire.immunityType()).toBe(Type.FIRE);

  stormDrain.disabled = true;
  expect(stormDrain.immunityType()).toBe(-1);

  stormDrain.disabled = false;
  stormDrain.gen = 4;
  expect(stormDrain.immunityType()).toBe(-1);

  const invalidAbility = new Ability({ id: "-1" });
  expect(invalidAbility.immunityType()).toBe(-1);
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
  expect(pickpocket.isIgnorable()).toBe(false);
});

test("#isSandImmunity()", () => {
  const magicGuard = new Ability({ name: "Magic Guard" });
  const overcoat = new Ability({ name: "Overcoat" });
  const sandVeil = new Ability({ name: "Sand Veil" });
  const sandRush = new Ability({ name: "Sand Rush" });
  const sandForce = new Ability({ name: "Sand Force" });

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
  const magicGuard = new Ability({ name: "Magic Guard" });
  const overcoat = new Ability({ name: "Overcoat" });
  const iceBody = new Ability({ name: "Ice Body" });
  const snowCloak = new Ability({ name: "Snow Cloak" });

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
  expect(pickpocket.reducesSuperEffective()).toBe(false);
});

test("#hasCritArmor()", () => {
  const battleArmor = new Ability({ name: "Battle Armor" });
  const shellArmor = new Ability({ name: "Shell Armor" });
  expect(battleArmor.hasCritArmor()).toBe(true);
  expect(shellArmor.hasCritArmor()).toBe(true);
  expect(noAbility.hasCritArmor()).toBe(false);
  expect(pickpocket.hasCritArmor()).toBe(false);
});
