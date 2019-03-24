import Move from "./Move";
import Pokemon from "./Pokemon";
import {
  BoostList,
  DamageClass,
  Generation,
  maxGen,
  StatList,
  Type,
  types,
  Weather
} from "./utilities";

const defaultMove = new Move();
let noMove = defaultMove;
let struggle = defaultMove;
let tackle = defaultMove;
let psychic = defaultMove;
beforeEach(() => {
  noMove = new Move();
  struggle = new Move({ name: "Struggle" });
  tackle = new Move({ name: "Tackle" });
  psychic = new Move({ name: "Psychic" });
});

test("#constructor()", () => {
  const move1 = new Move({ name: "Pound" });
  expect(move1.id).toBe("pound");
  expect(move1.gen).toBe(maxGen);

  const move2 = new Move({ name: "Pay Day", gen: Generation.ADV });
  expect(move2.id).toBe("payday");
  expect(move2.gen).toBe(Generation.ADV);

  const move3 = new Move({ id: "payday" });
  expect(move3.id).toBe("payday");

  const move4 = new Move({ id: "Bullet Seed", numberOfHits: 4 });
  expect(move4.numberOfHits).toBe(4);
});

test("#name", () => {
  expect(noMove.name).toBe("(No Move)");
  expect(tackle.name).toBe("Tackle");

  const move1 = new Move();
  move1.name = "Tackle";
  expect(move1.id).toBe("tackle");

  const move2 = new Move();
  move2.name = " bullet   seed    ";
  expect(move2.id).toBe("bulletseed");

  const move3 = new Move();
  move3.name = "b ullet seed";
  expect(move3.id).toBe("bulletseed");

  const doubleEdge = new Move({ name: "Double-Edge", zMove: true });
  expect(doubleEdge.name).toBe("Breakneck Blitz");

  const clangingScales = new Move({ name: "Clanging Scales", zMove: true });
  expect(clangingScales.name).toBe("Devastating Drake");
  clangingScales.user = new Pokemon({
    name: "Kommo-o",
    item: "Kommonium Z"
  });
  expect(clangingScales.name).toBe("Clangorous Soulblaze");

  const photonGeyser = new Move({ name: "Photon Geyser", zMove: true });
  expect(photonGeyser.name).toBe("Shattered Psyche");
  photonGeyser.user = new Pokemon({
    name: "Necrozma-Ultra",
    item: "Ultranecrozium Z"
  });
  expect(photonGeyser.name).toBe("Light That Burns the Sky");
});

describe("#power()", () => {
  test("basic tests", () => {
    const leer = new Move({ name: "Leer" });
    expect(noMove.power()).toBe(0);
    expect(leer.power()).toBe(0);
    expect(struggle.power()).toBe(50);
    expect(tackle.power()).toBe(40);
  });

  test("gen changes", () => {
    tackle.gen = 6;
    expect(tackle.power()).toBe(50);
    tackle.gen = 4;
    expect(tackle.power()).toBe(35);
  });

  test("Z-Moves", () => {
    const doubleEdge = new Move({ name: "Double-Edge", zMove: true });
    expect(doubleEdge.power()).toBe(190);

    const clangingScales = new Move({ name: "Clanging Scales" });
    expect(clangingScales.power()).toBe(110);
    clangingScales.zMove = true;
    expect(clangingScales.power()).toBe(185);
    clangingScales.user = new Pokemon({
      name: "Kommo-o",
      item: "Kommonium Z"
    });
    expect(clangingScales.power()).toBe(185);

    const photonGeyser = new Move({ name: "Photon Geyser" });
    expect(photonGeyser.power()).toBe(100);
    photonGeyser.zMove = true;
    expect(photonGeyser.power()).toBe(180);
    photonGeyser.user = new Pokemon({
      name: "Necrozma-Ultra",
      item: "Ultranecrozium Z"
    });
    expect(photonGeyser.power()).toBe(200);
  });
});

test("#damageClass()", () => {
  const hiddenPower = new Move({ name: "Hidden Power" });
  expect(noMove.damageClass()).toBe(DamageClass.OTHER);
  expect(tackle.damageClass()).toBe(DamageClass.PHYSICAL);
  expect(struggle.damageClass()).toBe(DamageClass.PHYSICAL);
  expect(psychic.damageClass()).toBe(DamageClass.SPECIAL);
  expect(hiddenPower.damageClass()).toBe(DamageClass.SPECIAL);
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
  expect(psychic.type()).toBe(Type.PSYCHIC);
  expect(hiddenPower.type()).toBe(Type.NORMAL);
  expect(struggle.type()).toBe(Type.CURSE);
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
  expect(noMove.minHits()).toBe(0);
  expect(tackle.minHits()).toBe(1);
  expect(bulletSeed.minHits()).toBe(2);
  expect(gearGrind.minHits()).toBe(2);
  expect(tripleKick.minHits()).toBe(3);
  expect(beatUp.minHits()).toBe(1);
});

