<template>
  <multiselect
    track-by="set"
    label="pokemonName"
    group-values="sets"
    group-label="pokemonName"
    :show-labels="false"
    placeholder="Pokemon"
    :value="pokemon.set"
    :options="sets"
    :options-limit="20"
    @input="updatePokemon"
  >
    <span slot="noResult">No Pokemon found.</span>
    <template slot="option" slot-scope="props">
      <span v-if="props.option.$isLabel">{{ props.option.$groupLabel }}</span>
      <span v-else>{{ props.option.setName }}</span>
    </template>
  </multiselect>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { Multiselect } from "vue-multiselect";
import { Pokemon } from "sulcalc";

export default {
  components: {
    Multiselect
  },
  props: {
    pokemon: {
      required: true,
      type: Pokemon
    }
  },
  computed: {
    ...mapState(["gen"]),
    ...mapGetters(["sets"])
  },
  methods: {
    updatePokemon(event) {
      const pokemon = event
        ? Pokemon.fromSet({
            id: event.pokemonId,
            set: event.set,
            gen: this.gen
          })
        : new Pokemon({ gen: this.gen });
      pokemon.set = event || undefined;
      this.$emit("input", pokemon);
    }
  }
};
</script>
