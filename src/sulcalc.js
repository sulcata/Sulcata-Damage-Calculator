import Pokemon from "./Pokemon";
import Move from "./Move";
import Field from "./Field";
import Multiset from "./Multiset";
import { Gens, Stats, Statuses, Types, Weathers } from "./utilities";
import { isPhysicalType, natureMultiplier, effectiveness } from "./info";
import { NoPokemonError, NoMoveError } from "./errors";
import calculate from "./calculate";
import endOfTurn from "./endOfTurn";

const weatherMessages = {
  [Weathers.HAIL]: "in Hail",
  [Weathers.RAIN]: "in Rain",
  [Weathers.SAND]: "in Sand",
  [Weathers.SUN]: "in Sun",
  [Weathers.HEAVY_RAIN]: "in Heavy Rain",
  [Weathers.HARSH_SUN]: "in Harsh Sun",
  [Weathers.STRONG_WINDS]: "in Strong Winds"
};

const statusMessages = {
  [Statuses.POISONED]: "poisoned",
  [Statuses.BADLY_POISONED]: "badly poisoned",
  [Statuses.BURNED]: "burned",
  [Statuses.PARALYZED]: "paralyzed",
  [Statuses.ASLEEP]: "asleep",
  [Statuses.FROZEN]: "frozen"
};

