<template>
    <button
        type='button'
        :class='classes'
        style='cursor: default;'
        @click='toggle'
        >
        <slot></slot>
    </button>
</template>

<script>
const sizeClasses = {
    small: "btn-sm",
    medium: "",
    large: "btn-lg"
};

const typeClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "btn-success",
    danger: "btn-danger",
    warning: "btn-warning",
    info: "btn-warning",
    light: "btn-light",
    dark: "btn-dark",
    link: "btn-link"
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
                return sizeClasses.hasOwnProperty(value);
            }
        },
        type: {
            type: String,
            default: "primary",
            validator(value) {
                return typeClasses.hasOwnProperty(value);
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
                [typeClasses[this.type] + outline]: true
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
