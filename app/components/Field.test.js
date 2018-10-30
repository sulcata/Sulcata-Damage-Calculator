import { createLocalVue, mount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import FieldComponent from "./Field.vue";
import { Gens, Terrains, Weathers, Field, Pokemon } from "sulcalc";

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
      gen: Gens.SM,
      field: new Field(),
      attacker: new Pokemon(),
      defender: new Pokemon()
    },
    mutations
  });
});

it("aligns attacker left and defender right", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.pokeAlign("attacker")).toEqual("align-left");
  expect(wrapper.vm.pokeAlign("defender")).toEqual("align-right");
});

it("weathers computed property returns non-harsh weathers", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weathers.SUN, label: expect.any(String) },
      { value: Weathers.RAIN, label: expect.any(String) },
      { value: Weathers.SAND, label: expect.any(String) },
      { value: Weathers.HAIL, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(4);
  store.commit("_setGen", { gen: Gens.GSC });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weathers.SUN, label: expect.any(String) },
      { value: Weathers.RAIN, label: expect.any(String) },
      { value: Weathers.SAND, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(3);
});

it("weathers computed property returns non-harsh weather options", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weathers.SUN, label: expect.any(String) },
      { value: Weathers.RAIN, label: expect.any(String) },
      { value: Weathers.SAND, label: expect.any(String) },
      { value: Weathers.HAIL, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(4);
  store.commit("_setGen", { gen: Gens.GSC });
  expect(wrapper.vm.weathers).toEqual(
    expect.arrayContaining([
      { value: Weathers.SUN, label: expect.any(String) },
      { value: Weathers.RAIN, label: expect.any(String) },
      { value: Weathers.SAND, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.weathers).toHaveLength(3);
});

it("terrains computed property returns possible terrain options", () => {
  const wrapper = mount(FieldComponent, { localVue, store });
  expect(wrapper.vm.terrains).toEqual(
    expect.arrayContaining([
      { value: Terrains.GRASSY_TERRAIN, label: expect.any(String) },
      { value: Terrains.MISTY_TERRAIN, label: expect.any(String) },
      { value: Terrains.ELECTRIC_TERRAIN, label: expect.any(String) },
      { value: Terrains.PSYCHIC_TERRAIN, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.terrains).toHaveLength(4);
  store.commit("_setGen", { gen: Gens.ORAS });
  expect(wrapper.vm.terrains).toEqual(
    expect.arrayContaining([
      { value: Terrains.GRASSY_TERRAIN, label: expect.any(String) },
      { value: Terrains.MISTY_TERRAIN, label: expect.any(String) },
      { value: Terrains.ELECTRIC_TERRAIN, label: expect.any(String) }
    ])
  );
  expect(wrapper.vm.terrains).toHaveLength(3);
});
