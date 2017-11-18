<template>
  <div class='container-fluid'>
    <div class='row align-items-center'>

      <div class='col-6'>
        <!-- Move Selection -->
        <multiselect
          track-by='value'
          label='label'
          :show-labels='false'
          placeholder='Move'
          :value='valueObj'
          :options='moves'
          @input='updateMove'
          />
      </div>

      <div class='col-auto'>
        <!-- Critical Hit -->
        <button-checkbox
          :value='move.critical'
          @input='updateCritical'
          size='small'
          type='secondary'
          >
          Crit
        </button-checkbox>

        <!-- Z-Move -->
        <button-checkbox
          v-if='gen >= Gens.SM'
          :value='move.zMove'
          @input='updateZMove'
          size='small'
          type='secondary'
          >
          Z-Move
        </button-checkbox>
      </div>

      <div class='col'>
        <!-- Multihit -->
        <select
          v-if='numberOfHitsInput'
          :value='move.numberOfHits'
          @input='updateNumberOfHits'
          class='form-control form-control-sm'
          >
          <option
            v-for='{value, label} in multiHitOptions'
            :key='value'
            :value='value'
            >
            {{ label }}
          </option>
        </select>

        <!-- Return / Frustration -->
        <integer
          v-else-if='move.usesHappiness()'
          :min='0'
          :max='255'
          :value='happiness'
          @input='updateHappiness'
          size='small'
          />

        <!-- Echoed Voice -->
        <select
          v-else-if='move.name === "Fury Cutter"'
          :value='move.furyCutter'
          @input='updateFuryCutter'
          class='form-control form-control-sm'
          >
          <option
            v-for='{value, label} in furyCutterOptions'
            :key='value'
            :value='value'
            >
            {{ label }}
          </option>
        </select>

        <!-- Echoed Voice -->
        <select
          v-else-if='move.name === "Echoed Voice"'
          :value='move.echoedVoice'
          @input='updateEchoedVoice'
          class='form-control form-control-sm'
          >
          <option
            v-for='{value, label} in echoedVoiceOptions'
            :key='value'
            :value='value'
            >
            {{ label }}
          </option>
        </select>

        <!-- Round -->
        <button-checkbox
          v-else-if='move.name === "Round"'
          :value='move.roundBoost'
          @input='updateRoundBoost'
          size='small'
          type='secondary'
          >
          Round
        </button-checkbox>

        <!-- Trump Card -->
        <select
          v-else-if='move.name === "Trump Card"'
          :value='move.trumpPP'
          @input='updateTrumpPP'
          class='form-control form-control-sm'
          >
          <option value='4'>4+ PP after use</option>
          <option value='3'>3 PP after use</option>
          <option value='2'>2 PP after use</option>
          <option value='1'>1 PP after use</option>
          <option value='0'>0 PP after use</option>
        </select>

        <!-- Minimize -->
        <button-checkbox
          v-else-if='move.boostedByMinimize()'
          :value='move.minimize'
          @input='updateMinimize'
          size='small'
          type='secondary'
          >
          Minimize
        </button-checkbox>

        <!-- Dig -->
        <button-checkbox
          v-else-if='move.boostedByDig()'
          :value='move.dig'
          @input='updateDig'
          size='small'
          type='secondary'
          >
          Dig
        </button-checkbox>

        <!-- Dive -->
        <button-checkbox
          v-else-if='move.boostedByDive()'
          :value='move.dive'
          @input='updateDive'
          size='small'
          type='secondary'
          >
          Dive
        </button-checkbox>

        <!-- Fly / Bounce -->
        <button-checkbox
          v-else-if='move.boostedByFly()'
          :value='move.fly'
          @input='updateFly'
          size='small'
          type='secondary'
          >
          Fly / Bounce
        </button-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Multiselect } from "vue-multiselect";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import Integer from "./ui/Integer.vue";
import { Move, Gens, info } from "sulcalc";

export default {
  model: {
    prop: "move",
    event: "input"
  },
  components: {
    Multiselect,
    ButtonCheckbox,
    Integer
  },
  props: {
    move: {
      required: true,
      type: Move
    },
    happiness: {
      type: Number,
      default: 0,
      validator(value) {
        return 0 <= value && value <= 255;
      }
    }
  },
  data() {
    return { Gens };
  },
  computed: {
    ...mapState(["gen"]),
    moves() {
      return info
        .releasedMoves(this.gen)
        .map(id => ({ value: id, label: info.moveName(id) }));
    },
    valueObj() {
      if (this.move.name === "(No Move)") {
        return {};
      }
      return { value: this.move.id, label: this.move.name };
    },
    multiHitOptions() {
      const options = [
        {
          value: 0,
          label: "--"
        }
      ];
      for (let i = this.move.minHits(); i <= this.move.maxHits(); i++) {
        options.push({
          value: i,
          label: `${i} hits`
        });
      }
      return options;
    },
    furyCutterOptions() {
      if (this.gen >= Gens.ORAS) return ordinalHitOptions(3);
      if (this.gen >= Gens.B2W2) return ordinalHitOptions(4);
      return ordinalHitOptions(5);
    },
    echoedVoiceOptions() {
      return ordinalHitOptions(5);
    },
    numberOfHitsInput() {
      return this.move.hitsMultipleTimes();
    }
  },
  methods: {
    updateMove(event) {
      const move = new Move({
        id: event ? event.value : "nomove",
        gen: this.gen
      });
      this.$emit("input", move);
    },
    updateHappiness(happiness) {
      this.$emit("input-happiness", happiness);
    },
    updateCritical(critical) {
      this.$emit("input", new Move({ ...this.move, critical }));
    },
    updateZMove(zMove) {
      this.$emit("input", new Move({ ...this.move, zMove }));
    },
    updateNumberOfHits(event) {
      this.$emit(
        "input",
        new Move({
          ...this.move,
          numberOfHits: Number(event.target.value)
        })
      );
    },
    updateFuryCutter(event) {
      this.$emit(
        "input",
        new Move({
          ...this.move,
          furyCutter: Number(event.target.value)
        })
      );
    },
    updateEchoedVoice(event) {
      this.$emit(
        "input",
        new Move({
          ...this.move,
          echoedVoice: Number(event.target.value)
        })
      );
    },
    updateRoundBoost(roundBoost) {
      this.$emit("input", new Move({ ...this.move, roundBoost }));
    },
    updateTrumpPP(event) {
      this.$emit(
        "input",
        new Move({
          ...this.move,
          trumpPP: Number(event.target.value)
        })
      );
    },
    updateMinimize(minimize) {
      this.$emit("input", new Move({ ...this.move, minimize }));
    },
    updateDig(dig) {
      this.$emit("input", new Move({ ...this.move, dig }));
    },
    updateDive(dive) {
      this.$emit("input", new Move({ ...this.move, dive }));
    },
    updateFly(fly) {
      this.$emit("input", new Move({ ...this.move, fly }));
    }
  }
};

function ordinalHitOptions(n) {
  return ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"]
    .slice(0, n)
    .map((ord, value) => ({
      value,
      label: `${ord} hit`
    }));
}
</script>
