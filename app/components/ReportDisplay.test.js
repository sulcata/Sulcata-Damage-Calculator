import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import ReportDisplay from "./ReportDisplay.vue";
import { Multiset } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store, mutations;
beforeEach(() => {
  mutations = {
    setAttacker: jest.fn(),
    setDefender: jest.fn(),
    _setSelectedReport(state, { report }) {
      state._selectedReport = report;
    },
    _toggleFractions(state) {
      state.fractions = !state.fractions;
    },
    _toggleLongRolls(state) {
      state.longRolls = !state.longRolls;
    }
  };
  store = new Store({
    state: {
      fractions: false,
      longRolls: false,
      _selectedReport: {},
      _attackerReports: [{ attacker: "A", defender: "B" }, {}, {}, {}],
      _defenderReports: [{ attacker: "C", defender: "D" }, {}, {}, {}]
    },
    getters: {
      selectedReport: state => state._selectedReport,
      attackerReports: state => state._attackerReports,
      defenderReports: state => state._defenderReports
    },
    mutations
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

test("setHp commits setAttacker and setDefender mutations", () => {
  const wrapper = shallowMount(ReportDisplay, { localVue, store });

  wrapper.vm.setHp();

  store.commit("_setSelectedReport", {
    report: store.state._attackerReports[0]
  });
  wrapper.vm.setHp();

  store.commit("_setSelectedReport", {
    report: store.state._defenderReports[0]
  });
  wrapper.vm.setHp();

  expect(mutations.setAttacker.mock.calls).toHaveLength(1);
  expect(mutations.setAttacker.mock.calls[0][1]).toEqual({ pokemon: "D" });
  expect(mutations.setDefender.mock.calls).toHaveLength(1);
  expect(mutations.setDefender.mock.calls[0][1]).toEqual({ pokemon: "B" });
});
