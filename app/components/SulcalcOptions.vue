<template>
  <section class="flex option-groups">
    <section>
      <h3>Setdex Options</h3>
      <button-checkbox
        :value="sortByUsage"
        size="small"
        type="secondary"
        @input="toggleSortByUsage()"
      >
        Sort By Usage
      </button-checkbox>
      <button-checkbox
        :value="enabledSets.smogon"
        size="small"
        type="secondary"
        @input="toggleSmogonSets()"
      >
        Smogon Sets
      </button-checkbox>
      <button-checkbox
        :value="enabledSets.pokemonPerfect"
        size="small"
        type="secondary"
        @input="togglePokemonPerfectSets()"
      >
        Pokemon Perfect Sets
      </button-checkbox>
      <button-checkbox
        :value="enabledSets.usage"
        size="small"
        type="secondary"
        @input="toggleUsageSets()"
      >
        Usage Sets
      </button-checkbox>
      <button-checkbox
        :value="enabledSets.custom"
        size="small"
        type="secondary"
        @input="toggleCustomSets()"
      >
        Custom Sets
      </button-checkbox>
    </section>
    <section>
      <h3>Report Options</h3>
      <button-checkbox
        :value="fractions"
        size="small"
        type="secondary"
        @input="toggleFractions()"
      >
        Show Fractions
      </button-checkbox>
      <button-checkbox
        :value="longRolls"
        size="small"
        type="secondary"
        @input="toggleLongRolls()"
      >
        Show Long Damage Rolls
      </button-checkbox>
    </section>
  </section>
</template>

<script>
import { mapActions, mapState } from "vuex";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";

export default {
  components: {
    ButtonCheckbox
  },
  computed: {
    ...mapState(["fractions", "longRolls", "sortByUsage", "enabledSets"])
  },
  methods: {
    ...mapActions([
      "toggleSmogonSets",
      "togglePokemonPerfectSets",
      "toggleUsageSets",
      "toggleCustomSets",
      "toggleFractions",
      "toggleLongRolls",
      "toggleSortByUsage"
    ])
  }
};
</script>

<style lang="scss" scoped>
@import "node_modules/bootstrap/scss/functions";
@import "node_modules/bootstrap/scss/variables";
@import "node_modules/bootstrap/scss/mixins";

.option-groups {
  & > * {
    border-bottom: $border-width $border-color;
    padding: map-get($spacers, 1);
    display: flex;
    flex-direction: column;
    align-items: start;

    & > * {
      margin-bottom: map-get($spacers, 1);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  &:last-child {
    border-bottom: 0;
  }
}
</style>
