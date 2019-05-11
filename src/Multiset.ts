import * as bigInt from "big-integer";

type PredicateFn<T> = (value: T, multiplicity: bigInt.BigNumber) => boolean;
type MapFn<T, U> = (
  value: T,
  multiplicity: bigInt.BigInteger,
  skip: () => void
) => U;
type Entry<T> = [T, bigInt.BigInteger];
type CompareFn<T> = (a: T, b: T) => number;
type CombineFn<T, U, V> = (a: T, b: U) => V;

export default class Multiset<T> {
  private readonly data: Map<T, bigInt.BigInteger>;

  public constructor(iterable: Multiset<T> | T[] = []) {
    if (iterable instanceof Multiset) {
      this.data = new Map(iterable.data);
    } else {
      this.data = new Map();
      for (const value of iterable) {
        this.add(value);
      }
    }
  }

  public add(
    value: T,
    multiplicity: bigInt.BigNumber = bigInt.one
  ): Multiset<T> {
    this.data.set(
      value,
      (this.data.get(value) || bigInt.zero).add(multiplicity)
    );
    return this;
  }

  public clear(): void {
    this.data.clear();
  }

  public count(callbackFn: PredicateFn<T> = () => true): bigInt.BigInteger {
    let sum = bigInt.zero;
    for (const [value, multiplicity] of this) {
      if (callbackFn(value, multiplicity)) {
        sum = sum.add(multiplicity);
      }
    }
    return sum;
  }

  public delete(value: T): boolean {
    return this.data.delete(value);
  }

  public *entries(): IterableIterator<Entry<T>> {
    yield* this.data;
  }

  public every(callbackFn: PredicateFn<T>): boolean {
    for (const entry of this) {
      if (!callbackFn(...entry)) {
        return false;
      }
    }
    return true;
  }

  public has(value: T): boolean {
    return this.data.has(value);
  }

  public get(value: T): bigInt.BigInteger | undefined {
    return this.data.get(value);
  }

  public intersect(iterable: T[] | Multiset<T>): Multiset<T> {
    const multiset =
      iterable instanceof Multiset ? iterable : new Multiset(iterable);
    const intersection = new Multiset<T>();
    for (const [value, multiplicity] of this) {
      const otherMultiplicity = multiset.get(value);
      if (otherMultiplicity !== undefined) {
        if (multiplicity.leq(otherMultiplicity)) {
          intersection.add(value, multiplicity);
        } else {
          intersection.add(value, multiset.get(value));
        }
      }
    }
    return intersection;
  }

  public isEmpty(): boolean {
    return this.data.size === 0;
  }

  public *keys(): IterableIterator<T> {
    yield* this.data.keys();
  }

  public map<U>(callbackFn: MapFn<T, U>): Multiset<U> {
    let skipValue = false;
    function skip(): void {
      skipValue = true;
    }
    const mapped = new Multiset<U>();
    for (const entry of this) {
      const value = callbackFn(entry[0], entry[1], skip);
      if (skipValue) {
        skipValue = false;
      } else {
        mapped.add(value, entry[1]);
      }
    }
    return mapped;
  }

  public max<U>(
    defaultValue: U,
    compareFn: CompareFn<T> = (a, b) => (a > b ? 1 : 0)
  ): T | U {
    const itr = this.values();
    const first = itr.next();
    if (first.done) return defaultValue;
    let max = first.value;
    for (const value of itr) {
      if (compareFn(value, max) > 0) {
        max = value;
      }
    }
    return max;
  }

  public min<U>(
    defaultValue: U,
    compareFn: CompareFn<T> = (a, b) => (a > b ? 1 : 0)
  ): T | U {
    const itr = this.values();
    const first = itr.next();
    if (first.done) return defaultValue;
    let min = first.value;
    for (const value of itr) {
      if (compareFn(value, min) <= 0) {
        min = value;
      }
    }
    return min;
  }

