<template>
    <div class='container-fluid'>
        <!-- Battle Mode -->
        <div v-if='field.gen >= Gens.ADV' :class='centeredRowClasses'>
            <button-radio-group
                v-model='field.multiBattle'
                :options='battleModes'
                size='small'
            ></button-radio-group>
        </div>

        <!-- Inverted Battle -->
        <div v-if='field.gen === Gens.ORAS' :class='centeredRowClasses'>
            <button-checkbox v-model='field.invertedBattle' size='small'>
                {{ $t("invertedBattle") }}
            </button-checkbox>
        </div>

        <!-- Weather -->
        <hr v-if='field.gen >= Gens.ORAS' class='row'>
        <div v-if='field.gen >= Gens.GSC' :class='centeredRowClasses'>
            <button-radio-group
                v-model='field.weather'
                :options='weathers'
                size='small'
            ></button-radio-group>
        </div>
        <div v-if='field.gen >= Gens.ORAS' :class='centeredRowClasses'>
            <button-radio-group
                v-model='field.weather'
                :options='harshWeathers'
                size='small'
            ></button-radio-group>
        </div>
        <hr v-if='field.gen >= Gens.ORAS' class='row'>

        <!-- Water Sport / Mud Sport -->
        <div v-if='field.gen >= Gens.ADV' :class='centeredRowClasses'>
            <div class='col-auto btn-group btn-group-sm'>
                <button-checkbox v-model='field.waterSport'>
                    {{ $tMove("Water Sport") }}
                </button-checkbox>
                <button-checkbox v-model='field.mudSport'>
                    {{ $tMove("Mud Sport") }}
                </button-checkbox>
            </div>
        </div>

        <!-- Gravity / Magic Room / Wonder Room -->
        <div v-if='field.gen >= Gens.HGSS' :class='centeredRowClasses'>
            <div class='col-auto btn-group btn-group-sm'>
                <button-checkbox v-model='field.gravity'>
                    {{ $tMove("Gravity") }}
                </button-checkbox>
                <template v-if='field.gen >= Gens.B2W2'>
                    <button-checkbox v-model='field.magicRoom'>
                        {{ $tMove("Magic Room") }}
                    </button-checkbox>
                    <button-checkbox v-model='field.wonderRoom'>
                        {{ $tMove("Wonder Room") }}
                    </button-checkbox>
                </template>
            </div>
        </div>

        <!-- Grassy Terrain / Electric Terrain / Misty Terrain / Psychic Terrain -->
        <div v-if='field.gen >= Gens.ORAS' :class='centeredRowClasses'>
            <div class='col-auto btn-group btn-group-sm'>
                <button-checkbox v-model='field.grassyTerrain'>
                    {{ $tMove("Grassy Terrain") }}
                </button-checkbox>
                <button-checkbox v-model='field.electricTerrain'>
                    {{ $tMove("Electric Terrain") }}
                </button-checkbox>
                <button-checkbox v-model='field.mistyTerrain'>
                    {{ $tMove("Misty Terrain") }}
                </button-checkbox>
                <button-checkbox
                    v-if='field.gen >= Gens.SM'
                    v-model='field.psychicTerrain'
                    >
                    {{ $tMove("Psychic Terrain") }}
                </button-checkbox>
            </div>
        </div>

        <!-- Fairy Aura / Dark Aura / Aura Break -->
        <div v-if='field.gen >= Gens.ORAS' :class='centeredRowClasses'>
            <div class='col-auto btn-group btn-group-sm'>
                <button-checkbox v-model='field.fairyAura'>
                    {{ $tAbility("Fairy Aura") }}
                </button-checkbox>
                <button-checkbox v-model='field.darkAura'>
                    {{ $tAbility("Dark Aura") }}
                </button-checkbox>
                <button-checkbox v-model='field.auraBreak'>
                    {{ $tAbility("Aura Break") }}
                </button-checkbox>
            </div>
        </div>

        <!-- Ion Deluge -->
        <div v-if='field.gen >= Gens.ORAS' :class='centeredRowClasses'>
            <div class='col-auto'>
                <button-checkbox v-model='field.ionDeluge' size='small'>
                    {{ $tMove("Ion Deluge") }}
                </button-checkbox>
            </div>
        </div>

        <!-- attacker / defender -->
        <div :class='centeredRowClasses'>
            <div v-for='pokemon in [attacker, defender]' class='col-6'>

                <!-- Stealth Rock -->
                <button-checkbox
                    v-if='field.gen >= Gens.HGSS'
                    v-model='pokemon.stealthRock'
                    size='small'
                    class='mt-1'
                    :class='pokeAlign(pokemon)'
                    >
                    {{ $tMove("Stealth Rock") }}
                </button-checkbox>

                <!-- Spikes -->
                <button-radio-group
                    v-if='field.gen >= Gens.ADV'
                    v-model='pokemon.spikes'
                    :options='spikes'
                    size='small'
                    class='mt-1'
                    :class='pokeAlign(pokemon)'
                ></button-radio-group>
                <button-checkbox
                    v-if='field.gen === Gens.GSC'
                    :value='gscSpikesBoolean(pokemon)'
                    size='small'
                    class='mt-1'
                    :class='pokeAlign(pokemon)'
                    @input='pokemon.spikes = +$event'
                    >
                    {{ $tMove("Spikes") }}
                </button-checkbox>

                <!-- Reflect / Light Screen -->
                <div class='btn-group btn-group-sm mt-1' :class='pokeAlign(pokemon)'>
                    <button-checkbox v-model='pokemon.reflect'>
                        {{ $tMove("Reflect") }}
                    </button-checkbox>
                    <button-checkbox v-model='pokemon.lightScreen'>
                        {{ $tMove("Light Screen") }}
                    </button-checkbox>
                </div>

                <!-- Foresight -->
                <button-checkbox
                    v-if='field.gen >= Gens.GSC'
                    v-model='pokemon.foresight'
                    size='small'
                    class='mt-1'
                    :class='pokeAlign(pokemon)'
                    >
                    {{ $tMove("Foresight") }}
                </button-checkbox>

                <!-- Friend Guard -->
                <button-checkbox
                    v-if='field.gen >= Gens.B2W2'
                    v-model='pokemon.friendGuard'
                    size='small'
                    class='mt-1'
                    :class='pokeAlign(pokemon)'
                    >
                    {{ $tAbility("Friend Guard") }}
                </button-checkbox>

                <!-- Aurora Veil -->
                <button-checkbox
                    v-if='field.gen >= Gens.SM'
                    v-model='pokemon.auroraVeil'
                    size='small'
                    class='mt-1'
                    :class='pokeAlign(pokemon)'
                    >
                    {{ $tMove("Aurora Veil") }}
                </button-checkbox>

                <!-- Battery -->
                <button-checkbox
                    v-if='field.gen >= Gens.SM'
                    v-model='pokemon.battery'
                    size='small'
                    class='mt-1'
                    :class='pokeAlign(pokemon)'
                    >
                    {{ $tAbility("Battery") }}
                </button-checkbox>

            </div>
        </div>
    </div>
