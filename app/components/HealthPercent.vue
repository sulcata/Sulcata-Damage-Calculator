<template>
  <div class="input-group">
    <integer-input
      :min="1"
      :max="100"
      :value="percentHealth"
      @input="updatePercent"
    />
    <div class="input-group-append">
      <span class="input-group-text">
        %
      </span>
    </div>
  </div>
</template>

<script>
import { clamp } from "lodash";
import IntegerInput from "./ui/IntegerInput.vue";
import { Multiset } from "sulcalc";

export default {
  components: {
    IntegerInput
  },
  props: {
    currentHp: {
      required: true,
      type: Number
    },
    totalHp: {
      required: true,
      type: Number
    }
  },
  computed: {
    percentHealth() {
      return Math.max(1, Math.floor((100 * this.currentHp) / this.totalHp));
    }
  },
  methods: {
    updatePercent(percent) {
      const [minHp, maxHp] = minMaxHp(this.totalHp, percent);
      const health = new Multiset();
      for (let hp = minHp; hp <= maxHp; hp++) {
        health.add(hp);
      }
      this.$emit("input", { currentHpRange: health });
    }
  }
};

function minMaxHp(totalHp, percent) {
  const minHp = Math.ceil((percent / 100) * totalHp);
  const maxHp = clamp(
    Math.ceil(((percent + 1) / 100) * totalHp) - 1,
    minHp,
    totalHp
  );
  return [percent > 1 ? minHp : 1, maxHp];
}
</script>
