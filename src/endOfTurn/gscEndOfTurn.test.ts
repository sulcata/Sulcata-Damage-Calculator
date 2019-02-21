/* tslint:disable:no-unbound-method */
import Pokemon from "../Pokemon";
import Field from "../Field";
import gscEndOfTurn from "./gscEndOfTurn";
import { Stat } from "../utilities";

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

let defender: Pokemon | undefined;
let field: Field | undefined;
beforeEach(() => {
  defender = new Pokemon();
  defender.stat = jest.fn().mockReturnValue(70);
  defender.hurtBySandstorm = () => true;
  field = new Field();
});

test("produces no effects with no statuses", () => {
  const { values, messages } = gscEndOfTurn(defender!, field!);
  expect(values).toEqual([]);
  expect(messages).toEqual([]);
});

test("burn inflicts 1/8 max hp", () => {
  defender!.isBurned = () => true;
  const { values, messages } = gscEndOfTurn(defender!, field!);
  expect(values).toEqual([Math.trunc(-70 / 8)]);
  expect(messages).toEqual(["Burn"]);
  expect(defender!.stat).toHaveBeenCalledWith(Stat.HP);
});

test("poison inflicts 1/8 max hp", () => {
  defender!.isPoisoned = () => true;
  const { values, messages } = gscEndOfTurn(defender!, field!);
  expect(values).toEqual([Math.trunc(-70 / 8)]);
  expect(messages).toEqual(["Poison"]);
  expect(defender!.stat).toHaveBeenCalledWith(Stat.HP);
});

test("toxic inflicts increasing damage", () => {
  defender!.isBadlyPoisoned = () => true;
  const { values, messages } = gscEndOfTurn(defender!, field!);
  expect(values).toEqual(["toxic"]);
  expect(messages).toEqual(["Toxic"]);
});

describe("sandstorm", () => {
  beforeEach(() => {
    field!.sand = () => true;
  });

  test("inflicts 1/8 max hp", () => {
    const { values, messages } = gscEndOfTurn(defender!, field!);
    expect(values).toEqual([Math.trunc(-70 / 8)]);
    expect(messages).toEqual(["Sandstorm"]);
    expect(defender!.stat).toHaveBeenCalledWith(Stat.HP);
  });

  test("does not inflict damage to sandstorm immune", () => {
    defender!.hurtBySandstorm = () => false;
    const { values, messages } = gscEndOfTurn(defender!, field!);
    expect(values).toEqual([]);
    expect(messages).toEqual([]);
  });
});

test("leftovers restores 1/16 max hp", () => {
  defender!.item.name = "Leftovers";
  const { values, messages } = gscEndOfTurn(defender!, field!);
  expect(values).toEqual([Math.trunc(70 / 16)]);
  expect(messages).toEqual(["Leftovers"]);
  expect(defender!.stat).toHaveBeenCalledWith(Stat.HP);
});

test("orders conditions correctly", () => {
  defender!.item.name = "Leftovers";
  defender!.isBurned = () => true;
  defender!.hurtBySandstorm = () => true;
  field!.sand = () => true;
  const { messages } = gscEndOfTurn(defender!, field!);
  expect(messages).toEqual(["Burn", "Sandstorm", "Leftovers"]);
});
