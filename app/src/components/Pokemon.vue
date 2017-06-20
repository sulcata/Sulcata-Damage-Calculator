<template>
    <div>
        <set-selector
            :gen='pokemon.gen'
            :pokemon='pokemon'
            :sets='sets'
            @input='updateValue($event)'
        ></set-selector>

        <div class='mt-1' v-if='pokemon.gen >= Gens.GSC'>
            <item v-model='pokemon.item'></item>
        </div>

        <div class='mt-1' v-if='pokemon.gen >= Gens.ADV'>
            <ability v-model='pokemon.ability'></ability>
        </div>

        <div class='mt-1' v-if='pokemon.gen >= Gens.ADV'>
            <nature v-model='pokemon.nature'></nature>
        </div>

        <div class='mt-1'>
            <strong>Level: </strong>
            <input
                type='number'
                min='0'
                max='100'
                v-model.number='level'
                class='form-control level-control'
                >
        </div>

        <div class='mt-1'>
            <stats :pokemon='pokemon'></stats>
        </div>

        <div class='mt-1' v-for='i in pokemon.moves.length'>
            <move v-model='pokemon.moves[i - 1]' :pokemon='pokemon'></move>
        </div>

        <div class='mt-1'>
            <div class='container-fluid p-0'>
                <div class='row'>
                    <div class='col'>
                        <status v-model='pokemon.status'></status>
                    </div>
                    <div class='col-auto'>
                        <health :pokemon='pokemon'></health>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {clamp} from "lodash";
import sulcalcMixin from "../mixins/sulcalc";
import SetSelector from "./SetSelector.vue";
import Ability from "./Ability.vue";
import Item from "./Item.vue";
import Move from "./Move.vue";
import Nature from "./Nature.vue";
import Status from "./Status.vue";
import Stats from "./Stats.vue";
import Health from "./Health.vue";
import {Pokemon} from "sulcalc";

export default {
    props: {
        pokemon: Pokemon,
        sets: {
            type: Object,
            default: () => ({
                smogon: true,
                pokemonPerfect: false
            }),
            validator(value) {
                return isBoolean(value.smogon)
                    && isBoolean(value.pokemonPerfect);
            }
        }
    },
    model: {
        prop: "pokemon",
        event: "input"
    },
    computed: {
        level: {
            get() {
                return this.pokemon.level;
            },
            set(value) {
                this.pokemon.level = clamp(value, 1, 100);
            }
        }
    },
    methods: {
        updateValue(newValue) {
            this.$emit("input", newValue);
        }
    },
    mixins: [sulcalcMixin],
    components: {
        SetSelector,
        Ability,
        Item,
        Move,
        Nature,
        Status,
        Stats,
        Health
    }
};

function isBoolean(value) {
    return value === true || value === false;
}
</script>

<style scoped>
.level-control {
    width: 6em;
    display: inline-block;
}
</style>
