import {
    cmpStrs, addStrs, subtractStrs, multiplyStrs, divideStrs,
    avg, roundHalfToZero, chainMod, applyMod, isGenValid, maxGen
} from "../src/utilities";
import Multiset from "../src/Multiset";

describe("utilities", () => {
    test("cmpStrs()", () => {
        expect(cmpStrs("120", "420")).toBeLessThan(0);
        expect(cmpStrs("12", "999")).toBeLessThan(0);
        expect(cmpStrs("125", "125")).toEqual(0);
        expect(cmpStrs("120", "100")).toBeGreaterThan(0);
        expect(cmpStrs("12564", "45")).toBeGreaterThan(0);
    });

    test("addStrs()", () => {
        const x = [1, 3, 10, 123565, 0, 345];
        for (const a of x) {
            for (const b of x) {
                expect(addStrs(String(a), String(b))).toEqual(String(a + b));
            }
        }
    });

    test("subtractStrs()", () => {
        const x = [
            [20, 4],
            [40, 0],
            [44, 2],
            [2, 1],
            [10, 10],
            [999, 123],
            [1000, 22]
        ];
        for (const [a, b] of x) {
            expect(subtractStrs(String(a), String(b))).toEqual(String(a - b));
        }
    });

    test("multiplyStrs()", () => {
        const x = [1, 3, 10, 123565, 0, 345];
        for (const a of x) {
            for (const b of x) {
                expect(multiplyStrs(String(a), String(b)))
                    .toEqual(String(a * b));
            }
        }
    });

    test("divideStrs()", () => {
        const x = [0, 1, 2, 10, 111, 34, 99, 11, 999999999];
        for (const a of x) {
            for (const b of x) {
                expect(divideStrs(String(a), String(b))).toEqual([
                    String(Math.trunc(a / b)),
                    String(a % b)
                ]);
            }
        }
    });

    test("avg()", () => {
        const emptySet = new Multiset();
        expect(avg(emptySet)).toEqual(NaN);

        const set1 = new Multiset();
        set1.add(2436678, "100000000000000000000000000");
        set1.add(1);
        expect(avg(set1)).toEqual(2436678);

        const set2 = new Multiset([1, 2, 3, 4, 5, 6, 7, 8, 9, 77, 1]);
        expect(avg(set2)).toBeCloseTo(11.1818, 4);

        const zeroSet = new Multiset([0, 0, 0]);
        expect(avg(zeroSet)).toEqual(0);
    });

    test("roundHalfToZero()", () => {
        expect(roundHalfToZero(2.4)).toEqual(2);
        expect(roundHalfToZero(2.5)).toEqual(2);
        expect(roundHalfToZero(2.6)).toEqual(3);
        expect(roundHalfToZero(-1.4)).toEqual(-1);
        expect(roundHalfToZero(-1.5)).toEqual(-1);
        expect(roundHalfToZero(-1.6)).toEqual(-2);
    });

    test("chainMod()", () => {
        expect(chainMod(0x1000, 0x1800)).toEqual(0x1800);
        expect(chainMod(0x800, 0x1800)).toEqual(0xC00);
        expect(chainMod(0x7FF, 0x1)).toEqual(0x0);
        expect(chainMod(0x7FF, 0x2)).toEqual(0x1);
    });

    test("applyMod()", () => {
        expect(applyMod(0x1800, 5)).toEqual(7);
        expect(applyMod(0x1801, 5)).toEqual(8);
        expect(applyMod(0x1800, [2, 5])).toEqual([3, 7]);
    });

    test("isGenValid()", () => {
        expect(isGenValid(0)).toBeFalsy();
        expect(isGenValid(1.1)).toBeFalsy();
        expect(isGenValid(maxGen + 1)).toBeFalsy();
        expect(isGenValid(1)).toBeTruthy();
        expect(isGenValid(maxGen)).toBeTruthy();
    });
});
