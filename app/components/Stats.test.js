import { shallowMount } from "@vue/test-utils";
import StatsComponent from "./Stats.vue";
import { Gens, Stats, Pokemon } from "sulcalc";

test("calculates the maximum IV", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Gens.ORAS }) }
  });
  expect(wrapper.vm.maxIv).toBe(31);
  wrapper.setProps({ pokemon: new Pokemon({ gen: Gens.GSC }) });
  expect(wrapper.vm.maxIv).toBe(15);
});

test("calculates the default EV", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Gens.ORAS }) }
  });
  expect(wrapper.vm.defaultEv).toBe(0);
  wrapper.setProps({ pokemon: new Pokemon({ gen: Gens.GSC }) });
  expect(wrapper.vm.defaultEv).toBe(252);
});

test("generates labels for stat boost levels", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Gens.ORAS }) }
  });
  expect(wrapper.vm.statBoost(-3)).toBe("-3");
  expect(wrapper.vm.statBoost(0)).toBe("--");
  expect(wrapper.vm.statBoost(2)).toBe("+2");
});

test("creates a list of stat values and labels", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Gens.ORAS }) }
  });
  expect(wrapper.vm.stats).toEqual([
    [Stats.HP, expect.any(String)],
    [Stats.ATK, expect.any(String)],
    [Stats.DEF, expect.any(String)],
    [Stats.SATK, expect.any(String)],
    [Stats.SDEF, expect.any(String)],
    [Stats.SPD, expect.any(String)]
  ]);
  wrapper.setProps({ pokemon: new Pokemon({ gen: Gens.RBY }) });
  expect(wrapper.vm.stats).toEqual([
    [Stats.HP, expect.any(String)],
    [Stats.ATK, expect.any(String)],
    [Stats.DEF, expect.any(String)],
    [Stats.SPC, expect.any(String)],
    [Stats.SPD, expect.any(String)]
  ]);
});
