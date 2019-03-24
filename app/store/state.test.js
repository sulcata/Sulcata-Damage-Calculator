import state from "./state";

test("function creates state", () => {
  expect(() => state()).not.toThrow();
});
