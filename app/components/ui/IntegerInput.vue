<template>
  <input
    type="number"
    required
    :min="min"
    :max="max"
    :step="step"
    :maxlength="maxLength"
    :value="value"
    :disabled="disabled"
    class="form-control"
    :class="sizeClass"
    @change="updateValue"
  />
</template>

<script>
import { clamp } from "lodash";
import { hasOwn } from "sulcalc";

const sizeClasses = {
  small: "form-control-sm",
  medium: "",
  large: "form-control-lg"
};

const clampAndStep = (value, min, max, step) =>
  Math.trunc(clamp(value, min, max) / step) * step;

export default {
  props: {
    value: {
      type: Number,
      default: 0,
      validator: Number.isSafeInteger
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
    maxLength: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER,
      validator(value) {
        return value > 0 && Number.isSafeInteger(value);
      }
    },
    size: {
      type: String,
      default: "medium",
      validator(value) {
        return hasOwn(sizeClasses, value);
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
      if (!event.target.value) return;
      const value = clampAndStep(
        Number.parseInt(event.target.value, 10),
        this.min,
        this.max,
        this.step
      );
      if (Number.isSafeInteger(value) && this.value !== value) {
        this.$emit("input", value);
      }
    }
  }
};
</script>