test("#maxHits()", () => {
  const bulletSeed = new Move({ name: "Bullet Seed" });
  const gearGrind = new Move({ name: "Gear Grind" });
  const tripleKick = new Move({ name: "Triple Kick" });
  const beatUp = new Move({ name: "Beat Up" });
  expect(noMove.maxHits()).toBe(0);
  expect(tackle.maxHits()).toBe(1);
  expect(bulletSeed.maxHits()).toBe(5);
  expect(gearGrind.maxHits()).toBe(2);
  expect(tripleKick.maxHits()).toBe(3);
  expect(beatUp.maxHits()).toBe(1);
});

test("#hitsMultipleTimes()", () => {
  const bulletSeed = new Move({ name: "Bullet Seed" });
  const gearGrind = new Move({ name: "Gear Grind" });
  const tripleKick = new Move({ name: "Triple Kick" });
  expect(noMove.hitsMultipleTimes()).toBe(false);
  expect(tackle.hitsMultipleTimes()).toBe(false);
  expect(bulletSeed.hitsMultipleTimes()).toBe(true);
  expect(gearGrind.hitsMultipleTimes()).toBe(true);
  expect(tripleKick.hitsMultipleTimes()).toBe(true);
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

  for (const gen of [Generation.GSC, Generation.ADV]) {
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
  function changeGen(gen: Generation) {
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

  changeGen(Generation.ORAS);
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

  changeGen(Generation.B2W2);
  expect(steamroller.boostedByMinimize()).toBe(true);
  changeGen(Generation.HGSS);
  expect(steamroller.boostedByMinimize()).toBe(false);
  for (const gen of [Generation.B2W2, Generation.HGSS]) {
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

  changeGen(Generation.ADV);
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

  changeGen(Generation.GSC);
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
  expect(returnMove.optimalHappiness()).toBe(255);
  expect(frustration.optimalHappiness()).toBe(0);
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
  const isMaxIv = (iv: number) => iv === 30 || iv === 31;
  for (const type of types) {
    for (const ivs of Move.hiddenPowers(type, Generation.B2W2)) {
      expect(ivs.every(isMaxIv)).toBe(true);
      expect(Move.hiddenPowerType(ivs, Generation.B2W2)).toBe(type);
      expect(Move.hiddenPowerBp(ivs, Generation.B2W2)).toBe(70);
    }
    for (const ivs of Move.hiddenPowers(type, Generation.GSC)) {
      expect(Move.hiddenPowerType(ivs, Generation.GSC)).toBe(type);
      expect(Move.hiddenPowerBp(ivs, Generation.GSC)).toBe(70);
    }
  }
});

test(".hiddenPowerBp()", () => {
  const base70: StatList[] = [
    [0b11111, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111],
    [0b11110, 0b01111, 0b10111, 0b00010, 0b01010, 0b10111],
    [0b11011, 0b00111, 0b11111, 0b00011, 0b10011, 0b10111],
    [0b10111, 0b10011, 0b11110, 0b10111, 0b10111, 0b11011],
    [0b01111, 0b10111, 0b10111, 0b11011, 0b11011, 0b10110]
  ];

  for (const ivs of base70) {
    expect(Move.hiddenPowerBp(ivs, Generation.B2W2)).toBe(70);
    expect(Move.hiddenPowerBp(ivs, Generation.ORAS)).toBe(60);
  }

  const notBase70: StatList[] = [
    [0b11101, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111],
    [0b11110, 0b01101, 0b10111, 0b00010, 0b01010, 0b10111],
    [0b11011, 0b00111, 0b11101, 0b00011, 0b10011, 0b10111],
    [0b10111, 0b10011, 0b11110, 0b10101, 0b10111, 0b11011],
    [0b01111, 0b10111, 0b10111, 0b11011, 0b11001, 0b10100]
  ];

  for (const ivs of notBase70) {
    expect(Move.hiddenPowerBp(ivs, Generation.B2W2)).not.toBe(70);
    expect(Move.hiddenPowerBp(ivs, Generation.ORAS)).toBe(60);
  }

  const base70Gen2: StatList[] = [
    [NaN, 0x8, 0x9, 0xa | 0x3, NaN, 0xc],
    [NaN, 0xd, 0xe, 0xf | 0x3, NaN, 0x8],
    [NaN, 0xf, 0xa, 0xc | 0x3, NaN, 0x8],
    [NaN, 0xd, 0x8, 0xa | 0x3, NaN, 0x9],
    [NaN, 0x8, 0x8, 0x8 | 0x3, NaN, 0x8]
  ];

  for (const ivs of base70Gen2) {
    expect(Move.hiddenPowerBp(ivs, Generation.GSC)).toBe(70);
  }

  const notBase70Gen2: StatList[] = [
    [NaN, 0x7, 0x8, 0x8 & ~0x3, NaN, 0x8],
    [NaN, 0xa, 0xf, 0xd & ~0x3, NaN, 0xc],
    [NaN, 0xf, 0xa, 0xc & ~0x3, NaN, 0x5],
    [NaN, 0x0, 0x0, 0x0 & ~0x3, NaN, 0x0],
    [NaN, 0xf, 0xf, 0x7 & ~0x3, NaN, 0xf]
  ];

  for (const ivs of notBase70Gen2) {
    expect(Move.hiddenPowerBp(ivs, Generation.GSC)).toBeLessThan(70);
  }
});

test(".hiddenPowerType()", () => {
  expect(Move.hiddenPowerType([31, 31, 31, 31, 31, 31], Generation.ADV)).toBe(
    Type.DARK
  );
  expect(Move.hiddenPowerType([31, 30, 30, 31, 31, 31], Generation.ADV)).toBe(
    Type.ICE
  );
  expect(Move.hiddenPowerType([31, 30, 31, 30, 31, 30], Generation.ADV)).toBe(
    Type.FIRE
  );
  expect(Move.hiddenPowerType([31, 30, 31, 30, 31, 31], Generation.ADV)).toBe(
    Type.GRASS
  );

  expect(Move.hiddenPowerType([NaN, 15, 15, 15, NaN, 15], Generation.GSC)).toBe(
    Type.DARK
  );
  expect(Move.hiddenPowerType([NaN, 15, 13, 15, NaN, 15], Generation.GSC)).toBe(
    Type.ICE
  );
  expect(Move.hiddenPowerType([NaN, 13, 13, 15, NaN, 15], Generation.GSC)).toBe(
    Type.BUG
  );
  expect(Move.hiddenPowerType([NaN, 14, 13, 15, NaN, 15], Generation.GSC)).toBe(
    Type.WATER
  );
});

test.each<[number, number, number]>([
  // prettier-ignore
  [1, 100, 200],
  [4, 100, 200],
  [5, 100, 150],
  [10, 100, 150],
  [11, 100, 100],
  [20, 100, 100],
  [21, 100, 80],
  [35, 100, 80],
  [36, 100, 40],
  [68, 100, 40],
  [69, 100, 20],
  [100, 100, 20]
])(".flail(%p, %p)", (currentHp, maxHp, expected) => {
  expect(Move.flail(currentHp, maxHp, Generation.B2W2)).toBe(expected);
});

test.each<[number, number, number]>([
  // prettier-ignore
  [1, 100, 200],
  [3, 100, 200],
  [4, 100, 150],
  [9, 100, 150],
  [10, 100, 100],
  [20, 100, 100],
  [21, 100, 80],
  [34, 100, 80],
  [35, 100, 40],
  [67, 100, 40],
  [68, 100, 20],
  [100, 100, 20]
])(".flail(%p, %p, Generation.HGSS)", (currentHp, maxHp, expected) => {
  expect(Move.flail(currentHp, maxHp, Generation.HGSS)).toBe(expected);
});

test.each<[number, number]>([
  // prettier-ignore
  [4, 10],
  [5, 30],
  [6, 50],
  [7, 70],
  [8, 90],
  [9, 110],
  [10, 150]
])(".magnitude(%p)", (magnitude, expected) => {
  expect(Move.magnitude(magnitude)).toBe(expected);
});

test(".weatherBall()", () => {
  expect(Move.weatherBall(Weather.CLEAR)).toBe(Type.NORMAL);
  expect(Move.weatherBall(Weather.SUN)).toBe(Type.FIRE);
  expect(Move.weatherBall(Weather.RAIN)).toBe(Type.WATER);
  expect(Move.weatherBall(Weather.SAND)).toBe(Type.ROCK);
  expect(Move.weatherBall(Weather.HAIL)).toBe(Type.ICE);
  expect(Move.weatherBall(Weather.HARSH_SUN)).toBe(Type.FIRE);
  expect(Move.weatherBall(Weather.HEAVY_RAIN)).toBe(Type.WATER);
  expect(Move.weatherBall(Weather.STRONG_WINDS)).toBe(Type.NORMAL);
});

test.each<[number, number]>([
  // prettier-ignore
  [0, 200],
  [1, 80],
  [2, 60],
  [3, 50],
  [4, 40],
  [5, 40],
  [6, 40]
])(".trumpCard(%p)", (ppLeft, expected) => {
  expect(Move.trumpCard(ppLeft)).toBe(expected);
});

test.each<[number, number, number]>([
  // prettier-ignore
  [100, 20000, 40],
  [100, 101, 40],
  [100, 100, 60],
  [100, 51, 60],
  [100, 50, 80],
  [100, 34, 80],
  [100, 33, 120],
  [100, 26, 120],
  [100, 25, 150],
  [100, 1, 150],
  [100, 0, 150]
])(".electroBall(%p, %p)", (userSpeed, targetSpeed, expected) => {
  expect(Move.electroBall(userSpeed, targetSpeed)).toBe(expected);
});

test(".gyroBall()", () => {
  expect(Move.gyroBall(0, 100)).toBe(150);
  expect(Move.gyroBall(1, 100)).toBe(150);
  expect(Move.gyroBall(25, 100)).toBe(100);
  expect(Move.gyroBall(26, 100)).toBeLessThan(150);
  expect(Move.gyroBall(100, 100)).toBe(25);
  expect(Move.gyroBall(101, 100)).toBeLessThan(25);
  expect(Move.gyroBall(500, 100)).toBe(5);
  expect(Move.gyroBall(501, 100)).toBeLessThan(5);
  expect(Move.gyroBall(2500, 100)).toBe(1);
});

test.each<[number, number]>([
  // prettier-ignore
  [200000, 120],
  [2000, 120],
  [1999, 100],
  [1000, 100],
  [999, 80],
  [500, 80],
  [499, 60],
  [250, 60],
  [249, 40],
  [100, 40],
  [99, 20],
  [1, 20],
  [0, 20]
])(".grassKnot(%p)", (targetWeight, expected) => {
  expect(Move.grassKnot(targetWeight)).toBe(expected);
});

test.each<[number, number, number]>([
  // prettier-ignore
  [100, 1, 120],
  [100, 20, 120],
  [100, 21, 100],
  [100, 25, 100],
  [100, 26, 80],
  [100, 33, 80],
  [100, 34, 60],
  [100, 50, 60],
  [100, 51, 40],
  [100, 100, 40]
])(".heavySlam(%p, %p)", (userWeight, targetWeight, expected) => {
  expect(Move.heavySlam(userWeight, targetWeight)).toBe(expected);
});

test.each<[BoostList, number]>([
  // prettier-ignore
  [[NaN, 0, 0, 0, 0, 0, 0, 0], 60],
  [[NaN, -3, 0, 0, 0, 0, -5, 0], 60],
  [[NaN, 1, 0, 0, 0, 0, 0, 0], 80],
  [[NaN, 0, 0, 0, 0, 0, 1, 1], 100],
  [[NaN, 1, 0, 0, 0, 0, 2, 0], 120],
  [[NaN, 0, 0, 0, 0, -3, 3, 0], 120]
])(".punishment(%p)", (statBoosts, expected) => {
  expect(Move.punishment(statBoosts)).toBe(expected);
});

test.each<[BoostList, number]>([
  // prettier-ignore
  [[NaN, 0, 0, 0, 0, 0, 0, 0], 20],
  [[NaN, -3, 0, 0, 0, 0, -5, 0], 20],
  [[NaN, 1, 0, 0, 0, 0, 0, 0], 40],
  [[NaN, 0, 0, 0, 0, 0, 1, 1], 60],
  [[NaN, 1, 0, 0, 0, 0, 2, 0], 80],
  [[NaN, 6, 6, 6, 6, 6, 6, 6], 860]
])(".storedPower(%p)", (statBoosts, expected) => {
  expect(Move.storedPower(statBoosts)).toBe(expected);
});

test.each<[number, number]>([
  // prettier-ignore
  [0, 102],
  [5, 100],
  [250, 2],
  [251, 1],
  [255, 1]
])(".frustration(%p)", (happiness, expected) => {
  expect(Move.frustration(happiness)).toBe(expected);
});

test.each<[number, number]>([
  // prettier-ignore
  [255, 102],
  [250, 100],
  [5, 2],
  [2, 1],
  [0, 1]
])(".return(%p)", (happiness, expected) => {
  expect(Move.return(happiness)).toBe(expected);
});

test.each<[number, number, number]>([
  // prettier-ignore
  [100, 100, 150],
  [1, 300, 1],
  [1, 2, 75],
  [1, 3, 50]
])(".eruption(%p, %p)", (currentHp, maxHp, expected) => {
  expect(Move.eruption(currentHp, maxHp)).toBe(expected);
});
