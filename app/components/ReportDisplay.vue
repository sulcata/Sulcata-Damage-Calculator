<template>
  <div>
    <strong>{{ summary }}</strong> <br />
    <small>{{ damageRoll }}</small>
    <button type="button" class="btn btn-sm btn-light" @click="setHp">
      set hp
    </button>
    <br />
    <small v-if="fractions">{{ fractionalChances }}</small>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  computed: {
    ...mapState(["fractions", "longRolls"]),
    ...mapGetters(["selectedReport"]),
    summary() {
      return this.selectedReport.summary || "";
    },
    damageRoll() {
      const damage = this.selectedReport.damage;
      if (!damage) return "";
      if (damage.size.gt(39)) {
        return this.longRolls ? `(${damage})` : "";
      }
      return `(${damage.toArray().join(", ")})`;
    },
    fractionalChances() {
      const chances = this.selectedReport.fractionalChances;
      if (!chances) return "";
      return chances.map(chance => chance.join(" / ")).join(", ");
    }
  },
  methods: {
    ...mapActions(["setHp"])
  }
};
</script>
