<template>
  <div class="container-fluid">
    <div class="row no-gutters">
      <strong class="col-3 offset-2 text-center">IVs</strong>
      <strong class="col-3 text-center">EVs</strong>
      <strong class="col-2"></strong>
      <strong class="col-2"></strong>
    </div>

    <div
      v-for="[stat, statName] in stats"
      :key="stat"
      class="form-row align-items-center"
    >
      <div class="col-2">{{ statName }}</div>

      <div class="col-3">
        <integer-input
          :value="computedIv(stat)"
          :min="0"
          :max="maxIv"
          :max-length="2"
          :disabled="isIvDisabled(stat)"
          @input="iv => updateIv(stat, iv)"
        />
      </div>

      <div class="col-3">
        <integer-input
          :value="computedEv(stat)"
          :min="0"
          :max="252"
          :step="4"
          :max-length="3"
          :disabled="isEvDisabled(stat)"
          @input="ev => updateEv(stat, ev)"
        />
      </div>

      <div class="col-2 text-center">
        <div
          v-if="stat === Stat.HP"
          role="group"
          class="btn-group btn-group-sm d-flex"
        >
          <button
            type="button"
            class="btn btn-outline-primary w-100"
            @click="() => boostAll(1)"
          >
            +1
          </button>
          <button
            type="button"
            class="btn btn-outline-primary w-100"
            @click="() => boostAll(-1)"
          >
            -1
          </button>
        </div>

        <select
          v-else
          :value="pokemon.boosts[stat]"
          class="form-control"
          @change="event => updateBoost(stat, event)"
        >
          <option v-for="n in 13" :key="n" :value="7 - n">
            {{ statBoost(7 - n) }}
          </option>
        </select>
      </div>

      <div class="col-2 text-center">
        {{ pokemon.boostedStat(stat) }}
      </div>
    </div>
  </div>
</template>

<script>
import { clamp } from "lodash";
import IntegerInput from "./ui/IntegerInput.vue";
import { Generation, Pokemon, Stat } from "sulcalc";

export default {
  components: {
    IntegerInput
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
    return { Stat };
  },
  computed: {
    stats() {
      if (this.pokemon.gen >= Generation.GSC) {
        return [
          [Stat.HP, "HP"],
          [Stat.ATK, "Atk"],
          [Stat.DEF, "Def"],
          [Stat.SATK, "SpAtk"],
          [Stat.SDEF, "SpDef"],
          [Stat.SPD, "Spe"]
        ];
      }
      return [
        [Stat.HP, "HP"],
        [Stat.ATK, "Atk"],
        [Stat.DEF, "Def"],
        [Stat.SPC, "Spc"],
        [Stat.SPD, "Spe"]
      ];
    },
    maxIv() {
      return this.pokemon.gen >= Generation.ADV ? 31 : 15;
    },
    defaultEv() {
      return this.pokemon.gen >= Generation.ADV ? 0 : 252;
    }
  },
  methods: {
    statBoost(boost) {
      if (boost > 0) {
        return `+${boost}`;
      }
      if (boost < 0) {
        return `${boost}`;
      }
      return "--";
    },
    boostAll(amount) {
      const boosts = this.pokemon.boosts.slice(0);
      const stats = [Stat.ATK, Stat.DEF, Stat.SATK, Stat.SDEF, Stat.SPD];
      for (const stat of stats) {
        boosts[stat] = clamp(boosts[stat] + amount, -6, 6);
      }
      this.$emit("input", new Pokemon({ ...this.pokemon, boosts }));
    },
    updateIv(stat, iv) {
      const ivs = this.pokemon.ivs.slice(0);
      ivs[stat] = iv;
      if (stat === Stat.HP || this.pokemon.gen <= Generation.GSC) {
        this.$emit(
          "input",
          new Pokemon({
            ...this.pokemon,
            ivs,
            currentHp: undefined,
            currentHpRange: undefined,
            currentHpRangeBerry: undefined
          })
        );
      } else {
        this.$emit("input", new Pokemon({ ...this.pokemon, ivs }));
      }
    },
    updateEv(stat, ev) {
      const evs = this.pokemon.evs.slice(0);
      evs[stat] = ev;
      if (stat === Stat.HP) {
        this.$emit(
          "input",
          new Pokemon({
            ...this.pokemon,
            evs,
            currentHp: undefined,
            currentHpRange: undefined,
            currentHpRangeBerry: undefined
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
        this.pokemon.gen <= Generation.GSC &&
        (stat === Stat.HP || stat === Stat.SDEF)
      );
    },
    isEvDisabled(stat) {
      return this.pokemon.gen <= Generation.GSC && stat === Stat.SDEF;
    },
    computedIv(stat) {
      if (this.pokemon.gen <= Generation.GSC) {
        if (stat === Stat.HP) {
          return Pokemon.calcHealthDv(this.pokemon.ivs);
        }
        if (stat === Stat.SDEF) {
          return this.pokemon.ivs[Stat.SPC];
        }
      }
      return this.pokemon.ivs[stat];
    },
    computedEv(stat) {
      if (this.pokemon.gen <= Generation.GSC && stat === Stat.SDEF) {
        return this.pokemon.evs[Stat.SPC];
      }
      return this.pokemon.evs[stat];
    }
  }
};
</script>
