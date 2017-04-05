import Ability from "../src/Ability";
import {Types, maxGen} from "../src/utilities";

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
    let multiscale;
    let pixilate;
    let refrigerate;
    let waterAbsorb;
    let stormDrain;
    let sapSipper;
    let levitate;
    let motorDrive;
    let flashFire;
    let drySkin;
    let moldBreaker;
    let turboblaze;
    let teravolt;

    beforeEach(() => {
        noAbility = new Ability();
        swiftSwim = new Ability("Swift Swim");
        sandRush = new Ability("Sand Rush");
        magicGuard = new Ability("Magic Guard");
        overcoat = new Ability("Overcoat");
        sandVeil = new Ability("Sand Veil");
        sandForce = new Ability("Sand Force");
        iceBody = new Ability("Ice Body");
        snowCloak = new Ability("Snow Cloak");
        blaze = new Ability("Blaze");
        swarm = new Ability("Swarm");
        multiscale = new Ability("Multiscale");
        pixilate = new Ability("Pixilate");
        refrigerate = new Ability("Refrigerate");
        waterAbsorb = new Ability("Water Absorb");
        stormDrain = new Ability("Storm Drain");
        sapSipper = new Ability("Sap Sipper");
        levitate = new Ability("Levitate");
        motorDrive = new Ability("Motor Drive");
        flashFire = new Ability("Flash Fire");
        drySkin = new Ability("Dry Skin");
        moldBreaker = new Ability("Mold Breaker");
        turboblaze = new Ability("Turboblaze");
        teravolt = new Ability("Teravolt");
    });

    test("#constructor()", () => {
        const ability1 = new Ability("Effect Spore");
        expect(ability1.id).toEqual(27);

        const ability2 = new Ability({
            name: "Effect Spore",
            disabled: true
        });
        expect(ability2.id).toEqual(27);
        expect(ability2.disabled).toBeTruthy();
        expect(ability2.gen).toEqual(maxGen);

        const ability3 = new Ability({
            id: 27,
            gen: 3
        });
        expect(ability3.id).toEqual(27);
        expect(ability3.disabled).toBeFalsy();
        expect(ability3.gen).toEqual(3);
    });

    test("#name", () => {
        expect(noAbility.name).toEqual("(No Ability)");
        expect(swiftSwim.name).toEqual("Swift Swim");

        swiftSwim.disabled = true;
        expect(swiftSwim.name).toEqual("(No Ability)");

        const ability = new Ability();

        ability.name = "  drought";
        expect(ability.id).toEqual(70);

        ability.name = "Swift Swim";
        expect(ability.id).toEqual(33);

        ability.name = "d  rought";
        expect(ability.id).toEqual(0);
    });

    test("#pinchType", () => {
        expect(blaze.pinchType).toEqual(Types.FIRE);
        expect(swarm.pinchType).toEqual(Types.BUG);
        expect(magicGuard.pinchType).toEqual(-1);
        expect(noAbility.pinchType).toEqual(-1);

        blaze.disabled = true;
        expect(blaze.pinchType).toEqual(-1);
    });

    test("#normalToType", () => {
        expect(pixilate.normalToType).toEqual(Types.FAIRY);
        expect(refrigerate.normalToType).toEqual(Types.ICE);
        expect(noAbility.normalToType).toEqual(-1);

        pixilate.disabled = true;
        expect(pixilate.normalToType).toEqual(-1);
    });

    test("#immunityType", () => {
        expect(noAbility.immunityType).toEqual(-1);
        expect(waterAbsorb.immunityType).toEqual(Types.WATER);
        expect(stormDrain.immunityType).toEqual(Types.WATER);
        expect(sapSipper.immunityType).toEqual(Types.GRASS);
        expect(levitate.immunityType).toEqual(Types.GROUND);
        expect(motorDrive.immunityType).toEqual(Types.ELECTRIC);
        expect(flashFire.immunityType).toEqual(Types.FIRE);
        expect(drySkin.immunityType).toEqual(Types.WATER);

        stormDrain.disabled = true;
        expect(stormDrain.immunityType).toEqual(-1);

        stormDrain.disabled = false;
        stormDrain.gen = 4;
        expect(stormDrain.immunityType).toEqual(-1);

        const invalidAbility = new Ability({id: -1});
        expect(invalidAbility.immunityType).toEqual(-1);
    });

    test("#moldBreaker", () => {
        expect(noAbility.moldBreakerLike).toBeFalsy();
        expect(moldBreaker.moldBreakerLike).toBeTruthy();
        expect(turboblaze.moldBreakerLike).toBeTruthy();
        expect(teravolt.moldBreakerLike).toBeTruthy();

        moldBreaker.disabled = true;
        expect(moldBreaker.moldBreakerLike).toBeFalsy();
    });

    test("#ignorable", () => {
        expect(multiscale.ignorable).toBeTruthy();
        expect(swiftSwim.ignorable).toBeFalsy();
    });

    test("#sandImmunity", () => {
        expect(noAbility.sandImmunity).toBeFalsy();
        expect(magicGuard.sandImmunity).toBeTruthy();
        expect(overcoat.sandImmunity).toBeTruthy();
        expect(sandVeil.sandImmunity).toBeTruthy();
        expect(sandRush.sandImmunity).toBeTruthy();
        expect(sandForce.sandImmunity).toBeTruthy();

        magicGuard.disabled = true;
        expect(magicGuard.sandImmunity).toBeFalsy();
    });

    test("#hailImmunity", () => {
        expect(noAbility.hailImmunity).toBeFalsy();
        expect(magicGuard.hailImmunity).toBeTruthy();
        expect(overcoat.hailImmunity).toBeTruthy();
        expect(iceBody.hailImmunity).toBeTruthy();
        expect(snowCloak.hailImmunity).toBeTruthy();

        magicGuard.disabled = true;
        expect(magicGuard.hailImmunity).toBeFalsy();
    });

    test("#filterLike", () => {
        const filter = new Ability("Filter");
        const solidRock = new Ability("Solid Rock");
        const prismArmor = new Ability("Prism Armor");
        expect(filter.filterLike).toBeTruthy();
        expect(solidRock.filterLike).toBeTruthy();
        expect(prismArmor.filterLike).toBeTruthy();
        expect(noAbility.filterLike).toBeFalsy();
        expect(magicGuard.filterLike).toBeFalsy();
    });
});
