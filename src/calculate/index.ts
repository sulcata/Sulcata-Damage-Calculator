import { flowRight } from "lodash";
import Field from "../Field";
import Move from "../Move";
import Multiset from "../Multiset";
import Pokemon from "../Pokemon";
import { Generation, Stat } from "../utilities";
import advCalculate from "./advCalculate";
import b2w2Calculate from "./b2w2Calculate";
import gscCalculate from "./gscCalculate";
import hgssCalculate from "./hgssCalculate";
import orasCalculate from "./orasCalculate";
import rbyCalculate from "./rbyCalculate";
import smCalculate from "./smCalculate";

const add = (a: number, b: number): number => a + b;

const calculateFns: {
  [key in Generation]: (
    attacker: Pokemon,
    defender: Pokemon,
    move: Move,
    field: Field
  ) => number[]
} = {
  [Generation.RBY]: rbyCalculate,
  [Generation.GSC]: gscCalculate,
  [Generation.ADV]: advCalculate,
  [Generation.HGSS]: hgssCalculate,
  [Generation.B2W2]: b2w2Calculate,
  [Generation.ORAS]: orasCalculate,
  [Generation.SM]: smCalculate
};

const genCalculate = flowRight(
  (damage: number[]) => new Multiset(damage),
  (
    attacker: Pokemon,
    defender: Pokemon,
    move: Move,
    field: Field
  ): number[] => {
    const gen = field.gen;
    const maxHp = defender.stat(Stat.HP);
    const level = attacker.level;

    switch (move.name) {
      case "Seismic Toss":
      case "Night Shade":
        return [attacker.level];
      case "Dragon Rage":
        return [40];
      case "Sonic Boom":
        return [20];
      case "Psywave": {
        const range = [];
        if (gen <= Generation.GSC) {
          // intentionally 1-149
          for (let i = 1; i < Math.trunc((level * 3) / 2); i++) {
            range.push(i);
          }
        } else {
          const increment = gen <= Generation.HGSS ? 10 : 1;
          for (let i = 50; i <= 150; i += increment) {
            range.push(Math.max(1, Math.trunc((level * i) / 100)));
          }
        }
        return range;
      }
      case "Super Fang":
      case "Nature's Madness":
        return [Math.max(1, Math.trunc(defender.currentHp / 2))];
      case "Guardian of Alola":
        return [Math.max(1, Math.trunc((defender.currentHp * 3) / 4))];
      case "Endeavor":
        return [Math.max(0, defender.currentHp - attacker.currentHp)];
      case "Final Gambit":
        return [attacker.currentHp];
      default:
        if (
          move.isOther() ||
          (move.isSound() && defender.ability.name === "Soundproof") ||
          (move.isBall() && defender.ability.name === "Bulletproof") ||
          (move.isExplosion() && defender.ability.name === "Damp")
        ) {
          return [0];
        }
        if (move.isOhko()) {
          return [maxHp];
        }
    }

    let damages = calculateFns[field.gen](attacker, defender, move, field);

    if (defender.ability.name === "Sturdy" && defender.currentHp === maxHp) {
      damages = damages.map(d => Math.min(maxHp - 1, d));
    }

    return damages;
  }
);

