import Move from "sulcalc/Move";
import Pokemon from "sulcalc/Pokemon";
import {
  DamageClasses,
  Gens,
  Types,
  Weathers,
  maxGen
} from "sulcalc/utilities";

let noMove, struggle, tackle, psychic;
beforeEach(() => {
  noMove = new Move();
  struggle = new Move({ name: "Struggle" });
  tackle = new Move({ name: "Tackle" });
  psychic = new Move({ name: "Psychic" });
});

test("#constructor()", () => {
  const move1 = new Move({ name: "Pound" });
  expect(move1.id).toEqual("pound");
  expect(move1.gen).toEqual(maxGen);

  const move2 = new Move({ name: "Pay Day", gen: Gens.ADV });
  expect(move2.id).toEqual("payday");
  expect(move2.gen).toEqual(Gens.ADV);

  const move3 = new Move({ id: "payday" });
  expect(move3.id).toEqual("payday");
});

test("#name", () => {
  expect(noMove.name).toEqual("(No Move)");
  expect(tackle.name).toEqual("Tackle");

  const move1 = new Move();
  move1.name = "Tackle";
  expect(move1.id).toEqual("tackle");

  const move2 = new Move();
  move2.name = " bullet   seed    ";
  expect(move2.id).toEqual("bulletseed");

  const move3 = new Move();
  move3.name = "b ullet seed";
  expect(move3.id).toEqual("bulletseed");

  const doubleEdge = new Move({ name: "Double-Edge", zMove: true });
  expect(doubleEdge.name).toEqual("Breakneck Blitz");

  const clangingScales = new Move({ name: "Clanging Scales", zMove: true });
  expect(clangingScales.name).toEqual("Devastating Drake");
  clangingScales.user = new Pokemon({
    name: "Kommo-o",
    item: "Kommonium Z"
  });
  expect(clangingScales.name).toEqual("Clangorous Soulblaze");

  const photonGeyser = new Move({ name: "Photon Geyser", zMove: true });
  expect(photonGeyser.name).toEqual("Shattered Psyche");
  photonGeyser.user = new Pokemon({
    name: "Necrozma-Ultra",
    item: "Ultranecrozium Z"
  });
  expect(photonGeyser.name).toEqual("Light That Burns the Sky");
});

describe("#power()", () => {
  test("basic tests", () => {
    const leer = new Move({ name: "Leer" });
    expect(noMove.power()).toEqual(0);
    expect(leer.power()).toEqual(0);
    expect(struggle.power()).toEqual(50);
    expect(tackle.power()).toEqual(40);
  });

  test("gen changes", () => {
    tackle.gen = 6;
    expect(tackle.power()).toEqual(50);
    tackle.gen = 4;
    expect(tackle.power()).toEqual(35);
  });

  test("Z-Moves", () => {
    const doubleEdge = new Move({ name: "Double-Edge", zMove: true });
    expect(doubleEdge.power()).toEqual(190);

    const clangingScales = new Move({ name: "Clanging Scales" });
    expect(clangingScales.power()).toEqual(110);
    clangingScales.zMove = true;
    expect(clangingScales.power()).toEqual(185);
    clangingScales.user = new Pokemon({
      name: "Kommo-o",
      item: "Kommonium Z"
    });
    expect(clangingScales.power()).toEqual(185);

    const photonGeyser = new Move({ name: "Photon Geyser" });
    expect(photonGeyser.power()).toEqual(100);
    photonGeyser.zMove = true;
    expect(photonGeyser.power()).toEqual(180);
    photonGeyser.user = new Pokemon({
      name: "Necrozma-Ultra",
      item: "Ultranecrozium Z"
    });
    expect(photonGeyser.power()).toEqual(200);
  });
});

test("#damageClass()", () => {
  const hiddenPower = new Move({ name: "Hidden Power" });
  expect(noMove.damageClass()).toEqual(DamageClasses.OTHER);
  expect(tackle.damageClass()).toEqual(DamageClasses.PHYSICAL);
  expect(struggle.damageClass()).toEqual(DamageClasses.PHYSICAL);
  expect(psychic.damageClass()).toEqual(DamageClasses.SPECIAL);
  expect(hiddenPower.damageClass()).toEqual(DamageClasses.SPECIAL);
});

test("#isPhysical()", () => {
  const hiddenPower = new Move({ name: "Hidden Power" });
  expect(noMove.isPhysical()).toBe(false);
  expect(tackle.isPhysical()).toBe(true);
  expect(struggle.isPhysical()).toBe(true);
  expect(psychic.isPhysical()).toBe(false);
  expect(hiddenPower.isPhysical()).toBe(false);
});

