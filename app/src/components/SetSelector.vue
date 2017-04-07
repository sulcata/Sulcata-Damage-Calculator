<template>
    <multiselect track-by='set' label='pokemonAndSet'
                 group-values='sets' group-label='pokemon'
                 :show-labels='false'
                 :placeholder='$t("pokemon")'
                 :options='sets'
                 :value='pokemon.smogonSet'
                 @input='emitPokemon($event)'>
        <template slot='option' scope='props'>
            <span>{{ props.option.setName }}</span>
        </template>
    </multiselect>
</template>

<script>
import {Multiselect} from "vue-multiselect";
import translationMixin from "../mixins/translation";
import {Pokemon, info, maxGen} from "sulcalc";
import setdex from "setdex";

export default {
    props: {
        gen: {
            type: Number,
            default: maxGen,
            validator(value) {
                return value >= 1 && value <= maxGen;
            }
        },
        pokemon: Pokemon
    },
    computed: {
        sets() {
            return this.groupPokes(this.gen);
        }
    },
    methods: {
        emitPokemon($event) {
            const pokemon = importSmogonSet($event.pokemonId, $event.set,
                                            this.gen);
            pokemon.smogonSet = $event;
            this.$emit("input", pokemon);
        },
        groupPokes(gen) {
            const genSetdex = setdex[gen];
            const groups = [];
            for (const pokemonId of info.releasedPokes(gen)) {
                const pokemonName = this.$tPokemon({id: pokemonId});
                groups.push({
                    pokemon: pokemonName,
                    sets: this.groupSets(genSetdex[pokemonId],
                                         pokemonId, pokemonName)
                });
            }
            return groups.sort((a, b) => a.pokemon.localeCompare(b.pokemon));
        },
        groupSets(setdex, pokemonId, pokemonName) {
            const sets = [{
                pokemonId,
                setName: "Blank Set",
                pokemonAndSet: pokemonName,
                set: {}
            }];
            if (setdex) {
                for (const setName in setdex) {
                    sets.push({
                        pokemonId,
                        setName,
                        pokemonAndSet: `${pokemonName} – ${setName}`,
                        set: setdex[setName]
                    });
                }
            }
            return sets;
        }
    },
    mixins: [translationMixin],
    components: {
        Multiselect
    }
};

function importSmogonSet(pokemonId, set, gen) {
    const pokemon = new Pokemon({
        id: pokemonId,
        gen,
        level: set.l,
        nature: set.n,
        ability: set.a ? {id: set.a} : undefined,
        item: set.i ? {id: set.i} : undefined,
        moves: set.m ? set.m.map(id => ({id})) : undefined,
        evs: set.e ? set.e.map(ev => 4 * ev) : undefined,
        ivs: set.d ? set.d.slice() : undefined
    });

    if (pokemon.moves.some(move => move.name === "Return")) {
        pokemon.happiness = 255;
    }

    if (pokemon.isMega()) {
        pokemon.ability = pokemon.ability1();
    }

    return pokemon;
}
</script>
