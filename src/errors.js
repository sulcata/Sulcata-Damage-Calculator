export class NoPokemonError extends Error {
  constructor() {
    super("Pokemon cannot be (No Pokemon)");
    this.name = "NoPokemonError";
  }
}

export class NoMoveError extends Error {
  constructor() {
    super("Move cannot be (No Move)");
    this.name = "NoMoveError";
  }
}
