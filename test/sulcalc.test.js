import sulcalc from "../src/sulcalc";
import Multiset from "../src/Multiset";
import {MissingnoError, NoMoveError} from "../src/errors";

describe("sulcalc()", () => {
    test("RBY", () => {
        const results = sulcalc("Snorlax", "Snorlax", "Body Slam", {gen: 1});
        expect(results.damage).toEqual(new Multiset([
            127, 128, 128, 129, 130, 130, 131, 131, 132, 132, 133, 134, 134,
            135, 135, 136, 137, 137, 138, 138, 139, 140, 140, 141, 141, 142,
            142, 143, 144, 144, 145, 145, 146, 147, 147, 148, 148, 149, 150
        ]));
    });

    test("GSC", () => {
        const results = sulcalc("Snorlax", "Snorlax", "Body Slam", {gen: 2});
        expect(results.damage).toEqual(new Multiset([
            127, 128, 128, 129, 130, 130, 131, 131, 132, 132, 133, 134, 134,
            135, 135, 136, 137, 137, 138, 138, 139, 140, 140, 141, 141, 142,
            142, 143, 144, 144, 145, 145, 146, 147, 147, 148, 148, 149, 150
        ]));
    });

    test("Adv", () => {
        const results = sulcalc("Snorlax", "Snorlax", "Body Slam", {gen: 3});
        expect(results.damage).toEqual(new Multiset([
            142, 144, 146, 147, 149, 151, 152, 154,
            156, 157, 159, 161, 162, 164, 166, 168
        ]));
    });

    test("HGSS", () => {
        const results = sulcalc("Snorlax", "Snorlax", "Body Slam", {gen: 4});
        expect(results.damage).toEqual(new Multiset([
            142, 144, 145, 147, 148, 150, 151, 154,
            156, 157, 159, 160, 162, 163, 165, 168
        ]));
    });

    test("B2W2", () => {
        const results = sulcalc("Snorlax", "Snorlax", "Body Slam", {gen: 5});
        expect(results.damage).toEqual(new Multiset([
            142, 144, 145, 147, 148, 150, 151, 154,
            156, 157, 159, 160, 162, 163, 165, 168
        ]));
    });

    test("ORAS", () => {
        const results = sulcalc("Snorlax", "Snorlax", "Body Slam", {gen: 6});
        expect(results.damage).toEqual(new Multiset([
            142, 144, 145, 147, 148, 150, 151, 154,
            156, 157, 159, 160, 162, 163, 165, 168
        ]));
    });

    test("throws MissingnoError when either Pokemon is invalid", () => {
        expect(() => {
            sulcalc({id: "0:0"}, {id: "0:0"}, {id: 1}, {});
        }).toThrow(MissingnoError);

        expect(() => {
            sulcalc({id: "233"}, {id: "233"}, {id: 1}, {});
        }).toThrow(MissingnoError);
    });

    test("throws NoMoveError when either Move is invalid", () => {
        expect(() => {
            sulcalc({name: "Snorlax"}, {name: "Snorlax"}, {id: 0}, {});
        }).toThrow(NoMoveError);

        expect(() => {
            sulcalc({name: "Snorlax"}, {name: "Snorlax"}, {id: -1}, {});
        }).toThrow(NoMoveError);
    });
});
