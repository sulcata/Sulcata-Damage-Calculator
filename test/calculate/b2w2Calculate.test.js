import b2w2Calculate from "../../src/calculate/b2w2Calculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens} from "../../src/utilities";

const {max} = Math;

describe("b2w2Calculate()", () => {
    let field;

    beforeEach(() => {
        field = new Field({gen: Gens.B2W2});
    });

    test("sanity check", () => {
        const attacker = new Pokemon({
            name: "Heatran",
            gen: Gens.B2W2,
            evs: [252, 0, 0, 0, 4, 252],
            natureName: "Timid"
        });
        const defender = new Pokemon({
            name: "Landorus-Therian",
            gen: Gens.B2W2,
            evs: [252, 0, 216, 0, 24, 16],
            natureName: "Impish"
        });
        const move = new Move({
            name: "Lava Plume",
            gen: Gens.B2W2
        });
        const damage = b2w2Calculate(attacker, defender, move, field);
        expect(max(...damage)).toEqual(150);
    });
});
