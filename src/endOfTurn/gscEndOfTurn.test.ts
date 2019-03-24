/* tslint:disable:no-unbound-method */
import Field from "../Field";
import Pokemon from "../Pokemon";
import { Stat } from "../utilities";
import gscEndOfTurn from "./gscEndOfTurn";

jest.mock("../Pokemon", () => {
  class PokemonMock {
    public item = { name: "(No Item)" };
    public ability = {
      name: "(No Ability)",
      nonDisabledName: "(No Ability)"
    };
    public stat = jest.fn().mockReturnValue(40);
    public isBurned = () => false;
    public isPoisoned = () => false;
    public isBadlyPoisoned = () => false;
    public hurtBySandstorm = () => false;
    public hurtByHail = () => false;
    public isAsleep = () => false;
    public stab = () => false;
    public isGrounded = () => false;
  }
  return PokemonMock;
});

jest.mock("../Field", () => {
  class FieldMock {
    public gen = 2;
    public sand = () => false;
    public sun = () => false;
    public rain = () => false;
  }
  return FieldMock;
});

test("produces no effects with no statuses", () => {
  const defender = new Pokemon();
  const field = new Field();
  const { values, messages } = gscEndOfTurn(defender, field);
  expect(values).toEqual([]);
  expect(messages).toEqual([]);
});

test("burn inflicts 1/8 max hp", () => {
  const defender = new Pokemon();
  defender.stat = jest.fn().mockReturnValue(70);
  defender.isBurned = () => true;
  const field = new Field();
  const { values, messages } = gscEndOfTurn(defender, field);
  expect(values).toEqual([Math.trunc(-70 / 8)]);
  expect(messages).toEqual(["Burn"]);
  expect(defender.stat).toHaveBeenCalledWith(Stat.HP);
});

test("poison inflicts 1/8 max hp", () => {
  const defender = new Pokemon();
  defender.stat = jest.fn().mockReturnValue(70);
  defender.isPoisoned = () => true;
  const field = new Field();
  const { values, messages } = gscEndOfTurn(defender, field);
  expect(values).toEqual([Math.trunc(-70 / 8)]);
  expect(messages).toEqual(["Poison"]);
  expect(defender.stat).toHaveBeenCalledWith(Stat.HP);
});

test("toxic inflicts increasing damage", () => {
  const defender = new Pokemon();
  defender.isBadlyPoisoned = () => true;
  const field = new Field();
  const { values, messages } = gscEndOfTurn(defender, field);
  expect(values).toEqual(["toxic"]);
  expect(messages).toEqual(["Toxic"]);
});

describe("sandstorm", () => {
  test("inflicts 1/8 max hp", () => {
    const defender = new Pokemon();
    defender.stat = jest.fn().mockReturnValue(70);
    defender.hurtBySandstorm = () => true;
    const field = new Field();
    field.sand = () => true;
    const { values, messages } = gscEndOfTurn(defender, field);
    expect(values).toEqual([Math.trunc(-70 / 8)]);
    expect(messages).toEqual(["Sandstorm"]);
    expect(defender.stat).toHaveBeenCalledWith(Stat.HP);
  });

  test("does not inflict damage to sandstorm immune", () => {
    const defender = new Pokemon();
    defender.hurtBySandstorm = () => false;
    const field = new Field();
    field.sand = () => true;
    const { values, messages } = gscEndOfTurn(defender, field);
    expect(values).toEqual([]);
    expect(messages).toEqual([]);
  });
});

test("leftovers restores 1/16 max hp", () => {
  const defender = new Pokemon();
  defender.stat = jest.fn().mockReturnValue(70);
  defender.item.name = "Leftovers";
  const field = new Field();
  const { values, messages } = gscEndOfTurn(defender, field);
  expect(values).toEqual([Math.trunc(70 / 16)]);
  expect(messages).toEqual(["Leftovers"]);
  expect(defender.stat).toHaveBeenCalledWith(Stat.HP);
});

test("orders conditions correctly", () => {
  const defender = new Pokemon();
  defender.item.name = "Leftovers";
  defender.isBurned = () => true;
  defender.hurtBySandstorm = () => true;
  const field = new Field();
  field.sand = () => true;
  const { messages } = gscEndOfTurn(defender, field);
  expect(messages).toEqual(["Burn", "Sandstorm", "Leftovers"]);
});
