<template>
    <div>
        <v-set-selector :gen='pokemon.gen' :pokemon='pokemon'
                        @input='updateValue($event)'>
        </v-set-selector>

        <div class='mt-1' v-if='pokemon.gen >= Gens.GSC'>
            <v-item v-model='pokemon.item'></v-item>
        </div>

        <div class='mt-1' v-if='pokemon.gen >= Gens.ADV'>
            <v-ability v-model='pokemon.ability'></v-ability>
        </div>

        <div class='mt-1' v-if='pokemon.gen >= Gens.ADV'>
            <v-nature v-model='pokemon.nature'></v-nature>
        </div>

        <div class='mt-1'>
            <strong>Level: </strong>
            <input type='number' min='0' max='100'
                   v-model.number='level'
                   class='form-control level-control'>
        </div>

        <div class='mt-1'>
            <v-stats :pokemon='pokemon'></v-stats>
        </div>

        <div class='mt-1' v-for='i in pokemon.moves.length'>
            <v-move v-model='pokemon.moves[i - 1]' :pokemon='pokemon'></v-move>
        </div>

        <div class='mt-1'>
            <div class='container-fluid p-0'>
                <div class='row'>
                    <div class='col'>
                        <v-status v-model='pokemon.status'></v-status>
                    </div>
                    <div class='col-auto'>
                        <v-health :pokemon='pokemon'></v-health>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import clamp from "lodash/clamp";

import sulcalcMixin from "../mixins/sulcalc";

import vSetSelector from "./SetSelector.vue";
import vAbility from "./Ability.vue";
import vItem from "./Item.vue";
import vMove from "./Move.vue";
import vNature from "./Nature.vue";
import vStatus from "./Status.vue";
import vStats from "./Stats.vue";
import vHealth from "./Health.vue";

import {Pokemon} from "sulcalc";

export default {
    props: {
        pokemon: Pokemon
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
        vSetSelector,
        vAbility,
        vItem,
        vMove,
        vNature,
        vStatus,
        vStats,
        vHealth
    }
};
</script>

<style scoped>
.level-control {
    width: 6em;
    display: inline-block;
}
</style>
