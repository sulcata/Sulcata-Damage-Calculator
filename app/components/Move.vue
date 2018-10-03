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
          size='small'
          type='secondary'
          @input='updateCritical'
          >
          Crit
        </button-checkbox>

        <!-- Z-Move -->
        <button-checkbox
          v-if='gen >= Gens.SM'
          :value='move.zMove'
          size='small'
          type='secondary'
          @input='updateZMove'
          >
          Z-Move
        </button-checkbox>
      </div>

      <div class='col'>
        <!-- Multihit -->
        <select
          v-if='numberOfHitsInput'
          :value='move.numberOfHits'
          class='form-control form-control-sm'
          @input='updateNumberOfHits'
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
        <integer-input
          v-else-if='move.usesHappiness()'
          :min='0'
          :max='255'
          :value='happiness'
          size='small'
          @input='updateHappiness'
          />

        <!-- Fury Cutter -->
        <select
          v-else-if='move.name === "Fury Cutter"'
          :value='move.furyCutter'
          class='form-control form-control-sm'
          @input='updateFuryCutter'
          >
          <option
            v-for='{value, label} in furyCutterOptions'
            :key='value'
            :value='value'
            >
            {{ label }}
          </option>
        </select>

        <!-- Fury Cutter -->
        <select
          v-else-if='move.name === "Present"'
          :value='move.present'
          class='form-control form-control-sm'
          @input='updatePresent'
          >
          <option :value='-1'>--</option>
          <option :value='0'>Heal</option>
          <option :value='1'>40 BP</option>
          <option :value='2'>80 BP</option>
          <option :value='3'>120 BP</option>
        </select>

        <!-- Echoed Voice -->
        <select
          v-else-if='move.name === "Echoed Voice"'
          :value='move.echoedVoice'
          class='form-control form-control-sm'
          @input='updateEchoedVoice'
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
          size='small'
          type='secondary'
          @input='updateRoundBoost'
          >
          Round
        </button-checkbox>

        <!-- Trump Card -->
        <select
          v-else-if='move.name === "Trump Card"'
          :value='move.trumpPP'
          class='form-control form-control-sm'
          @input='updateTrumpPP'
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
          size='small'
          type='secondary'
          @input='updateMinimize'
          >
          Minimize
        </button-checkbox>

        <!-- Dig -->
        <button-checkbox
          v-else-if='move.boostedByDig()'
          :value='move.dig'
          size='small'
          type='secondary'
          @input='updateDig'
          >
          Dig
        </button-checkbox>

        <!-- Dive -->
        <button-checkbox
          v-else-if='move.boostedByDive()'
          :value='move.dive'
          size='small'
          type='secondary'
          @input='updateDive'
          >
          Dive
        </button-checkbox>

        <!-- Fly / Bounce -->
        <button-checkbox
          v-else-if='move.boostedByFly()'
          :value='move.fly'
          size='small'
          type='secondary'
          @input='updateFly'
          >
          Fly / Bounce
        </button-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import VueMultiselect from "vue-multiselect";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import IntegerInput from "./ui/IntegerInput.vue";
import { Move, Gens, info } from "sulcalc";

const { Multiselect } = VueMultiselect;

export default {
  components: {
    Multiselect,
    ButtonCheckbox,
    IntegerInput
  },
  model: {
    prop: "move",
    event: "input"
  },
  props: {
    move: {
      required: true,
      type: Move
    },
    happiness: {
      type: Number,
      default: 0,
      validator(happiness) {
        return 0 <= happiness && happiness <= 255;
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
      return this.move.name === "(No Move)"
        ? null
        : { value: this.move.id, label: this.move.name };
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
      return (
        this.move.hitsMultipleTimes() &&
        this.move.minHits() < this.move.maxHits()
      );
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
    updatePresent(event) {
      this.$emit(
        "input",
        new Move({
          ...this.move,
          present: Number(event.target.value)
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
