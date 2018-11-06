import { get, set } from "lodash";
import * as mutations from "./mutations";

test("toggle*() mutations switch boolean values of state", () => {
  const mutationPairs = [
    ["enabledSets.smogon", mutations.toggleSmogonSets],
    ["enabledSets.pokemonPerfect", mutations.togglePokemonPerfectSets],
    ["enabledSets.usage", mutations.toggleUsageSets],
    ["enabledSets.custom", mutations.toggleCustomSets],
    ["longRolls", mutations.toggleLongRolls],
    ["fractions", mutations.toggleFractions],
    ["field.multiBattle", mutations.toggleMultiBattle],
    ["field.invertedBattle", mutations.toggleInvertedBattle],
    ["field.waterSport", mutations.toggleWaterSport],
    ["field.mudSport", mutations.toggleMudSport],
    ["field.gravity", mutations.toggleGravity],
    ["field.fairyAura", mutations.toggleFairyAura],
    ["field.darkAura", mutations.toggleDarkAura],
    ["field.auraBreak", mutations.toggleAuraBreak],
    ["field.ionDeluge", mutations.toggleIonDeluge]
  ];
  for (const [property, mutation] of mutationPairs) {
    const state = set({}, property, false);
    mutation(state);
    expect(get(state, property)).toBe(true);
    mutation(state);
    expect(get(state, property)).toBe(false);
  }

  const sidedMutationPairs = [
    ["stealthRock", mutations.toggleStealthRock],
    ["reflect", mutations.toggleReflect],
    ["lightScreen", mutations.toggleLightScreen],
    ["foresight", mutations.toggleForesight],
    ["friendGuard", mutations.toggleFriendGuard],
    ["auroraVeil", mutations.toggleAuroraVeil],
    ["battery", mutations.toggleBattery]
  ];
  for (const [property, mutation] of sidedMutationPairs) {
    for (const side of ["attacker", "defender"]) {
      const sidedProperty = `${side}.${property}`;
      const state = set({}, sidedProperty, false);
      mutation(state, { side });
      expect(get(state, sidedProperty)).toBe(true);
      mutation(state, { side });
      expect(get(state, sidedProperty)).toBe(false);
      expect(() => {
        mutation(state, { side: "absolutely not a side" });
      }).toThrowError();
    }
  }
});
