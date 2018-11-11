# sulcalc

[![Build Status](https://travis-ci.org/sulcata/sulcalc.svg?branch=master)](https://travis-ci.org/sulcata/sulcalc)

A Pokemon damage calculator.

## Usage

```js
import { sulcalc, Field, Gens, Move, Pokemon, Weathers } from "sulcalc";

const attacker = new Pokemon({
  name: "Moltres",
  item: "Charcoal",
  gen: Gens.GSC
});

const defender = new Pokemon({
  name: "Snorlax",
  item: "Leftovers",
  gen: Gens.GSC
});

const move = new Move({
  name: "Fire Blast",
  gen: Gens.GSC
});

const field = new Field({
  weather: Weathers.SUN,
  gen: Gens.GSC
});

sulcalc(attacker, defender, move, field).summary;
// 'Charcoal Moltres Fire Blast vs. Leftovers Snorlax in Sun: 237 - 279 (45.3 - 53.3%) -- 0.3% chance to 2HKO after Leftovers'
```

## Installing Dependencies and Setup

1.  Install [Node.js](https://nodejs.org/) if you haven't done so already.
2.  Run `npm install` in the root directory of the repository.
3.  Be sure to run `npm run setup` before running other tasks.

## Running

`npm start` to start a local server that will serve the app.

## Issues

[GitHub Issues](https://github.com/sulcata/sulcalc/issues)

## License

[MIT License](LICENSE)
