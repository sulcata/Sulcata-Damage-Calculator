import * as bigInt from "big-integer";
import calculate from "./calculate";
import endOfTurn from "./endOfTurn";
import { NoMoveError, NoPokemonError } from "./errors";
import Field, { FieldOptions } from "./Field";
import { effectiveness, isPhysicalType, natureMultiplier } from "./info";
import Move, { MoveOptions } from "./Move";
import Multiset from "./Multiset";
import Pokemon, { PokemonOptions } from "./Pokemon";
import { Generation, Stat, Status, Type, Weather } from "./utilities";

const weatherMessages: { [key in Weather]: string } = {
  [Weather.CLEAR]: "",
  [Weather.HAIL]: "in Hail",
  [Weather.RAIN]: "in Rain",
  [Weather.SAND]: "in Sand",
  [Weather.SUN]: "in Sun",
  [Weather.HEAVY_RAIN]: "in Heavy Rain",
  [Weather.HARSH_SUN]: "in Harsh Sun",
  [Weather.STRONG_WINDS]: "in Strong Winds"
};

const statusMessages: { [key in Status]: string } = {
  [Status.NO_STATUS]: "",
  [Status.POISONED]: "poisoned",
  [Status.BADLY_POISONED]: "badly poisoned",
  [Status.BURNED]: "burned",
  [Status.PARALYZED]: "paralyzed",
  [Status.ASLEEP]: "asleep",
  [Status.FROZEN]: "frozen"
};

export type SulcalcReport = ReturnType<typeof sulcalc>;

