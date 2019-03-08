<template>
  <div class="row">
    <div role="group" class="col-6 btn-group-vertical">
      <button
        v-for="{ report, index } in reports"
        :key="index"
        type="button"
        :class="buttonClasses(index)"
        @click="selectReport({ index })"
      >
        {{ report.move.name }}
      </button>
    </div>
    <div role="group" class="col-6">
      <div v-for="{ report, index } in reports" :key="index" class="row py-2">
        {{ report.minPercent || 0 }}% - {{ report.maxPercent || 0 }}%
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from "vuex";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";

export default {
  components: {
    ButtonRadioGroup
  },
  props: {
    reports: {
      required: true,
      type: Array
    }
  },
  computed: {
    ...mapState(["reportStick"]),
    ...mapGetters(["selectedReportIndex"])
  },
  methods: {
    ...mapActions(["selectReport"]),
    buttonClasses(reportIndex) {
      const isReportSelected = reportIndex === this.selectedReportIndex;
      const usesStuckColor = this.reportStick && isReportSelected;
      return {
        btn: true,
        "btn-primary": !usesStuckColor,
        "btn-secondary": usesStuckColor,
        active: isReportSelected
      };
    }
  }
};
</script>
