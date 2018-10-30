import rbyEndOfTurn from "sulcalc/endOfTurn/rbyEndOfTurn";
import { Stats } from "sulcalc/utilities";

let attacker, defender;
beforeEach(() => {
  attacker = null;
  defender = {
    stat: jest.fn().mockReturnValue(70),
    isBurned: () => false,
    isPoisoned: () => false,
    isBadlyPoisoned: () => false
  };
});

test("produces no effects with no statuses", () => {
  const { values, messages } = rbyEndOfTurn(attacker, defender);
  expect(values).toEqual([]);
  expect(messages).toEqual([]);
});

test("burn inflicts 1/16 max hp", () => {
  defender.isBurned = () => true;
  const { values, messages } = rbyEndOfTurn(attacker, defender);
  expect(values).toEqual([Math.trunc(-70 / 16)]);
  expect(messages).toEqual(["Burn"]);
  expect(defender.stat).toHaveBeenCalledWith(Stats.HP);
});

test("poison inflicts 1/16 max hp", () => {
  defender.isPoisoned = () => true;
  const { values, messages } = rbyEndOfTurn(attacker, defender);
  expect(values).toEqual([Math.trunc(-70 / 16)]);
  expect(messages).toEqual(["Poison"]);
  expect(defender.stat).toHaveBeenCalledWith(Stats.HP);
});

test("toxic inflicts increasing damage", () => {
  defender.isBadlyPoisoned = () => true;
  const { values, messages } = rbyEndOfTurn(attacker, defender);
  expect(values).toEqual(["toxic"]);
  expect(messages).toEqual(["Toxic"]);
});
