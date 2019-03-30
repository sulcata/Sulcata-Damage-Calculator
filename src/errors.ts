export class NoPokemonError extends RangeError {
  public constructor() {
    super("Pokemon cannot be (No Pokemon)");
    this.name = "NoPokemonError";
  }
}

export class NoMoveError extends RangeError {
  public constructor() {
    super("Move cannot be (No Move)");
    this.name = "NoMoveError";
  }
}
