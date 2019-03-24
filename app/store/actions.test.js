import { get, set } from "lodash";
import { Generation } from "sulcalc";
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
          active: !booleanValue,
          side
        });
      }
    }
  }
});

test("changeGen calls appropriate mutations", () => {
  const commit = jest.fn();
  const gen = Generation.GSC;
  actions.changeGen({ commit }, { gen });
  const { calls } = commit.mock;
  expect(calls[0][0]).toBe("setGen");
  expect(calls[1][0]).toBe("setAttacker");
  expect(calls[2][0]).toBe("setDefender");
  expect(calls[3][0]).toBe("setField");
  expect(calls[4][0]).toBe("setReportStick");
  expect(calls[5][0]).toBe("setReportOverrideIndex");
});
