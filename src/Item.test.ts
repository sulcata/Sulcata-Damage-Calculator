import Item from "./Item";
import { Generation, maxGen, Type } from "./utilities";

const placeholderItem = new Item();
let noItem = placeholderItem;
let leftovers = placeholderItem;
let chopleBerry = placeholderItem;
let chilanBerry = placeholderItem;
beforeEach(() => {
  noItem = new Item();
  leftovers = new Item({ name: "Leftovers" });
  chopleBerry = new Item({ name: "Chople Berry" });
  chilanBerry = new Item({ name: "Chilan Berry" });
});

test("#constructor()", () => {
  const item1 = new Item({ name: "Leftovers" });
  expect(item1.id).toBe("leftovers");
  expect(item1.used).toBe(false);
  expect(item1.disabled).toBe(false);
  expect(item1.gen).toBe(maxGen);

  const item2 = new Item({
    name: "Leftovers",
    disabled: true
  });
  expect(item2.id).toBe("leftovers");
  expect(item2.used).toBe(false);
  expect(item2.disabled).toBe(true);
  expect(item2.gen).toBe(maxGen);

  const item3 = new Item({
    id: "leftovers",
    used: true,
    gen: Generation.GSC
  });
  expect(item3.id).toBe("leftovers");
  expect(item3.used).toBe(true);
  expect(item3.disabled).toBe(false);
  expect(item3.gen).toBe(2);
});

test("#name", () => {
  expect(noItem.name).toBe("(No Item)");
  expect(chopleBerry.name).toBe("Chople Berry");

  chopleBerry.disabled = true;
  expect(chopleBerry.name).toBe("(No Item)");

  chopleBerry.disabled = false;
  chopleBerry.used = true;
  expect(chopleBerry.name).toBe("(No Item)");

  const item = new Item();
  expect(item.id).toBe("noitem");

  item.name = "Leftovers";
  expect(item.id).toBe("leftovers");

  item.name = "  chople  berry";
  expect(item.id).toBe("chopleberry");

  item.name = "l eftovers";
  expect(item.id).toBe("leftovers");
});

test("#nonDisabledName()", () => {
  expect(chopleBerry.nonDisabledName()).toBe("Chople Berry");

  chopleBerry.disabled = true;
  expect(chopleBerry.nonDisabledName()).toBe("Chople Berry");

  chopleBerry.used = true;
  expect(chopleBerry.nonDisabledName()).toBe("(No Item)");
});

test("#boostedType()", () => {
  const mysticWater = new Item({ name: "Mystic Water" });
  const zapPlate = new Item({ name: "Zap Plate" });

  expect(mysticWater.boostedType()).toBe(Type.WATER);
  expect(zapPlate.boostedType()).toBe(Type.ELECTRIC);
  expect(chopleBerry.boostedType()).toBe(-1);

  mysticWater.disabled = true;
  expect(mysticWater.boostedType()).toBe(-1);

  zapPlate.used = true;
  expect(zapPlate.boostedType()).toBe(-1);
});

test("#isBerry()", () => {
  expect(leftovers.isBerry()).toBe(false);
  expect(chopleBerry.isBerry()).toBe(true);

  chopleBerry.disabled = true;
  expect(chopleBerry.isBerry()).toBe(true);

  chopleBerry.used = true;
  expect(chopleBerry.isBerry()).toBe(false);
});

test("#berryTypeResist()", () => {
  expect(chopleBerry.berryTypeResist()).toBe(Type.FIGHTING);
  expect(chilanBerry.berryTypeResist()).toBe(Type.NORMAL);
  expect(noItem.berryTypeResist()).toBe(-1);

  chopleBerry.disabled = true;
  expect(chopleBerry.berryTypeResist()).toBe(-1);

  chilanBerry.used = true;
  expect(chilanBerry.berryTypeResist()).toBe(-1);
});

test("#naturalGiftPower()", () => {
  expect(noItem.naturalGiftPower()).toBe(0);
  expect(chopleBerry.naturalGiftPower()).toBe(80);

  chopleBerry.gen = Generation.B2W2;
  expect(chopleBerry.naturalGiftPower()).toBe(60);

  chopleBerry.disabled = true;
  expect(chopleBerry.naturalGiftPower()).toBe(0);

  chilanBerry.used = true;
  expect(chilanBerry.naturalGiftPower()).toBe(0);
});

