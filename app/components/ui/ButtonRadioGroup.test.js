import { shallowMount } from "@vue/test-utils";
import ButtonRadioGroup from "./ButtonRadioGroup.vue";

let wrapper;
beforeEach(() => {
  wrapper = shallowMount(ButtonRadioGroup, {
    propsData: {
      options: [
        { label: "Choice A", value: 1 },
        { label: "Choice B", value: 2 },
        { label: "Choice C", value: 3 },
        { label: "Choice D", value: NaN }
      ]
    }
  });
});

it("emits a toggled value when changed", () => {
  const buttons = wrapper.findAll("button");
  buttons.at(0).trigger("click");
  wrapper.setProps({ value: 1 });
  buttons.at(0).trigger("click");
  buttons.at(3).trigger("click");
  expect(wrapper.emitted().input).toHaveLength(2);
  expect(wrapper.emitted().input[0]).toEqual([1]);
  expect(wrapper.emitted().input[1]).toEqual([NaN]);
});

it("allows a default value", () => {
  wrapper.setProps({ value: 42, defaultValue: 42 });
  const buttons = wrapper.findAll("button");
  buttons.at(3).trigger("click");
  wrapper.setProps({ value: NaN });
  buttons.at(3).trigger("click");
  expect(wrapper.emitted().input).toHaveLength(2);
  expect(wrapper.emitted().input[0]).toEqual([NaN]);
  expect(wrapper.emitted().input[1]).toEqual([42]);
});

it("customizes display", () => {
  const buttons = wrapper.findAll("button");

  expect(wrapper.classes()).toContain("btn-group");
  expect(wrapper.attributes().role).toBe("group");
  expect(buttons.at(0).classes()).toContain("btn");
  expect(buttons.at(0).classes()).toContain("btn-primary");

  wrapper.setProps({
    value: 1,
    layout: "vertical",
    size: "large",
    type: "info",
    outline: true
  });
  expect(wrapper.classes()).toContain("btn-group-vertical");
  expect(wrapper.classes()).toContain("btn-group-lg");
  expect(buttons.at(0).classes()).toContain("btn");
  expect(buttons.at(0).classes()).toContain("active");
  expect(buttons.at(1).classes()).not.toContain("active");
  expect(buttons.at(0).classes()).toContain("btn-outline-info");

  wrapper.setProps({ layout: "verticle" });
  expect(wrapper.classes()).not.toContain("btn-group");
  expect(wrapper.classes()).not.toContain("btn-group-vertical");
});
