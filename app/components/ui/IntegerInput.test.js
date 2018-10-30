import { shallowMount } from "@vue/test-utils";
import IntegerInput from "./IntegerInput.vue";

it("emits the validated input on changes", () => {
  const wrapper = shallowMount(IntegerInput);
  wrapper.element.value = "5";
  wrapper.trigger("change");
  wrapper.element.value = "4.2";
  wrapper.trigger("change");
  expect(wrapper.emitted().input).toHaveLength(2);
  expect(wrapper.emitted().input[0]).toEqual([5]);
  expect(wrapper.emitted().input[1]).toEqual([0]);
});

it("allows a default, min, and max value", () => {
  const wrapper = shallowMount(IntegerInput, {
    propsData: {
      defaultValue: 42,
      min: 0,
      max: 350
    }
  });
  wrapper.element.value = "5";
  wrapper.trigger("change");
  wrapper.element.value = "43";
  wrapper.trigger("change");
  wrapper.element.value = "not a number";
  wrapper.trigger("change");
  wrapper.element.value = "351";
  wrapper.trigger("change");
  expect(wrapper.emitted().input[0]).toEqual([5]);
  expect(wrapper.emitted().input[1]).toEqual([43]);
  expect(wrapper.emitted().input[2]).toEqual([42]);
  expect(wrapper.emitted().input[3]).toEqual([350]);
});

it("allows custom step size", () => {
  const wrapper = shallowMount(IntegerInput, {
    propsData: { step: 2 }
  });
  expect(wrapper.attributes().step).toBe("2");
});

it("can be disabled", () => {
  const wrapper = shallowMount(IntegerInput);
  expect(wrapper.attributes().disabled).toBeUndefined();
  wrapper.setProps({ disabled: true });
  expect(wrapper.attributes().disabled).toBe("disabled");
});

it("customizes display", () => {
  const wrapper = shallowMount(IntegerInput);

  expect(wrapper.classes()).toContain("form-control");

  wrapper.setProps({ size: "large" });
  expect(wrapper.classes()).toContain("form-control");
  expect(wrapper.classes()).toContain("form-control-lg");
});
