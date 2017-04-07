import Move from "../src/Move";
import {DamageClasses, Types, Weathers, Gens, maxGen} from "../src/utilities";

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
    let psystrike;
    let secretSword;
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
        struggle = new Move("Struggle");
        tackle = new Move("Tackle");
        gust = new Move("Gust");
        hiddenPower = new Move("Hidden Power");
        bulletSeed = new Move("Bullet Seed");
        sheerCold = new Move("Sheer Cold");
        leer = new Move("Leer");
        psyshock = new Move("Psyshock");
        psystrike = new Move("Psystrike");
        secretSword = new Move("Secret Sword");
        doubleEdge = new Move("Double-Edge");
        absorb = new Move("Absorb");
        machPunch = new Move("Mach Punch");
        ironHead = new Move("Iron Head");
        fakeOut = new Move("Fake Out");
        ancientPower = new Move("Ancient Power");
        blazeKick = new Move("Blaze Kick");
        chatter = new Move("Chatter");
        psychic = new Move("Psychic");
        overheat = new Move("Overheat");
        spore = new Move("Spore");
        bite = new Move("Bite");
        dragonPulse = new Move("Dragon Pulse");
        shadowBall = new Move("Shadow Ball");
        rockWrecker = new Move("Rock Wrecker");
        gearGrind = new Move("Gear Grind");
        tripleKick = new Move("Triple Kick");
        beatUp = new Move("Beat Up");
        surf = new Move("Surf");
        eruption = new Move("Eruption");
        jumpKick = new Move("Jump Kick");
        highJumpKick = new Move("High Jump Kick");
        reversal = new Move("Reversal");
        doomDesire = new Move("Doom Desire");
        explosion = new Move("Explosion");
    });

    test("#constructor()", () => {
        const move1 = new Move("Pound");
        expect(move1.id).toEqual(1);
        expect(move1.gen).toEqual(maxGen);

        const move2 = new Move("Pay Day", 3);
        expect(move2.id).toEqual(6);
        expect(move2.gen).toEqual(3);

        const move3 = new Move({name: "Pound"});
        expect(move3.id).toEqual(1);
        expect(move3.gen).toEqual(maxGen);

        const move4 = new Move({
            name: "Pay Day",
            gen: 3
        });
        expect(move4.id).toEqual(6);
        expect(move4.gen).toEqual(3);

        const move5 = new Move({
            id: 6,
            gen: 4
        });
        expect(move5.id).toEqual(6);
        expect(move5.gen).toEqual(4);
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
    });

    test("#power()", () => {
        expect(noMove.power()).toEqual(0);
        expect(sheerCold.power()).toEqual(1);
        expect(leer.power()).toEqual(0);
        expect(struggle.power()).toEqual(50);
        expect(tackle.power()).toEqual(40);

        tackle.gen = 6;
        expect(tackle.power()).toEqual(50);

        tackle.gen = 4;
        expect(tackle.power()).toEqual(35);
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
        expect(overheat.isContact()).toBeTruthy();
    });

    test.skip("#isContact()", () => {
        ancientPower.gen = 3;
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

    test(".hiddenPowers()", () => {
        const isMaxIv = iv => iv === 30 || iv === 31;
        for (const typeId in Types) {
            const type = Types[typeId];
            for (const ivs of Move.hiddenPowers(type, 5)) {
                expect(ivs.every(isMaxIv)).toBeTruthy();
                expect(Move.hiddenPowerType(ivs, 5)).toEqual(type);
                expect(Move.hiddenPowerBp(ivs, 5)).toEqual(70);
            }
            for (const ivs of Move.hiddenPowers(type, 2)) {
                expect(Move.hiddenPowerType(ivs, 2)).toEqual(type);
                expect(Move.hiddenPowerBp(ivs, 2)).toEqual(70);
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
            expect(Move.hiddenPowerBp(ivs, 5)).toEqual(70);
            expect(Move.hiddenPowerBp(ivs, 6)).toEqual(60);
        }

        const notBase70 = [
            [0b11101, 0b11111, 0b11111, 0b11111, 0b11111, 0b11111],
            [0b11110, 0b01101, 0b10111, 0b00010, 0b01010, 0b10111],
            [0b11011, 0b00111, 0b11101, 0b00011, 0b10011, 0b10111],
            [0b10111, 0b10011, 0b11110, 0b10101, 0b10111, 0b11011],
            [0b01111, 0b10111, 0b10111, 0b11011, 0b11001, 0b10100]
        ];

        for (const ivs of notBase70) {
            expect(Move.hiddenPowerBp(ivs, 5)).not.toEqual(70);
            expect(Move.hiddenPowerBp(ivs, 6)).toEqual(60);
        }

        const base70Gen2 = [
            [NaN, 0x8, 0x9, 0xA | 0x3, NaN, 0xC],
            [NaN, 0xD, 0xE, 0xF | 0x3, NaN, 0x8],
            [NaN, 0xF, 0xA, 0xC | 0x3, NaN, 0x8],
            [NaN, 0xD, 0x8, 0xA | 0x3, NaN, 0x9],
            [NaN, 0x8, 0x8, 0x8 | 0x3, NaN, 0x8]
        ];

        for (const ivs of base70Gen2) {
            expect(Move.hiddenPowerBp(ivs, 2)).toEqual(70);
        }

        const notBase70Gen2 = [
            [NaN, 0x7, 0x8, 0x8 & !0x3, NaN, 0x8],
            [NaN, 0xA, 0xF, 0xD & !0x3, NaN, 0xC],
            [NaN, 0xF, 0xA, 0xC & !0x3, NaN, 0x5],
            [NaN, 0x0, 0x0, 0x0 & !0x3, NaN, 0x0],
            [NaN, 0xF, 0xF, 0x7 & !0x3, NaN, 0xF]
        ];

        for (const ivs of notBase70Gen2) {
            expect(Move.hiddenPowerBp(ivs, 2)).toBeLessThan(70);
        }
    });

    test(".hiddenPowerType()", () => {
        expect(Move.hiddenPowerType([31, 31, 31, 31, 31, 31]))
            .toEqual(Types.DARK);
        expect(Move.hiddenPowerType([31, 30, 30, 31, 31, 31]))
            .toEqual(Types.ICE);
        expect(Move.hiddenPowerType([31, 30, 31, 30, 31, 30]))
            .toEqual(Types.FIRE);
        expect(Move.hiddenPowerType([31, 30, 31, 30, 31, 31]))
            .toEqual(Types.GRASS);

        expect(Move.hiddenPowerType([NaN, 15, 15, 15, NaN, 15], 2))
            .toEqual(Types.DARK);
        expect(Move.hiddenPowerType([NaN, 15, 13, 15, NaN, 15], 2))
            .toEqual(Types.ICE);
        expect(Move.hiddenPowerType([NaN, 13, 13, 15, NaN, 15], 2))
            .toEqual(Types.BUG);
        expect(Move.hiddenPowerType([NaN, 14, 13, 15, NaN, 15], 2))
            .toEqual(Types.WATER);
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

        expect(Move.flail(1, 100, 4)).toEqual(200);
        expect(Move.flail(3, 100, 4)).toEqual(200);
        expect(Move.flail(4, 100, 4)).toEqual(150);
        expect(Move.flail(9, 100, 4)).toEqual(150);
        expect(Move.flail(10, 100, 4)).toEqual(100);
        expect(Move.flail(20, 100, 4)).toEqual(100);
        expect(Move.flail(21, 100, 4)).toEqual(80);
        expect(Move.flail(34, 100, 4)).toEqual(80);
        expect(Move.flail(35, 100, 4)).toEqual(40);
        expect(Move.flail(67, 100, 4)).toEqual(40);
        expect(Move.flail(68, 100, 4)).toEqual(20);
        expect(Move.flail(100, 100, 4)).toEqual(20);
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
