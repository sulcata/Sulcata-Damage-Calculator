import {addStrs, cmpStrs, multiplyStrs, divideStrs, gcdStrs} from "./utilities";

export default class Multiset {
    constructor(iterable = []) {
        if (iterable instanceof Multiset) {
            this._data = new Map(iterable._data);
        } else if (iterable instanceof Map) {
            this._data = new Map(iterable);
        } else {
            this._data = new Map();
            for (const value of iterable) {
                this.add(value);
            }
        }
    }

    add(value, multiplicity = "1") {
        this._data.set(value, addStrs(this._data.get(value) || "0",
                                      String(multiplicity)));
        return this;
    }

    clear() {
        this._data.clear();
    }

    count(callbackFn = (() => true), thisArg) {
        let sum = "0";
        for (const entry of this) {
            if (Reflect.apply(callbackFn, thisArg, [...entry, this])) {
                sum = addStrs(sum, entry[1]);
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

    every(callbackFn, thisArg) {
        for (const entry of this) {
            if (!Reflect.apply(callbackFn, thisArg, [...entry, this])) {
                return false;
            }
        }
        return true;
    }

    forEach(callbackFn, thisArg) {
        for (const entry of this) {
            Reflect.apply(callbackFn, thisArg, [...entry, this]);
        }
    }

    has(value) {
        return this._data.has(value);
    }

    get(value) {
        return this._data.get(value);
    }

    intersect(iterable) {
        const multiset = (iterable instanceof Multiset)
            ? iterable : new Multiset(iterable);
        const intersection = new Multiset();
        for (const [value, multiplicity] of this) {
            if (multiset.has(value)) {
                if (cmpStrs(multiplicity, multiset.get(value)) <= 0) {
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

    map(callbackFn, thisArg) {
        let skipValue = false;
        function skip() {
            skipValue = true;
        }
        const mapped = new Multiset();
        for (const entry of this) {
            const value = Reflect.apply(callbackFn, thisArg,
                                        [...entry, this, skip]);
            if (skipValue) {
                skipValue = false;
            } else {
                mapped.add(value, entry[1]);
            }
        }
        return mapped;
    }

    max(compareFn = ((a, b) => a > b)) {
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

    min(compareFn = ((a, b) => a > b)) {
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

    permute(iterable, callbackFn = ((a, b) => a + b)) {
        const multiset = (iterable instanceof Multiset)
            ? iterable : new Multiset(iterable);
        const permutation = new Multiset();
        for (const [value1, multiplicity1] of this) {
            for (const [value2, multiplicity2] of multiset) {
                permutation.add(callbackFn(value1, value2),
                                multiplyStrs(multiplicity1, multiplicity2));
            }
        }
        return permutation;
    }

    get size() {
        let size = "0";
        for (const multiplicity of this.multiplicities()) {
            size = addStrs(size, multiplicity);
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
            total = callbackFn(total, ...entry, this);
        }
        return total;
    }

    scale(factor = "1") {
        factor = String(factor);
        const scaled = new Multiset();
        for (const [value, multiplicity] of this) {
            scaled.add(value, multiplyStrs(multiplicity, factor));
        }
        return scaled;
    }

    simplify() {
        const simplified = new Multiset();
        const itr = this.multiplicities();
        const first = itr.next();
        if (first.done) return simplified;
        let gcd = first.value;
        for (const multiplicity of itr) {
            gcd = gcdStrs(gcd, multiplicity);
        }
        for (const [value, multiplicity] of this) {
            simplified.add(value, divideStrs(multiplicity, gcd)[0]);
        }
        return simplified;
    }

    some(callbackFn, thisArg) {
        for (const entry of this) {
            if (Reflect.apply(callbackFn, thisArg, [...entry, this])) {
                return true;
            }
        }
        return false;
    }

    toString(toStringFn = (entry => entry.join(":")),
             compareFn = (([a], [b]) => (a > b) - (b > a))) {
        return Array.from(this)
            .sort(compareFn)
            .map(toStringFn)
            .join(", ");
    }

    union(iterable) {
        const multiset = (iterable instanceof Multiset)
            ? iterable : new Multiset(iterable);
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
}
