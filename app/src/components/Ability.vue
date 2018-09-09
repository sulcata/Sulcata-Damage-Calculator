<template>
  <multiselect
    track-by='value'
    label='label'
    :show-labels='false'
    placeholder='Ability'
    :value='valueObj'
    :options='abilities'
    @input='updateValue'
    />
</template>

<script>
import { mapState } from "vuex";
import VueMultiselect from "vue-multiselect";
import { Ability, info } from "sulcalc";

const { Multiselect } = VueMultiselect;

export default {
  model: {
    prop: "ability",
    event: "input"
  },
  components: {
    Multiselect
  },
  props: {
    ability: {
      required: true,
      type: Ability
    }
  },
  computed: {
    ...mapState(["gen"]),
    abilities() {
      return info
        .releasedAbilities(this.gen)
        .map(id => ({ value: id, label: info.abilityName(id) }));
    },
    valueObj() {
      if (this.ability.name === "(No Ability)") {
        return {};
      }
      return { value: this.ability.id, label: this.ability.name };
    }
  },
  methods: {
    updateValue(event) {
      this.$emit(
        "input",
        new Ability({
          id: event ? event.value : "noability",
          gen: this.gen
        })
      );
    }
  }
};
</script>
