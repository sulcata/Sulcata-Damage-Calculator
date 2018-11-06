import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import Sulcalc from "./Sulcalc.vue";
import PokemonComponent from "./Pokemon.vue";
import ReportSelector from "./ReportSelector.vue";
import ReportDisplay from "./ReportDisplay.vue";
import { Pokemon } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store;
beforeEach(() => {
  store = new Store({
    state: {
      attacker: new Pokemon(),
      defender: new Pokemon(),
      report: null
    },
    getters: {
      attackerReports: jest.fn().mockReturnValue([]),
      defenderReports: jest.fn().mockReturnValue([]),
      isReportSelected: state => Boolean(state.report)
    },
    mutations: {
      setAttacker: jest.fn(),
      setDefender: jest.fn(),
      setReport(state, report) {
        state.report = report;
      }
    }
  });
});

test("supplies props from Vuex store to each child component", () => {
  const wrapper = shallowMount(Sulcalc, { localVue, store });
  const pokemon = wrapper.findAll(PokemonComponent);
  expect(pokemon.at(0).props().pokemon).toBe(store.state.attacker);
  expect(pokemon.at(1).props().pokemon).toBe(store.state.defender);

  const selectors = wrapper.findAll(ReportSelector);
  expect(selectors.at(0).props().reports).toBe(store.getters.attackerReports);
  expect(selectors.at(1).props().reports).toBe(store.getters.defenderReports);
});

test("creates a report display only when a report is selected", () => {
  const wrapper = shallowMount(Sulcalc, { localVue, store });
  expect(wrapper.find(ReportDisplay).exists()).toBe(false);
  store.commit("setReport", {});
  expect(wrapper.find(ReportDisplay).exists()).toBe(true);
});