export default function sulcalc(attacker, defender, move, field) {
  attacker = new Pokemon(attacker);
  defender = new Pokemon(defender);
  move = new Move({ ...move, user: attacker, target: defender });
  field = new Field(field);

  const reportPokes = [];
  const reportDamage = [];
  const reportResult = [];

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

  const dmg = calculate(attacker, defender, move, field);

  if (move.name === "Smack Down" || move.name === "Thousand Arrows") {
    defender.grounded = true;
  }

  attacker.item.disabled = false;
  attacker.item.used = false;
  defender.item.disabled = false;
  defender.item.used = false;
  defender.ability.disabled = false;

  const maxHp = defender.stat(Stats.HP);

  const minPercent = Math.round((dmg[0].min() / maxHp) * 1000) / 10;
  const maxPercent = Math.round((dmg[0].max() / maxHp) * 1000) / 10;

  const convertToDamage = v => Math.max(0, maxHp - v);
  let initDmg = defender.currentHpRange.map(convertToDamage);
  let initDmgBerry = defender.currentHpRangeBerry.map(convertToDamage);

  let moveType, movePower;
  if (move.name === "Hidden Power") {
    moveType = Move.hiddenPowerType(attacker.ivs, field.gen);
    movePower = Move.hiddenPowerBp(attacker.ivs, field.gen);
  } else if (move.name === "Weather Ball") {
    moveType = Move.weatherBall(field.effectiveWeather());
    // gen 3 multiplies damage, not BP
    movePower = field.gen >= Gens.HGSS && moveType ? 100 : 50;
  } else if (move.zMove) {
    moveType = move.type();
    movePower = move.power();
  } else {
    moveType = move.type();
    movePower = null;
  }

  let a, d;
  if (move.isPsyshockLike()) {
    a = Stats.SATK;
    d = Stats.DEF;
  } else if (
    (field.gen >= Gens.HGSS && move.isPhysical()) ||
    (field.gen < Gens.HGSS && isPhysicalType(moveType))
  ) {
    a = Stats.ATK;
    d = Stats.DEF;
  } else {
    a = Stats.SATK;
    d = Stats.SDEF;
  }

  if (attacker.boosts[a]) {
    reportPokes.push((attacker.boosts[a] > 0 ? "+" : "") + attacker.boosts[a]);
  }

  if (field.gen >= Gens.ADV || attacker.evs[a] < 252) {
    const mult =
      field.gen >= Gens.ADV ? natureMultiplier(attacker.nature, a) : 0;
    if (mult) {
      reportPokes.push(attacker.evs[a] + (mult > 0 ? "+" : "-"));
    } else {
      reportPokes.push(attacker.evs[a]);
    }
    reportPokes.push(a === Stats.ATK ? "Atk" : "SpA");
  }

  if (field.gen >= Gens.GSC && !attacker.isItemRequired()) {
    reportPokes.push(attacker.item.name);
  }

  if (field.gen >= Gens.ADV && attacker.ability.name !== "(No Ability)") {
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

  if (move.zMove || (move.name === "Hidden Power" && field.gen <= Gens.B2W2)) {
    reportPokes.push(`[${movePower} BP]`);
  } else if (move.hitsMultipleTimes() && move.numberOfHits >= 1) {
    const n = move.numberOfHits;
    reportPokes.push(n > 1 ? `[${n} hits]` : `[${n} hit]`);
  }

  reportPokes.push("vs.");

  if (defender.boosts[d]) {
    reportPokes.push((defender.boosts[d] > 0 ? "+" : "") + defender.boosts[d]);
  }

  if (
    field.gen >= Gens.ADV ||
    defender.evs[d] < 252 ||
    defender.evs[Stats.HP] < 252
  ) {
    reportPokes.push(defender.evs[Stats.HP], "HP /");
    const mult =
      field.gen >= Gens.ADV ? natureMultiplier(defender.nature, d) : 0;
    if (mult) {
      reportPokes.push(defender.evs[d] + (mult > 0 ? "+" : "-"));
    } else {
      reportPokes.push(defender.evs[d]);
    }
    reportPokes.push(d === Stats.DEF ? "Def" : "SpD");
  }

  if (field.gen >= Gens.GSC && !defender.isItemRequired()) {
    reportPokes.push(defender.item.name);
  }

  if (field.gen >= Gens.ADV && defender.ability.name !== "(No Ability)") {
    reportPokes.push(defender.ability.name);
  }

  reportPokes.push(defender.name);

  if (!defender.isHealthy()) {
    reportPokes.push(`(${statusMessages[defender.status]})`);
  }

  const defenderHpPercent = Math.floor(
    (100 * defender.currentHp) / defender.stat(Stats.HP)
  );
  if (defenderHpPercent < 100) {
    reportPokes.push(`at ${defenderHpPercent}%`);
  }

  if (defender.reflect && d === Stats.DEF) {
    reportPokes.push("behind Reflect");
  } else if (defender.lightScreen && d === Stats.SDEF) {
    reportPokes.push("behind Light Screen");
  }

  if (weatherMessages[field.weather]) {
    reportPokes.push(weatherMessages[field.weather]);
  }

  if (dmg[0].min() === dmg[0].max()) {
    reportDamage.push(String(dmg[0].min()), `(${minPercent}%)`);
  } else {
    reportDamage.push(
      `${dmg[0].min()} - ${dmg[0].max()}`,
      `(${minPercent} - ${maxPercent}%)`
    );
  }

  // remove field hazards from current HP for probability calculation
  if (defender.ability.name !== "Magic Guard") {
    let hazardsDmg = 0;
    if (defender.stealthRock) {
      const [numerator, denominator] = effectiveness(
        Types.ROCK,
        defender.types(),
        {
          gen: field.gen
        }
      );
      hazardsDmg += Math.trunc((maxHp * numerator) / (denominator * 8));
    }
    if (defender.spikes > 0 && defender.isGrounded(field)) {
      hazardsDmg += Math.trunc(maxHp / (10 - 2 * defender.spikes));
    }
    initDmg = initDmg.map(v => Math.min(maxHp, v + hazardsDmg));
    initDmgBerry = initDmgBerry.map(v => Math.min(maxHp, v + hazardsDmg));
  }

  const chances = chanceToKo(defender, dmg, {
    initDmgRange: initDmg,
    initDmgRangeBerry: initDmgBerry,
    effects: effects.values,
    rechargeTurns: Number(move.requiresRecharge()),
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

function chanceToKo(poke, damageRanges, params) {
  const chances = [];
  const totalHp = poke.stat(Stats.HP);
  const berryHeal = poke.item.berryHeal(totalHp);
  const berryHealThreshold = poke.item.berryHealThreshold(totalHp);
  const maxTurns = params.maxTurns ?? 9;
  const rechargeTurns = params.rechargeTurns ?? 0;
  const effects = params.effects ?? [0];

  let dmg = new Multiset(params.initDmgRange ?? [0]);
  let berryDmg = new Multiset(params.initDmgRangeBerry ?? []);
  let toxicCounter = params.toxicCounter ?? 0;

  let remainingHealth, remainingHealthBerry;

  const hasFainted = damage => damage >= totalHp;
  const damageToHealth = damage => totalHp - damage;
  const applyDamage = (damage, newDamage) =>
    damage >= totalHp ? damage : damage + newDamage;

  for (let turn = 0, i = 0; turn < maxTurns; turn++, i++) {
    if (typeof damageRanges[i] === "number") {
      if (damageRanges[i] === 0) break;
      i += damageRanges[i];
    }

    dmg = dmg.permute(damageRanges[i], applyDamage).simplify();
    berryDmg = berryDmg.permute(damageRanges[i], applyDamage).simplify();

    for (let j = 0; j <= rechargeTurns; j++) {
      /*
       * because effects always has a 0 value passed in the first index,
       * berry check runs right after damage is applied, as well as after
       * every added effect. Separating damages with berries applied
       * prevents extra applications.
       */
      // berries go first to prevent double effect application
      berryDmg = berryDmg.map(
        berryDamageMap.bind({
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
          berryHeal,
          berryHealThreshold,
          berryDmg
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

    if (chances[chances.length - 1][0] === chances[chances.length - 1][1]) {
      break;
    }
  }

  return {
    fractionalChances: chances,
    roundedChances: chances.map(
      ([numerator, denominator]) =>
        numerator.multiply(1000000).divide(denominator) / 1000000
    ),
    remainingHealth,
    remainingHealthBerry
  };
}

function berryDamageMap(v) {
  for (let e = 0; e < this.effects.length && v < this.totalHp; e++) {
    if (this.effects[e] === "toxic") {
      // limit to at most enough to KO
      v += Math.trunc(((this.toxicCounter + 1) * this.totalHp) / 16);
    } else {
      // limit to at most enough to KO, at least enough to fully heal
      v = Math.max(0, v - this.effects[e]);
    }
  }
  return Math.min(this.totalHp, v);
}

function damageMap(v, w, skip) {
  let berryUsed = false;
  for (let e = 0; e < this.effects.length && v < this.totalHp; e++) {
    if (this.effects[e] === "toxic") {
      // limit to at most enough to KO
      v += Math.trunc(((this.toxicCounter + 1) * this.totalHp) / 16);
    } else {
      // limit to at most enough to KO, at least enough to fully heal
      v = Math.max(0, v - this.effects[e]);
    }
    if (
      !berryUsed &&
      this.berryHeal > 0 &&
      v < this.totalHp &&
      this.totalHp - v < this.berryHealThreshold
    ) {
      v = Math.max(0, v - this.berryHeal);
      berryUsed = true;
    }
  }
  v = Math.min(this.totalHp, v);
  // berry might not be the last effect added, so do this at the end
  if (berryUsed) {
    // separate berry modified value into berryDmg
    this.berryDmg.add(v, w);
    skip();
  }
  return v;
}