test("#isSpecial()", () => {
  const hiddenPower = new Move({ name: "Hidden Power" });
  expect(noMove.isSpecial()).toBe(false);
  expect(tackle.isSpecial()).toBe(false);
  expect(struggle.isSpecial()).toBe(false);
  expect(psychic.isSpecial()).toBe(true);
  expect(hiddenPower.isSpecial()).toBe(true);
});

test("#isPsyshockLike()", () => {
  const psyshock = new Move({ name: "Psyshock" });
  const psystrike = new Move({ name: "Psystrike" });
  const secretSword = new Move({ name: "Secret Sword" });
  expect(psyshock.isPsyshockLike()).toBe(true);
  expect(psystrike.isPsyshockLike()).toBe(true);
  expect(secretSword.isPsyshockLike()).toBe(true);
  expect(noMove.isPsyshockLike()).toBe(false);
  expect(psychic.isPsyshockLike()).toBe(false);
});

test("#type()", () => {
  const hiddenPower = new Move({ name: "Hidden Power" });
  expect(psychic.type()).toEqual(Types.PSYCHIC);
  expect(hiddenPower.type()).toEqual(Types.NORMAL);
  expect(struggle.type()).toEqual(Types.CURSE);
});

test("#hasRecoil()", () => {
  const doubleEdge = new Move({ name: "Double-Edge" });
  const absorb = new Move({ name: "Absorb" });
  expect(psychic.hasRecoil()).toBe(false);
  expect(doubleEdge.hasRecoil()).toBe(true);
  expect(absorb.hasRecoil()).toBe(false);
  expect(noMove.hasRecoil()).toBe(false);
  expect(struggle.hasRecoil()).toBe(false);
});

test("#isPunch()", () => {
  const machPunch = new Move({ name: "Mach Punch" });
  expect(machPunch.isPunch()).toBe(true);
  expect(tackle.isPunch()).toBe(false);
  expect(noMove.isPunch()).toBe(false);
});

test("#affectedBySheerForce()", () => {
  const ironHead = new Move({ name: "Iron Head" });
  const ancientPower = new Move({ name: "Ancient Power" });
  const blazeKick = new Move({ name: "Blaze Kick" });
  const chatter = new Move({ name: "Chatter" });
  expect(ironHead.affectedBySheerForce()).toBe(true);
  expect(ancientPower.affectedBySheerForce()).toBe(true);
  expect(blazeKick.affectedBySheerForce()).toBe(true);
  expect(chatter.affectedBySheerForce()).toBe(true);
  expect(psychic.affectedBySheerForce()).toBe(true);
  expect(noMove.affectedBySheerForce()).toBe(false);
  expect(tackle.affectedBySheerForce()).toBe(false);
});

test("#isContact()", () => {
  const overheat = new Move({ name: "Overheat" });
  const ancientPower = new Move({ name: "Ancient Power" });

  expect(tackle.isContact()).toBe(true);
  expect(noMove.isContact()).toBe(false);
  expect(psychic.isContact()).toBe(false);
  expect(struggle.isContact()).toBe(true);
  expect(overheat.isContact()).toBe(false);
  expect(ancientPower.isContact()).toBe(false);

  overheat.gen = 3;
  ancientPower.gen = 3;
  expect(overheat.isContact()).toBe(true);
  expect(ancientPower.isContact()).toBe(true);
});

test("#isSound()", () => {
  const chatter = new Move({ name: "Chatter" });
  expect(chatter.isSound()).toBe(true);
  expect(noMove.isSound()).toBe(false);
  expect(tackle.isSound()).toBe(false);
});

test("#isPowder()", () => {
  const spore = new Move({ name: "Spore" });
  expect(spore.isPowder()).toBe(true);
  expect(noMove.isPowder()).toBe(false);
  expect(tackle.isPowder()).toBe(false);
});

test("#isBite()", () => {
  const bite = new Move({ name: "Bite" });
  expect(bite.isBite()).toBe(true);
  expect(noMove.isBite()).toBe(false);
  expect(tackle.isBite()).toBe(false);
});

test("#isPulse()", () => {
  const dragonPulse = new Move({ name: "Dragon Pulse" });
  expect(dragonPulse.isPulse()).toBe(true);
  expect(noMove.isPulse()).toBe(false);
  expect(tackle.isPulse()).toBe(false);
});

