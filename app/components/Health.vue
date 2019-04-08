<template>
  <div>
    <label>HP</label>
    <input
      :value="actualHealth"
      class="form-control small-fixed-width"
      @change="updateHealth"
    />
    /{{ totalHp }} (
    <integer-input
      :min="1"
      :max="100"
      :value="percentHealth"
      class="small-fixed-width"
      @input="updatePercent"
    />
    %)
  </div>
</template>

<script>
import { clamp } from "lodash";
import IntegerInput from "./ui/IntegerInput.vue";
import { Multiset } from "sulcalc";

const damageListRegex = /^(\d+(:\d+)?,)*\d+(:\d+)?$/;

export default {
  components: {
    IntegerInput
  },
  props: {
    currentHp: {
      required: true,
      type: Number
    },
    currentHpRange: {
      required: true,
      type: Multiset
    },
    currentHpRangeBerry: {
      required: true,
      type: Multiset
    },
    totalHp: {
      required: true,
      type: Number
    }
  },
  computed: {
    percentHealth() {
      return Math.max(1, Math.floor((100 * this.currentHp) / this.totalHp));
    },
    actualHealth() {
      return this.currentHpRange.toString(prettyPrintItems);
    }
  },
  methods: {
    updateHealth(event) {
      const normalized = event.target.value.replace(/\s/g, "");
      const health = damageListRegex.test(normalized)
        ? parseHealthList(normalized)
        : new Multiset([this.totalHp]);
      this.$emit("input", {
        currentHpRange: health.map(value => clamp(value, 0, this.totalHp))
      });
    },
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

function parseItem(item) {
  const [health, multiplicity = 1] = item.split(":");
  return [Number(health), multiplicity];
}

function parseHealthList(list) {
  const pairs = list.split(",").map(parseItem);
  return Multiset.fromEntries(pairs);
}

function minMaxHp(totalHp, percent) {
  const minHp = Math.ceil((percent / 100) * totalHp);
  const maxHp = clamp(
    Math.ceil(((percent + 1) / 100) * totalHp) - 1,
    minHp,
    totalHp
  );
  return percent === 1 ? [1, maxHp] : [minHp, maxHp];
}

function prettyPrintItems([value, multiplicity]) {
  return multiplicity.eq(1) ? value : `${value}:${multiplicity}`;
}
</script>

<style scoped>
.small-fixed-width {
  width: 6rem;
  display: inline-block;
}
</style>
