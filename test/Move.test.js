import Move from "../src/Move";
import { DamageClasses, Types, Weathers, Gens, maxGen } from "../src/utilities";

describe("Move", () => {
  let invalidMove;
  let noMove;
  let struggle;
  let tackle;
  let gust;
  let hiddenPower;
  let bulletSeed;
  let sheerCold;
  let leer;
  let psyshock;
  let doubleEdge;
  let absorb;
  let machPunch;
  let ironHead;
  let fakeOut;
  let ancientPower;
  let blazeKick;
  let chatter;
  let psychic;
  let overheat;
  let spore;
  let bite;
  let dragonPulse;
  let shadowBall;
  let rockWrecker;
  let gearGrind;
  let tripleKick;
  let beatUp;
  let surf;
  let eruption;
  let jumpKick;
  let highJumpKick;
  let reversal;
  let doomDesire;
  let explosion;

  beforeEach(() => {
    invalidMove = new Move();
    invalidMove.id = -2718;
    noMove = new Move();
    struggle = new Move({ name: "Struggle" });
    tackle = new Move({ name: "Tackle" });
    gust = new Move({ name: "Gust" });
    hiddenPower = new Move({ name: "Hidden Power" });
    bulletSeed = new Move({ name: "Bullet Seed" });
    sheerCold = new Move({ name: "Sheer Cold" });
    leer = new Move({ name: "Leer" });
    psyshock = new Move({ name: "Psyshock" });
    doubleEdge = new Move({ name: "Double-Edge" });
    absorb = new Move({ name: "Absorb" });
    machPunch = new Move({ name: "Mach Punch" });
    ironHead = new Move({ name: "Iron Head" });
    fakeOut = new Move({ name: "Fake Out" });
    ancientPower = new Move({ name: "Ancient Power" });
    blazeKick = new Move({ name: "Blaze Kick" });
    chatter = new Move({ name: "Chatter" });
    psychic = new Move({ name: "Psychic" });
    overheat = new Move({ name: "Overheat" });
    spore = new Move({ name: "Spore" });
    bite = new Move({ name: "Bite" });
    dragonPulse = new Move({ name: "Dragon Pulse" });
    shadowBall = new Move({ name: "Shadow Ball" });
    rockWrecker = new Move({ name: "Rock Wrecker" });
    gearGrind = new Move({ name: "Gear Grind" });
    tripleKick = new Move({ name: "Triple Kick" });
    beatUp = new Move({ name: "Beat Up" });
    surf = new Move({ name: "Surf" });
    eruption = new Move({ name: "Eruption" });
    jumpKick = new Move({ name: "Jump Kick" });
    highJumpKick = new Move({ name: "High Jump Kick" });
    reversal = new Move({ name: "Reversal" });
    doomDesire = new Move({ name: "Doom Desire" });
    explosion = new Move({ name: "Explosion" });
  });

  test("#constructor()", () => {
    const move1 = new Move({ name: "Pound" });
    expect(move1.id).toEqual(1);
    expect(move1.gen).toEqual(maxGen);

    const move2 = new Move({ name: "Pay Day", gen: Gens.ADV });
    expect(move2.id).toEqual(6);
    expect(move2.gen).toEqual(3);

    const move3 = new Move({ id: 6 });
    expect(move3.id).toEqual(6);
  });

  test("#name", () => {
    expect(noMove.name).toEqual("(No Move)");
    expect(tackle.name).toEqual("Tackle");

    const move1 = new Move();
    move1.name = "Tackle";
    expect(move1.id).toEqual(33);

    const move2 = new Move();
    move2.name = " bullet   seed    ";
    expect(move2.id).toEqual(331);

    const move3 = new Move();
    move3.name = "b ullet seed";
    expect(move3.id).toEqual(0);

    doubleEdge.zMove = true;
    expect(doubleEdge.name).toEqual("Breakneck Blitz");
  });

  describe("#power()", () => {
    test("basic tests", () => {
      expect(noMove.power()).toEqual(0);
      expect(sheerCold.power()).toEqual(1);
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
      doubleEdge.zMove = true;
      expect(doubleEdge.power()).toEqual(190);
    });
  });

  test("#damageClass()", () => {
    expect(noMove.damageClass()).toEqual(DamageClasses.OTHER);
    expect(tackle.damageClass()).toEqual(DamageClasses.PHYSICAL);
    expect(struggle.damageClass()).toEqual(DamageClasses.PHYSICAL);
    expect(gust.damageClass()).toEqual(DamageClasses.SPECIAL);
    expect(hiddenPower.damageClass()).toEqual(DamageClasses.SPECIAL);
  });

  test("#isPhysical()", () => {
    expect(noMove.isPhysical()).toBeFalsy();
    expect(tackle.isPhysical()).toBeTruthy();
    expect(struggle.isPhysical()).toBeTruthy();
    expect(gust.isPhysical()).toBeFalsy();
    expect(hiddenPower.isPhysical()).toBeFalsy();
  });

  test("#isSpecial()", () => {
    expect(noMove.isSpecial()).toBeFalsy();
    expect(tackle.isSpecial()).toBeFalsy();
    expect(struggle.isSpecial()).toBeFalsy();
    expect(gust.isSpecial()).toBeTruthy();
    expect(hiddenPower.isSpecial()).toBeTruthy();
  });

  test("#isPsyshockLike()", () => {
    const psystrike = new Move({ name: "Psystrike" });
    const secretSword = new Move({ name: "Secret Sword" });
    expect(psyshock.isPsyshockLike()).toBeTruthy();
    expect(psystrike.isPsyshockLike()).toBeTruthy();
    expect(secretSword.isPsyshockLike()).toBeTruthy();
    expect(noMove.isPsyshockLike()).toBeFalsy();
    expect(gust.isPsyshockLike()).toBeFalsy();
  });

  test("#type()", () => {
    expect(psyshock.type()).toEqual(Types.PSYCHIC);
    expect(struggle.type()).toEqual(Types.CURSE);
    expect(hiddenPower.type()).toEqual(Types.NORMAL);
  });

  test("#hasRecoil()", () => {
    expect(psyshock.hasRecoil()).toBeFalsy();
    expect(doubleEdge.hasRecoil()).toBeTruthy();
    expect(absorb.hasRecoil()).toBeFalsy();
    expect(noMove.hasRecoil()).toBeFalsy();
    expect(struggle.hasRecoil()).toBeFalsy();
  });

  test("#isPunch()", () => {
    expect(machPunch.isPunch()).toBeTruthy();
    expect(tackle.isPunch()).toBeFalsy();
    expect(noMove.isPunch()).toBeFalsy();
  });

  test("#flinchChance()", () => {
    expect(ironHead.flinchChance()).toEqual(30);
    expect(fakeOut.flinchChance()).toEqual(100);
    expect(noMove.flinchChance()).toEqual(0);
    expect(tackle.flinchChance()).toEqual(0);

    expect(
      new Move({
        name: "Low Kick",
        gen: Gens.RBY
      }).flinchChance()
    ).toBeGreaterThan(0);
    expect(
      new Move({
        name: "Low Kick",
        gen: Gens.GSC
      }).flinchChance()
    ).toBeGreaterThan(0);
    expect(
      new Move({
        name: "Low Kick",
        gen: Gens.ADV
      }).flinchChance()
    ).toEqual(0);
  });

  test("#affectedBySheerForce()", () => {
    expect(ironHead.affectedBySheerForce()).toBeTruthy();
    expect(ancientPower.affectedBySheerForce()).toBeTruthy();
    expect(blazeKick.affectedBySheerForce()).toBeTruthy();
    expect(chatter.affectedBySheerForce()).toBeTruthy();
    expect(psychic.affectedBySheerForce()).toBeTruthy();
    expect(noMove.affectedBySheerForce()).toBeFalsy();
    expect(tackle.affectedBySheerForce()).toBeFalsy();
  });

  test("#isContact()", () => {
    expect(tackle.isContact()).toBeTruthy();
    expect(noMove.isContact()).toBeFalsy();
    expect(leer.isContact()).toBeFalsy();
    expect(struggle.isContact()).toBeTruthy();
    expect(overheat.isContact()).toBeFalsy();
    expect(ancientPower.isContact()).toBeFalsy();

    overheat.gen = 3;
    ancientPower.gen = 3;
    expect(overheat.isContact()).toBeTruthy();
    expect(ancientPower.isContact()).toBeTruthy();
  });

  test("#isSound()", () => {
    expect(chatter.isSound()).toBeTruthy();
    expect(noMove.isSound()).toBeFalsy();
    expect(tackle.isSound()).toBeFalsy();
  });

  test("#isPowder()", () => {
    expect(spore.isPowder()).toBeTruthy();
    expect(noMove.isPowder()).toBeFalsy();
    expect(tackle.isPowder()).toBeFalsy();
  });

  test("#isBite()", () => {
    expect(bite.isBite()).toBeTruthy();
    expect(noMove.isBite()).toBeFalsy();
    expect(tackle.isBite()).toBeFalsy();
  });

  test("#isPulse()", () => {
    expect(dragonPulse.isPulse()).toBeTruthy();
    expect(noMove.isPulse()).toBeFalsy();
    expect(tackle.isPulse()).toBeFalsy();
  });

  test("#isBall()", () => {
    expect(shadowBall.isBall()).toBeTruthy();
    expect(rockWrecker.isBall()).toBeTruthy();
    expect(noMove.isBall()).toBeFalsy();
    expect(tackle.isBall()).toBeFalsy();
  });

  test("#minHits()", () => {
    expect(noMove.minHits()).toEqual(0);
    expect(tackle.minHits()).toEqual(1);
    expect(bulletSeed.minHits()).toEqual(2);
    expect(gearGrind.minHits()).toEqual(2);
    expect(tripleKick.minHits()).toEqual(3);
    expect(beatUp.minHits()).toEqual(6);
  });

  test("#maxHits()", () => {
    expect(noMove.maxHits()).toEqual(0);
    expect(tackle.maxHits()).toEqual(1);
    expect(bulletSeed.maxHits()).toEqual(5);
    expect(gearGrind.maxHits()).toEqual(2);
    expect(tripleKick.maxHits()).toEqual(3);
    expect(beatUp.maxHits()).toEqual(6);
  });

  test("#hitsMultipleTimes()", () => {
    expect(noMove.hitsMultipleTimes()).toEqual(false);
    expect(tackle.hitsMultipleTimes()).toEqual(false);
    expect(bulletSeed.hitsMultipleTimes()).toEqual(true);
    expect(gearGrind.hitsMultipleTimes()).toEqual(true);
    expect(tripleKick.hitsMultipleTimes()).toEqual(true);
    expect(beatUp.hitsMultipleTimes()).toEqual(true);
  });

  test("#hasMultipleTargets()", () => {
    expect(surf.hasMultipleTargets()).toBeTruthy();
    expect(eruption.hasMultipleTargets()).toBeTruthy();
    expect(tackle.hasMultipleTargets()).toBeFalsy();
    expect(noMove.hasMultipleTargets()).toBeFalsy();
  });

  test("#isOhko()", () => {
    expect(sheerCold.isOhko()).toBeTruthy();
    expect(tackle.isOhko()).toBeFalsy();
    expect(noMove.isOhko()).toBeFalsy();
  });

  test("#requiresRecharge()", () => {
    expect(rockWrecker.requiresRecharge()).toBeTruthy();
    expect(tackle.requiresRecharge()).toBeFalsy();
    expect(noMove.requiresRecharge()).toBeFalsy();
  });

  test("#isRecklessBoosted()", () => {
    expect(doubleEdge.isRecklessBoosted()).toBeTruthy();
    expect(jumpKick.isRecklessBoosted()).toBeTruthy();
    expect(highJumpKick.isRecklessBoosted()).toBeTruthy();
    expect(tackle.isRecklessBoosted()).toBeFalsy();
    expect(noMove.isRecklessBoosted()).toBeFalsy();
    expect(struggle.isRecklessBoosted()).toBeFalsy();
  });

  test("#canCrit()", () => {
    expect(reversal.canCrit()).toBeTruthy();
    expect(doomDesire.canCrit()).toBeTruthy();
    expect(tackle.canCrit()).toBeTruthy();
    expect(noMove.canCrit()).toBeTruthy();
    expect(struggle.canCrit()).toBeTruthy();

    for (let gen = Gens.GSC; gen < Gens.HGSS; gen++) {
      reversal.gen = gen;
      doomDesire.gen = gen;
      tackle.gen = gen;
      noMove.gen = gen;
      struggle.gen = gen;

      expect(reversal.canCrit()).toBeFalsy();
      expect(doomDesire.canCrit()).toBeFalsy();
      expect(tackle.canCrit()).toBeTruthy();
      expect(noMove.canCrit()).toBeTruthy();
      expect(struggle.canCrit()).toBeTruthy();
    }
  });

  test("#affectedByParentalBond()", () => {
    expect(surf.affectedByParentalBond()).toBeTruthy();
    expect(bulletSeed.affectedByParentalBond()).toBeTruthy();
    expect(explosion.affectedByParentalBond()).toBeFalsy();
    expect(tackle.affectedByParentalBond()).toBeTruthy();
    expect(struggle.affectedByParentalBond()).toBeTruthy();
    expect(noMove.affectedByParentalBond()).toBeTruthy();
  });

  test("#weakenedByGrassyTerrain()", () => {
    const earthquake = new Move({ name: "Earthquake" });
    const magnitude = new Move({ name: "Magnitude" });
    const bulldoze = new Move({ name: "Bulldoze" });
    expect(earthquake.weakenedByGrassyTerrain()).toBeTruthy();
    expect(magnitude.weakenedByGrassyTerrain()).toBeTruthy();
    expect(bulldoze.weakenedByGrassyTerrain()).toBeTruthy();
    expect(tackle.weakenedByGrassyTerrain()).toBeFalsy();
  });

  test("#boostedByMinimize()", () => {
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

    expect(gust.boostedByMinimize()).toBeFalsy();

    expect(stomp.boostedByMinimize()).toBeTruthy();
    expect(astonish.boostedByMinimize()).toBeFalsy();
    expect(extrasensory.boostedByMinimize()).toBeFalsy();
    expect(needleArm.boostedByMinimize()).toBeFalsy();
    expect(steamroller.boostedByMinimize()).toBeTruthy();
    expect(bodySlam.boostedByMinimize()).toBeTruthy();
    expect(dragonRush.boostedByMinimize()).toBeTruthy();
    expect(flyingPress.boostedByMinimize()).toBeTruthy();
    expect(shadowForce.boostedByMinimize()).toBeTruthy();
    expect(phantomForce.boostedByMinimize()).toBeTruthy();
    expect(heavySlam.boostedByMinimize()).toBeTruthy();

    changeGen(Gens.ORAS);
    expect(stomp.boostedByMinimize()).toBeTruthy();
    expect(astonish.boostedByMinimize()).toBeFalsy();
    expect(extrasensory.boostedByMinimize()).toBeFalsy();
    expect(needleArm.boostedByMinimize()).toBeFalsy();
    expect(steamroller.boostedByMinimize()).toBeTruthy();
    expect(bodySlam.boostedByMinimize()).toBeTruthy();
    expect(dragonRush.boostedByMinimize()).toBeTruthy();
    expect(flyingPress.boostedByMinimize()).toBeTruthy();
    expect(shadowForce.boostedByMinimize()).toBeTruthy();
    expect(phantomForce.boostedByMinimize()).toBeTruthy();
    expect(heavySlam.boostedByMinimize()).toBeFalsy();

    changeGen(Gens.B2W2);
    expect(steamroller.boostedByMinimize()).toBeTruthy();
    changeGen(Gens.HGSS);
    expect(steamroller.boostedByMinimize()).toBeFalsy();
    for (const gen of [Gens.B2W2, Gens.HGSS]) {
      changeGen(gen);
      expect(stomp.boostedByMinimize()).toBeTruthy();
      expect(astonish.boostedByMinimize()).toBeFalsy();
      expect(extrasensory.boostedByMinimize()).toBeFalsy();
      expect(needleArm.boostedByMinimize()).toBeFalsy();
      expect(bodySlam.boostedByMinimize()).toBeFalsy();
      expect(dragonRush.boostedByMinimize()).toBeFalsy();
      expect(flyingPress.boostedByMinimize()).toBeFalsy();
      expect(shadowForce.boostedByMinimize()).toBeFalsy();
      expect(phantomForce.boostedByMinimize()).toBeFalsy();
      expect(heavySlam.boostedByMinimize()).toBeFalsy();
    }

    changeGen(Gens.ADV);
    expect(stomp.boostedByMinimize()).toBeTruthy();
    expect(astonish.boostedByMinimize()).toBeTruthy();
    expect(extrasensory.boostedByMinimize()).toBeTruthy();
    expect(needleArm.boostedByMinimize()).toBeTruthy();
    expect(steamroller.boostedByMinimize()).toBeFalsy();
    expect(bodySlam.boostedByMinimize()).toBeFalsy();
    expect(dragonRush.boostedByMinimize()).toBeFalsy();
    expect(flyingPress.boostedByMinimize()).toBeFalsy();
    expect(shadowForce.boostedByMinimize()).toBeFalsy();
    expect(phantomForce.boostedByMinimize()).toBeFalsy();
    expect(heavySlam.boostedByMinimize()).toBeFalsy();

    changeGen(Gens.GSC);
    expect(stomp.boostedByMinimize()).toBeTruthy();
    expect(astonish.boostedByMinimize()).toBeFalsy();
    expect(extrasensory.boostedByMinimize()).toBeFalsy();
    expect(needleArm.boostedByMinimize()).toBeFalsy();
    expect(steamroller.boostedByMinimize()).toBeFalsy();
    expect(bodySlam.boostedByMinimize()).toBeFalsy();
    expect(dragonRush.boostedByMinimize()).toBeFalsy();
    expect(flyingPress.boostedByMinimize()).toBeFalsy();
    expect(shadowForce.boostedByMinimize()).toBeFalsy();
    expect(phantomForce.boostedByMinimize()).toBeFalsy();
    expect(heavySlam.boostedByMinimize()).toBeFalsy();
  });

  test("#boostedByDig()", () => {
    const earthquake = new Move({ name: "Earthquake" });
    const magnitude = new Move({ name: "Magnitude" });
    expect(earthquake.boostedByDig()).toBeTruthy();
    expect(magnitude.boostedByDig()).toBeTruthy();
    expect(tackle.boostedByDig()).toBeFalsy();
  });

  test("#boostedByDive()", () => {
    const whirlpool = new Move({ name: "Whirlpool" });
    expect(surf.boostedByDive()).toBeTruthy();
    expect(whirlpool.boostedByDive()).toBeTruthy();
    expect(tackle.boostedByDive()).toBeFalsy();
  });

  test("#boostedByFly()", () => {
    const twister = new Move({ name: "Twister" });
    expect(gust.boostedByFly()).toBeTruthy();
    expect(twister.boostedByFly()).toBeTruthy();
    expect(tackle.boostedByFly()).toBeFalsy();
  });

  test("#usesHappiness()", () => {
    const returnMove = new Move({ name: "Return" });
    const frustration = new Move({ name: "Frustration" });
    expect(returnMove.usesHappiness()).toBeTruthy();
    expect(frustration.usesHappiness()).toBeTruthy();
    expect(tackle.usesHappiness()).toBeFalsy();
  });

  test("#optimalHappiness()", () => {
    const returnMove = new Move({ name: "Return" });
    const frustration = new Move({ name: "Frustration" });
    expect(returnMove.optimalHappiness()).toEqual(255);
    expect(frustration.optimalHappiness()).toEqual(0);
  });

  test("#isUseful()", () => {
    expect(noMove.isUseful()).toBeFalsy();
    expect(leer.isUseful()).toBeFalsy();
    expect(tackle.isUseful()).toBeTruthy();
    expect(hiddenPower.isUseful()).toBeTruthy();
  });

  test(".hiddenPowers()", () => {
    const isMaxIv = iv => iv === 30 || iv === 31;
    for (const type of Object.values(Types)) {
      for (const ivs of Move.hiddenPowers(type, Gens.B2W2)) {
        expect(ivs.every(isMaxIv)).toBeTruthy();
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
});
