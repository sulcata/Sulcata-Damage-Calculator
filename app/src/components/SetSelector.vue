<template>
    <multiselect
        track-by='set'
        label='pokemonName'
        group-values='sets'
        group-label='pokemonName'
        :show-labels='false'
        :placeholder='$t("pokemon")'
        :options='translatedSets'
        :value='pokemon.event'
        @input='updatePokemon'
        >
        <template slot='option' scope='props'>
            <span v-if='props.option.$isLabel'>
                {{ props.option.$groupLabel }}
            </span>
            <span v-else>
                {{ props.option.setName }}
            </span>
        </template>
    </multiselect>
</template>

<script>
import {mapState, mapGetters} from "vuex";
import {Multiselect} from "vue-multiselect";
import translationMixin from "../mixins/translation";
import {Pokemon} from "sulcalc";

export default {
    components: {
        Multiselect
    },
    mixins: [
        translationMixin
    ],
    props: {
        pokemon: {
            required: true,
            type: Pokemon
        }
    },
    computed: {
        ...mapState([
            "gen"
        ]),
        ...mapGetters([
            "sets"
        ]),
        translatedSets() {
            return this.sets.map(setGroup => {
                const pokemonName = this.$tPokemon({id: setGroup.pokemonId});
                return {
                    ...setGroup,
                    pokemonName,
                    sets: setGroup.sets.map(set => ({...set, pokemonName}))
                };
            }).sort((a, b) => a.pokemonName.localeCompare(b.pokemonName));
        }
    },
    methods: {
        updatePokemon(event) {
            const pokemon = Pokemon.fromSet({
                id: event.pokemonId,
                set: event.set,
                gen: this.gen
            });
            pokemon.event = event;
            this.$emit("input", pokemon);
        }
    }
};
</script>
