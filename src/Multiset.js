import bigInt from "big-integer";

export default class Multiset {
  constructor(iterable = []) {
    if (iterable instanceof Multiset) {
      this._data = new Map(iterable._data);
    } else if (iterable instanceof Map) {
      this._data = new Map();
      for (const [value, weight] of iterable) {
        this._data.set(value, bigInt(weight));
      }
    } else {
      this._data = new Map();
      for (const value of iterable) {
        this.add(value);
      }
    }
  }

  add(value, multiplicity = bigInt.one) {
    this._data.set(value, bigInt(this._data.get(value)).add(multiplicity));
    return this;
  }

  clear() {
    this._data.clear();
  }

  count(callbackFn = () => true) {
    let sum = bigInt.zero;
    for (const [value, multiplicity] of this) {
      if (callbackFn(value, multiplicity)) {
        sum = sum.add(multiplicity);
      }
    }
    return sum;
  }

  delete(value) {
    return this._data.delete(value);
  }

  *entries() {
    yield* this._data;
  }

  every(callbackFn) {
    for (const entry of this) {
      if (!callbackFn(...entry)) {
        return false;
      }
    }
    return true;
  }

  has(value) {
    return this._data.has(value);
  }

  get(value) {
    return this._data.get(value);
  }

  intersect(iterable) {
    const multiset =
      iterable instanceof Multiset ? iterable : new Multiset(iterable);
    const intersection = new Multiset();
    for (const [value, multiplicity] of this) {
      if (multiset.has(value)) {
        if (multiplicity.leq(multiset.get(value))) {
          intersection.add(value, multiplicity);
        } else {
          intersection.add(value, multiset.get(value));
        }
      }
    }
    return intersection;
  }

  isEmpty() {
    return this._data.size === 0;
  }

  *keys() {
    yield* this._data.keys();
  }

  map(callbackFn) {
    let skipValue = false;
    function skip() {
      skipValue = true;
    }
    const mapped = new Multiset();
    for (const entry of this) {
      const value = callbackFn(...entry, skip);
      if (skipValue) {
        skipValue = false;
      } else {
        mapped.add(value, entry[1]);
      }
    }
    return mapped;
  }

  max(compareFn = (a, b) => a > b) {
    let max = undefined;
    const itr = this.values();
    const first = itr.next();
    if (!first.done) {
      max = first.value;
      for (const value of itr) {
        if (compareFn(value, max) > 0) {
          max = value;
        }
      }
    }
    return max;
  }

  min(compareFn = (a, b) => a > b) {
    let min = undefined;
    const itr = this.values();
    const first = itr.next();
    if (!first.done) {
      min = first.value;
      for (const value of itr) {
        if (compareFn(value, min) <= 0) {
          min = value;
        }
      }
    }
    return min;
  }

  permute(iterable, callbackFn = (a, b) => a + b) {
    const multiset =
      iterable instanceof Multiset ? iterable : new Multiset(iterable);
    const permutation = new Multiset();
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

  get size() {
    let size = bigInt.zero;
    for (const multiplicity of this.multiplicities()) {
      size = size.add(multiplicity);
    }
    return size;
  }

  reduce(callbackFn, initialValue) {
    const itr = this.entries();
    let total = initialValue;
    if (initialValue === undefined) {
      const first = itr.next();
      if (first.done) return undefined;
      total = first.value;
    }
    for (const entry of itr) {
      total = callbackFn(total, ...entry);
    }
    return total;
  }

  scale(factor = bigInt.one) {
    const scaledSet = new Multiset();
    for (const [value, multiplicity] of this) {
      scaledSet.add(value, multiplicity.multiply(factor));
    }
    return scaledSet;
  }

  simplify() {
    const simplified = new Multiset();
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

  some(callbackFn) {
    for (const entry of this) {
      if (callbackFn(...entry)) {
        return true;
      }
    }
    return false;
  }

  toArray() {
    const array = Array(Number(this.size));
    let i = 0;
    for (const [value, multiplicity] of this) {
      const m = Number(multiplicity);
      array.fill(value, i, i + m);
      i += m;
    }
    return array;
  }

  toString(
    toStringFn = entry => entry.join(":"),
    compareFn = ([a], [b]) => (a > b) - (b > a)
  ) {
    return Array.from(this)
      .sort(compareFn)
      .map(toStringFn)
      .join(", ");
  }

  union(iterable) {
    const multiset =
      iterable instanceof Multiset ? iterable : new Multiset(iterable);
    const union = new Multiset(this);
    for (const entry of multiset) {
      union.add(...entry);
    }
    return union;
  }

  *values() {
    yield* this._data.keys();
  }

  *multiplicities() {
    yield* this._data.values();
  }

  *[Symbol.iterator]() {
    yield* this._data;
  }

  static average(multiSet, digits = 4) {
    const size = multiSet.size;
    if (size.isZero()) return NaN;

    const weightedSum = multiSet.reduce(
      (sum, v, w) => sum.add(w.multiply(v)),
      bigInt.zero
    );

    const exp = 10 ** (digits + 1);
    const quotient = weightedSum.multiply(exp).divide(size);
    return (Math.round(quotient / 10) * 10) / exp;
  }

  static weightedUnion(sets, weights) {
    const product = sets.reduce(
      (result, set) => result.multiply(set.size),
      bigInt.one
    );
    let result = new Multiset();
    for (let i = 0; i < sets.length; i++) {
      if (!weights[i]) continue;
      const multiplier = product.divide(sets[i].size).multiply(weights[i]);
      const set = sets[i].scale(multiplier);
      result = result.union(set);
    }
    return result.simplify();
  }
}
