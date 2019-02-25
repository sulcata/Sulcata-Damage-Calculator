import { shallowMount } from "@vue/test-utils";
import NatureComponent from "./Nature.vue";
import { Nature } from "sulcalc";

test("supplies a list of nature values and labels to choose from", () => {
  const wrapper = shallowMount(NatureComponent, {
    propsData: { nature: Nature.HARDY }
  });
  for (const nature of wrapper.vm.natures) {
    expect(nature).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});

test("selects the nature when not selected, otherwise it selects nothing", () => {
  const wrapper = shallowMount(NatureComponent, {
    propsData: { nature: Nature.HARDY }
  });
  expect(wrapper.vm.valueObj).toBeNull();
  wrapper.setProps({ nature: Nature.ADAMANT });
  expect(wrapper.vm.valueObj).toEqual({
    value: Nature.ADAMANT,
    label: "Adamant"
  });
});

test("emits the new nature", () => {
  const wrapper = shallowMount(NatureComponent, {
    propsData: { nature: Nature.HARDY }
  });
  wrapper.vm.updateNature(null);
  wrapper.vm.updateNature({ value: Nature.HARDY, label: "" });
  wrapper.vm.updateNature({ value: Nature.SERIOUS, label: "" });
  expect(wrapper.emitted().input).toHaveLength(3);
  expect(wrapper.emitted().input[0]).toEqual([Nature.HARDY]);
  expect(wrapper.emitted().input[1]).toEqual([Nature.HARDY]);
  expect(wrapper.emitted().input[2]).toEqual([Nature.SERIOUS]);
});
