<template>
  <div>
    <label>HP</label>
    <input
      :value='actualHealth'
      @change='updateHealth'
      class='form-control'
      style='width: 6rem; display: inline-block;'
      >
    /{{ totalHp }} (
    <integer
      :min='1'
      :max='100'
      :value='percentHealth'
      @input='updatePercent'
      style='width: 6rem; display: inline-block;'
      />
    %)
  </div>
</template>

<script>
import { clamp } from "lodash";
import Integer from "./ui/Integer.vue";
import { Multiset } from "sulcalc";

const damageListRegex = /^(\d+(:\d+)?,)*\d+(:\d+)?$/;

export default {
  components: {
    Integer
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
      return Math.max(1, Math.floor(100 * this.currentHp / this.totalHp));
    },
    actualHealth() {
      return this.currentHpRange.toString(prettyPrintItems);
    }
  },
  methods: {
    updateHealth(event) {
      const normalized = event.target.value.replace(/\s/g, "");
      let newHealth;
      if (damageListRegex.test(normalized)) {
        newHealth = parseHealthList(normalized, 0, this.totalHp);
      } else {
        newHealth = new Multiset([this.totalHp]);
      }
      this.$emit("input", {
        currentHp: Multiset.average(newHealth, 0),
        currentHpRange: newHealth,
        currentHpRangeBerry: new Multiset()
      });
    },
    updatePercent(percent) {
      const [minHp, maxHp] = minMaxHp(this.totalHp, percent);
      const newHealth = new Multiset();
      for (let hp = minHp; hp <= maxHp; hp++) {
        newHealth.add(hp);
      }
      this.$emit("input", {
        currentHp: Multiset.average(newHealth, 0),
        currentHpRange: newHealth,
        currentHpRangeBerry: new Multiset()
      });
    }
  }
};

function parseItem(item, min, max) {
  const [health, multiplicity = "1"] = item.split(":");
  return [clamp(Number(health), min, max), multiplicity];
}

function parseHealthList(list, min, max) {
  const pairs = list.split(",").map(item => parseItem(item, min, max));
  return new Multiset(new Map(pairs));
}

function minMaxHp(totalHp, percent) {
  const minHp = Math.ceil(percent / 100 * totalHp);
  const maxHp = clamp(
    Math.ceil((percent + 1) / 100 * totalHp) - 1,
    minHp,
    totalHp
  );
  return percent === 1 ? [1, maxHp] : [minHp, maxHp];
}

function prettyPrintItems([value, multiplicity]) {
  return multiplicity === "1" ? value : `${value}:${multiplicity}`;
}
</script>
