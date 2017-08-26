<template>
    <div>
        <div>
            <button-checkbox
                :value='enabledSets.smogon'
                @input='toggleSmogonSets()'
                size='small'
                type='secondary'
                >
                {{ $t("smogonSets") }}
            </button-checkbox>
            <button-checkbox
                :value='enabledSets.pokemonPerfect'
                @input='togglePokemonPerfectSets()'
                size='small'
                type='secondary'
                >
                {{ $t("pokemonPerfectSets") }}
            </button-checkbox>
            <button-checkbox
                :value='enabledSets.custom'
                @input='toggleCustomSets()'
                size='small'
                type='secondary'
                >
                {{ $t("customSets") }}
            </button-checkbox>
        </div>
        <hr>
        <div>
            <button-checkbox
                :value='fractions'
                @input='toggleFractions()'
                size='small'
                type='secondary'
                >
                {{ $t("showFractions") }}
            </button-checkbox>
            <button-checkbox
                :value='longRolls'
                @input='toggleLongRolls()'
                size='small'
                type='secondary'
                >
                {{ $t("showLongDamageRolls") }}
            </button-checkbox>
        </div>
    </div>
</template>

<script>
import {mapState, mapMutations} from "vuex";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";

export default {
    components: {
        ButtonCheckbox
    },
    computed: {
        ...mapState([
            "fractions",
            "longRolls",
            "enabledSets"
        ])
    },
    methods: {
        ...mapMutations([
            "toggleSmogonSets",
            "togglePokemonPerfectSets",
            "toggleCustomSets",
            "toggleFractions",
            "toggleLongRolls"
        ])
    }
};
</script>