</template>

<script>
import {Multiselect} from "vue-multiselect";

import translationMixin from "../mixins/translation";
import sulcalcMixin from "../mixins/sulcalc";

import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";

import {Field, Pokemon, Weathers, Gens} from "sulcalc";

export default {
    props: {
        field: Field,
        attacker: Pokemon,
        defender: Pokemon
    },
    data() {
        return {
            centeredRowClasses: [
                "row",
                "justify-content-center",
                "no-gutters",
                "mt-1"
            ]
        };
    },
    computed: {
        battleModes() {
            return ["singles", "doubles"].map((mode, idx) => ({
                value: Boolean(idx),
                label: this.$t(mode)
            }));
        },
        weathers() {
            const weathers = [
                Weathers.CLEAR,
                Weathers.SUN,
                Weathers.RAIN,
                Weathers.SAND
            ];
            if (this.field.gen >= Gens.ADV) {
                weathers.push(Weathers.HAIL);
            }
            return weathers.map(value => ({
                value,
                label: this.$tWeather(value)
            }));
        },
        harshWeathers() {
            return [
                Weathers.HARSH_SUN, Weathers.HEAVY_RAIN, Weathers.STRONG_WINDS
            ].map(value => ({
                value,
                label: this.$tWeather(value)
            }));
        },
        spikes() {
            const options = [];
            for (let i = 0; i <= 3; i++) {
                options.push({
                    value: i,
                    label: String(i)
                });
            }
            options[3].label += " " + this.$tMove("Spikes");
            return options;
        }
    },
    methods: {
        pokeAlign(pokemon) {
            return {
                "clear-left": pokemon === this.attacker,
                "float-left": pokemon === this.attacker,
                "clear-right": pokemon === this.defender,
                "float-right": pokemon === this.defender
            };
        },
        gscSpikesBoolean(pokemon) {
            return Boolean(pokemon.spikes);
        },
        otherPokemon(pokemon) {
            return pokemon === this.defender ? this.attacker : this.defender;
        }
    },
    mixins: [translationMixin, sulcalcMixin],
    components: {
        Multiselect,
        ButtonCheckbox,
        ButtonRadioGroup
    }
};
</script>

<style scoped>
.clear-left {
    clear: left;
}

.clear-right {
    clear: right;
}
</style>
