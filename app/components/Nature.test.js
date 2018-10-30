import { shallowMount } from "@vue/test-utils";
import Nature from "./Nature.vue";
import { Natures } from "sulcalc";

it("supplies a list of nature values and labels to choose from", () => {
  const wrapper = shallowMount(Nature, {
    propsData: { nature: Natures.HARDY }
  });
  for (const nature of wrapper.vm.natures) {
    expect(nature).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});

it("selects the nature when not selected, otherwise it selects nothing", () => {
  const wrapper = shallowMount(Nature, {
    propsData: { nature: Natures.HARDY }
  });
  expect(wrapper.vm.valueObj).toBeNull();
  wrapper.setProps({ nature: Natures.ADAMANT });
  expect(wrapper.vm.valueObj).toEqual({
    value: Natures.ADAMANT,
    label: "Adamant"
  });
});

it("emits the new nature", () => {
  const wrapper = shallowMount(Nature, {
    propsData: { nature: Natures.HARDY }
  });
  wrapper.vm.updateNature(null);
  wrapper.vm.updateNature({ value: Natures.HARDY, label: "" });
  wrapper.vm.updateNature({ value: Natures.SERIOUS, label: "" });
  expect(wrapper.emitted().input).toHaveLength(3);
  expect(wrapper.emitted().input[0]).toEqual([Natures.HARDY]);
  expect(wrapper.emitted().input[1]).toEqual([Natures.HARDY]);
  expect(wrapper.emitted().input[2]).toEqual([Natures.SERIOUS]);
});
