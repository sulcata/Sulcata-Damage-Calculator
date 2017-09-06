<template>
    <button-radio-group
        :value='gen'
        :options='gens'
        @input='gen => changeGen({gen})'
        type='secondary'
    />
</template>

<script>
import {mapState, mapMutations} from "vuex";
import translationMixin from "../mixins/translation";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import {Gens, maxGen} from "sulcalc";

export default {
    components: {
        ButtonRadioGroup
    },
    mixins: [
        translationMixin
    ],
    computed: {
        ...mapState([
            "gen"
        ]),
        gens() {
            const options = [];
            for (let value = Gens.RBY; value <= maxGen; value++) {
                options.push({
                    value,
                    label: this.$tGen(value)
                });
            }
            return options;
        }
    },
    methods: {
        ...mapMutations([
            "changeGen"
        ])
    }
};
</script>
