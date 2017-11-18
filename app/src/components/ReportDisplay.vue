<template>
  <div>
    <strong>{{ summary }}</strong>
    <br>
    <small>{{ damageRoll }}</small>
    <button type='button' class='btn btn-sm btn-light' @click='setHp'>
      set hp
    </button>
    <br>
    <small v-if='fractions'>{{ fractionalChances }}</small>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from "vuex";
import { cmpStrs } from "sulcalc";

export default {
  computed: {
    ...mapState(["attacker", "defender", "fractions", "longRolls"]),
    ...mapGetters(["selectedReport", "attackerReports", "defenderReports"]),
    summary() {
      return this.selectedReport.summary || "";
    },
    damageRoll() {
      const damage = this.selectedReport.damage;
      if (!damage) return "";
      if (cmpStrs(damage.size, "39") > 0) {
        return this.longRolls ? String(damage) : "";
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
    ...mapMutations(["setAttacker", "setDefender"]),
    setHp() {
      const report = this.selectedReport;
      const pokemon = this.selectedReport.defender;
      if (this.attackerReports.includes(report)) {
        pokemon.event = this.defender.event;
        this.setDefender({ pokemon });
      } else if (this.defenderReports.includes(report)) {
        pokemon.event = this.attacker.event;
        this.setAttacker({ pokemon });
      }
    }
  }
};
</script>
