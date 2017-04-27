import gscCalculate from "../../src/calculate/gscCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens, Stats, Statuses} from "../../src/utilities";

const {max} = Math;

describe("gscCalculate()", () => {
    describe("crit mechanics", () => {
        let machamp;
        let starmie;
        let field;
        let crossChopCrit;

        beforeEach(() => {
            machamp = new Pokemon("Machamp", 2);
            starmie = new Pokemon("Starmie", 2);
            field = new Field({gen: Gens.GSC});
            crossChopCrit = new Move({
                name: "Cross Chop",
                critical: true,
                gen: Gens.GSC
            });
        });

        test("doubles damage", () => {
            const damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(168);
        });

        test("only ignores modifiers if boosts are the same or worse", () => {
            machamp.boosts[Stats.ATK] = 6;
            starmie.boosts[Stats.DEF] = 5;
            let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(135);

            machamp.boosts[Stats.ATK] = 6;
            starmie.boosts[Stats.DEF] = 6;
            damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(168);

            machamp.boosts[Stats.ATK] = 5;
            starmie.boosts[Stats.DEF] = 6;
            damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(168);
        });

        test("ignoring includes Reflect", () => {
            starmie.reflect = true;

            let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(168);

            machamp.boosts[Stats.ATK] = 1;
            damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(127);
        });

        test("ignoring includes Burn", () => {
            machamp.status = Statuses.BURNED;

            let damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(168);

            machamp.boosts[Stats.ATK] = 1;
            damage = gscCalculate(machamp, starmie, crossChopCrit, field);
            expect(max(...damage)).toEqual(127);
        });
    });
});
