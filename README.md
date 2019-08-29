# sulcalc

[![Build Status](https://travis-ci.org/sulcata/sulcalc.svg?branch=master)](https://travis-ci.org/sulcata/sulcalc)

A Pokemon damage calculator.

## Usage

```js
import { sulcalc, Field, Generation, Move, Pokemon, Weather } from "sulcalc";

const attacker = new Pokemon({
  name: "Moltres",
  item: "Charcoal",
  gen: Generation.GSC
});

const defender = new Pokemon({
  name: "Snorlax",
  item: "Leftovers",
  gen: Generation.GSC
});

const move = new Move({
  name: "Fire Blast",
  gen: Generation.GSC
});

const field = new Field({
  weather: Weather.SUN,
  gen: Generation.GSC
});

sulcalc(attacker, defender, move, field).summary;
// 'Charcoal Moltres Fire Blast vs. Leftovers Snorlax in Sun: 237 - 279 (45.3 - 53.3%) -- 0.3% chance to 2HKO after Leftovers'
```

## Installing Dependencies and Setup

1.  Install [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/en/).
2.  Run `yarn` in the root directory of the repository.
3.  Be sure to run `yarn setup` before running other tasks.

## Running

- `yarn start` to start a local server that will serve the app.
- After a while it will finish building and provide a link in the console.

## Building

- `yarn build:app` to build the web app.
- `yarn build:lib` to bundle just the API together.
- All builds are put in the `/dist` folder.

## Linting and Testing

- `yarn test` to run the unit tests.
- `yarn lint` to run TSLint and Prettier.
- `yarn style:fix` to autoformat with Prettier.
- These should all be run automatically before commits.

## Issues

[GitHub Issues](https://github.com/sulcata/sulcalc/issues)

## License

[MIT License](LICENSE)
