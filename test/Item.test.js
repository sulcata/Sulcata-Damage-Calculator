import Item from "../src/Item";
import {Types, maxGen} from "../src/utilities";

describe("Item", () => {
    let invalidItem;
    let noItem;
    let chopleBerry;
    let chilanBerry;
    let mysticWater;
    let zapPlate;
    let normalGem;
    let charizarditeX;
    let altarianite;
    let ironBall;
    let luxuryBall;
    let sitrusBerry;
    let berry;
    let oranBerry;
    let figyBerry;
    let goldBerry;

    beforeEach(() => {
        invalidItem = new Item({id: -314});
        noItem = new Item();
        chopleBerry = new Item("Chople Berry");
        chilanBerry = new Item("Chilan Berry");
        mysticWater = new Item("Mystic Water");
        zapPlate = new Item("Zap Plate");
        normalGem = new Item("Normal Gem");
        charizarditeX = new Item("Charizardite X");
        altarianite = new Item("Altarianite");
        ironBall = new Item("Iron Ball");
        luxuryBall = new Item("Luxury Ball");
        sitrusBerry = new Item("Sitrus Berry");
        berry = new Item("Berry");
        oranBerry = new Item("Oran Berry");
        figyBerry = new Item("Figy Berry");
        goldBerry = new Item("Gold Berry");
    });

    test("#constructor()", () => {
        const item1 = new Item("Leftovers");
        expect(item1.id).toEqual(15);
        expect(item1.used).toBeFalsy();
        expect(item1.disabled).toBeFalsy();
        expect(item1.gen).toEqual(maxGen);

        const item2 = new Item({
            name: "Leftovers",
            disabled: true
        });
        expect(item2.id).toEqual(15);
        expect(item2.used).toBeFalsy();
        expect(item2.disabled).toBeTruthy();
        expect(item2.gen).toEqual(maxGen);

        const item3 = new Item({
            id: 15,
            used: true,
            gen: 2
        });
        expect(item3.id).toEqual(15);
        expect(item3.used).toBeTruthy();
        expect(item3.disabled).toBeFalsy();
        expect(item3.gen).toEqual(2);
    });

    test("#name", () => {
        expect(noItem.name).toEqual("(No Item)");
        expect(chopleBerry.name).toEqual("Chople Berry");

        chopleBerry.disabled = true;
        expect(chopleBerry.name).toEqual("(No Item)");

        chopleBerry.disabled = false;
        chopleBerry.used = true;
        expect(chopleBerry.name).toEqual("(No Item)");

        const item = new Item();
        expect(item.id).toEqual(0);

        item.name = "Leftovers";
        expect(item.id).toEqual(15);

        item.name = "  chople  berry";
        expect(item.id).toEqual(8041);

        item.name = "l eftovers";
        expect(item.id).toEqual(0);
    });

    test("#nonDisabledName()", () => {
        expect(chopleBerry.nonDisabledName()).toEqual("Chople Berry");

        chopleBerry.disabled = true;
        expect(chopleBerry.nonDisabledName()).toEqual("Chople Berry");

        chopleBerry.used = true;
        expect(chopleBerry.nonDisabledName()).toEqual("(No Item)");
    });

    test("#boostedType()", () => {
        expect(mysticWater.boostedType()).toEqual(Types.WATER);
        expect(zapPlate.boostedType()).toEqual(Types.ELECTRIC);
        expect(chopleBerry.boostedType()).toEqual(-1);

        mysticWater.disabled = true;
        expect(mysticWater.boostedType()).toEqual(-1);

        zapPlate.used = true;
        expect(zapPlate.boostedType()).toEqual(-1);
    });

    test("#isBerry()", () => {
        expect(mysticWater.isBerry()).toBeFalsy();
        expect(chopleBerry.isBerry()).toBeTruthy();

        chopleBerry.disabled = true;
        expect(chopleBerry.isBerry()).toBeTruthy();

        chopleBerry.used = true;
        expect(chopleBerry.isBerry()).toBeFalsy();
    });

    test("#berryTypeResist()", () => {
        expect(chopleBerry.berryTypeResist()).toEqual(Types.FIGHTING);
        expect(chilanBerry.berryTypeResist()).toEqual(Types.NORMAL);
        expect(noItem.berryTypeResist()).toEqual(-1);

        chopleBerry.disabled = true;
        expect(chopleBerry.berryTypeResist()).toEqual(-1);

        chilanBerry.used = true;
        expect(chilanBerry.berryTypeResist()).toEqual(-1);
    });

    test("#naturalGiftPower()", () => {
        expect(noItem.naturalGiftPower()).toEqual(0);
        expect(chopleBerry.naturalGiftPower()).toEqual(80);

        chopleBerry.gen = 5;
        expect(chopleBerry.naturalGiftPower()).toEqual(60);

        chopleBerry.disabled = true;
        expect(chopleBerry.naturalGiftPower()).toEqual(0);

        chilanBerry.used = true;
        expect(chilanBerry.naturalGiftPower()).toEqual(0);
    });

    test("#naturalGiftType()", () => {
        expect(noItem.naturalGiftType()).toEqual(-1);
        expect(chopleBerry.naturalGiftType()).toEqual(Types.FIGHTING);

        chopleBerry.disabled = true;
        expect(chopleBerry.naturalGiftType()).toEqual(-1);

        chilanBerry.used = true;
        expect(chilanBerry.naturalGiftType()).toEqual(-1);
    });

    test("#flingPower()", () => {
        expect(noItem.flingPower()).toEqual(0);
        expect(chopleBerry.flingPower()).toEqual(10);
        expect(zapPlate.flingPower()).toEqual(90);

        chopleBerry.disabled = true;
        expect(chopleBerry.flingPower()).toEqual(0);

        zapPlate.used = true;
        expect(zapPlate.flingPower()).toEqual(0);
    });

    test("#gemType()", () => {
        expect(normalGem.gemType()).toEqual(Types.NORMAL);
        expect(noItem.gemType()).toEqual(-1);

        normalGem.disabled = true;
        expect(normalGem.gemType()).toEqual(-1);

        normalGem.disabled = false;
        normalGem.used = true;
        expect(normalGem.gemType()).toEqual(-1);
    });

    test("#megaPokeNum()", () => {
        expect(noItem.megaPokeNum()).toBeNull();
        expect(charizarditeX.megaPokeNum()).toEqual(6);
        expect(altarianite.megaPokeNum()).toEqual(334);

        charizarditeX.disabled = true;
        expect(charizarditeX.megaPokeNum()).toEqual(6);

        altarianite.disabled = false;
        altarianite.used = true;
        expect(altarianite.megaPokeNum()).toBeNull();
    });

    test("#megaPokeForm()", () => {
        expect(noItem.megaPokeForm()).toBeNull();
        expect(charizarditeX.megaPokeForm()).toEqual(1);
        expect(altarianite.megaPokeForm()).toEqual(1);

        charizarditeX.disabled = true;
        expect(charizarditeX.megaPokeForm()).toEqual(1);

        altarianite.disabled = false;
        altarianite.used = true;
        expect(altarianite.megaPokeForm()).toBeNull();
    });

    test("#megaPoke()", () => {
        expect(invalidItem.megaPoke()).toBeNull();
        expect(noItem.megaPoke()).toBeNull();
        expect(charizarditeX.megaPoke()).toEqual("6:1");
        expect(altarianite.megaPoke()).toEqual("334:1");

        charizarditeX.disabled = true;
        expect(charizarditeX.megaPoke()).toEqual("6:1");

        altarianite.disabled = false;
        altarianite.used = true;
        expect(altarianite.megaPoke()).toBeNull();
    });

    test("#plateType()", () => {
        expect(zapPlate.plateType()).toEqual(Types.ELECTRIC);
        expect(mysticWater.plateType()).toEqual(-1);

        zapPlate.disabled = true;
        expect(zapPlate.plateType()).toEqual(-1);

        zapPlate.disabled = false;
        zapPlate.used = true;
        expect(zapPlate.plateType()).toEqual(-1);
    });

    test("#isHeavy()", () => {
        expect(noItem.isHeavy()).toBeFalsy();
        expect(ironBall.isHeavy()).toBeTruthy();

        ironBall.disabled = true;
        expect(ironBall.isHeavy()).toBeTruthy();

        ironBall.disabled = false;
        ironBall.used = true;
        expect(ironBall.isHeavy()).toBeFalsy();
    });

    test("#isUseful()", () => {
        expect(noItem.isUseful()).toBeFalsy();
        expect(ironBall.isUseful()).toBeTruthy();
        expect(luxuryBall.isUseful()).toBeFalsy();
    });

    test("#berryHeal()", () => {
        expect(sitrusBerry.berryHeal(27)).toEqual(6);
        expect(berry.berryHeal(27)).toEqual(10);
        expect(oranBerry.berryHeal(27)).toEqual(10);
        expect(figyBerry.berryHeal(27)).toEqual(3);
        expect(goldBerry.berryHeal(27)).toEqual(30);

        sitrusBerry.gen = 3;
        expect(sitrusBerry.berryHeal()).toEqual(30);

        berry.disabled = true;
        expect(berry.berryHeal()).toEqual(0);

        oranBerry.used = true;
        expect(oranBerry.berryHeal()).toEqual(0);
    });
});
