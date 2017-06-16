import orasCalculate from "../../src/calculate/orasCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens} from "../../src/utilities";

const {max} = Math;
const gen = Gens.ORAS;

describe("orasCalculate()", () => {
    let field;
    beforeEach(() => {
        field = new Field({gen});
    });

    test("sanity check", () => {
        const attacker = new Pokemon({
            name: "Heatran",
            evs: [252, 0, 0, 0, 4, 252],
            natureName: "Timid",
            gen
        });
        const defender = new Pokemon({
            name: "Landorus-Therian",
            evs: [252, 0, 216, 0, 24, 16],
            natureName: "Impish",
            gen
        });
        const move = new Move({
            name: "Lava Plume",
            gen
        });
        const damage = orasCalculate(attacker, defender, move, field);
        expect(max(...damage)).toEqual(150);
    });

    test("Fairy Aura is a move power mod", () => {
        const xerneas = new Pokemon({
            name: "Xerneas",
            item: "Life Orb",
            natureName: "Modest",
            evs: [0, 0, 0, 252, 0, 0],
            gen
        });
        const genesect = new Pokemon({
            name: "Genesect",
            natureName: "Naive",
            gen
        });
        const moonblast = new Move({
            name: "Moonblast",
            gen
        });
        const auraField = new Field({
            fairyAura: true,
            gen
        });
        const damage = orasCalculate(xerneas, genesect, moonblast, auraField);
        expect(damage).toEqual([
            172, 173, 175, 178, 179, 182, 183, 186,
            187, 190, 191, 194, 195, 198, 199, 203
        ]);
    });
});
