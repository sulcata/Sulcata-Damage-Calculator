<template>
  <multiselect
    track-by="value"
    label="label"
    :show-labels="false"
    placeholder="Ability"
    :value="valueObj"
    :options="abilities"
    :options-limit="20"
    @input="updateAbility"
  >
    <span slot="noResult">No Ability found.</span>
  </multiselect>
</template>

<script>
import { mapState } from "vuex";
import { Multiselect } from "vue-multiselect";
import { Ability, info } from "sulcalc";

export default {
  components: {
    Multiselect
  },
  model: {
    prop: "ability",
    event: "input"
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
      return this.ability.name === "(No Ability)"
        ? null
        : { value: this.ability.id, label: this.ability.name };
    }
  },
  methods: {
    updateAbility(event) {
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
