import { shallowMount } from "@vue/test-utils";
import IntegerInput from "./IntegerInput.vue";

const preventDefault = jest.fn();
beforeEach(() => {
  preventDefault.mockClear();
});

test("emits the validated input on changes", () => {
  const wrapper = shallowMount(IntegerInput);
  wrapper.element.value = "5";
  wrapper.trigger("change");
  wrapper.element.value = "4";
  wrapper.trigger("change");
  expect(wrapper.emitted().input).toHaveLength(2);
  expect(wrapper.emitted().input[0]).toEqual([5]);
  expect(wrapper.emitted().input[1]).toEqual([4]);
});

test("does not emit anything on bad input", () => {
  const wrapper = shallowMount(IntegerInput, {
    propsData: { value: 10 }
  });
  wrapper.element.value = "$";
  wrapper.trigger("change");
  expect(wrapper.emitted().input).toBeUndefined();

  wrapper.element.value = `${Number.MAX_VALUE}0`;
  wrapper.trigger("change");
  expect(wrapper.emitted().input).toBeUndefined();
});

test("allows a min and max value", () => {
  const wrapper = shallowMount(IntegerInput, {
    propsData: {
      min: 0,
      max: 350
    }
  });
  expect(wrapper.attributes().min).toBe("0");
  expect(wrapper.attributes().max).toBe("350");
  wrapper.element.value = "5";
  wrapper.trigger("change");
  wrapper.element.value = "43";
  wrapper.trigger("change");
  wrapper.element.value = "351";
  wrapper.trigger("change");
  expect(wrapper.emitted().input[0]).toEqual([5]);
  expect(wrapper.emitted().input[1]).toEqual([43]);
  expect(wrapper.emitted().input[2]).toEqual([350]);
});

test("allows custom step size", () => {
  const wrapper = shallowMount(IntegerInput, {
    propsData: { step: 2 }
  });
  expect(wrapper.attributes().step).toBe("2");
  wrapper.element.value = "5";
  wrapper.trigger("change");
  wrapper.element.value = "44";
  wrapper.trigger("change");
  expect(wrapper.emitted().input[0]).toEqual([4]);
  expect(wrapper.emitted().input[1]).toEqual([44]);
});

test("can be disabled", () => {
  const wrapper = shallowMount(IntegerInput);
  expect(wrapper.attributes().disabled).toBeUndefined();
  wrapper.setProps({ disabled: true });
  expect(wrapper.attributes().disabled).toBe("disabled");
});

test("customizes display", () => {
  const wrapper = shallowMount(IntegerInput);

  expect(wrapper.classes()).toContain("form-control");

  wrapper.setProps({ size: "large" });
  expect(wrapper.classes()).toContain("form-control");
  expect(wrapper.classes()).toContain("form-control-lg");
});
