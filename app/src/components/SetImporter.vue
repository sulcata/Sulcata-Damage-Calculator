<template>
  <div>
    <textarea
      v-model='importText'
      class='form-control'
      style='resize: vertical;'
      rows='10'
    ></textarea>
    <div class='text-center mt-3'>
      <button
        @click='importPokemon({importText, gen})'
        type='button'
        class='btn btn-primary'
        >
        Import
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return { importText: "" };
  },
  computed: {
    ...mapState(["gen"])
  },
  methods: {
    ...mapMutations(["importPokemon"])
  }
};
</script>
