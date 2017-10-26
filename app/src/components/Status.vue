<template>
  <multiselect
    track-by='value'
    label='label'
    :show-labels='false'
    :placeholder='$t("status")'
    :value='valueObj'
    :options='statuses'
    @input='updateStatus'
    />
</template>

<script>
import { Multiselect } from "vue-multiselect";
import { Statuses } from "sulcalc";

const statusTypes = [
  "poisoned",
  "badlyPoisoned",
  "burned",
  "paralyzed",
  "asleep",
  "frozen"
];

export default {
  model: {
    prop: "status",
    event: "input"
  },
  components: {
    Multiselect
  },
  props: {
    status: {
      required: true,
      type: Number,
      validator(value) {
        return value >= 0 && value <= 5;
      }
    }
  },
  computed: {
    statuses() {
      return statusTypes.map((status, idx) => ({
        value: idx + 1,
        label: this.$t(status)
      }));
    },
    valueObj() {
      if (this.status === Statuses.NO_STATUS) {
        return {};
      }
      return {
        value: this.status,
        label: this.$t(statusTypes[this.status - 1])
      };
    }
  },
  methods: {
    updateStatus(event) {
      this.$emit("input", event ? event.value : 0);
    }
  }
};
</script>
