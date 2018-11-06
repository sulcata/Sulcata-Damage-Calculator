import { shallowMount } from "@vue/test-utils";
import ButtonCheckbox from "./ButtonCheckbox.vue";

test("emits a toggled state when clicked", () => {
  const wrapper = shallowMount(ButtonCheckbox);
  wrapper.trigger("click");
  wrapper.setProps({ value: true });
  wrapper.trigger("click");
  expect(wrapper.emitted().input).toHaveLength(2);
  expect(wrapper.emitted().input[0]).toEqual([true]);
  expect(wrapper.emitted().input[1]).toEqual([false]);
});

test("toggles display when active", () => {
  const wrapper = shallowMount(ButtonCheckbox);
  expect(wrapper.classes()).not.toContain("active");
  wrapper.setProps({ value: true });
  expect(wrapper.classes()).toContain("active");
});

test("customizes display", () => {
  const wrapper = shallowMount(ButtonCheckbox);

  expect(wrapper.classes()).toContain("btn");
  expect(wrapper.classes()).toContain("btn-primary");

  wrapper.setProps({ size: "large", type: "info", outline: true });
  expect(wrapper.classes()).toContain("btn");
  expect(wrapper.classes()).toContain("btn-lg");
  expect(wrapper.classes()).toContain("btn-outline-info");
});