export default function sulcalc(
  attackerOptions: Pokemon | PokemonOptions,
  defenderOptions: Pokemon | PokemonOptions,
  moveOptions: Move | MoveOptions,
  fieldOptions: Field | FieldOptions
) {
  const field = new Field(fieldOptions);
  const { gen } = field;
  const attacker = new Pokemon({ ...attackerOptions, gen });
  const defender = new Pokemon({ ...defenderOptions, gen });
  const move = new Move({
    ...moveOptions,
    user: attacker,
    target: defender,
    gen
  });

  const reportPokes: string[] = [];
  const reportDamage: string[] = [];
  const reportResult: string[] = [];

  if (attacker.name === "(No Pokemon)" || defender.name === "(No Pokemon)") {
    throw new NoPokemonError();
  }

  if (move.name === "(No Move)") {
    throw new NoMoveError();
  }

  if (
    field.magicRoom ||
    attacker.ability.name === "Klutz" ||
    (defender.ability.name === "Unnerve" && attacker.item.isBerry())
  ) {
    attacker.item.disabled = true;
  }
  if (
    field.magicRoom ||
    defender.ability.name === "Klutz" ||
    (attacker.ability.name === "Unnerve" && defender.item.isBerry())
  ) {
    defender.item.disabled = true;
  }

  if (
    attacker.ability.name === "Air Lock" ||
    defender.ability.name === "Air Lock"
  ) {
    field.airLock = true;
  }

  if (
    attacker.ability.name === "Fairy Aura" ||
    defender.ability.name === "Fairy Aura"
  ) {
    field.fairyAura = true;
  }

  if (
    attacker.ability.name === "Dark Aura" ||
    defender.ability.name === "Dark Aura"
  ) {
    field.darkAura = true;
  }

  if (
    attacker.ability.name === "Aura Break" ||
    defender.ability.name === "Aura Break"
  ) {
    field.auraBreak = true;
  }

  const effects = endOfTurn(attacker, defender, field);
  effects.messages.unshift("");
  effects.values.unshift(0);

  if (
    (attacker.ability.ignoresAbilities() || move.ignoresAbilities()) &&
    defender.ability.isIgnorable()
  ) {
    defender.ability.disabled = false;
  }

  if (defender.hasCritArmor() || !move.canCrit()) {
    move.critical = false;
  } else if (
    attacker.ability.name === "Merciless" &&
    (defender.isPoisoned() || defender.isBadlyPoisoned())
  ) {
    move.critical = true;
  }

  const [dmg, next] = calculate(attacker, defender, move, field);

  if (move.name === "Smack Down" || move.name === "Thousand Arrows") {
    defender.grounded = true;
  }

  attacker.item.disabled = false;
  attacker.item.used = false;
  defender.item.disabled = false;
  defender.item.used = false;
  defender.ability.disabled = false;

  const maxHp = defender.stat(Stat.HP);

  const minPercent = Math.round((dmg[0].min(NaN) / maxHp) * 1000) / 10;
  const maxPercent = Math.round((dmg[0].max(NaN) / maxHp) * 1000) / 10;

  const convertToDamage = (v: number) => Math.max(0, maxHp - v);
  let initDmg = defender.currentHpRange.map(convertToDamage);
  let initDmgBerry = defender.currentHpRangeBerry.map(convertToDamage);

  let moveType = Type.CURSE;
  let movePower = 0;
  if (move.name === "Hidden Power") {
    moveType = Move.hiddenPowerType(attacker.ivs, gen);
    movePower = Move.hiddenPowerBp(attacker.ivs, gen);
  } else if (move.name === "Weather Ball") {
    moveType = Move.weatherBall(field.effectiveWeather());
    // gen 3 multiplies damage, not BP
    movePower = gen >= Generation.HGSS && moveType ? 100 : 50;
  } else if (move.zMove) {
    moveType = move.type();
    movePower = move.power();
  } else {
    moveType = move.type();
  }

  let a = gen >= Generation.GSC ? Stat.SATK : Stat.SPC;
  let d = gen >= Generation.GSC ? Stat.SDEF : Stat.SPC;
  if (move.isPsyshockLike()) {
    a = Stat.SATK;
    d = Stat.DEF;
  } else if (
    (gen >= Generation.HGSS && move.isPhysical()) ||
    (gen < Generation.HGSS && isPhysicalType(moveType))
  ) {
    a = Stat.ATK;
    d = Stat.DEF;
  }

  if (attacker.boosts[a]) {
    reportPokes.push(
      attacker.boosts[a] > 0
        ? `+${attacker.boosts[a]}`
        : `${attacker.boosts[a]}`
    );
  }

  if (gen >= Generation.ADV || attacker.evs[a] < 252) {
    const mult =
      gen >= Generation.ADV ? natureMultiplier(attacker.nature, a) : 0;
    if (mult > 0) {
      reportPokes.push(`${attacker.evs[a]}+`);
    } else if (mult < 0) {
      reportPokes.push(`${attacker.evs[a]}-`);
    } else {
      reportPokes.push(`${attacker.evs[a]}`);
    }
    reportPokes.push(a === Stat.ATK ? "Atk" : "SpA");
  }

  if (gen >= Generation.GSC && !attacker.isItemRequired()) {
    reportPokes.push(attacker.item.name);
  }

  if (gen >= Generation.ADV && attacker.ability.name !== "(No Ability)") {
    reportPokes.push(attacker.ability.name);
  }

  reportPokes.push(attacker.name);

  if (!attacker.isHealthy()) {
    reportPokes.push(`(${statusMessages[attacker.status]})`);
  }

  if (move.critical) {
    reportPokes.push("critical hit");
  }

  if (attacker.helpingHand) {
    reportPokes.push("Helping Hand");
  }

  reportPokes.push(move.name);

  if (move.zMove || (move.name === "Hidden Power" && gen <= Generation.B2W2)) {
    reportPokes.push(`[${movePower} BP]`);
  } else if (move.hitsMultipleTimes() && move.numberOfHits >= 1) {
    const n = move.numberOfHits;
    reportPokes.push(n > 1 ? `[${n} hits]` : `[${n} hit]`);
  }

  reportPokes.push("vs.");

  if (defender.boosts[d]) {
    reportPokes.push(
      defender.boosts[d] > 0
        ? `+${defender.boosts[d]}`
        : `${defender.boosts[d]}`
    );
  }

  if (
    gen >= Generation.ADV ||
    defender.evs[d] < 252 ||
    defender.evs[Stat.HP] < 252
  ) {
    reportPokes.push(`${defender.evs[Stat.HP]} HP /`);
    const mult =
      gen >= Generation.ADV ? natureMultiplier(defender.nature, d) : 0;
    if (mult > 0) {
      reportPokes.push(`${defender.evs[d]}+`);
    } else if (mult < 0) {
      reportPokes.push(`${defender.evs[d]}-`);
    } else {
      reportPokes.push(`${defender.evs[d]}`);
    }
    reportPokes.push(d === Stat.DEF ? "Def" : "SpD");
  }

  if (gen >= Generation.GSC && !defender.isItemRequired()) {
    reportPokes.push(defender.item.name);
  }

  if (gen >= Generation.ADV && defender.ability.name !== "(No Ability)") {
    reportPokes.push(defender.ability.name);
  }

  reportPokes.push(defender.name);

  if (!defender.isHealthy()) {
    reportPokes.push(`(${statusMessages[defender.status]})`);
  }

  const defenderHpPercent = Math.floor(
    (100 * defender.currentHp) / defender.stat(Stat.HP)
  );
  if (defenderHpPercent < 100) {
    reportPokes.push(`at ${defenderHpPercent}%`);
  }

  if (defender.reflect && d === Stat.DEF) {
    reportPokes.push("behind Reflect");
  } else if (defender.lightScreen && (d === Stat.SDEF || d === Stat.SPC)) {
    reportPokes.push("behind Light Screen");
  }

  if (weatherMessages[field.weather]) {
    reportPokes.push(weatherMessages[field.weather]);
  }

  if (dmg[0].min(NaN) === dmg[0].max(NaN)) {
    reportDamage.push(String(dmg[0].min(NaN)), `(${minPercent}%)`);
  } else {
    reportDamage.push(
      `${dmg[0].min(NaN)} - ${dmg[0].max(NaN)}`,
      `(${minPercent} - ${maxPercent}%)`
    );
  }

  // remove field hazards from current HP for probability calculation
  if (defender.ability.name !== "Magic Guard") {
    let hazardsDmg = 0;
    if (defender.stealthRock) {
      const [numerator, denominator] = effectiveness(
        Type.ROCK,
        defender.types(),
        { gen }
      );
      hazardsDmg += Math.trunc((maxHp * numerator) / (denominator * 8));
    }
    if (defender.spikes > 0 && defender.isGrounded(field)) {
      hazardsDmg += Math.trunc(maxHp / (10 - 2 * defender.spikes));
    }
    initDmg = initDmg.map((v: number) => Math.min(maxHp, v + hazardsDmg));
    initDmgBerry = initDmgBerry.map((v: number) =>
      Math.min(maxHp, v + hazardsDmg)
    );
  }

  const chances = chanceToKo(defender, dmg, next, {
    initDmgRange: initDmg,
    initDmgRangeBerry: initDmgBerry,
    effects: effects.values,
    rechargeTurns: move.requiresRecharge() ? 1 : 0,
    toxicCounter: defender.toxicCounter
  });

  effects.messages = effects.messages.slice(1);
  effects.values = effects.values.slice(1);

  const displayChances = [];
  for (let i = 0; i < chances.roundedChances.length; i++) {
    const nhko = `${i ? i + 1 : "O"}HKO`;
    const fractionalChance = chances.fractionalChances[i];
    if (fractionalChance[0].eq(fractionalChance[1])) {
      if (displayChances.length === 0) {
        displayChances.push(`guaranteed ${nhko}`);
      }
      break;
    } else if (!fractionalChance[0].isZero()) {
      const c = Math.round(chances.roundedChances[i] * 1000) / 10;
      if (c === 100) {
        displayChances.push(`almost guaranteed ${nhko}`);
      } else if (c === 0) {
        displayChances.push(`negligible chance to ${nhko}`);
      } else {
        displayChances.push(`${c}% chance to ${nhko}`);
      }
    }
  }

  if (displayChances.length > 0) {
    reportResult.push(displayChances.join(", "));
    if (effects.messages.length > 0) {
      reportResult.push("after", effects.messages.join(", "));
    }
  } else {
    reportResult.push("this might take a while...");
  }

  defender.currentHpRange = chances.remainingHealth;
  defender.currentHpRangeBerry = chances.remainingHealthBerry;

  const pokeInfo = reportPokes.join(" ");
  const damageInfo = reportDamage.join(" ");
  const resultInfo = reportResult.join(" ");

  return {
    summary: `${pokeInfo}: ${damageInfo} -- ${resultInfo}`,
    attacker,
    defender,
    move,
    field,
    minPercent,
    maxPercent,
    damages: dmg.slice(0, dmg.length - 1),
    damage: dmg[0],
    effectValues: effects.values,
    effectMessages: effects.messages,
    fractionalChances: chances.fractionalChances,
    roundedChances: chances.roundedChances
  };
}

