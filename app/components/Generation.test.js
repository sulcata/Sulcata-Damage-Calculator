import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import Generation from "./Generation.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { Gens } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store;
beforeEach(() => {
  store = new Store({
    state: {
      gen: Gens.ADV
    },
    mutations: {
      changeGen(state, gen) {
        state.gen = gen;
      }
    }
  });
});

it("maps store gen to computed property", () => {
  const wrapper = shallowMount(Generation, { localVue, store });
  expect(wrapper.vm.gen).toBe(Gens.ADV);
  store.commit("changeGen", Gens.GSC);
  expect(wrapper.vm.gen).toBe(Gens.GSC);
});

it("supplies a list of generation values and labels to choose from", () => {
  const wrapper = shallowMount(Generation, { localVue, store });
  const selector = wrapper.find(ButtonRadioGroup);
  expect(selector.props().value).toBe(Gens.ADV);
  for (const option of selector.props().options) {
    expect(option).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});
