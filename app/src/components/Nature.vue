<template>
    <multiselect
        track-by='value'
        label='label'
        :show-labels='false'
        :placeholder='$t("nature")'
        :value='valueObj'
        :options='natures'
        @input='updateValue($event)'
    ></multiselect>
</template>

<script>
import {Multiselect} from "vue-multiselect";
import translationMixin from "../mixins/translation";
import {info} from "sulcalc";

export default {
    props: {
        nature: {
            type: Number,
            default: 0,
            validator(value) {
                return value >= 0 && value <= 24;
            }
        }
    },
    model: {
        prop: "nature",
        event: "input"
    },
    computed: {
        natures() {
            return info.natures()
                .map(id => ({
                    value: id,
                    label: this.$tNature({id})
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
        },
        valueObj() {
            if (info.natureName(this.nature) === "Hardy") {
                return {};
            }
            return {
                value: this.nature,
                label: this.$tNature({id: this.nature})
            };
        }
    },
    methods: {
        updateValue($event) {
            this.$emit("input", $event ? $event.value : 0);
        }
    },
    mixins: [translationMixin],
    components: {
        Multiselect
    }
};
</script>