test("#isBall()", () => {
  const shadowBall = new Move({ name: "Shadow Ball" });
  const rockWrecker = new Move({ name: "Rock Wrecker" });
  expect(shadowBall.isBall()).toBe(true);
  expect(rockWrecker.isBall()).toBe(true);
  expect(noMove.isBall()).toBe(false);
  expect(tackle.isBall()).toBe(false);
});

test("#minHits()", () => {
  const bulletSeed = new Move({ name: "Bullet Seed" });
  const gearGrind = new Move({ name: "Gear Grind" });
  const tripleKick = new Move({ name: "Triple Kick" });
  const beatUp = new Move({ name: "Beat Up" });
  expect(noMove.minHits()).toEqual(0);
  expect(tackle.minHits()).toEqual(1);
  expect(bulletSeed.minHits()).toEqual(2);
  expect(gearGrind.minHits()).toEqual(2);
  expect(tripleKick.minHits()).toEqual(3);
  expect(beatUp.minHits()).toEqual(1);
});

test("#maxHits()", () => {
  const bulletSeed = new Move({ name: "Bullet Seed" });
  const gearGrind = new Move({ name: "Gear Grind" });
  const tripleKick = new Move({ name: "Triple Kick" });
  const beatUp = new Move({ name: "Beat Up" });
  expect(noMove.maxHits()).toEqual(0);
  expect(tackle.maxHits()).toEqual(1);
  expect(bulletSeed.maxHits()).toEqual(5);
  expect(gearGrind.maxHits()).toEqual(2);
  expect(tripleKick.maxHits()).toEqual(3);
  expect(beatUp.maxHits()).toEqual(1);
});

test("#hitsMultipleTimes()", () => {
  const bulletSeed = new Move({ name: "Bullet Seed" });
  const gearGrind = new Move({ name: "Gear Grind" });
  const tripleKick = new Move({ name: "Triple Kick" });
  expect(noMove.hitsMultipleTimes()).toEqual(false);
  expect(tackle.hitsMultipleTimes()).toEqual(false);
  expect(bulletSeed.hitsMultipleTimes()).toEqual(true);
  expect(gearGrind.hitsMultipleTimes()).toEqual(true);
  expect(tripleKick.hitsMultipleTimes()).toEqual(true);
});

test("#hasMultipleTargets()", () => {
  const surf = new Move({ name: "Surf" });
  const eruption = new Move({ name: "Eruption" });
  expect(surf.hasMultipleTargets()).toBe(true);
  expect(eruption.hasMultipleTargets()).toBe(true);
  expect(tackle.hasMultipleTargets()).toBe(false);
  expect(noMove.hasMultipleTargets()).toBe(false);
});

test("#isOhko()", () => {
  const sheerCold = new Move({ name: "Sheer Cold" });
  expect(sheerCold.isOhko()).toBe(true);
  expect(tackle.isOhko()).toBe(false);
  expect(noMove.isOhko()).toBe(false);
});

test("#requiresRecharge()", () => {
  const rockWrecker = new Move({ name: "Rock Wrecker" });
  expect(rockWrecker.requiresRecharge()).toBe(true);
  expect(tackle.requiresRecharge()).toBe(false);
  expect(noMove.requiresRecharge()).toBe(false);
});

test("#isRecklessBoosted()", () => {
  const doubleEdge = new Move({ name: "Double-Edge" });
  const jumpKick = new Move({ name: "Jump Kick" });
  const highJumpKick = new Move({ name: "High Jump Kick" });
  expect(doubleEdge.isRecklessBoosted()).toBe(true);
  expect(jumpKick.isRecklessBoosted()).toBe(true);
  expect(highJumpKick.isRecklessBoosted()).toBe(true);
  expect(tackle.isRecklessBoosted()).toBe(false);
  expect(noMove.isRecklessBoosted()).toBe(false);
  expect(struggle.isRecklessBoosted()).toBe(false);
});

test("#canCrit()", () => {
  const doomDesire = new Move({ name: "Doom Desire" });
  const reversal = new Move({ name: "Reversal" });
  expect(reversal.canCrit()).toBe(true);
  expect(doomDesire.canCrit()).toBe(true);
  expect(tackle.canCrit()).toBe(true);
  expect(noMove.canCrit()).toBe(true);
  expect(struggle.canCrit()).toBe(true);

  for (let gen = Gens.GSC; gen < Gens.HGSS; gen++) {
    reversal.gen = gen;
    doomDesire.gen = gen;
    tackle.gen = gen;
    noMove.gen = gen;
    struggle.gen = gen;

    expect(reversal.canCrit()).toBe(false);
    expect(doomDesire.canCrit()).toBe(false);
    expect(tackle.canCrit()).toBe(true);
    expect(noMove.canCrit()).toBe(true);
    expect(struggle.canCrit()).toBe(true);
  }
});

