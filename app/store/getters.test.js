import * as getters from "./getters";

test("reports()", () => {
  expect(
    getters.reports(null, {
      attackerReports: [1, 3, 5, 7],
      defenderReports: [2, 4, 6, 8]
    })
  ).toEqual([1, 3, 5, 7, 2, 4, 6, 8]);
});

test.each([
  // prettier-ignore
  [{ reportOverrideIndex: -1 }, false],
  [{ reportOverrideIndex: 0 }, true],
  [{ reportOverrideIndex: 3 }, true],
  [{ reportOverrideIndex: 4 }, false],
  [{ reportOverrideIndex: NaN }, false]
])("isReportOverrideForAttacker(%p)", (state, expected) => {
  expect(getters.isReportOverrideForAttacker(state)).toBe(expected);
});

test.each([
  // prettier-ignore
  [{ reportOverrideIndex: 3 }, false],
  [{ reportOverrideIndex: 4 }, true],
  [{ reportOverrideIndex: 7 }, true],
  [{ reportOverrideIndex: 8 }, false],
  [{ reportOverrideIndex: NaN }, false]
])("isReportOverrideForDefender(%p)", (state, expected) => {
  expect(getters.isReportOverrideForDefender(state)).toBe(expected);
});
