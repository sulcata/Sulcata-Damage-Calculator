<template>
  <multiselect
    track-by="value"
    label="label"
    :show-labels="false"
    placeholder="Nature"
    :value="valueObj"
    :options="natures"
    @input="updateNature"
  />
</template>

<script>
import { Multiselect } from "vue-multiselect";
import { Nature, natures, info } from "sulcalc";

export default {
  components: {
    Multiselect
  },
  model: {
    prop: "nature",
    event: "input"
  },
  props: {
    nature: {
      required: true,
      type: Number,
      validator(value) {
        return natures.includes(value);
      }
    }
  },
  computed: {
    natures() {
      return natures
        .map(id => ({ value: id, label: info.natureName(id) }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    valueObj() {
      return this.nature === Nature.HARDY
        ? null
        : { value: this.nature, label: info.natureName(this.nature) };
    }
  },
  methods: {
    updateNature(event) {
      this.$emit("input", event ? event.value : Nature.HARDY);
    }
  }
};
</script>
