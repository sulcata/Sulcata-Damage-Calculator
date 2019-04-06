<template>
  <div class="container">
    <div class="row justify-content-center mt-3">
      <div class="col-auto"><generation /></div>
    </div>

    <div class="row mt-3">
      <div class="col-4">
        <report-selector :reports="indexedAttackerReports" />
      </div>
      <div class="col-4">
        <report-selector :reports="indexedDefenderReports" />
      </div>
    </div>

    <div v-if="isReportSelected" class="row mt-3">
      <div class="col"><report-display /></div>
    </div>

    <div class="row mt-3">
      <div class="col">
        <pokemon
          :pokemon="attacker"
          @input="pokemon => setAttacker({ pokemon })"
          @new-pokemon="unsetAttackerReport"
        />
      </div>
      <div class="col-4">
        <tab-content :tabs="['General', 'Import Team', 'More Options']">
          <div slot="General" class="mt-3"><field /></div>
          <div slot="Import Team" class="mt-3"><set-importer /></div>
          <div slot="More Options" class="mt-3"><sulcalc-options /></div>
        </tab-content>
      </div>
      <div class="col">
        <pokemon
          :pokemon="defender"
          @input="pokemon => setDefender({ pokemon })"
          @new-pokemon="unsetDefenderReport"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import Pokemon from "./Pokemon.vue";
import Field from "./Field.vue";
import SetImporter from "./SetImporter.vue";
import SulcalcOptions from "./SulcalcOptions.vue";
import Generation from "./Generation.vue";
import ReportDisplay from "./ReportDisplay.vue";
import ReportSelector from "./ReportSelector.vue";
import TabContent from "./ui/TabContent.vue";

export default {
  components: {
    Pokemon,
    Field,
    SetImporter,
    SulcalcOptions,
    Generation,
    ReportDisplay,
    ReportSelector,
    TabContent
  },
  computed: {
    ...mapState(["attacker", "defender"]),
    ...mapGetters([
      "attackerReports",
      "defenderReports",
      "isReportSelected",
      "isReportOverrideForAttacker",
      "isReportOverrideForDefender"
    ]),
    indexedAttackerReports() {
      const reports = this.attackerReports;
      return reports.map((report, index) => ({ report, index }));
    },
    indexedDefenderReports() {
      const reports = this.defenderReports;
      return reports.map((report, index) => ({ report, index: index + 4 }));
    }
  },
  methods: {
    ...mapActions(["setAttacker", "setDefender", "unsetReport"]),
    async unsetAttackerReport() {
      if (this.isReportOverrideForAttacker) {
        await this.unsetReport();
      }
    },
    async unsetDefenderReport() {
      if (this.isReportOverrideForDefender) {
        await this.unsetReport();
      }
    }
  }
};
</script>
