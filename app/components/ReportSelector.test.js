import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import ReportSelector from "./ReportSelector.vue";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store, mutations, reports;
beforeEach(() => {
  mutations = {
    setReport: jest.fn()
  };
  reports = [
    {
      move: { name: "Fire Blast" }
    },
    {
      move: { name: "Surf" }
    },
    {
      move: { name: "Fusion Bolt" }
    },
    {
      move: { name: "Bounce" }
    }
  ];
  store = new Store({
    getters: {
      selectedReport: jest.fn().mockReturnValue(reports[0])
    },
    mutations
  });
});

it("reportOptions computed property returns a list of reports labeled by move name", () => {
  const wrapper = shallowMount(ReportSelector, {
    localVue,
    store,
    propsData: { reports }
  });
  expect(wrapper.vm.reportOptions).toEqual([
    { value: reports[0], label: "Fire Blast" },
    { value: reports[1], label: "Surf" },
    { value: reports[2], label: "Fusion Bolt" },
    { value: reports[3], label: "Bounce" }
  ]);
});
