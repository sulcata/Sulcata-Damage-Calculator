/* tslint:disable:no-unbound-method */
import Pokemon from "../Pokemon";
import { Stat } from "../utilities";
import rbyEndOfTurn from "./rbyEndOfTurn";

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

let defender: Pokemon | undefined;
beforeEach(() => {
  defender = new Pokemon();
  defender.stat = jest.fn().mockReturnValue(70);
});

test("produces no effects with no statuses", () => {
  const { values, messages } = rbyEndOfTurn(defender!);
  expect(values).toEqual([]);
  expect(messages).toEqual([]);
});

test("burn inflicts 1/16 max hp", () => {
  defender!.isBurned = () => true;
  const { values, messages } = rbyEndOfTurn(defender!);
  expect(values).toEqual([Math.trunc(-70 / 16)]);
  expect(messages).toEqual(["Burn"]);
  expect(defender!.stat).toHaveBeenCalledWith(Stat.HP);
});

test("poison inflicts 1/16 max hp", () => {
  defender!.isPoisoned = () => true;
  const { values, messages } = rbyEndOfTurn(defender!);
  expect(values).toEqual([Math.trunc(-70 / 16)]);
  expect(messages).toEqual(["Poison"]);
  expect(defender!.stat).toHaveBeenCalledWith(Stat.HP);
});

test("toxic inflicts increasing damage", () => {
  defender!.isBadlyPoisoned = () => true;
  const { values, messages } = rbyEndOfTurn(defender!);
  expect(values).toEqual(["toxic"]);
  expect(messages).toEqual(["Toxic"]);
});
