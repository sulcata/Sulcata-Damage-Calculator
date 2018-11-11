<template>
  <input
    type="number"
    :min="min"
    :max="max"
    :step="step"
    :value="value"
    :disabled="disabled"
    class="form-control"
    :class="sizeClass"
    @change="updateValue"
  />
</template>

<script>
import { clamp } from "lodash";

const sizeClasses = {
  small: "form-control-sm",
  medium: "",
  large: "form-control-lg"
};

export default {
  props: {
    value: {
      type: Number,
      default: 0,
      validator: Number.isSafeInteger
    },
    defaultValue: {
      type: Number,
      default: NaN,
      validator(value) {
        return Number.isSafeInteger(value) || Number.isNaN(value);
      }
    },
    min: {
      type: Number,
      default: Number.MIN_SAFE_INTEGER,
      validator(value) {
        return !Number.isNaN(value);
      }
    },
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER,
      validator(value) {
        return !Number.isNaN(value);
      }
    },
    step: {
      type: Number,
      default: 1,
      validator(value) {
        return value > 0 && Number.isSafeInteger(value);
      }
    },
    size: {
      type: String,
      default: "medium",
      validator(value) {
        return sizeClasses.hasOwnProperty(value);
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    sizeClass() {
      return sizeClasses[this.size];
    }
  },
  methods: {
    updateValue(event) {
      const normalized = removeWhitespace(event.target.value);
      let integer;
      if (/^\d+$/.test(normalized)) {
        integer = Number(normalized);
      } else if (Number.isFinite(this.defaultValue)) {
        integer = this.defaultValue;
      } else {
        integer = this.value;
      }
      integer = clamp(integer, this.min, this.max);
      integer = Math.trunc(integer / this.step) * this.step;
      this.$emit("input", integer);
    }
  }
};

function removeWhitespace(string) {
  return string.replace(/\s/g, "");
}
</script>
