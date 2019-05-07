import { get, set } from "lodash";
import * as mutations from "./mutations";

test("set*() mutations set boolean values of state", () => {
  const mutationPairs = [
    ["enabledSets.smogon", mutations.setSmogonSets],
    ["enabledSets.pokemonPerfect", mutations.setPokemonPerfectSets],
    ["enabledSets.usage", mutations.setUsageSets],
    ["enabledSets.custom", mutations.setCustomSets],
    ["longRolls", mutations.setLongRolls],
    ["fractions", mutations.setFractions],
    ["field.multiBattle", mutations.setMultiBattle],
    ["field.invertedBattle", mutations.setInvertedBattle],
    ["field.waterSport", mutations.setWaterSport],
    ["field.mudSport", mutations.setMudSport],
    ["field.gravity", mutations.setGravity],
    ["field.fairyAura", mutations.setFairyAura],
    ["field.darkAura", mutations.setDarkAura],
    ["field.auraBreak", mutations.setAuraBreak],
    ["field.ionDeluge", mutations.setIonDeluge]
  ];
  for (const [property, mutation] of mutationPairs) {
    const state = set({}, property, false);
    mutation(state, { active: true });
    expect(get(state, property)).toBe(true);
    mutation(state, { active: false });
    expect(get(state, property)).toBe(false);
  }

  const sidedMutationPairs = [
    ["stealthRock", mutations.setStealthRock],
    ["reflect", mutations.setReflect],
    ["lightScreen", mutations.setLightScreen],
    ["foresight", mutations.setForesight],
    ["friendGuard", mutations.setFriendGuard],
    ["auroraVeil", mutations.setAuroraVeil],
    ["battery", mutations.setBattery]
  ];
  for (const [property, mutation] of sidedMutationPairs) {
    for (const side of ["attacker", "defender"]) {
      const sidedProperty = `${side}.${property}`;
      const state = set({}, sidedProperty, false);
      mutation(state, { side, active: true });
      expect(get(state, sidedProperty)).toBe(true);
      mutation(state, { side, active: false });
      expect(get(state, sidedProperty)).toBe(false);
      expect(() => {
        mutation(state, { side: "absolutely not a side", active: true });
      }).toThrow();
    }
  }
});
