<template>
    <multiselect
        track-by='set'
        label='pokemonAndSet'
        group-values='sets'
        group-label='pokemon'
        :show-labels='false'
        :placeholder='$t("pokemon")'
        :options='groupPokemon'
        :value='pokemon.smogonSet'
        @input='emitPokemon($event)'
        >
        <template slot='option' scope='props'>
            <span>{{ props.option.setName }}</span>
        </template>
    </multiselect>
</template>

<script>
import {Multiselect} from "vue-multiselect";
import translationMixin from "../mixins/translation";
import {smogon, pokemonPerfect} from "../setdex";
import {Pokemon, info, maxGen} from "sulcalc";

export default {
    props: {
        gen: {
            type: Number,
            default: maxGen,
            validator(value) {
                return (1 <= value && value <= maxGen);
            }
        },
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
    computed: {
        groupPokemon() {
            const setdexList = [];
            if (this.sets.smogon) {
                setdexList.push(smogon[this.gen]);
            }
            if (this.sets.pokemonPerfect) {
                setdexList.push(pokemonPerfect[this.gen]);
            }
            const groups = [];
            for (const pokemonId of info.releasedPokes(this.gen)) {
                const pokemonName = this.$tPokemon({id: pokemonId});
                groups.push({
                    pokemon: pokemonName,
                    sets: this.groupPokemonSets(setdexList, pokemonId,
                                                pokemonName)
                });
            }
            return groups.sort((a, b) => a.pokemon.localeCompare(b.pokemon));
        }
    },
    methods: {
        emitPokemon($event) {
            const pokemon = importSet($event.pokemonId, $event.set, this.gen);
            pokemon.smogonSet = $event;
            this.$emit("input", pokemon);
        },
        groupPokemonSets(setdexList, pokemonId, pokemonName) {
            const sets = [];
            for (const setdex of setdexList) {
                const setList = setdex[pokemonId] || {};
                for (const setName in setList) {
                    sets.push({
                        pokemonId,
                        setName,
                        pokemonAndSet: `${pokemonName} – ${setName}`,
                        set: setList[setName]
                    });
                }
            }
            sets.push({
                pokemonId,
                setName: "Blank Set",
                pokemonAndSet: pokemonName,
                set: {}
            });
            return sets;
        }
    },
    mixins: [translationMixin],
    components: {
        Multiselect
    }
};

function importSet(pokemonId, set, gen) {
    const pokemon = new Pokemon({
        id: pokemonId,
        gen,
        level: set.l,
        nature: set.n,
        ability: set.a ? {id: set.a, gen} : undefined,
        item: set.i ? {id: set.i, gen} : undefined,
        moves: set.m ? set.m.map(id => ({id, gen})) : undefined,
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

function isBoolean(value) {
    return value === true || value === false;
}
</script>
