import rbyCalculate from "../../src/calculate/rbyCalculate";
import Pokemon from "../../src/Pokemon";
import Move from "../../src/Move";
import Field from "../../src/Field";
import {Gens, Statuses} from "../../src/utilities";

function range(min, max) {
    const arr = [];
    for (let i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
}

describe("rbyCalculate()", () => {
    test("physical", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon("Snorlax", 1);
        const move = new Move("Earthquake", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([
            100, 100, 101, 101, 102, 102, 103, 103, 104, 104, 105, 105, 105,
            106, 106, 107, 107, 108, 108, 109, 109, 110, 110, 111, 111, 111,
            112, 112, 113, 113, 114, 114, 115, 115, 116, 116, 117, 117, 118
        ]);
    });

    describe("special", () => {
        const attacker = new Pokemon("Zapdos", 1);
        const defender = new Pokemon("Snorlax", 1);
        const move = new Move("Thunder", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([
            197, 198, 199, 200, 201, 201, 202, 203, 204, 205, 206, 207, 208,
            209, 210, 211, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220,
            221, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232
        ]);
    });

    test("other", () => {
        const attacker = new Pokemon("Zapdos", 1);
        const defender = new Pokemon("Snorlax", 1);
        const move = new Move("Agility", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([0]);
    });

    describe("critical", () => {
        const attacker = new Pokemon("Zapdos", Gens.RBY);
        const defender = new Pokemon("Snorlax", Gens.RBY);
        const move = new Move({
            name: "Thunder",
            gen: Gens.RBY,
            critical: true
        });
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([
            385, 387, 389, 390, 392, 394, 396, 397, 399, 401, 403, 405, 406,
            408, 410, 412, 413, 415, 417, 419, 421, 422, 424, 426, 428, 429,
            431, 433, 435, 437, 438, 440, 442, 444, 445, 447, 449, 451, 453
        ]);
    });

    test("STAB", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon("Snorlax", 1);
        const move = new Move("Body Slam", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([
            127, 128, 128, 129, 130, 130, 131, 131, 132, 132, 133, 134, 134,
            135, 135, 136, 137, 137, 138, 138, 139, 140, 140, 141, 141, 142,
            142, 143, 144, 144, 145, 145, 146, 147, 147, 148, 148, 149, 150
        ]);
    });

    test("Reflect", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon({
            name: "Alakazam",
            gen: Gens.RBY,
            reflect: true
        });
        const move = new Move("Body Slam", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([
            79, 79, 79, 80, 80, 80, 81, 81, 82, 82, 82, 83, 83,
            83, 84, 84, 84, 85, 85, 86, 86, 86, 87, 87, 87, 88,
            88, 88, 89, 89, 90, 90, 90, 91, 91, 91, 92, 92, 93
        ]);
    });

    test("Light Screen", () => {
        const attacker = new Pokemon("Tauros", 1);
        const defender = new Pokemon({
            name: "Zapdos",
            gen: Gens.RBY,
            lightScreen: true
        });
        const move = new Move("Blizzard", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([
            61, 61, 61, 62, 62, 62, 62, 63, 63, 63, 64, 64, 64,
            64, 65, 65, 65, 66, 66, 66, 66, 67, 67, 67, 68, 68,
            68, 68, 69, 69, 69, 70, 70, 70, 70, 71, 71, 71, 72
        ]);
    });

    test("burn", () => {
        const attacker = new Pokemon({
            name: "Golem",
            gen: Gens.RBY,
            status: Statuses.BURNED
        });
        const defender = new Pokemon("Moltres", 1);
        const move = new Move("Rock Slide", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([
            187, 188, 188, 189, 190, 191, 192, 193, 194, 194, 195, 196, 197,
            198, 199, 200, 201, 201, 202, 203, 204, 205, 206, 207, 207, 208,
            209, 210, 211, 212, 213, 213, 214, 215, 216, 217, 218, 219, 220
        ]);
    });

    test("type immunity", () => {
        const attacker = new Pokemon("Gengar", 1);
        const defender = new Pokemon("Alakazam", 1);
        const move = new Move("Lick", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([0]);
    });

    test("Explosion and Self-Destruct", () => {
        const gengar = new Pokemon("Gengar", 1);
        const tauros = new Pokemon("Tauros", 1);
        const explosion = new Move("Explosion", 1);
        const field = new Field();
        expect(rbyCalculate(gengar, tauros, explosion, field)).toEqual([
            194, 194, 195, 196, 197, 198, 199, 200, 201, 202, 202, 203, 204,
            205, 206, 207, 208, 209, 210, 211, 211, 212, 213, 214, 215, 216,
            217, 218, 219, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228
        ]);

        const snorlax = new Pokemon("Snorlax", 1);
        const selfDestruct = new Move("Self-Destruct", 1);
        expect(rbyCalculate(snorlax, tauros, selfDestruct, field)).toEqual([
            307, 308, 310, 311, 312, 314, 315, 317, 318, 319, 321, 322, 324,
            325, 327, 328, 329, 331, 332, 334, 335, 336, 338, 339, 341, 342,
            344, 345, 346, 348, 349, 351, 352, 353, 355, 356, 358, 359, 361
        ]);
    });

    test("Seismic Toss and Night Shade", () => {
        const attacker = new Pokemon("Gengar", 1);
        const defender = new Pokemon("Alakazam", 1);
        const seismicToss = new Move("Seismic Toss", 1);
        const nightShade = new Move("Night Shade", 1);
        const field = new Field();

        expect(rbyCalculate(attacker, defender, seismicToss, field))
            .toEqual([100]);
        expect(rbyCalculate(attacker, defender, nightShade, field))
            .toEqual([100]);

        attacker.level = 42;
        expect(rbyCalculate(attacker, defender, seismicToss, field))
            .toEqual([42]);
        expect(rbyCalculate(attacker, defender, nightShade, field))
            .toEqual([42]);
    });

    test("Dragon Rage", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon("Tauros", 1);
        const move = new Move("Dragon Rage", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([40]);
    });

    test("Sonic Boom", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon("Tauros", 1);
        const move = new Move("Sonic Boom", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([20]);
    });

    test("OHKO", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon("Tauros", 1);
        const move = new Move("Horn Drill", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([65535]);
    });

    test("Super Fang", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon("Tauros", 1);
        const move = new Move("Super Fang", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([176]);

        defender.currentHp = 1;
        expect(rbyCalculate(attacker, defender, move, field)).toEqual([1]);
    });

    test("Psywave", () => {
        const attacker = new Pokemon("Snorlax", 1);
        const defender = new Pokemon("Tauros", 1);
        const move = new Move("Psywave", 1);
        const field = new Field();
        expect(rbyCalculate(attacker, defender, move, field))
            .toEqual(range(1, 149));

        attacker.level = 50;
        expect(rbyCalculate(attacker, defender, move, field))
            .toEqual(range(1, 74));
    });
});