test("#affectedByParentalBond()", () => {
  const surf = new Move({ name: "Surf" });
  const bulletSeed = new Move({ name: "Bullet Seed" });
  const explosion = new Move({ name: "Explosion" });
  expect(surf.affectedByParentalBond()).toBe(true);
  expect(bulletSeed.affectedByParentalBond()).toBe(true);
  expect(explosion.affectedByParentalBond()).toBe(false);
  expect(tackle.affectedByParentalBond()).toBe(true);
  expect(struggle.affectedByParentalBond()).toBe(true);
  expect(noMove.affectedByParentalBond()).toBe(true);
});

test("#weakenedByGrassyTerrain()", () => {
  const earthquake = new Move({ name: "Earthquake" });
  const magnitude = new Move({ name: "Magnitude" });
  const bulldoze = new Move({ name: "Bulldoze" });
  expect(earthquake.weakenedByGrassyTerrain()).toBe(true);
  expect(magnitude.weakenedByGrassyTerrain()).toBe(true);
  expect(bulldoze.weakenedByGrassyTerrain()).toBe(true);
  expect(tackle.weakenedByGrassyTerrain()).toBe(false);
});

test("#boostedByMinimize()", () => {
  const gust = new Move({ name: "Gust" });
  const stomp = new Move({ name: "Stomp" });
  const astonish = new Move({ name: "Astonish" });
  const extrasensory = new Move({ name: "Extrasensory" });
  const needleArm = new Move({ name: "Needle Arm" });
  const steamroller = new Move({ name: "Steamroller" });
  const bodySlam = new Move({ name: "Body Slam" });
  const dragonRush = new Move({ name: "Dragon Rush" });
  const flyingPress = new Move({ name: "Flying Press" });
  const shadowForce = new Move({ name: "Shadow Force" });
  const phantomForce = new Move({ name: "Phantom Force" });
  const heavySlam = new Move({ name: "Heavy Slam" });
  function changeGen(gen) {
    stomp.gen = gen;
    astonish.gen = gen;
    extrasensory.gen = gen;
    needleArm.gen = gen;
    steamroller.gen = gen;
    bodySlam.gen = gen;
    dragonRush.gen = gen;
    flyingPress.gen = gen;
    shadowForce.gen = gen;
    phantomForce.gen = gen;
    heavySlam.gen = gen;
  }

  expect(gust.boostedByMinimize()).toBe(false);

  expect(stomp.boostedByMinimize()).toBe(true);
  expect(astonish.boostedByMinimize()).toBe(false);
  expect(extrasensory.boostedByMinimize()).toBe(false);
  expect(needleArm.boostedByMinimize()).toBe(false);
  expect(steamroller.boostedByMinimize()).toBe(true);
  expect(bodySlam.boostedByMinimize()).toBe(true);
  expect(dragonRush.boostedByMinimize()).toBe(true);
  expect(flyingPress.boostedByMinimize()).toBe(true);
  expect(shadowForce.boostedByMinimize()).toBe(true);
  expect(phantomForce.boostedByMinimize()).toBe(true);
  expect(heavySlam.boostedByMinimize()).toBe(true);

  changeGen(Gens.ORAS);
  expect(stomp.boostedByMinimize()).toBe(true);
  expect(astonish.boostedByMinimize()).toBe(false);
  expect(extrasensory.boostedByMinimize()).toBe(false);
  expect(needleArm.boostedByMinimize()).toBe(false);
  expect(steamroller.boostedByMinimize()).toBe(true);
  expect(bodySlam.boostedByMinimize()).toBe(true);
  expect(dragonRush.boostedByMinimize()).toBe(true);
  expect(flyingPress.boostedByMinimize()).toBe(true);
  expect(shadowForce.boostedByMinimize()).toBe(true);
  expect(phantomForce.boostedByMinimize()).toBe(true);
  expect(heavySlam.boostedByMinimize()).toBe(false);

  changeGen(Gens.B2W2);
  expect(steamroller.boostedByMinimize()).toBe(true);
  changeGen(Gens.HGSS);
  expect(steamroller.boostedByMinimize()).toBe(false);
  for (const gen of [Gens.B2W2, Gens.HGSS]) {
    changeGen(gen);
    expect(stomp.boostedByMinimize()).toBe(true);
    expect(astonish.boostedByMinimize()).toBe(false);
    expect(extrasensory.boostedByMinimize()).toBe(false);
    expect(needleArm.boostedByMinimize()).toBe(false);
    expect(bodySlam.boostedByMinimize()).toBe(false);
    expect(dragonRush.boostedByMinimize()).toBe(false);
    expect(flyingPress.boostedByMinimize()).toBe(false);
    expect(shadowForce.boostedByMinimize()).toBe(false);
    expect(phantomForce.boostedByMinimize()).toBe(false);
    expect(heavySlam.boostedByMinimize()).toBe(false);
  }

  changeGen(Gens.ADV);
  expect(stomp.boostedByMinimize()).toBe(true);
  expect(astonish.boostedByMinimize()).toBe(true);
  expect(extrasensory.boostedByMinimize()).toBe(true);
  expect(needleArm.boostedByMinimize()).toBe(true);
  expect(steamroller.boostedByMinimize()).toBe(false);
  expect(bodySlam.boostedByMinimize()).toBe(false);
  expect(dragonRush.boostedByMinimize()).toBe(false);
  expect(flyingPress.boostedByMinimize()).toBe(false);
  expect(shadowForce.boostedByMinimize()).toBe(false);
  expect(phantomForce.boostedByMinimize()).toBe(false);
  expect(heavySlam.boostedByMinimize()).toBe(false);

  changeGen(Gens.GSC);
  expect(stomp.boostedByMinimize()).toBe(true);
  expect(astonish.boostedByMinimize()).toBe(false);
  expect(extrasensory.boostedByMinimize()).toBe(false);
  expect(needleArm.boostedByMinimize()).toBe(false);
  expect(steamroller.boostedByMinimize()).toBe(false);
  expect(bodySlam.boostedByMinimize()).toBe(false);
  expect(dragonRush.boostedByMinimize()).toBe(false);
  expect(flyingPress.boostedByMinimize()).toBe(false);
  expect(shadowForce.boostedByMinimize()).toBe(false);
  expect(phantomForce.boostedByMinimize()).toBe(false);
  expect(heavySlam.boostedByMinimize()).toBe(false);
});

