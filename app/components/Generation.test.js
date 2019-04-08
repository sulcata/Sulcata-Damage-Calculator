import { createLocalVue, shallowMount } from "@vue/test-utils";
import { Store, install as vuexInstall } from "vuex";
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
      setGen(state, { gen }) {
        state.gen = gen;
      }
    },
    actions: {
      changeGen({ commit }, { gen }) {
        commit("setGen", { gen });
      }
    }
  });
});

test("maps store gen to computed property", () => {
  const wrapper = shallowMount(GenerationComponent, { localVue, store });
  expect(wrapper.vm.gen).toBe(Generation.ADV);
  store.commit("setGen", { gen: Generation.GSC });
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
