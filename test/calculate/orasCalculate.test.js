import orasCalculate from "../../src/calculate/orasCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens} from "../../src/utilities";

const {max} = Math;

describe("orasCalculate()", () => {
    let field;

    beforeEach(() => {
        field = new Field({gen: Gens.ORAS});
    });

    test("sanity check", () => {
        const attacker = new Pokemon({
            name: "Heatran",
            gen: Gens.ORAS,
            evs: [252, 0, 0, 0, 4, 252],
            natureName: "Timid"
        });
        const defender = new Pokemon({
            name: "Landorus-Therian",
            gen: Gens.ORAS,
            evs: [252, 0, 216, 0, 24, 16],
            natureName: "Impish"
        });
        const move = new Move({
            name: "Lava Plume",
            gen: Gens.ORAS
        });
        const damage = orasCalculate(attacker, defender, move, field);
        expect(max(...damage)).toEqual(150);
    });
});
