import advCalculate from "../../src/calculate/advCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens} from "../../src/utilities";

const {max} = Math;

describe("advCalculate()", () => {
    let field;

    beforeEach(() => {
        field = new Field({gen: Gens.ADV});
    });

    test("sanity check", () => {
        const attacker = new Pokemon({
            name: "Aerodactyl",
            gen: Gens.ADV,
            evs: [4, 252, 0, 0, 0, 252],
            natureName: "Jolly",
            item: "Choice Band"
        });
        const defender = new Pokemon({
            name: "Skarmory",
            gen: Gens.ADV,
            evs: [252, 0, 4, 0, 252, 0],
            natureName: "Impish"
        });
        const move = new Move({
            name: "Rock Slide",
            gen: Gens.ADV
        });
        const damage = advCalculate(attacker, defender, move, field);
        expect(max(...damage)).toEqual(127);
    });

    test("ensure proper stats are used", () => {
        const attacker = new Pokemon({
            name: "Celebi",
            boosts: [0, 0, 0, 1, 0, 0],
            gen: Gens.ADV
        });
        const defender = new Pokemon({
            name: "Dugtrio",
            evs: [8, 0, 0, 0, 60, 0],
            gen: Gens.ADV
        });
        const move = new Move({
            name: "Psychic",
            gen: Gens.ADV
        });
        const damage = advCalculate(attacker, defender, move, field);
        expect(max(...damage)).toEqual(213);
    });
});
