import * as bigInt from "big-integer";
import Multiset from "./Multiset";

const eq = (a: bigInt.BigInteger | undefined, b: bigInt.BigNumber): boolean =>
  a !== undefined && a.eq(b);

let arr1: number[] = [];
let arr2: number[] = [];
let emptySet: Multiset<number> = new Multiset();
let set1: Multiset<number> = new Multiset();
let set2: Multiset<number> = new Multiset();
beforeEach(() => {
  arr1 = [2, 3, 1, 1, 4, 3, 2];
  arr2 = [2, 1, -2, 3];
  emptySet = new Multiset();
  set1 = new Multiset(arr1);
  set2 = new Multiset(arr2);
});

test("#constructor()", () => {
  function checker(set: Multiset<number>): void {
    expect(eq(set.get(-2), 1)).toBe(true);
    expect(eq(set.get(1), 1)).toBe(true);
    expect(eq(set.get(2), 1)).toBe(true);
    expect(eq(set.get(3), 2)).toBe(true);
  }

  checker(new Multiset([1, 2, 3, 3, -2]));

  checker(new Multiset(new Multiset([1, 2, 3, 3, -2])));
});

test("#add()", () => {
  const set = new Multiset<number>();
  set.add(1);
  set.add(2);
  set.add(2, 1);
  set.add(3, 1337);
  expect(set.add(4, 3).add(5, 0)).toBe(set);
  expect(eq(set.get(1), 1)).toBe(true);
  expect(eq(set.get(2), 2)).toBe(true);
  expect(eq(set.get(3), 1337)).toBe(true);
  expect(eq(set.get(4), 3)).toBe(true);
  expect(eq(set.get(5), 0)).toBe(true);
});

test("#delete()", () => {
  expect(set1.has(1)).toBe(true);
  expect(set1.delete(1)).toBe(true);
  expect(set1.has(1)).toBe(false);
  expect(set1.delete(1)).toBe(false);
  expect(set1.delete(1.5)).toBe(false);
});

test("#has()", () => {
  expect(emptySet.has(1)).toBe(false);
  expect(set1.has(1)).toBe(true);
  expect(set1.has(-2)).toBe(false);
  expect(set2.has(-2)).toBe(true);
});

test("#get()", () => {
  expect(set1.get(Math.PI)).toBeUndefined();
  expect(eq(set1.get(1), 2)).toBe(true);
  expect(eq(set1.get(2), 2)).toBe(true);
  expect(eq(set1.get(3), 2)).toBe(true);
  expect(eq(set1.get(4), 1)).toBe(true);
});

test("#size", () => {
  expect(emptySet.size.eq(0)).toBe(true);
  expect(set1.size.eq(arr1.length)).toBe(true);
});

test("#isEmpty()", () => {
  expect(emptySet.isEmpty()).toBe(true);
  expect(set1.isEmpty()).toBe(false);
});

test("#max()", () => {
  expect(emptySet.max(-Infinity)).toBe(-Infinity);
  expect(set1.max(0)).toBe(4);
  expect(set1.max(0, (a, b) => b - a)).toBe(1);
});

test("#min()", () => {
  expect(emptySet.min(Infinity)).toBe(Infinity);
  expect(set1.min(0)).toBe(1);
  expect(set1.min(0, (a, b) => b - a)).toBe(4);
});

test("#every()", () => {
  expect(emptySet.every(Boolean)).toBe(true);
  expect(set1.every(a => a > 0)).toBe(true);
  expect(set2.every(a => a > 0)).toBe(false);
  set1.every((value, multiplicity) => {
    expect(typeof value).toBe("number");
    expect(bigInt.isInstance(multiplicity)).toBe(true);
    return true;
  });
});

test("#some()", () => {
  expect(emptySet.some(Boolean)).toBe(false);
  expect(set1.some(a => a < 0)).toBe(false);
  expect(set2.some(a => a < 0)).toBe(true);
  set1.some((value, multiplicity) => {
    expect(typeof value).toBe("number");
    expect(bigInt.isInstance(multiplicity)).toBe(true);
    return true;
  });
});

test("#count()", () => {
  expect(emptySet.count().eq(0)).toBe(true);
  expect(set1.count()).toEqual(set1.size);
  expect(set1.count(a => a % 2 === 1).eq(4)).toBe(true);
});

test("#clear()", () => {
  set1.clear();
  expect(set1.size.eq(0)).toBe(true);
  expect(set1.has(1)).toBe(false);
});

test("#toString()", () => {
  expect(emptySet.toString()).toBe("");
  expect(set1.toString()).toBe("1:2, 2:2, 3:2, 4:1");
  expect(set1.toString(undefined, ([v1], [v2]) => v2 - v1)).toBe(
    "4:1, 3:2, 2:2, 1:2"
  );
  expect(set1.toString(e => e.join("#"))).toBe("1#2, 2#2, 3#2, 4#1");
});

test("#toArray()", () => {
  expect(emptySet.toArray()).toEqual([]);
  const array = set1.toArray();
  expect(array).toHaveLength(7);
  expect(array).toEqual(expect.arrayContaining([1, 1, 2, 2, 3, 3, 4]));
});

