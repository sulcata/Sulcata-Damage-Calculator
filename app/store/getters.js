import { zip } from "lodash";
import { sulcalc, info } from "sulcalc";

export function sets(state) {
  const setdexList = [];
  for (const [name, setdex] of Object.entries(state.sets)) {
    if (state.enabledSets[name]) {
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

export function selectedReport(state, getters) {
  if (getters.reports.includes(state.overrideReport)) {
    return state.overrideReport;
  }
  return getters.reports.reduce((report1, report2) => {
    const chances1 = report1.roundedChances ?? [];
    const chances2 = report2.roundedChances ?? [];
    for (const [chance1 = 0, chance2 = 0] of zip(chances1, chances2)) {
      if (chance1 > chance2) return report1;
      if (chance2 > chance1) return report2;
    }
    if (!report2.damage) return report1;
    if (!report1.damage) return report2;
    if (report2.damage.max() > report1.damage.max()) return report2;
    return report1;
  }, {});
}

export const reports = (state, getters) => [
  ...getters.attackerReports,
  ...getters.defenderReports
];

export const attackerReports = state =>
  getReportList(state.attacker, state.defender, state.field);

export const defenderReports = state =>
  getReportList(state.defender, state.attacker, state.field);

export const isReportSelected = (state, getters) =>
  Boolean(getters.selectedReport.summary);

function getReportList(attacker, defender, field) {
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
