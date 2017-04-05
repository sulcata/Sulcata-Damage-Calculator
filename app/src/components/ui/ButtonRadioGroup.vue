<template>
    <div role='group' :class='groupClasses'>
        <button type='button' class='btn btn-secondary'
                :class='{active: isSelected(option)}'
                v-for='option in options'
                @click='select(option)'>
            {{ option[label] }}
        </button>
    </div>
</template>

<script>
import isEqual from "lodash/isEqual";

const sizeClasses = {
    small: "btn-group-sm",
    medium: "",
    large: "btn-group-lg"
};

export default {
    props: {
        value: {},
        options: {
            type: Array,
            default: []
        },
        layout: {
            type: String,
            default: "horizontal",
            validator(value) {
                return value === "horizontal" || value === "vertical";
            }
        },
        size: {
            type: String,
            default: "medium",
            validator(value) {
                return sizeClasses.hasOwnProperty(value);
            }
        },
        label: {
            type: String,
            default: "label"
        },
        trackBy: {
            type: String,
            default: "value"
        }
    },
    computed: {
        groupClasses() {
            return {
                "btn-group": this.layout === "horizontal",
                "btn-group-vertical": this.layout === "vertical",
                [sizeClasses[this.size]]: true
            };
        }
    },
    methods: {
        select(option) {
            this.$emit("input", option[this.trackBy]);
        },
        isSelected(option) {
            return isEqual(this.value, option[this.trackBy]);
        }
    }
};
</script>
