<template>
  <div class='container-fluid'>
    <div class='row no-gutters'>
      <strong class='col-3 offset-2 text-center'>{{ $t("ivs") }}</strong>
      <strong class='col-3 text-center'>{{ $t("evs") }}</strong>
      <strong class='col-2'></strong>
      <strong class='col-2'></strong>
    </div>

    <div
      v-for='(statName, stat) in stats'
      :key='stat'
      v-if='statName'
      class='row align-items-center no-gutters'
      >

      <div class='col-2'>
        {{ $t(statName) }}
      </div>

      <div class='col-3'>
        <integer
          :value='computedIv(stat)'
          :min='0'
          :max='maxIv'
          :disabled='isIvDisabled(stat)'
          @input='iv => updateIv(stat, iv)'
          />
      </div>

      <div class='col-3'>
        <integer
          :value='computedEv(stat)'
          :min='0'
          :max='252'
          :step='4'
          :disabled='isEvDisabled(stat)'
          @input='ev => updateEv(stat, ev)'
          />
      </div>

      <div class='col-2 text-center'>{{ pokemon.boostedStat(stat) }}</div>

      <div class='col-2'>
        <select
          :value='pokemon.boosts[stat]'
          @change='event => updateBoost(stat, event)'
          class='form-control'
          :class='{invisible: stat === Stats.HP}'
          >
          <option v-for='n in 13' :key='n' :value='7 - n'>
              {{ statBoost(7 - n) }}
          </option>
        </select>
      </div>

    </div>
  </div>
</template>

<script>
import { copyWithEvent } from "../utilities";
import Integer from "./ui/Integer.vue";
import { Pokemon, Gens, Stats } from "sulcalc";

export default {
  model: {
    prop: "pokemon",
    event: "input"
  },
  components: {
    Integer
  },
  props: {
    pokemon: {
      required: true,
      type: Pokemon
    }
  },
  data() {
    return { Stats };
  },
  computed: {
    stats() {
      return this.pokemon.gen >= Gens.GSC
        ? ["hp", "atk", "def", "spAtk", "spDef", "spe"]
        : ["hp", "atk", "def", "spc", null, "spe"];
    },
    maxIv() {
      return this.pokemon.gen >= Gens.ADV ? 31 : 15;
    },
    defaultEv() {
      return this.pokemon.gen >= Gens.ADV ? 0 : 252;
    }
  },
  methods: {
    statBoost(boost) {
      if (boost > 0) {
        return "+" + boost;
      }
      if (boost < 0) {
        return boost;
      }
      return "--";
    },
    updateIv(stat, iv) {
      const ivs = [...this.pokemon.ivs];
      ivs[stat] = iv;
      if (stat === Stats.HP || this.pokemon.gen <= Gens.GSC) {
        this.$emit(
          "input",
          copyWithEvent({
            ...this.pokemon,
            ivs,
            currentHp: null,
            currentHpRange: null,
            currentHpRangeBerry: null
          })
        );
      } else {
        this.$emit("input", copyWithEvent({ ...this.pokemon, ivs }));
      }
    },
    updateEv(stat, ev) {
      const evs = [...this.pokemon.evs];
      evs[stat] = ev;
      if (stat === Stats.HP) {
        this.$emit(
          "input",
          copyWithEvent({
            ...this.pokemon,
            evs,
            currentHp: null,
            currentHpRange: null,
            currentHpRangeBerry: null
          })
        );
      } else {
        this.$emit("input", copyWithEvent({ ...this.pokemon, evs }));
      }
    },
    updateBoost(stat, event) {
      const boosts = [...this.pokemon.boosts];
      boosts[stat] = Number(event.target.value);
      this.$emit("input", copyWithEvent({ ...this.pokemon, boosts }));
    },
    isIvDisabled(stat) {
      return (
        this.pokemon.gen <= Gens.GSC &&
        (stat === Stats.HP || stat === Stats.SDEF)
      );
    },
    isEvDisabled(stat) {
      return this.pokemon.gen <= Gens.GSC && stat === Stats.SDEF;
    },
    computedIv(stat) {
      if (this.pokemon.gen <= Gens.GSC) {
        if (stat === Stats.HP) {
          return Pokemon.calcHealthDv(this.pokemon.ivs);
        }
        if (stat === Stats.SDEF) {
          return this.pokemon.ivs[Stats.SPC];
        }
      }
      return this.pokemon.ivs[stat];
    },
    computedEv(stat) {
      if (this.pokemon.gen <= Gens.GSC && stat === Stats.SDEF) {
        return this.pokemon.evs[Stats.SPC];
      }
      return this.pokemon.evs[stat];
    }
  }
};
</script>