test("#permute()", () => {
  const add = (a: number, b: number): number => a + b;
  const mult = (a: number, b: number): number => a * b;
  expect(set1.permute(emptySet, add).toString()).toBe("");
  expect(set1.permute(set2, add).toString()).toBe(
    "-1:2, 0:2, 1:2, 2:3, 3:4, 4:6, 5:5, 6:3, 7:1"
  );
  expect(set1.permute(arr2, add).toString()).toBe(
    "-1:2, 0:2, 1:2, 2:3, 3:4, 4:6, 5:5, 6:3, 7:1"
  );
  expect(set1.permute([0], mult).toString()).toBe("0:7");
});

test("#intersect()", () => {
  expect(set1.intersect(set2).toString()).toBe("1:1, 2:1, 3:1");
  expect(set2.intersect(set1).toString()).toBe("1:1, 2:1, 3:1");
  expect(set1.intersect(arr2).toString()).toBe("1:1, 2:1, 3:1");
  expect(set1.intersect(emptySet).toString()).toBe("");
  expect(emptySet.intersect([]).toString()).toBe("");
});

test("#union()", () => {
  expect(set1.union(set2).toString()).toBe("-2:1, 1:3, 2:3, 3:3, 4:1");
  expect(set1.union(arr2).toString()).toBe("-2:1, 1:3, 2:3, 3:3, 4:1");
  expect(set1.union(emptySet).toString()).toBe("1:2, 2:2, 3:2, 4:1");
  expect(emptySet.union([]).toString()).toBe("");
});

test("#map()", () => {
  expect(emptySet.map(() => 1).toString()).toBe("");
  expect(set1.map(v => v + 1).toString()).toBe("2:2, 3:2, 4:2, 5:1");
  set1.map((value, multiplicity, skip) => {
    expect(typeof value).toBe("number");
    expect(bigInt.isInstance(multiplicity)).toBe(true);
    expect(typeof skip).toBe("function");
    return Math.E;
  });

  expect(
    set1
      .map((value, _multiplicity, skip) => {
        if (value % 2 === 0) skip();
        return value;
      })
      .toString()
  ).toBe("1:2, 3:2");
});

test("#scale()", () => {
  expect(emptySet.scale(314).toString()).toBe("");
  expect(set1.scale(2).toString()).toBe("1:4, 2:4, 3:4, 4:2");
  expect(set1.scale().toString()).toBe(set1.toString());
});

test("#reduce()", () => {
  const reduced = set1.reduce(
    (sum, value, multiplicity) => sum + value * multiplicity.valueOf(),
    0
  );
  expect(reduced).toBe(16);
  expect(emptySet.reduce(() => 1, undefined)).toBeUndefined();
});

test("#[Symbol.iterator]()", () => {
  expect(emptySet[Symbol.iterator]().next().done).toBe(true);

  for (const entry of set1) {
    expect(entry).toBeInstanceOf(Array);
    expect(entry).toHaveLength(2);
    expect(typeof entry[0]).toBe("number");
    expect(bigInt.isInstance(entry[1])).toBe(true);
  }
});

test("#entries()", () => {
  expect(emptySet.entries().next().done).toBe(true);

  for (const entry of set1.entries()) {
    expect(entry).toBeInstanceOf(Array);
    expect(entry).toHaveLength(2);
    expect(typeof entry[0]).toBe("number");
    expect(bigInt.isInstance(entry[1])).toBe(true);
  }
});

test("#keys()", () => {
  expect(emptySet.keys().next().done).toBe(true);

  for (const value of set1.keys()) {
    expect(typeof value).toBe("number");
  }

  expect([...set1.keys()]).toEqual([...set1.values()]);
});

test("#values()", () => {
  expect(emptySet.values().next().done).toBe(true);

  for (const value of set1.values()) {
    expect(typeof value).toBe("number");
  }
});

test("#multiplicities()", () => {
  expect(emptySet.multiplicities().next().done).toBe(true);

  for (const multiplicity of set1.multiplicities()) {
    expect(bigInt.isInstance(multiplicity)).toBe(true);
  }
});

test(".average()", () => {
  expect(Multiset.average(emptySet)).toBe(NaN);

  const set1 = new Multiset<number>();
  set1.add(2436678, "100000000000000000000000000");
  set1.add(1);
  expect(Multiset.average(set1)).toBe(2436678);

  const set2 = new Multiset([1, 2, 3, 4, 5, 6, 7, 8, 9, 77, 1]);
  expect(Multiset.average(set2)).toBeCloseTo(11.1818, 4);

  const zeroSet = new Multiset([0, 0, 0]);
  expect(Multiset.average(zeroSet)).toBe(0);
});

test(".fromEntries()", () => {
  const set = Multiset.fromEntries([[1, 2], [2, 2], [3, 1], [4, 1], [2, 5]]);
  expect(set.toString()).toBe("1:2, 2:7, 3:1, 4:1");
});

test(".weightedUnion()", () => {
  expect(
    Multiset.weightedUnion([set1, set2, set1, set2], [2, 1, 0]).toString()
  ).toBe("-2:7, 1:23, 2:23, 3:23, 4:8");
});
