<template>
  <multiselect
    track-by='value'
    label='label'
    :show-labels='false'
    placeholder='Status'
    :value='valueObj'
    :options='statuses'
    @input='updateStatus'
    />
</template>

<script>
import { Multiselect } from "vue-multiselect";
import { Statuses } from "sulcalc";

const statusNames = {
  [Statuses.POISONED]: "Poisoned",
  [Statuses.BADLY_POISONED]: "Badly Poisoned",
  [Statuses.BURNED]: "Burned",
  [Statuses.PARALYZED]: "Paralyzed",
  [Statuses.ASLEEP]: "Asleep",
  [Statuses.FROZEN]: "Frozen"
};

const statusList = [
  Statuses.POISONED,
  Statuses.BADLY_POISONED,
  Statuses.BURNED,
  Statuses.PARALYZED,
  Statuses.ASLEEP,
  Statuses.FROZEN
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
        return Object.values(Statuses).includes(value);
      }
    }
  },
  computed: {
    statuses() {
      return statusList.map(status => ({
        value: status,
        label: statusNames[status]
      }));
    },
    valueObj() {
      if (this.status === Statuses.NO_STATUS) {
        return {};
      }
      return { value: this.status, label: statusNames[this.status] };
    }
  },
  methods: {
    updateStatus(event) {
      this.$emit("input", event ? event.value : 0);
    }
  }
};
</script>
