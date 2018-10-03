<template>
  <div>
    <div>
      <button-checkbox
        :value='enabledSets.smogon'
        size='small'
        type='secondary'
        @input='toggleSmogonSets()'
        >
        Smogon Sets
      </button-checkbox>
      <button-checkbox
        :value='enabledSets.pokemonPerfect'
        size='small'
        type='secondary'
        @input='togglePokemonPerfectSets()'
        >
        Pokemon Perfect Sets
      </button-checkbox>
      <button-checkbox
        :value='enabledSets.usage'
        size='small'
        type='secondary'
        @input='toggleUsageSets()'
        >
        Usage Sets
      </button-checkbox>
      <button-checkbox
        :value='enabledSets.custom'
        size='small'
        type='secondary'
        @input='toggleCustomSets()'
        >
        Custom Sets
      </button-checkbox>
    </div>
    <hr>
    <div>
      <button-checkbox
        :value='fractions'
        size='small'
        type='secondary'
        @input='toggleFractions()'
        >
        Show Fractions
      </button-checkbox>
      <button-checkbox
        :value='longRolls'
        size='small'
        type='secondary'
        @input='toggleLongRolls()'
        >
        Show Long Damage Rolls
      </button-checkbox>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";

export default {
  components: {
    ButtonCheckbox
  },
  computed: {
    ...mapState(["fractions", "longRolls", "enabledSets"])
  },
  methods: {
    ...mapMutations([
      "toggleSmogonSets",
      "togglePokemonPerfectSets",
      "toggleUsageSets",
      "toggleCustomSets",
      "toggleFractions",
      "toggleLongRolls"
    ])
  }
};
</script>