test("#boostedByDig()", () => {
  const earthquake = new Move({ name: "Earthquake" });
  const magnitude = new Move({ name: "Magnitude" });
  expect(earthquake.boostedByDig()).toBe(true);
  expect(magnitude.boostedByDig()).toBe(true);
  expect(tackle.boostedByDig()).toBe(false);
});

test("#boostedByDive()", () => {
  const surf = new Move({ name: "Surf" });
  const whirlpool = new Move({ name: "Whirlpool" });
  expect(surf.boostedByDive()).toBe(true);
  expect(whirlpool.boostedByDive()).toBe(true);
  expect(tackle.boostedByDive()).toBe(false);
});

test("#boostedByFly()", () => {
  const twister = new Move({ name: "Twister" });
  const gust = new Move({ name: "Gust" });
  expect(gust.boostedByFly()).toBe(true);
  expect(twister.boostedByFly()).toBe(true);
  expect(tackle.boostedByFly()).toBe(false);
});

test("#usesHappiness()", () => {
  const returnMove = new Move({ name: "Return" });
  const frustration = new Move({ name: "Frustration" });
  expect(returnMove.usesHappiness()).toBe(true);
  expect(frustration.usesHappiness()).toBe(true);
  expect(tackle.usesHappiness()).toBe(false);
});

test("#optimalHappiness()", () => {
  const returnMove = new Move({ name: "Return" });
  const frustration = new Move({ name: "Frustration" });
  expect(returnMove.optimalHappiness()).toEqual(255);
  expect(frustration.optimalHappiness()).toEqual(0);
});

test("#isExplosion()", () => {
  const selfDestruct = new Move({ name: "Self-Destruct" });
  const explosion = new Move({ name: "Explosion" });
  const mindBlown = new Move({ name: "Mind Blown" });
  expect(selfDestruct.isExplosion()).toBe(true);
  expect(explosion.isExplosion()).toBe(true);
  expect(mindBlown.isExplosion()).toBe(true);
  expect(tackle.isExplosion()).toBe(false);
});

