import rbyCalculate from "../../src/calculate/rbyCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens, Statuses} from "../../src/utilities";

const gen = Gens.RBY;

describe("rbyCalculate()", () => {
    let field;
    beforeEach(() => {
        field = new Field({gen});
    });

    test("physical", () => {
        const snorlax = new Pokemon({name: "Snorlax", gen});
        const earthquake = new Move({name: "Earthquake", gen});
        expect(rbyCalculate(snorlax, snorlax, earthquake, field)).toEqual([
            100, 100, 101, 101, 102, 102, 103, 103, 104, 104, 105, 105, 105,
            106, 106, 107, 107, 108, 108, 109, 109, 110, 110, 111, 111, 111,
            112, 112, 113, 113, 114, 114, 115, 115, 116, 116, 117, 117, 118
        ]);
    });

    test("special", () => {
        const zapdos = new Pokemon({name: "Zapdos", gen});
        const snorlax = new Pokemon({name: "Snorlax", gen});
        const thunder = new Move({name: "Thunder", gen});
        expect(rbyCalculate(zapdos, snorlax, thunder, field)).toEqual([
            197, 198, 199, 200, 201, 201, 202, 203, 204, 205, 206, 207, 208,
            209, 210, 211, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220,
            221, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232
        ]);
    });

    test("critical", () => {
        const zapdos = new Pokemon({name: "Zapdos", gen});
        const snorlax = new Pokemon({name: "Snorlax", gen});
        const thunderCrit = new Move({
            name: "Thunder",
            critical: true,
            gen
        });
        expect(rbyCalculate(zapdos, snorlax, thunderCrit, field)).toEqual([
            385, 387, 389, 390, 392, 394, 396, 397, 399, 401, 403, 405, 406,
            408, 410, 412, 413, 415, 417, 419, 421, 422, 424, 426, 428, 429,
            431, 433, 435, 437, 438, 440, 442, 444, 445, 447, 449, 451, 453
        ]);
    });

    test("STAB", () => {
        const snorlax = new Pokemon({name: "Snorlax", gen});
        const bodySlam = new Move({name: "Body Slam", gen});
        expect(rbyCalculate(snorlax, snorlax, bodySlam, field)).toEqual([
            127, 128, 128, 129, 130, 130, 131, 131, 132, 132, 133, 134, 134,
            135, 135, 136, 137, 137, 138, 138, 139, 140, 140, 141, 141, 142,
            142, 143, 144, 144, 145, 145, 146, 147, 147, 148, 148, 149, 150
        ]);
    });

    test("Reflect", () => {
        const snorlax = new Pokemon({name: "Snorlax", gen});
        const alakazam = new Pokemon({
            name: "Alakazam",
            reflect: true,
            gen
        });
        const bodySlam = new Move({name: "Body Slam", gen});
        expect(rbyCalculate(snorlax, alakazam, bodySlam, field)).toEqual([
            79, 79, 79, 80, 80, 80, 81, 81, 82, 82, 82, 83, 83,
            83, 84, 84, 84, 85, 85, 86, 86, 86, 87, 87, 87, 88,
            88, 88, 89, 89, 90, 90, 90, 91, 91, 91, 92, 92, 93
        ]);
    });

    test("Light Screen", () => {
        const tauros = new Pokemon({name: "Tauros", gen});
        const zapdos = new Pokemon({
            name: "Zapdos",
            lightScreen: true,
            gen
        });
        const blizzard = new Move({name: "Blizzard", gen});
        expect(rbyCalculate(tauros, zapdos, blizzard, field)).toEqual([
            61, 61, 61, 62, 62, 62, 62, 63, 63, 63, 64, 64, 64,
            64, 65, 65, 65, 66, 66, 66, 66, 67, 67, 67, 68, 68,
            68, 68, 69, 69, 69, 70, 70, 70, 70, 71, 71, 71, 72
        ]);
    });

    test("burn", () => {
        const golem = new Pokemon({
            name: "Golem",
            status: Statuses.BURNED,
            gen
        });
        const moltres = new Pokemon({name: "Moltres", gen});
        const rockSlide = new Move({name: "Rock Slide", gen});
        expect(rbyCalculate(golem, moltres, rockSlide, field)).toEqual([
            187, 188, 188, 189, 190, 191, 192, 193, 194, 194, 195, 196, 197,
            198, 199, 200, 201, 201, 202, 203, 204, 205, 206, 207, 207, 208,
            209, 210, 211, 212, 213, 213, 214, 215, 216, 217, 218, 219, 220
        ]);
    });

    test("type immunity", () => {
        const gengar = new Pokemon({name: "Gengar", gen});
        const alakazam = new Pokemon({name: "Alakazam", gen});
        const lick = new Move({name: "Lick", gen});
        expect(rbyCalculate(gengar, alakazam, lick, field)).toEqual([0]);
    });

    test("Explosion and Self-Destruct", () => {
        const tauros = new Pokemon({name: "Tauros", gen});

        const gengar = new Pokemon({name: "Gengar", gen});
        const explosion = new Move({name: "Explosion", gen});
        expect(rbyCalculate(gengar, tauros, explosion, field)).toEqual([
            194, 194, 195, 196, 197, 198, 199, 200, 201, 202, 202, 203, 204,
            205, 206, 207, 208, 209, 210, 211, 211, 212, 213, 214, 215, 216,
            217, 218, 219, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228
        ]);

        const snorlax = new Pokemon({name: "Snorlax", gen});
        const selfDestruct = new Move({name: "Self-Destruct", gen});
        expect(rbyCalculate(snorlax, tauros, selfDestruct, field)).toEqual([
            307, 308, 310, 311, 312, 314, 315, 317, 318, 319, 321, 322, 324,
            325, 327, 328, 329, 331, 332, 334, 335, 336, 338, 339, 341, 342,
            344, 345, 346, 348, 349, 351, 352, 353, 355, 356, 358, 359, 361
        ]);
    });
});
