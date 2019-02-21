import { shallowMount } from "@vue/test-utils";
import StatsComponent from "./Stats.vue";
import { Generation, Stat, Pokemon } from "sulcalc";

test("calculates the maximum IV", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Generation.ORAS }) }
  });
  expect(wrapper.vm.maxIv).toBe(31);
  wrapper.setProps({ pokemon: new Pokemon({ gen: Generation.GSC }) });
  expect(wrapper.vm.maxIv).toBe(15);
});

test("calculates the default EV", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Generation.ORAS }) }
  });
  expect(wrapper.vm.defaultEv).toBe(0);
  wrapper.setProps({ pokemon: new Pokemon({ gen: Generation.GSC }) });
  expect(wrapper.vm.defaultEv).toBe(252);
});

test("generates labels for stat boost levels", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Generation.ORAS }) }
  });
  expect(wrapper.vm.statBoost(-3)).toBe("-3");
  expect(wrapper.vm.statBoost(0)).toBe("--");
  expect(wrapper.vm.statBoost(2)).toBe("+2");
});

test("creates a list of stat values and labels", () => {
  const wrapper = shallowMount(StatsComponent, {
    propsData: { pokemon: new Pokemon({ gen: Generation.ORAS }) }
  });
  expect(wrapper.vm.stats).toEqual([
    [Stat.HP, expect.any(String)],
    [Stat.ATK, expect.any(String)],
    [Stat.DEF, expect.any(String)],
    [Stat.SATK, expect.any(String)],
    [Stat.SDEF, expect.any(String)],
    [Stat.SPD, expect.any(String)]
  ]);
  wrapper.setProps({ pokemon: new Pokemon({ gen: Generation.RBY }) });
  expect(wrapper.vm.stats).toEqual([
    [Stat.HP, expect.any(String)],
    [Stat.ATK, expect.any(String)],
    [Stat.DEF, expect.any(String)],
    [Stat.SPC, expect.any(String)],
    [Stat.SPD, expect.any(String)]
  ]);
});
