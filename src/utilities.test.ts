import { roundHalfToZero, chainMod, applyMod, applyModAll } from "./utilities";

test.each([[2.4, 2], [2.5, 2], [2.6, 3], [-1.4, -1], [-1.5, -1], [-1.6, -2]])(
  "roundHalfToZero(%p)",
  (value: number, expected: number) => {
    expect(roundHalfToZero(value)).toBe(expected);
  }
);

test.each([
  [0x1000, 0x1800, 0x1800],
  [0x800, 0x1800, 0xc00],
  [0x7ff, 0x1, 0x0],
  [0x7ff, 0x2, 0x1]
])(
  "chainMod(%p, %p)",
  (modifier1: number, modifier2: number, expected: number) => {
    expect(chainMod(modifier1, modifier2)).toBe(expected);
  }
);

test.each([[0x1800, 5, 7], [0x1801, 5, 8]])(
  "applyMod(%p, %p)",
  (modifier: number, value: number, expected: number) => {
    expect(applyMod(modifier, value)).toBe(expected);
  }
);

test.each([[0x1800, [], []], [0x1800, [5], [7]], [0x1800, [2, 5], [3, 7]]])(
  "applyMod(%p, %p)",
  (modifier: number, values: number[], expected: number[]) => {
    expect(applyModAll(modifier, values)).toEqual(expected);
  }
);
