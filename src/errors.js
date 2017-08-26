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
