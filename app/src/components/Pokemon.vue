<template>
    <div>
        <set-selector :pokemon='pokemon' @input='updatePokemon'></set-selector>

        <div class='mt-1' v-if='pokemon.gen >= Gens.GSC'>
            <item :item='pokemon.item' @input='updateItem'></item>
        </div>

        <div class='mt-1' v-if='pokemon.gen >= Gens.ADV'>
            <ability
                :ability='pokemon.ability'
                @input='updateAbility'
            ></ability>
        </div>

        <div class='mt-1' v-if='pokemon.gen >= Gens.ADV'>
            <nature :nature='pokemon.nature' @input='updateNature'></nature>
        </div>

        <div class='mt-1'>
            <strong>Level: </strong>
            <integer
                :min='1'
                :max='100'
                :value='pokemon.level'
                @input='updateLevel'
                class='level-control'
            ></integer>
        </div>

        <div class='mt-1'>
            <stats :pokemon='pokemon' @input='updatePokemon'></stats>
        </div>

        <div class='mt-1' v-for='i in pokemon.moves.length' :key='i'>
            <move
                :move='pokemon.moves[i - 1]'
                :happiness='pokemon.happiness'
                @input='move => updateMove(i - 1, move)'
                @input-happiness='updateHappiness'
            ></move>
        </div>

        <div class='mt-1'>
            <div class='container-fluid p-0'>
                <div class='row'>
                    <div class='col'>
                        <status
                            :status='pokemon.status'
                            @input='updateStatus'
                        ></status>
                    </div>
                    <div class='col-auto'>
                        <health
                            :total-hp='pokemon.stat(Stats.HP)'
                            :current-hp='pokemon.currentHp'
                            :current-hp-range='pokemon.currentHpRange'
                            :current-hp-range-berry='
                                pokemon.currentHpRangeBerry'
                            @input='updateHealth'
                        ></health>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {copyWithEvent} from "../utilities";
import SetSelector from "./SetSelector.vue";
import Ability from "./Ability.vue";
import Item from "./Item.vue";
import Move from "./Move.vue";
import Nature from "./Nature.vue";
import Status from "./Status.vue";
import StatsComponent from "./Stats.vue";
import Health from "./Health.vue";
import Integer from "./ui/Integer.vue";
import {Gens, Stats, Pokemon} from "sulcalc";

export default {
    model: {
        prop: "pokemon",
        event: "input"
    },
    components: {
        SetSelector,
        Ability,
        Item,
        Move,
        Nature,
        Status,
        Stats: StatsComponent,
        Health,
        Integer
    },
    props: {
        pokemon: {
            required: true,
            type: Pokemon
        }
    },
    data() {
        return {Gens, Stats};
    },
    methods: {
        updatePokemon(pokemon) {
            this.$emit("input", pokemon);
        },
        updateItem(item) {
            this.$emit("input", copyWithEvent({...this.pokemon, item}));
        },
        updateAbility(ability) {
            this.$emit("input", copyWithEvent({...this.pokemon, ability}));
        },
        updateNature(nature) {
            this.$emit("input", copyWithEvent({...this.pokemon, nature}));
        },
        updateLevel(level) {
            this.$emit("input", copyWithEvent({...this.pokemon, level}));
        },
        updateMove(i, move) {
            const moves = [...this.pokemon.moves];
            moves[i] = move;
            if (move.usesHappiness()) {
                this.$emit("input", copyWithEvent({
                    ...this.pokemon,
                    moves,
                    happiness: move.optimalHappiness()
                }));
            } else {
                this.$emit("input", copyWithEvent({...this.pokemon, moves}));
            }
        },
        updateHappiness(happiness) {
            this.$emit("input", copyWithEvent({...this.pokemon, happiness}));
        },
        updateHealth(health) {
            this.$emit("input", copyWithEvent({...this.pokemon, ...health}));
        },
        updateStatus(status) {
            this.$emit("input", copyWithEvent({...this.pokemon, status}));
        }
    }
};
</script>

<style scoped>
.level-control {
    width: 6em;
    display: inline-block;
}
</style>