test(".hiddenPowers()", () => {
  const isMaxIv = iv => iv === 30 || iv === 31;
  for (const type of Object.values(Types)) {
    for (const ivs of Move.hiddenPowers(type, Gens.B2W2)) {
      expect(ivs.every(isMaxIv)).toBe(true);
      expect(Move.hiddenPowerType(ivs, Gens.B2W2)).toEqual(type);
      expect(Move.hiddenPowerBp(ivs, Gens.B2W2)).toEqual(70);
    }
    for (const ivs of Move.hiddenPowers(type, Gens.GSC)) {
      expect(Move.hiddenPowerType(ivs, Gens.GSC)).toEqual(type);
      expect(Move.hiddenPowerBp(ivs, Gens.GSC)).toEqual(70);
    }
  }
});

test(".hiddenPowerBp()", () => {
  const base70 = [
    [0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111],
    [0b11110, 0b01111, 0b10111, 0b00010, 0b01010, 0b10111],
    [0b11011, 0b00111, 0b11111, 0b00011, 0b10011, 0b10111],
    [0b10111, 0b10011, 0b11110, 0b10111, 0b10111, 0b11011],
    [0b01111, 0b10111, 0b10111, 0b11011, 0b11011, 0b10110]
  ];

  for (const ivs of base70) {
    expect(Move.hiddenPowerBp(ivs, Gens.B2W2)).toEqual(70);
    expect(Move.hiddenPowerBp(ivs, Gens.ORAS)).toEqual(60);
  }

  const notBase70 = [
    [0b11101, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111],
    [0b11110, 0b01101, 0b10111, 0b00010, 0b01010, 0b10111],
    [0b11011, 0b00111, 0b11101, 0b00011, 0b10011, 0b10111],
    [0b10111, 0b10011, 0b11110, 0b10101, 0b10111, 0b11011],
    [0b01111, 0b10111, 0b10111, 0b11011, 0b11001, 0b10100]
  ];

  for (const ivs of notBase70) {
    expect(Move.hiddenPowerBp(ivs, Gens.B2W2)).not.toEqual(70);
    expect(Move.hiddenPowerBp(ivs, Gens.ORAS)).toEqual(60);
  }

  const base70Gen2 = [
    [NaN, 0x8, 0x9, 0xa | 0x3, NaN, 0xc],
    [NaN, 0xd, 0xe, 0xf | 0x3, NaN, 0x8],
    [NaN, 0xf, 0xa, 0xc | 0x3, NaN, 0x8],
    [NaN, 0xd, 0x8, 0xa | 0x3, NaN, 0x9],
    [NaN, 0x8, 0x8, 0x8 | 0x3, NaN, 0x8]
  ];

  for (const ivs of base70Gen2) {
    expect(Move.hiddenPowerBp(ivs, Gens.GSC)).toEqual(70);
  }

  const notBase70Gen2 = [
    [NaN, 0x7, 0x8, 0x8 & !0x3, NaN, 0x8],
    [NaN, 0xa, 0xf, 0xd & !0x3, NaN, 0xc],
    [NaN, 0xf, 0xa, 0xc & !0x3, NaN, 0x5],
    [NaN, 0x0, 0x0, 0x0 & !0x3, NaN, 0x0],
    [NaN, 0xf, 0xf, 0x7 & !0x3, NaN, 0xf]
  ];

  for (const ivs of notBase70Gen2) {
    expect(Move.hiddenPowerBp(ivs, Gens.GSC)).toBeLessThan(70);
  }
});

test(".hiddenPowerType()", () => {
  expect(Move.hiddenPowerType([31, 31, 31, 31, 31, 31])).toEqual(Types.DARK);
  expect(Move.hiddenPowerType([31, 30, 30, 31, 31, 31])).toEqual(Types.ICE);
  expect(Move.hiddenPowerType([31, 30, 31, 30, 31, 30])).toEqual(Types.FIRE);
  expect(Move.hiddenPowerType([31, 30, 31, 30, 31, 31])).toEqual(Types.GRASS);

  expect(Move.hiddenPowerType([NaN, 15, 15, 15, NaN, 15], Gens.GSC)).toEqual(
    Types.DARK
  );
  expect(Move.hiddenPowerType([NaN, 15, 13, 15, NaN, 15], Gens.GSC)).toEqual(
    Types.ICE
  );
  expect(Move.hiddenPowerType([NaN, 13, 13, 15, NaN, 15], Gens.GSC)).toEqual(
    Types.BUG
  );
  expect(Move.hiddenPowerType([NaN, 14, 13, 15, NaN, 15], Gens.GSC)).toEqual(
    Types.WATER
  );
});

