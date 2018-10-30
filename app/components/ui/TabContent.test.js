import { shallowMount } from "@vue/test-utils";
import TabContent from "./TabContent.vue";

let wrapper;
beforeEach(() => {
  wrapper = shallowMount(TabContent, {
    propsData: {
      tabs: ["Tab A", "Tab B", "Tab C"]
    },
    slots: {
      "Tab A": "<div id='a'></div>",
      "Tab B": "<div id='b'></div>",
      "Tab C": "<div id='c'></div>"
    }
  });
});

it("renders only the selected tab", () => {
  const tabs = wrapper.findAll(".tab-content > .tab-pane");
  expect(tabs.at(0).classes()).toContain("active");
  expect(tabs.at(1).classes()).not.toContain("active");
  expect(tabs.at(2).classes()).not.toContain("active");
  wrapper.setData({ activeTab: "Tab B" });
  expect(tabs.at(0).classes()).not.toContain("active");
  expect(tabs.at(1).classes()).toContain("active");
  expect(tabs.at(2).classes()).not.toContain("active");
});

it("sets the active tab on click", () => {
  expect(wrapper.vm.activeTab).toBe("Tab A");
  wrapper.vm.selectTab("Tab C");
  expect(wrapper.vm.activeTab).toBe("Tab C");
});
