import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import Sulcalc from "./Sulcalc.vue";
import PokemonComponent from "./Pokemon.vue";
import ReportSelector from "./ReportSelector.vue";
import ReportDisplay from "./ReportDisplay.vue";
import { Pokemon } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

const attackerReports = [
  { move: { name: "Fire Blast" } },
  { move: { name: "Surf" } },
  { move: { name: "Fusion Bolt" } },
  { move: { name: "Bounce" } }
];

const defenderReports = [
  { move: { name: "Thunder" } },
  { move: { name: "Ice Beam" } },
  { move: { name: "Bubble" } },
  { move: { name: "Earthquake" } }
];

let store;
beforeEach(() => {
  store = new Store({
    state: {
      attacker: new Pokemon(),
      defender: new Pokemon(),
      _isReportSelected: false
    },
    getters: {
      attackerReports: jest.fn().mockReturnValue(attackerReports),
      defenderReports: jest.fn().mockReturnValue(defenderReports),
      isReportSelected: state => state._isReportSelected,
      isReportOverrideForAttacker: jest.fn().mockReturnValue(false),
      isReportOverrideForDefender: jest.fn().mockReturnValue(false)
    },
    mutations: {
      _setReportSelected(state, { active }) {
        state._isReportSelected = active;
      }
    },
    actions: {
      setAttacker: jest.fn(),
      setDefender: jest.fn(),
      unsetReport: jest.fn()
    }
  });
});

test("supplies props from Vuex store to each child component", () => {
  const wrapper = shallowMount(Sulcalc, { localVue, store });
  const pokemon = wrapper.findAll(PokemonComponent);
  expect(pokemon.at(0).props().pokemon).toBe(store.state.attacker);
  expect(pokemon.at(1).props().pokemon).toBe(store.state.defender);

  const selectors = wrapper.findAll(ReportSelector);
  expect(selectors.at(0).props().reports).toEqual(
    attackerReports.map((report, index) => ({ report, index }))
  );
  expect(selectors.at(1).props().reports).toEqual(
    defenderReports.map((report, index) => ({ report, index: index + 4 }))
  );
});

test("creates a report display only when a report is selected", () => {
  const wrapper = shallowMount(Sulcalc, { localVue, store });
  expect(wrapper.find(ReportDisplay).exists()).toBe(false);
  store.commit("_setReportSelected", { active: true });
  expect(wrapper.find(ReportDisplay).exists()).toBe(true);
});