test(".flail()", () => {
  expect(Move.flail(1, 100)).toEqual(200);
  expect(Move.flail(4, 100)).toEqual(200);
  expect(Move.flail(5, 100)).toEqual(150);
  expect(Move.flail(10, 100)).toEqual(150);
  expect(Move.flail(11, 100)).toEqual(100);
  expect(Move.flail(20, 100)).toEqual(100);
  expect(Move.flail(21, 100)).toEqual(80);
  expect(Move.flail(35, 100)).toEqual(80);
  expect(Move.flail(36, 100)).toEqual(40);
  expect(Move.flail(68, 100)).toEqual(40);
  expect(Move.flail(69, 100)).toEqual(20);
  expect(Move.flail(100, 100)).toEqual(20);

  expect(Move.flail(1, 100, Gens.HGSS)).toEqual(200);
  expect(Move.flail(3, 100, Gens.HGSS)).toEqual(200);
  expect(Move.flail(4, 100, Gens.HGSS)).toEqual(150);
  expect(Move.flail(9, 100, Gens.HGSS)).toEqual(150);
  expect(Move.flail(10, 100, Gens.HGSS)).toEqual(100);
  expect(Move.flail(20, 100, Gens.HGSS)).toEqual(100);
  expect(Move.flail(21, 100, Gens.HGSS)).toEqual(80);
  expect(Move.flail(34, 100, Gens.HGSS)).toEqual(80);
  expect(Move.flail(35, 100, Gens.HGSS)).toEqual(40);
  expect(Move.flail(67, 100, Gens.HGSS)).toEqual(40);
  expect(Move.flail(68, 100, Gens.HGSS)).toEqual(20);
  expect(Move.flail(100, 100, Gens.HGSS)).toEqual(20);
});

test(".magnitude()", () => {
  expect(Move.magnitude(4)).toEqual(10);
  expect(Move.magnitude(5)).toEqual(30);
  expect(Move.magnitude(6)).toEqual(50);
  expect(Move.magnitude(7)).toEqual(70);
  expect(Move.magnitude(8)).toEqual(90);
  expect(Move.magnitude(9)).toEqual(110);
  expect(Move.magnitude(10)).toEqual(150);
});

test(".weatherBall()", () => {
  expect(Move.weatherBall(Weathers.CLEAR)).toEqual(Types.NORMAL);
  expect(Move.weatherBall(Weathers.SUN)).toEqual(Types.FIRE);
  expect(Move.weatherBall(Weathers.RAIN)).toEqual(Types.WATER);
  expect(Move.weatherBall(Weathers.SAND)).toEqual(Types.ROCK);
  expect(Move.weatherBall(Weathers.HAIL)).toEqual(Types.ICE);
  expect(Move.weatherBall(Weathers.HARSH_SUN)).toEqual(Types.FIRE);
  expect(Move.weatherBall(Weathers.HEAVY_RAIN)).toEqual(Types.WATER);
  expect(Move.weatherBall(Weathers.STRONG_WINDS)).toEqual(Types.NORMAL);
});

test(".trumpCard()", () => {
  expect(Move.trumpCard(0)).toEqual(200);
  expect(Move.trumpCard(1)).toEqual(80);
  expect(Move.trumpCard(2)).toEqual(60);
  expect(Move.trumpCard(3)).toEqual(50);
  expect(Move.trumpCard(4)).toEqual(40);
  expect(Move.trumpCard(5)).toEqual(40);
  expect(Move.trumpCard(6)).toEqual(40);
});

test(".electroBall()", () => {
  expect(Move.electroBall(100, 20000)).toEqual(40);
  expect(Move.electroBall(100, 101)).toEqual(40);
  expect(Move.electroBall(100, 100)).toEqual(60);
  expect(Move.electroBall(100, 51)).toEqual(60);
  expect(Move.electroBall(100, 50)).toEqual(80);
  expect(Move.electroBall(100, 34)).toEqual(80);
  expect(Move.electroBall(100, 33)).toEqual(120);
  expect(Move.electroBall(100, 26)).toEqual(120);
  expect(Move.electroBall(100, 25)).toEqual(150);
  expect(Move.electroBall(100, 1)).toEqual(150);
  expect(Move.electroBall(100, 0)).toEqual(150);
});

