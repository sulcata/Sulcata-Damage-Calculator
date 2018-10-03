<template>
  <div class='container-fluid'>
    <div class='row no-gutters'>
      <strong class='col-3 offset-2 text-center'>IVs</strong>
      <strong class='col-3 text-center'>EVs</strong>
      <strong class='col-2'></strong>
      <strong class='col-2'></strong>
    </div>

    <div
      v-for='[stat, statName] in stats'
      :key='stat'
      class='row align-items-center no-gutters'
      >

      <div class='col-2'>
        {{ statName }}
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

      <div class='col-2 text-center'>
        <div
          v-if='stat === Stats.HP'
          role='group'
          class='btn-group btn-group-sm d-flex'
          >
          <button
            type='button'
            class='btn btn-outline-primary w-100'
            style='cursor: default;'
            @click='() => boostAll(1)'
            >
            +1
          </button>
          <button
            type='button'
            class='btn btn-outline-primary w-100'
            style='cursor: default;'
            @click='() => boostAll(-1)'
            >
            -1
          </button>
        </div>

        <select
          v-else
          :value='pokemon.boosts[stat]'
          class='form-control'
          @change='event => updateBoost(stat, event)'
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
import { clamp } from "lodash";
import Integer from "./ui/Integer.vue";
import { Pokemon, Gens, Stats } from "sulcalc";

export default {
  components: {
    Integer
  },
  model: {
    prop: "pokemon",
    event: "input"
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
      if (this.pokemon.gen >= Gens.GSC) {
        return [
          [Stats.HP, "HP"],
          [Stats.ATK, "Atk"],
          [Stats.DEF, "Def"],
          [Stats.SATK, "SpAtk"],
          [Stats.SDEF, "SpDef"],
          [Stats.SPD, "Spe"]
        ];
      }
      return [
        [Stats.HP, "HP"],
        [Stats.ATK, "Atk"],
        [Stats.DEF, "Def"],
        [Stats.SPC, "Spc"],
        [Stats.SPD, "Spe"]
      ];
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
    boostAll(amount) {
      const boosts = this.pokemon.boosts.slice(0);
      const stats = [Stats.ATK, Stats.DEF, Stats.SATK, Stats.SDEF, Stats.SPD];
      for (const stat of stats) {
        boosts[stat] = clamp(boosts[stat] + amount, -6, 6);
      }
      this.$emit("input", new Pokemon({ ...this.pokemon, boosts }));
    },
    updateIv(stat, iv) {
      const ivs = this.pokemon.ivs.slice(0);
      ivs[stat] = iv;
      if (stat === Stats.HP || this.pokemon.gen <= Gens.GSC) {
        this.$emit(
          "input",
          new Pokemon({
            ...this.pokemon,
            ivs,
            currentHp: null,
            currentHpRange: null,
            currentHpRangeBerry: null
          })
        );
      } else {
        this.$emit("input", new Pokemon({ ...this.pokemon, ivs }));
      }
    },
    updateEv(stat, ev) {
      const evs = this.pokemon.evs.slice(0);
      evs[stat] = ev;
      if (stat === Stats.HP) {
        this.$emit(
          "input",
          new Pokemon({
            ...this.pokemon,
            evs,
            currentHp: null,
            currentHpRange: null,
            currentHpRangeBerry: null
          })
        );
      } else {
        this.$emit("input", new Pokemon({ ...this.pokemon, evs }));
      }
    },
    updateBoost(stat, event) {
      const boosts = this.pokemon.boosts.slice(0);
      boosts[stat] = Number(event.target.value);
      this.$emit("input", new Pokemon({ ...this.pokemon, boosts }));
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