  public permute<U, V>(
    iterable: U[] | Multiset<U>,
    callbackFn: CombineFn<T, U, V>
  ): Multiset<V> {
    const multiset =
      iterable instanceof Multiset ? iterable : new Multiset(iterable);
    const permutation = new Multiset<V>();
    for (const [value1, multiplicity1] of this) {
      for (const [value2, multiplicity2] of multiset) {
        permutation.add(
          callbackFn(value1, value2),
          multiplicity1.multiply(multiplicity2)
        );
      }
    }
    return permutation;
  }

  public get size(): bigInt.BigInteger {
    let size = bigInt.zero;
    for (const multiplicity of this.multiplicities()) {
      size = size.add(multiplicity);
    }
    return size;
  }

  public reduce<U>(
    callbackFn: (acc: U, value: T, multiplicity: bigInt.BigInteger) => U,
    initialValue: U
  ): U {
    let total = initialValue;
    for (const entry of this) {
      total = callbackFn(total, entry[0], entry[1]);
    }
    return total;
  }

  public scale(factor: bigInt.BigNumber = bigInt.one): Multiset<T> {
    const scaledSet = new Multiset<T>();
    for (const [value, multiplicity] of this) {
      scaledSet.add(value, multiplicity.multiply(factor));
    }
    return scaledSet;
  }

  public simplify(): Multiset<T> {
    const simplified = new Multiset<T>();
    const itr = this.multiplicities();
    const first = itr.next();
    if (first.done) return simplified;
    let gcd = first.value;
    for (const multiplicity of itr) {
      gcd = bigInt.gcd(gcd, multiplicity);
    }
    for (const [value, multiplicity] of this) {
      simplified.add(value, multiplicity.divide(gcd));
    }
    return simplified;
  }

  public some(callbackFn: PredicateFn<T>): boolean {
    for (const entry of this) {
      if (callbackFn(...entry)) {
        return true;
      }
    }
    return false;
  }

  public toArray(): T[] {
    const array = Array(Number(this.size));
    let i = 0;
    for (const [value, multiplicity] of this) {
      const m = Number(multiplicity);
      array.fill(value, i, i + m);
      i += m;
    }
    return array;
  }

  public toString(
    toStringFn: (entry: Entry<T>) => string = entry => entry.join(":"),
    compareFn: CompareFn<Entry<T>> = ([a], [b]) =>
      (a > b ? 1 : 0) - (b > a ? 1 : 0)
  ): string {
    return Array.from(this)
      .sort(compareFn)
      .map(toStringFn)
      .join(", ");
  }

  public union(iterable: T[] | Multiset<T>): Multiset<T> {
    const multiset =
      iterable instanceof Multiset ? iterable : new Multiset(iterable);
    const union = new Multiset<T>(this);
    for (const entry of multiset) {
      union.add(...entry);
    }
    return union;
  }

  public *values(): IterableIterator<T> {
    yield* this.data.keys();
  }

  public *multiplicities(): IterableIterator<bigInt.BigInteger> {
    yield* this.data.values();
  }

  public *[Symbol.iterator](): IterableIterator<Entry<T>> {
    yield* this.data;
  }

  public static average(multiSet: Multiset<number>, digits = 4): number {
    const size = multiSet.size;
    if (size.isZero()) return NaN;

    const weightedSum = multiSet.reduce(
      (sum, v, w) => sum.add(w.multiply(v)),
      bigInt.zero
    );

    const exp = 10 ** (digits + 1);
    const quotient = weightedSum
      .multiply(exp)
      .divide(size)
      .valueOf();
    return (Math.round(quotient / 10) * 10) / exp;
  }

  public static fromEntries<T>(iterable: [T, bigInt.BigNumber][]): Multiset<T> {
    const set = new Multiset<T>();
    for (const entry of iterable) {
      set.add(...entry);
    }
    return set;
  }

  public static weightedUnion<T>(
    sets: Multiset<T>[],
    weights: number[]
  ): Multiset<T> {
    const product = sets.reduce(
      (result, set) => result.multiply(set.size),
      bigInt.one
    );
    let result = new Multiset<T>();
    for (let i = 0; i < sets.length; i++) {
      if (!weights[i]) continue;
      const multiplier = product.divide(sets[i].size).multiply(weights[i]);
      const set = sets[i].scale(multiplier);
      result = result.union(set);
    }
    return result.simplify();
  }
}
