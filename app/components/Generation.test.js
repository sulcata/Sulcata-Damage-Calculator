import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import GenerationComponent from "./Generation.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { Generation } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store;
beforeEach(() => {
  store = new Store({
    state: {
      gen: Generation.ADV
    },
    mutations: {
      changeGen(state, gen) {
        state.gen = gen;
      }
    }
  });
});

test("maps store gen to computed property", () => {
  const wrapper = shallowMount(GenerationComponent, { localVue, store });
  expect(wrapper.vm.gen).toBe(Generation.ADV);
  store.commit("changeGen", Generation.GSC);
  expect(wrapper.vm.gen).toBe(Generation.GSC);
});

test("supplies a list of generation values and labels to choose from", () => {
  const wrapper = shallowMount(GenerationComponent, { localVue, store });
  const selector = wrapper.find(ButtonRadioGroup);
  expect(selector.props().value).toBe(Generation.ADV);
  for (const option of selector.props().options) {
    expect(option).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});
