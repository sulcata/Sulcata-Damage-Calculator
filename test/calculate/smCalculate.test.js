import smCalculate from "../../src/calculate/smCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens} from "../../src/utilities";

const {max} = Math;

describe("smCalculate()", () => {
    let field;

    beforeEach(() => {
        field = new Field({gen: Gens.SM});
    });

    test("sanity check", () => {
        const attacker = new Pokemon({
            name: "Heatran",
            gen: Gens.SM,
            evs: [252, 0, 0, 0, 4, 252],
            natureName: "Timid"
        });
        const defender = new Pokemon({
            name: "Landorus-Therian",
            gen: Gens.SM,
            evs: [252, 0, 216, 0, 24, 16],
            natureName: "Impish"
        });
        const move = new Move({
            name: "Lava Plume",
            gen: Gens.SM
        });
        const damage = smCalculate(attacker, defender, move, field);
        expect(max(...damage)).toEqual(150);
    });
});
