<template>
  <button-radio-group
    :value='gen'
    :options='gens'
    @input='gen => changeGen({gen})'
    type='secondary'
    />
</template>

<script>
import { mapState, mapMutations } from "vuex";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { Gens, maxGen, info } from "sulcalc";

export default {
  components: {
    ButtonRadioGroup
  },
  computed: {
    ...mapState(["gen"]),
    gens() {
      const options = [];
      for (let value = Gens.RBY; value <= maxGen; value++) {
        options.push({ value, label: info.genName(value) });
      }
      return options;
    }
  },
  methods: {
    ...mapMutations(["changeGen"])
  }
};
</script>
