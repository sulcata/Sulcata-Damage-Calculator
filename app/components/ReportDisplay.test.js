import { createLocalVue, shallowMount } from "@vue/test-utils";
import { Store, install as vuexInstall } from "vuex";
import ReportDisplay from "./ReportDisplay.vue";
import { Multiset } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store, setHp;
beforeEach(() => {
  setHp = jest.fn();
  store = new Store({
    state: {
      fractions: false,
      longRolls: false,
      _selectedReport: {}
    },
    getters: {
      selectedReport: state => state._selectedReport
    },
    mutations: {
      _setSelectedReport(state, { report }) {
        state._selectedReport = report;
      },
      _toggleFractions(state) {
        state.fractions = !state.fractions;
      },
      _toggleLongRolls(state) {
        state.longRolls = !state.longRolls;
      }
    },
    actions: { setHp }
  });
});

test("summary computed property returns the summary or an empty string", () => {
  const wrapper = shallowMount(ReportDisplay, { localVue, store });
  expect(wrapper.vm.summary).toBe("");
  store.commit("_setSelectedReport", {
    report: { summary: "a summary" }
  });
  expect(wrapper.vm.summary).toBe("a summary");
});

test("damageRoll computed property prints a readable damage roll", () => {
  const wrapper = shallowMount(ReportDisplay, { localVue, store });

  expect(wrapper.vm.damageRoll).toBe("");

  store.commit("_setSelectedReport", {
    report: { damage: new Multiset([1, 2, 3, 4, 4, 5]) }
  });
  expect(wrapper.vm.damageRoll).toBe("(1, 2, 3, 4, 4, 5)");

  const set = new Multiset();
  set.add(1, 21);
  set.add(2, 3);
  set.add(4, 1);
  set.add(5, 15);
  store.commit("_setSelectedReport", {
    report: { damage: set }
  });
  expect(wrapper.vm.damageRoll).toBe("");

  store.commit("_toggleLongRolls");
  expect(wrapper.vm.damageRoll).toBe("(1:21, 2:3, 4:1, 5:15)");
});

test("fractionalChances computed property prints a list of fractions", () => {
  const wrapper = shallowMount(ReportDisplay, { localVue, store });
  expect(wrapper.vm.fractionalChances).toBe("");
  store.commit("_setSelectedReport", {
    report: {
      fractionalChances: [[1, 2], [3, 4], [5, 6], [3, 99]]
    }
  });
  expect(wrapper.vm.fractionalChances).toBe("1 / 2, 3 / 4, 5 / 6, 3 / 99");
});
