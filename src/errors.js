export class MissingnoError extends Error {
    constructor() {
        super("Pokemon cannot be Missingno");
        this.name = "MissingnoError";
    }
}

export class NoMoveError extends Error {
    constructor() {
        super("Move cannot be (No Move)");
        this.name = "NoMoveError";
    }
}

/* Importable Errors */

export class ImportableEvError extends Error {
    constructor(ev) {
        super(`${ev} is not a valid EV`);
        this.name = "ImportableEvError";
    }
}

export class ImportableIvError extends Error {
    constructor(iv) {
        super(`${iv} is not a valid IV`);
        this.name = "ImportableIvError";
    }
}

export class ImportableLevelError extends Error {
    constructor(level) {
        super(`${level} is not a valid level`);
        this.name = "ImportableLevelError";
    }
}

export class ImportableLineError extends Error {
    constructor(line) {
        super(`${line} is not a valid importable line`);
        this.name = "ImportableLineError";
    }
}
