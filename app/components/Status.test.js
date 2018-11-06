import { shallowMount } from "@vue/test-utils";
import Status from "./Status.vue";
import { Statuses } from "sulcalc";

test("supplies a list of status values and labels to choose from", () => {
  const wrapper = shallowMount(Status, {
    propsData: { status: Statuses.NO_STATUS }
  });
  for (const status of wrapper.vm.statuses) {
    expect(status).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});

test("selects the status if one exists, otherwise it selects nothing", () => {
  const wrapper = shallowMount(Status, {
    propsData: { status: Statuses.NO_STATUS }
  });
  expect(wrapper.vm.valueObj).toBeNull();
  wrapper.setProps({ status: Statuses.BURNED });
  expect(wrapper.vm.valueObj).toEqual({
    value: Statuses.BURNED,
    label: expect.any(String)
  });
});

test("emits the new status", () => {
  const wrapper = shallowMount(Status, {
    propsData: { status: Statuses.NO_STATUS }
  });
  wrapper.vm.updateStatus(null);
  wrapper.vm.updateStatus({ value: Statuses.NO_STATUS, label: "" });
  wrapper.vm.updateStatus({ value: Statuses.FROZEN, label: "" });
  expect(wrapper.emitted().input).toHaveLength(3);
  expect(wrapper.emitted().input[0]).toEqual([Statuses.NO_STATUS]);
  expect(wrapper.emitted().input[1]).toEqual([Statuses.NO_STATUS]);
  expect(wrapper.emitted().input[2]).toEqual([Statuses.FROZEN]);
});
