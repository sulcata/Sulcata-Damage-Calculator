import { createLocalVue, mount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import FieldComponent from "./Field.vue";
import { Generation, Terrain, Weather, Field, Pokemon } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store, mutations;
beforeEach(() => {
  mutations = {
    toggleMultiBattle: jest.fn(),
    toggleInvertedBattle: jest.fn(),
    toggleWaterSport: jest.fn(),
    toggleMudSport: jest.fn(),
    toggleGravity: jest.fn(),
    toggleMagicRoom: jest.fn(),
    toggleWonderRoom: jest.fn(),
    toggleFairyAura: jest.fn(),
    toggleDarkAura: jest.fn(),
    toggleAuraBreak: jest.fn(),
    toggleIonDeluge: jest.fn(),
    setWeather: jest.fn(),
    setTerrain: jest.fn(),
    toggleStealthRock: jest.fn(),
    toggleReflect: jest.fn(),
    toggleLightScreen: jest.fn(),
    toggleForesight: jest.fn(),
    toggleFriendGuard: jest.fn(),
    toggleAuroraVeil: jest.fn(),
    toggleBattery: jest.fn(),
    setSpikes: jest.fn(),
    _setGen(state, { gen }) {
      state.gen = gen;
    }
  };
  store = new Store({
    state: {
      gen: Generation.SM,
      field: new Field(),
      attacker: new Pokemon(),
      defender: new Pokemon()
    },
    mutations
  });
});

test("aligns attacker left and defender right", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.pokeAlign("attacker")).toBe("align-left");
  expect(wrapper.vm.pokeAlign("defender")).toBe("align-right");
});

test("weathers computed property returns non-harsh weathers", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weather.SUN, label: expect.any(String) },
      { value: Weather.RAIN, label: expect.any(String) },
      { value: Weather.SAND, label: expect.any(String) },
      { value: Weather.HAIL, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(4);
  store.commit("_setGen", { gen: Generation.GSC });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weather.SUN, label: expect.any(String) },
      { value: Weather.RAIN, label: expect.any(String) },
      { value: Weather.SAND, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(3);
});

test("weathers computed property returns non-harsh weather options", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weather.SUN, label: expect.any(String) },
      { value: Weather.RAIN, label: expect.any(String) },
      { value: Weather.SAND, label: expect.any(String) },
      { value: Weather.HAIL, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(4);
  store.commit("_setGen", { gen: Generation.GSC });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weather.SUN, label: expect.any(String) },
      { value: Weather.RAIN, label: expect.any(String) },
      { value: Weather.SAND, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(3);
});

test("terrains computed property returns possible terrain options", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.terrains).toEqual(
    expect.arrayContaining([
      { value: Terrain.GRASSY_TERRAIN, label: expect.any(String) },
      { value: Terrain.MISTY_TERRAIN, label: expect.any(String) },
      { value: Terrain.ELECTRIC_TERRAIN, label: expect.any(String) },
      { value: Terrain.PSYCHIC_TERRAIN, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.terrains).toHaveLength(4);
  store.commit("_setGen", { gen: Generation.ORAS });
  expect(wrapper.vm.terrains).toEqual(
    expect.arrayContaining([
      { value: Terrain.GRASSY_TERRAIN, label: expect.any(String) },
      { value: Terrain.MISTY_TERRAIN, label: expect.any(String) },
      { value: Terrain.ELECTRIC_TERRAIN, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.terrains).toHaveLength(3);
});