function turnCalculate(
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
): Multiset<number> {
  let dmg;
  if (move.name === "Triple Kick") {
    dmg = new Multiset([0]);
    for (let i = 1; i <= 3; i++) {
      move.tripleKickCount = i;
      dmg = dmg.permute(genCalculate(attacker, defender, move, field), add);
      defender.brokenMultiscale = true;
    }
    move.tripleKickCount = 1;
  } else if (move.name === "Beat Up") {
    dmg = new Multiset([0]);
    for (let i = 0; i < attacker.beatUpStats.length; i++) {
      move.beatUpHit = i;
      dmg = dmg.permute(genCalculate(attacker, defender, move, field), add);
      defender.brokenMultiscale = true;
    }
    move.beatUpHit = 0;
  } else if (move.name === "Present") {
    const heal = new Multiset([
      -Math.max(1, Math.floor(defender.stat(Stat.HP) / 4))
    ]);
    if (move.present === -1) {
      const dmgs = [heal];
      for (let i = 1; i <= 3; i++) {
        move.present = i;
        dmgs.push(genCalculate(attacker, defender, move, field));
      }
      move.present = -1;
      dmg = Multiset.weightedUnion(
        dmgs,
        field.gen >= Generation.ADV ? [2, 4, 3, 1] : [52, 102, 76, 26]
      );
    } else if (move.present === 0) {
      dmg = heal;
    } else {
      dmg = genCalculate(attacker, defender, move, field);
    }
  } else if (
    attacker.ability.name === "Parental Bond" &&
    move.maxHits() === 1 &&
    move.affectedByParentalBond() &&
    !(field.multiBattle && move.hasMultipleTargets())
  ) {
    // Parental Bond has no effect on Multi Hit moves in all cases
    // or in Multiple Target moves during non-Singles battles.
    // Fixed damage moves are still fixed. Psywave is calculated twice.
    // Fling, Self-Destruct, Explosion, Final Gambit, and Endeavor
    // are excluded from the effect.
    // Hits once at full power, and once at half power.
    dmg = genCalculate(attacker, defender, move, field);
    move.secondHit = true;
    defender.brokenMultiscale = true;
    dmg = dmg.permute(genCalculate(attacker, defender, move, field), add);
    move.secondHit = false;
  } else if (move.maxHits() > 1) {
    // multi-hit moves
    const dmgs = [new Multiset([0])];

    for (let i = 1; i <= move.maxHits(); i++) {
      if (field.gen >= Generation.GSC) {
        dmgs.push(
          dmgs[i - 1].permute(
            genCalculate(attacker, defender, move, field),
            add
          )
        );
      } else {
        dmgs.push(
          genCalculate(attacker, defender, move, field).map(d => d * i)
        );
      }
      defender.brokenMultiscale = true;
    }

    if (move.numberOfHits >= 1) {
      dmg = dmgs[move.numberOfHits];
    } else if (move.maxHits() === 2) {
      dmg = dmgs[2];
    } else {
      /*
       *  before b2w2:
       * 2 hits (3/8), 3 hits (3/8), 4 hits (1/8), 5 hits (1/8)
       * after b2w2:
       * 2 hits (1/3), 3 hits (1/3), 4 hits (1/6), 5 hits (1/6)
       */
      const weights =
        field.gen >= Generation.B2W2 ? [0, 0, 2, 2, 1, 1] : [0, 0, 3, 3, 1, 1];
      dmg = Multiset.weightedUnion(
        dmgs.slice(move.minHits(), move.maxHits()),
        weights.slice(move.minHits(), move.maxHits())
      );
    }
  } else {
    // simple move; default case.
    dmg = genCalculate(attacker, defender, move, field);
    defender.brokenMultiscale = true;
  }

  if (move.name === "Knock Off" && defender.knockOff()) {
    defender.item.used = true;
  }

  return dmg.size.leq(39) ? dmg : dmg.simplify();
}

export default (
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field
): [Multiset<number>[], number[]] => {
  switch (move.name) {
    case "(No Move)":
      return [[new Multiset([0])], [NaN]];
    case "Fury Cutter": {
      const dmg = [];
      const next = [];
      const tempCutter = move.furyCutter;
      while (move.furyCutter < 5) {
        dmg.push(turnCalculate(attacker, defender, move, field));
        next.push(1);
        move.furyCutter++;
      }
      dmg.push(turnCalculate(attacker, defender, move, field));
      next.push(0);
      move.furyCutter = tempCutter;
      defender.brokenMultiscale = false;
      return [dmg, next];
    }
    case "Echoed Voice": {
      const dmg = [];
      const next = [];
      const tempVoice = move.echoedVoice;
      while (move.echoedVoice < 4) {
        dmg.push(turnCalculate(attacker, defender, move, field));
        next.push(1);
        move.echoedVoice++;
      }
      dmg.push(turnCalculate(attacker, defender, move, field));
      next.push(0);
      move.echoedVoice = tempVoice;
      defender.brokenMultiscale = false;
      return [dmg, next];
    }
    case "Trump Card": {
      const dmg = [];
      const next = [];
      const tempPP = move.trumpPP;
      dmg.push(turnCalculate(attacker, defender, move, field));
      while (move.trumpPP > 0) {
        next.push(1);
        if (defender.ability.name === "Pressure") {
          move.trumpPP -= Math.min(2, move.trumpPP);
        } else {
          move.trumpPP--;
        }
        dmg.push(turnCalculate(attacker, defender, move, field));
      }
      next.push(NaN);
      move.trumpPP = tempPP;
      defender.brokenMultiscale = false;
      return [dmg, next];
    }
    case "Explosion":
    case "Self-Destruct": {
      const dmg = [turnCalculate(attacker, defender, move, field)];
      const next = [NaN];
      defender.brokenMultiscale = false;
      return [dmg, next];
    }
    case "Rollout":
    case "Ice Ball": {
      const dmg = [];
      const next = [];
      const tempRollout = move.rollout;
      for (let i = 0; i < 4; i++) {
        dmg.push(turnCalculate(attacker, defender, move, field));
        next.push(1);
        move.rollout++;
      }
      dmg.push(turnCalculate(attacker, defender, move, field));
      next.push(-4);
      move.rollout = tempRollout;
      defender.brokenMultiscale = false;
      return [dmg, next];
    }
    default: {
      const dmg = [
        turnCalculate(attacker, defender, move, field),
        turnCalculate(attacker, defender, move, field)
      ];
      const next = [1, 0];
      defender.brokenMultiscale = false;
      return [dmg, next];
    }
  }
};
