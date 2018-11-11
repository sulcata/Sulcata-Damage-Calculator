<template>
  <div>
    <textarea
      v-model="importText"
      class="form-control text-monospace"
      style="resize: vertical;"
      rows="10"
    ></textarea>
    <div class="text-center mt-3">
      <button
        type="button"
        class="btn btn-primary"
        @click="importPokemon({ importText, gen });"
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
