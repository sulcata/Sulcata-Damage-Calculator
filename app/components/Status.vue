<template>
  <multiselect
    track-by="value"
    label="label"
    :show-labels="false"
    placeholder="Status"
    :value="valueObj"
    :options="statuses"
    @input="updateStatus"
  >
    <span slot="noResult">No Status found.</span>
  </multiselect>
</template>

<script>
import { Multiselect } from "vue-multiselect";
import { Status, statuses } from "sulcalc";

const statusNames = {
  [Status.POISONED]: "Poisoned",
  [Status.BADLY_POISONED]: "Badly Poisoned",
  [Status.BURNED]: "Burned",
  [Status.PARALYZED]: "Paralyzed",
  [Status.ASLEEP]: "Asleep",
  [Status.FROZEN]: "Frozen"
};

export default {
  components: {
    Multiselect
  },
  model: {
    prop: "status",
    event: "input"
  },
  props: {
    status: {
      required: true,
      type: Number,
      validator(value) {
        return statuses.includes(value);
      }
    }
  },
  computed: {
    statuses() {
      return statuses.slice(1).map(status => ({
        value: status,
        label: statusNames[status]
      }));
    },
    valueObj() {
      return this.status === Status.NO_STATUS
        ? null
        : { value: this.status, label: statusNames[this.status] };
    }
  },
  methods: {
    updateStatus(event) {
      this.$emit("input", event ? event.value : Status.NO_STATUS);
    }
  }
};
</script>
