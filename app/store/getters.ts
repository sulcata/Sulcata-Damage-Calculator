import { zip } from "lodash";
import { Field, info, Pokemon, sulcalc } from "sulcalc";
import { SetdexName, State } from "./state";

type PartialReport = Partial<ReturnType<typeof sulcalc>>;

export interface Getters {
  readonly sets: ReturnType<typeof sets>;
  readonly selectedReportIndex: ReturnType<typeof selectedReportIndex>;
  readonly selectedReport: ReturnType<typeof selectedReport>;
  readonly reports: ReturnType<typeof reports>;
  readonly attackerReports: ReturnType<typeof attackerReports>;
  readonly defenderReports: ReturnType<typeof defenderReports>;
  readonly isReportSelected: ReturnType<typeof isReportSelected>;
  readonly isAttackerReportSelected: ReturnType<
    typeof isAttackerReportSelected
  >;
  readonly isDefenderReportSelected: ReturnType<
    typeof isDefenderReportSelected
  >;
  readonly isReportOverrideForAttacker: ReturnType<
    typeof isReportOverrideForAttacker
  >;
  readonly isReportOverrideForDefender: ReturnType<
    typeof isReportOverrideForDefender
  >;
}

export function sets(state: State) {
  const setdexList = [];
  for (const [name, setdex] of Object.entries(state.sets)) {
    if (state.enabledSets[name as SetdexName]) {
      setdexList.push(setdex[state.gen]);
    }
  }
  const groups = [];
  for (const pokemonId of info.releasedPokes(state.gen)) {
    const pokemonName = info.pokemonName(pokemonId);
    const sets = [];
    for (const { [pokemonId]: setList = {} } of setdexList) {
      for (const [setName, set] of Object.entries(setList)) {
        sets.push({ pokemonId, pokemonName, setName, set });
      }
    }
    sets.push({ pokemonId, pokemonName, setName: "Blank Set", set: {} });
    groups.push({ pokemonId, pokemonName, sets });
  }
  return groups;
}

export function selectedReportIndex(state: State, getters: Getters): number {
  if (state.reportOverrideIndex >= 0 && state.reportOverrideIndex < 8) {
    return state.reportOverrideIndex;
  }
  const emptyReport: PartialReport = {};
  const report = getters.reports.reduce((report1, report2) => {
    const chances1 = report1.roundedChances || [];
    const chances2 = report2.roundedChances || [];
    for (const [chance1 = 0, chance2 = 0] of zip(chances1, chances2)) {
      if (chance1 > chance2) return report1;
      if (chance2 > chance1) return report2;
    }
    if (!report2.damage) return report1;
    if (!report1.damage) return report2;
    if (report2.damage.max(NaN) > report1.damage.max(NaN)) return report2;
    return report1;
  }, emptyReport);
  return getters.reports.indexOf(report);
}

export function selectedReport(_state: State, getters: Getters): PartialReport {
  return getters.reports[getters.selectedReportIndex] || {};
}

export const reports = (_state: State, getters: Getters) => [
  ...getters.attackerReports,
  ...getters.defenderReports
];

export const attackerReports = (state: State) =>
  getReportList(state.attacker, state.defender, state.field);

export const defenderReports = (state: State) =>
  getReportList(state.defender, state.attacker, state.field);

export const isReportSelected = (_state: State, getters: Getters): boolean =>
  Boolean(getters.selectedReport.summary);

export const isAttackerReportSelected = (
  _state: State,
  getters: Getters
): boolean =>
  getters.selectedReportIndex >= 0 && getters.selectedReportIndex < 4;

export const isDefenderReportSelected = (
  _state: State,
  getters: Getters
): boolean =>
  getters.selectedReportIndex >= 4 && getters.selectedReportIndex < 8;

export const isReportOverrideForAttacker = (state: State): boolean =>
  state.reportOverrideIndex >= 0 && state.reportOverrideIndex < 4;

export const isReportOverrideForDefender = (state: State): boolean =>
  state.reportOverrideIndex >= 4 && state.reportOverrideIndex < 8;

function getReportList(
  attacker: Pokemon,
  defender: Pokemon,
  field: Field
): PartialReport[] {
  const reports = [];
  for (const move of attacker.moves) {
    try {
      reports.push(sulcalc(attacker, defender, move, field));
    } catch {
      reports.push({ attacker, defender, move, field });
    }
  }
  return reports;
}
