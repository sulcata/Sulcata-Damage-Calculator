<template>
  <button-radio-group
    :value="gen"
    :options="gens"
    type="secondary"
    @input="gen => changeGen({ gen })"
  />
</template>

<script>
import { mapState, mapActions } from "vuex";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { generations, maxGen, info } from "sulcalc";

export default {
  components: {
    ButtonRadioGroup
  },
  computed: {
    ...mapState(["gen"]),
    gens() {
      return generations.map(value => ({ value, label: info.genName(value) }));
    }
  },
  methods: {
    ...mapActions(["changeGen"])
  }
};
</script>
