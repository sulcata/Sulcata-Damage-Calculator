<template>
    <button type='button' class='btn btn-secondary'
            :class='{active: value, [sizeClass]: true}'
            @click='toggle()'>
        <slot></slot>
    </button>
</template>

<script>
const sizeClasses = {
    small: "btn-sm",
    medium: "",
    large: "btn-lg"
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
        }
    },
    computed: {
        sizeClass() {
            return sizeClasses[this.size];
        }
    },
    methods: {
        toggle() {
            this.$emit("input", !this.value);
        }
    }
};
</script>
