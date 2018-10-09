import { shallowMount } from "@vue/test-utils";
import ButtonCheckbox from "app/components/ui/ButtonCheckbox.vue";

it("emits a toggled state when clicked", () => {
  const wrapper = shallowMount(ButtonCheckbox);
  wrapper.trigger("click");
  wrapper.setProps({ value: true });
  wrapper.trigger("click");
  expect(wrapper.emitted().input).toHaveLength(2);
  expect(wrapper.emitted().input[0]).toEqual([true]);
  expect(wrapper.emitted().input[1]).toEqual([false]);
});