test(".gyroBall()", () => {
  expect(Move.gyroBall(0, 100)).toEqual(150);
  expect(Move.gyroBall(1, 100)).toEqual(150);
  expect(Move.gyroBall(25, 100)).toEqual(100);
  expect(Move.gyroBall(26, 100)).toBeLessThan(150);
  expect(Move.gyroBall(100, 100)).toEqual(25);
  expect(Move.gyroBall(101, 100)).toBeLessThan(25);
  expect(Move.gyroBall(500, 100)).toEqual(5);
  expect(Move.gyroBall(501, 100)).toBeLessThan(5);
  expect(Move.gyroBall(2500, 100)).toEqual(1);
});

test(".grassKnot()", () => {
  expect(Move.grassKnot(200000)).toEqual(120);
  expect(Move.grassKnot(2000)).toEqual(120);
  expect(Move.grassKnot(1999)).toEqual(100);
  expect(Move.grassKnot(1000)).toEqual(100);
  expect(Move.grassKnot(999)).toEqual(80);
  expect(Move.grassKnot(500)).toEqual(80);
  expect(Move.grassKnot(499)).toEqual(60);
  expect(Move.grassKnot(250)).toEqual(60);
  expect(Move.grassKnot(249)).toEqual(40);
  expect(Move.grassKnot(100)).toEqual(40);
  expect(Move.grassKnot(99)).toEqual(20);
  expect(Move.grassKnot(1)).toEqual(20);
  expect(Move.grassKnot(0)).toEqual(20);
});

test(".heavySlam()", () => {
  expect(Move.heavySlam(100, 1)).toEqual(120);
  expect(Move.heavySlam(100, 20)).toEqual(120);
  expect(Move.heavySlam(100, 21)).toEqual(100);
  expect(Move.heavySlam(100, 25)).toEqual(100);
  expect(Move.heavySlam(100, 26)).toEqual(80);
  expect(Move.heavySlam(100, 33)).toEqual(80);
  expect(Move.heavySlam(100, 34)).toEqual(60);
  expect(Move.heavySlam(100, 50)).toEqual(60);
  expect(Move.heavySlam(100, 51)).toEqual(40);
  expect(Move.heavySlam(100, 100)).toEqual(40);
});

test(".punishment()", () => {
  expect(Move.punishment([NaN, 0, 0, 0, 0, 0, 0, 0])).toEqual(60);
  expect(Move.punishment([NaN, -3, 0, 0, 0, 0, -5, 0])).toEqual(60);
  expect(Move.punishment([NaN, 1, 0, 0, 0, 0, 0, 0])).toEqual(80);
  expect(Move.punishment([NaN, 1, 0, 0, 0, 0, 2, 0])).toEqual(120);
  expect(Move.punishment([NaN, 0, 0, 0, 0, 0, 1, 1])).toEqual(100);
  expect(Move.punishment([NaN, 0, 0, 0, 0, -3, 3, 0])).toEqual(120);
});

test(".storedPower()", () => {
  expect(Move.storedPower([NaN, 0, 0, 0, 0, 0, 0, 0])).toEqual(20);
  expect(Move.storedPower([NaN, -3, 0, 0, 0, 0, -5, 0])).toEqual(20);
  expect(Move.storedPower([NaN, 1, 0, 0, 0, 0, 0, 0])).toEqual(40);
  expect(Move.storedPower([NaN, 1, 0, 0, 0, 0, 2, 0])).toEqual(80);
  expect(Move.storedPower([NaN, 0, 0, 0, 0, 0, 1, 1])).toEqual(60);
  expect(Move.storedPower([NaN, 6, 6, 6, 6, 6, 6, 6])).toEqual(860);
});

test(".frustration()", () => {
  expect(Move.frustration(0)).toEqual(102);
  expect(Move.frustration(5)).toEqual(100);
  expect(Move.frustration(250)).toEqual(2);
  expect(Move.frustration(251)).toEqual(1);
  expect(Move.frustration(255)).toEqual(1);
});

test(".return()", () => {
  expect(Move.return(255)).toEqual(102);
  expect(Move.return(250)).toEqual(100);
  expect(Move.return(5)).toEqual(2);
  expect(Move.return(2)).toEqual(1);
  expect(Move.return(0)).toEqual(1);
});

test(".eruption()", () => {
  expect(Move.eruption(100, 100)).toEqual(150);
  expect(Move.eruption(1, 300)).toEqual(1);
  expect(Move.eruption(1, 2)).toEqual(75);
  expect(Move.eruption(1, 3)).toEqual(50);
});
