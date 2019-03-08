import { get, set } from "lodash";
import * as actions from "./actions";

test("toggle*() actions commit inverted boolean values", () => {
  const actionPairs = [
    ["enabledSets.smogon", "SmogonSets"],
    ["enabledSets.pokemonPerfect", "PokemonPerfectSets"],
    ["enabledSets.usage", "UsageSets"],
    ["enabledSets.custom", "CustomSets"],
    ["longRolls", "LongRolls"],
    ["fractions", "Fractions"],
    ["field.multiBattle", "MultiBattle"],
    ["field.invertedBattle", "InvertedBattle"],
    ["field.waterSport", "WaterSport"],
    ["field.mudSport", "MudSport"],
    ["field.gravity", "Gravity"],
    ["field.fairyAura", "FairyAura"],
    ["field.darkAura", "DarkAura"],
    ["field.auraBreak", "AuraBreak"],
    ["field.ionDeluge", "IonDeluge"]
  ];
  for (const [property, name] of actionPairs) {
    const action = actions[`toggle${name}`];
    for (const booleanValue of [false, true]) {
      const state = set({}, property, booleanValue);
      const commit = jest.fn();
      action({ commit, state });
      expect(commit).toHaveBeenCalledWith(`set${name}`, {
        active: !booleanValue
      });
    }
  }

  const sidedActionPairs = [
    ["stealthRock", "StealthRock"],
    ["reflect", "Reflect"],
    ["lightScreen", "LightScreen"],
    ["foresight", "Foresight"],
    ["friendGuard", "FriendGuard"],
    ["auroraVeil", "AuroraVeil"],
    ["battery", "Battery"]
  ];
  for (const [property, name] of sidedActionPairs) {
    const action = actions[`toggle${name}`];
    for (const side of ["attacker", "defender"]) {
      const sidedProperty = `${side}.${property}`;
      for (const booleanValue of [false, true]) {
        const state = set({}, sidedProperty, booleanValue);
        const commit = jest.fn();
        action({ commit, state }, { side });
        expect(commit).toHaveBeenCalledWith(`set${name}`, {
          active: !booleanValue
        });
      }
    }
  }
});
