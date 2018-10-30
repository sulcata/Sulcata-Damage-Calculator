import gscEndOfTurn from "sulcalc/endOfTurn/gscEndOfTurn";
import { Stats } from "sulcalc/utilities";

let attacker, defender, field;
beforeEach(() => {
  attacker = null;
  defender = {
    stat: jest.fn().mockReturnValue(70),
    isBurned: () => false,
    isPoisoned: () => false,
    isBadlyPoisoned: () => false,
    hurtBySandstorm: () => true,
    item: { name: "(No Item)" }
  };
  field = {
    sand: () => false
  };
});

test("produces no effects with no statuses", () => {
  const { values, messages } = gscEndOfTurn(attacker, defender, field);
  expect(values).toEqual([]);
  expect(messages).toEqual([]);
});

test("burn inflicts 1/8 max hp", () => {
  defender.isBurned = () => true;
  const { values, messages } = gscEndOfTurn(attacker, defender, field);
  expect(values).toEqual([Math.trunc(-70 / 8)]);
  expect(messages).toEqual(["Burn"]);
  expect(defender.stat).toHaveBeenCalledWith(Stats.HP);
});

test("poison inflicts 1/8 max hp", () => {
  defender.isPoisoned = () => true;
  const { values, messages } = gscEndOfTurn(attacker, defender, field);
  expect(values).toEqual([Math.trunc(-70 / 8)]);
  expect(messages).toEqual(["Poison"]);
  expect(defender.stat).toHaveBeenCalledWith(Stats.HP);
});

test("toxic inflicts increasing damage", () => {
  defender.isBadlyPoisoned = () => true;
  const { values, messages } = gscEndOfTurn(attacker, defender, field);
  expect(values).toEqual(["toxic"]);
  expect(messages).toEqual(["Toxic"]);
});

describe("sandstorm", () => {
  beforeEach(() => {
    field.sand = () => true;
  });

  test("inflicts 1/8 max hp", () => {
    const { values, messages } = gscEndOfTurn(attacker, defender, field);
    expect(values).toEqual([Math.trunc(-70 / 8)]);
    expect(messages).toEqual(["Sandstorm"]);
    expect(defender.stat).toHaveBeenCalledWith(Stats.HP);
  });

  test("does not inflict damage to sandstorm immune", () => {
    defender.hurtBySandstorm = () => false;
    const { values, messages } = gscEndOfTurn(attacker, defender, field);
    expect(values).toEqual([]);
    expect(messages).toEqual([]);
  });
});

test("leftovers restores 1/16 max hp", () => {
  defender.item.name = "Leftovers";
  const { values, messages } = gscEndOfTurn(attacker, defender, field);
  expect(values).toEqual([Math.trunc(70 / 16)]);
  expect(messages).toEqual(["Leftovers"]);
  expect(defender.stat).toHaveBeenCalledWith(Stats.HP);
});

test("orders conditions correctly", () => {
  defender.item.name = "Leftovers";
  defender.isBurned = () => true;
  defender.hurtBySandstorm = () => true;
  field.sand = () => true;
  const { messages } = gscEndOfTurn(attacker, defender, field);
  expect(messages).toEqual(["Burn", "Sandstorm", "Leftovers"]);
});
