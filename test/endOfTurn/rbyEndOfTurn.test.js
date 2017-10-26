import rbyEndOfTurn from "../../src/endOfTurn/rbyEndOfTurn";
import Pokemon from "../../src/Pokemon";
import { Gens, Statuses } from "../../src/utilities";

const gen = Gens.RBY;

describe("rbyEndOfTurn()", () => {
  let attacker;
  let defender;

  beforeEach(() => {
    attacker = new Pokemon({ name: "Snorlax", gen });
    defender = new Pokemon({ name: "Zapdos", gen });
  });

  test("produces no effects with no statuses", () => {
    const { values, messages } = rbyEndOfTurn(attacker, defender);
    expect(values).toEqual([]);
    expect(messages).toEqual([]);
  });

  test("produces a burn effect", () => {
    defender.status = Statuses.BURNED;
    const { values, messages } = rbyEndOfTurn(attacker, defender);
    expect(values).toEqual([-23]);
    expect(messages).toEqual(["Burn"]);
  });

  test("produces a poison effect", () => {
    defender.status = Statuses.POISONED;
    const { values, messages } = rbyEndOfTurn(attacker, defender);
    expect(values).toEqual([-23]);
    expect(messages).toEqual(["Poison"]);
  });

  test("produces a toxic effect", () => {
    defender.status = Statuses.BADLY_POISONED;
    const { values, messages } = rbyEndOfTurn(attacker, defender);
    expect(values).toEqual(["toxic"]);
    expect(messages).toEqual(["Toxic"]);
  });
});
