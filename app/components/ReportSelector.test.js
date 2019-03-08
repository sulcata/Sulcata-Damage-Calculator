import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import ReportSelector from "./ReportSelector.vue";

const localVue = createLocalVue();
localVue.use(vuexInstall);

const reports = [
  {
    index: 0,
    report: {
      move: { name: "Fire Blast" },
      minPercent: 91.1,
      maxPercent: 95.5
    }
  },
  {
    index: 1,
    report: {
      move: { name: "Surf" },
      minPercent: 20.1,
      maxPercent: 25.3
    }
  },
  {
    index: 2,
    report: {
      move: { name: "Fusion Bolt" }
    }
  },
  {
    index: 3,
    report: {
      move: { name: "Bounce" },
      minPercent: 30.2,
      maxPercent: 37.8
    }
  }
];

test("highlights the selected report", () => {
  const wrapper = shallowMount(ReportSelector, {
    localVue,
    store: new Store({
      state: {
        reportStick: false
      },
      getters: {
        selectedReportIndex: jest.fn().mockReturnValue(0)
      },
      actions: {
        selectReport: jest.fn()
      }
    }),
    propsData: { reports }
  });
  expect(wrapper.html()).toMatchSnapshot();
});

test("shows the report is stickied", () => {
  const wrapper = shallowMount(ReportSelector, {
    localVue,
    store: new Store({
      state: {
        reportStick: true
      },
      getters: {
        selectedReportIndex: jest.fn().mockReturnValue(1)
      },
      actions: {
        selectReport: jest.fn()
      }
    }),
    propsData: { reports }
  });
  expect(wrapper.html()).toMatchSnapshot();
});
