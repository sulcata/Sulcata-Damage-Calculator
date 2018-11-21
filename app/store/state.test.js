import state from "./state";

test("equals expected state structure", () => {
  const { sets, ...restState } = state;
  expect(restState).toMatchSnapshot();
});
