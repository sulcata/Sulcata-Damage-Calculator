<template>
  <button type="button" :class="classes" @click="toggle"><slot></slot></button>
</template>

<script>
import { hasOwn } from "sulcalc";

const sizeClasses = {
  small: "btn-sm",
  medium: "",
  large: "btn-lg"
};

const typeClasses = {
  primary: "-primary",
  secondary: "-secondary",
  success: "-success",
  danger: "-danger",
  warning: "-warning",
  info: "-info",
  light: "-light",
  dark: "-dark",
  link: "-link"
};

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: "medium",
      validator(value) {
        return hasOwn(sizeClasses, value);
      }
    },
    type: {
      type: String,
      default: "primary",
      validator(value) {
        return hasOwn(typeClasses, value);
      }
    },
    outline: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classes() {
      const outline = this.outline ? "-outline" : "";
      return {
        btn: true,
        active: this.value,
        [sizeClasses[this.size]]: true,
        [`btn${outline}${typeClasses[this.type]}`]: true
      };
    }
  },
  methods: {
    toggle() {
      this.$emit("input", !this.value);
    }
  }
};
</script>
