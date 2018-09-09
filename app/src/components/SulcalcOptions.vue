<template>
  <div>
    <div>
      <button-checkbox
        :value='enabledSets.smogon'
        @input='toggleSmogonSets()'
        size='small'
        type='secondary'
        >
        Smogon Sets
      </button-checkbox>
      <button-checkbox
        :value='enabledSets.pokemonPerfect'
        @input='togglePokemonPerfectSets()'
        size='small'
        type='secondary'
        >
        Pokemon Perfect Sets
      </button-checkbox>
      <button-checkbox
        :value='enabledSets.usage'
        @input='toggleUsageSets()'
        size='small'
        type='secondary'
        >
        Usage Sets
      </button-checkbox>
      <button-checkbox
        :value='enabledSets.custom'
        @input='toggleCustomSets()'
        size='small'
        type='secondary'
        >
        Custom Sets
      </button-checkbox>
    </div>
    <hr>
    <div>
      <button-checkbox
        :value='fractions'
        @input='toggleFractions()'
        size='small'
        type='secondary'
        >
        Show Fractions
      </button-checkbox>
      <button-checkbox
        :value='longRolls'
        @input='toggleLongRolls()'
        size='small'
        type='secondary'
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
