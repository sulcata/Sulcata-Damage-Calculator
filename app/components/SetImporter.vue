<template>
  <div>
    <textarea
      v-model="importable"
      class="form-control text-monospace"
      style="resize: vertical;"
      rows="10"
    ></textarea>
    <div class="text-center mt-3">
      <button
        type="button"
        class="btn btn-primary"
        @click="importPokemon({ importable })"
      >
        Import
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return { importable: "" };
  },
  methods: {
    ...mapActions(["importPokemon"])
  }
};
</script>
