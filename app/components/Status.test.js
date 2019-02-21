import { shallowMount } from "@vue/test-utils";
import StatusComponent from "./Status.vue";
import { Status } from "sulcalc";

test("supplies a list of status values and labels to choose from", () => {
  const wrapper = shallowMount(StatusComponent, {
    propsData: { status: Status.NO_STATUS }
  });
  for (const status of wrapper.vm.statuses) {
    expect(status).toEqual({
      value: expect.anything(),
      label: expect.any(String)
    });
  }
});

test("selects the status if one exists, otherwise it selects nothing", () => {
  const wrapper = shallowMount(StatusComponent, {
    propsData: { status: Status.NO_STATUS }
  });
  expect(wrapper.vm.valueObj).toBeNull();
  wrapper.setProps({ status: Status.BURNED });
  expect(wrapper.vm.valueObj).toEqual({
    value: Status.BURNED,
    label: expect.any(String)
  });
});

test("emits the new status", () => {
  const wrapper = shallowMount(StatusComponent, {
    propsData: { status: Status.NO_STATUS }
  });
  wrapper.vm.updateStatus(null);
  wrapper.vm.updateStatus({ value: Status.NO_STATUS, label: "" });
  wrapper.vm.updateStatus({ value: Status.FROZEN, label: "" });
  expect(wrapper.emitted().input).toHaveLength(3);
  expect(wrapper.emitted().input[0]).toEqual([Status.NO_STATUS]);
  expect(wrapper.emitted().input[1]).toEqual([Status.NO_STATUS]);
  expect(wrapper.emitted().input[2]).toEqual([Status.FROZEN]);
});