function chanceToKo(
  poke: Pokemon,
  damageRanges: Multiset<number>[],
  next: number[],
  params: {
    initDmgRange?: Multiset<number>;
    initDmgRangeBerry?: Multiset<number>;
    effects?: (number | "toxic")[];
    rechargeTurns?: number;
    toxicCounter?: number;
    maxTurns?: number;
  }
) {
  const chances: [bigInt.BigInteger, bigInt.BigInteger][] = [];
  const totalHp = poke.stat(Stat.HP);
  const berryHeal = poke.item.berryHeal(totalHp);
  const berryHealThreshold = poke.item.berryHealThreshold(totalHp);
  const { maxTurns = 9, rechargeTurns = 0, effects = [0] } = params;

  let dmg = new Multiset(params.initDmgRange || [0]);
  let berryDmg = new Multiset(params.initDmgRangeBerry || []);
  let toxicCounter = params.toxicCounter || 0;

  let remainingHealth = new Multiset<number>();
  let remainingHealthBerry = new Multiset<number>();

  const hasFainted = (damage: number) => damage >= totalHp;
  const damageToHealth = (damage: number) => totalHp - damage;
  const applyDamage = (damage: number, newDamage: number) =>
    damage >= totalHp ? damage : damage + newDamage;

  for (let turn = 0, i = 0; turn < maxTurns; turn++) {
    dmg = dmg.permute(damageRanges[i], applyDamage);
    berryDmg = berryDmg.permute(damageRanges[i], applyDamage);

    for (let j = 0; j <= rechargeTurns; j++) {
      /*
       * because effects always has a 0 value passed in the first index,
       * berry check runs right after damage is applied, as well as after
       * every added effect. Separating damages with berries applied
       * prevents extra applications.
       */
      // berries go first to prevent double effect application
      berryDmg = berryDmg.map(
        damageMap.bind({
          effects,
          toxicCounter,
          totalHp
        })
      );

      dmg = dmg.map(
        damageMap.bind({
          effects,
          toxicCounter,
          totalHp,
          berry: {
            heal: berryHeal,
            threshold: berryHealThreshold,
            dmg: berryDmg
          }
        })
      );

      toxicCounter++;
    }

    chances.push([
      dmg.count(hasFainted).add(berryDmg.count(hasFainted)),
      dmg.size.add(berryDmg.size)
    ]);

    if (turn === 0) {
      remainingHealth = dmg.map(damageToHealth);
      remainingHealthBerry = berryDmg.map(damageToHealth);
    }

    i += next[i];

    if (
      Number.isNaN(i) ||
      chances[chances.length - 1][0].eq(chances[chances.length - 1][1])
    ) {
      // We cannot attack again or 100% KO'd the defending Pokemon
      break;
    }
  }

  return {
    fractionalChances: chances,
    roundedChances: chances.map(
      ([numerator, denominator]) =>
        numerator
          .multiply(1000000)
          .divide(denominator)
          .valueOf() / 1000000
    ),
    remainingHealth,
    remainingHealthBerry
  };
}

function damageMap(
  this: {
    totalHp: number;
    effects: (number | "toxic")[];
    toxicCounter: number;
    berry?: {
      heal: number;
      threshold: number;
      dmg: Multiset<number>;
    };
  },
  v: number,
  w: bigInt.BigInteger,
  skip: () => void
) {
  const { berry, effects, totalHp, toxicCounter } = this;
  let berryUsed = false;
  for (const effect of effects) {
    if (v >= totalHp) break;
    if (effect === "toxic") {
      // limit to at most enough to KO
      v += Math.trunc(((toxicCounter + 1) * totalHp) / 16);
    } else {
      // limit to at most enough to KO, at least enough to fully heal
      v = Math.max(0, v - effect);
    }
    if (berry !== undefined) {
      if (v >= totalHp) break;
      if (!berryUsed && berry.heal > 0 && totalHp - v <= berry.threshold) {
        v = Math.max(0, v - berry.heal);
        berryUsed = true;
      }
    }
  }
  v = Math.min(totalHp, v);
  // berry might not be the last effect added, so do this at the end
  if (berry !== undefined && berryUsed) {
    // separate berry modified value into berryDmg
    berry.dmg.add(v, w);
    skip();
  }
  return v;
}
