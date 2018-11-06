import { shallowMount } from "@vue/test-utils";
import App from "./App.vue";

test("links are a list of url, label objects", () => {
  const wrapper = shallowMount(App);
  const links = wrapper.vm.links;
  for (const link of links) {
    expect(link).toEqual({
      url: expect.stringMatching(/^https?:\/\//),
      label: expect.any(String)
    });
  }
});
