export class NoPokemonError extends RangeError {
  constructor() {
    super("Pokemon cannot be (No Pokemon)");
    this.name = "NoPokemonError";
  }
}

export class NoMoveError extends RangeError {
  constructor() {
    super("Move cannot be (No Move)");
    this.name = "NoMoveError";
  }
}
