import { roundHalfToZero, chainMod, applyMod } from "sulcalc/utilities";

describe("utilities", () => {
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
    expect(chainMod(0x800, 0x1800)).toEqual(0xc00);
    expect(chainMod(0x7ff, 0x1)).toEqual(0x0);
    expect(chainMod(0x7ff, 0x2)).toEqual(0x1);
  });

  test("applyMod()", () => {
    expect(applyMod(0x1800, 5)).toEqual(7);
    expect(applyMod(0x1801, 5)).toEqual(8);
    expect(applyMod(0x1800, [2, 5])).toEqual([3, 7]);
  });
});
