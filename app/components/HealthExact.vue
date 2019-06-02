<template>
  <div class="input-group">
    <input :value="actualHealth" class="form-control" @change="updateHealth" />
    <div class="input-group-append">
      <span class="input-group-text"> / {{ totalHp }} HP </span>
    </div>
  </div>
</template>

<script>
import { clamp } from "lodash";
import { Multiset } from "sulcalc";

const damageListRegex = /^(\d+(:\d+)?,)*\d+(:\d+)?$/;

export default {
  props: {
    currentHpRange: {
      required: true,
      type: Multiset
    },
    totalHp: {
      required: true,
      type: Number
    }
  },
  computed: {
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

function prettyPrintItems([value, multiplicity]) {
  return multiplicity.eq(1) ? value : `${value}:${multiplicity}`;
}
</script>
