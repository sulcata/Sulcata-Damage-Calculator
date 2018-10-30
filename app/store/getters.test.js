import * as getters from "./getters";

it("reports()", () => {
  expect(
    getters.reports(null, {
      attackerReports: [1, 3, 5, 7],
      defenderReports: [2, 4, 6, 8]
    })
  ).toEqual([1, 3, 5, 7, 2, 4, 6, 8]);
});
