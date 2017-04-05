<template>
    <multiselect track-by='value' label='label'
                 :show-labels='false'
                 :placeholder='$t("status")'
                 :value='valueObj'
                 :options='statuses'
                 @input='updateValue($event)'
    ></multiselect>
</template>

<script>
import {Multiselect} from "vue-multiselect";
import {Statuses} from "sulcalc";

const statusTypes = [
    "poisoned",
    "badlyPoisoned",
    "burned",
    "paralyzed",
    "asleep",
    "frozen"
];

export default {
    props: {
        value: {
            type: Number,
            default: 0,
            validator(value) {
                return value >= 0 && value <= 5;
            }
        }
    },
    computed: {
        statuses() {
            return statusTypes.map((status, idx) => ({
                value: idx + 1,
                label: this.$t(status)
            }));
        },
        valueObj() {
            if (this.value === Statuses.NO_STATUS) {
                return {};
            }
            return {
                value: this.value,
                label: this.$t(statusTypes[this.value - 1])
            };
        }
    },
    methods: {
        updateValue($event) {
            this.$emit("input", $event ? $event.value : 0);
        }
    },
    components: {
        Multiselect
    }
};
</script>