test("#naturalGiftType()", () => {
  expect(noItem.naturalGiftType()).toBe(-1);
  expect(chopleBerry.naturalGiftType()).toBe(Type.FIGHTING);

  chopleBerry.disabled = true;
  expect(chopleBerry.naturalGiftType()).toBe(-1);

  chilanBerry.used = true;
  expect(chilanBerry.naturalGiftType()).toBe(-1);
});

test("#flingPower()", () => {
  const zapPlate = new Item({ name: "Zap Plate" });

  expect(noItem.flingPower()).toBe(0);
  expect(chopleBerry.flingPower()).toBe(10);
  expect(zapPlate.flingPower()).toBe(90);

  chopleBerry.disabled = true;
  expect(chopleBerry.flingPower()).toBe(0);

  zapPlate.used = true;
  expect(zapPlate.flingPower()).toBe(0);
});

test("#gemType()", () => {
  const normalGem = new Item({ name: "Normal Gem" });

  expect(normalGem.gemType()).toBe(Type.NORMAL);
  expect(noItem.gemType()).toBe(-1);

  normalGem.disabled = true;
  expect(normalGem.gemType()).toBe(-1);

  normalGem.disabled = false;
  normalGem.used = true;
  expect(normalGem.gemType()).toBe(-1);
});

test("#isPlate()", () => {
  const zapPlate = new Item({ name: "Zap Plate" });
  expect(zapPlate.isPlate()).toBe(true);
  expect(leftovers.isPlate()).toBe(false);
  zapPlate.disabled = true;
  expect(zapPlate.isPlate()).toBe(true);
  zapPlate.disabled = false;
  zapPlate.used = true;
  expect(zapPlate.isPlate()).toBe(false);
});

test("#isHeavy()", () => {
  const ironBall = new Item({ name: "Iron Ball" });

  expect(noItem.isHeavy()).toBe(false);
  expect(ironBall.isHeavy()).toBe(true);

  ironBall.disabled = true;
  expect(ironBall.isHeavy()).toBe(true);

  ironBall.disabled = false;
  ironBall.used = true;
  expect(ironBall.isHeavy()).toBe(false);
});

test("#berryHeal()", () => {
  const oranBerry = new Item({ name: "Oran Berry" });
  const sitrusBerry = new Item({ name: "Sitrus Berry" });
  const figyBerry = new Item({ name: "Figy Berry" });
  const berry = new Item({ name: "Berry" });
  const goldBerry = new Item({ name: "Gold Berry" });

  expect(oranBerry.berryHeal(27)).toBe(10);
  expect(sitrusBerry.berryHeal(27)).toBe(6);
  expect(figyBerry.berryHeal(27)).toBe(13);
  expect(berry.berryHeal(27)).toBe(10);
  expect(goldBerry.berryHeal(27)).toBe(30);

  figyBerry.gen = Generation.ORAS;
  expect(figyBerry.berryHeal(27)).toBe(3);

  sitrusBerry.gen = Generation.ADV;
  expect(sitrusBerry.berryHeal()).toBe(30);

  berry.disabled = true;
  expect(berry.berryHeal()).toBe(0);

  oranBerry.used = true;
  expect(oranBerry.berryHeal()).toBe(0);
});

test("#berryHealThreshold()", () => {
  const sitrusBerry = new Item({ name: "Sitrus Berry" });
  const figyBerry = new Item({ name: "Figy Berry" });

  expect(sitrusBerry.berryHealThreshold(27)).toBe(13);
  expect(figyBerry.berryHealThreshold(27)).toBe(6);

  figyBerry.gen = Generation.ORAS;
  expect(figyBerry.berryHealThreshold(27)).toBe(13);
});

test("#memoryType()", () => {
  const waterMemory = new Item({ name: "Water Memory" });
  expect(waterMemory.memoryType()).toBe(Type.WATER);
  expect(noItem.memoryType()).toBe(Type.NORMAL);
});
