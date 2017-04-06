<template>
    <div class='container-fluid'>
        <div class='row align-items-center'>

            <div class='col-6'>
                <!-- Move Selection -->
                <multiselect track-by='value' label='label'
                             :show-labels='false'
                             :placeholder='$t("move")'
                             :value='valueObj'
                             :options='moves'
                             @input='updateValue($event)'
                ></multiselect>
            </div>

            <div class='col-auto'>
                <!-- Critical Hit -->
                <button-checkbox v-model='move.critical' size='small'>
                    {{ $t("crit") }}
                </button-checkbox>

                <!-- Z-Move -->
                <button-checkbox v-if='move.gen >= Gens.SM'
                                 v-model='move.zMove'
                                 size='small'>
                    {{ $t("zMove") }}
                </button-checkbox>
            </div>

            <div class='col'>
                <!-- Multihit -->
                <select v-if='numberOfHitsInput'
                        v-model.number='move.numberOfHits'
                        class='form-control form-control-sm'>
                    <option v-for='{value, label} in multiHitOptions'
                            :value='value'>
                        {{ label }}
                    </option>
                </select>

                <!-- Return / Frustration -->
                <input v-else-if='move.usesHappiness()'
                       type='number' min='0' max='255'
                       v-model.number='happiness'
                       class='form-control form-control-sm'>

                <!-- Echoed Voice -->
                <select v-else-if='move.name === "Fury Cutter"'
                        v-model.number='move.furyCutter'
                        class='form-control form-control-sm'>
                    <option v-for='{value, label} in furyCutterOptions'
                            :value='value'>
                        {{ label }}
                    </option>
                </select>

                <!-- Echoed Voice -->
                <select v-else-if='move.name === "Echoed Voice"'
                        v-model.number='move.echoedVoice'
                        class='form-control form-control-sm'>
                    <option v-for='{value, label} in echoedVoiceOptions'
                            :value='value'>
                        {{ label }}
                    </option>
                </select>

                <!-- Round -->
                <button-checkbox v-else-if='move.name === "Round"'
                                 v-model='move.roundBoost' size='small'>
                    {{ $tMove("Round") }}
                </button-checkbox>

                <!-- Trump Card -->
                <select v-else-if='move.name === "Trump Card"'
                        v-model.number='move.trumpPP'
                        class='form-control form-control-sm'>
                    <option value='4'>4+ PP after use</option>
                    <option value='3'>3 PP after use</option>
                    <option value='2'>2 PP after use</option>
                    <option value='1'>1 PP after use</option>
                    <option value='0'>0 PP after use</option>
                </select>

                <!-- Minimize -->
                <button-checkbox v-else-if='move.boostedByMinimize'
                                 v-model='move.minimize'
                                 size='small'>
                    {{ $tMove("Minimize") }}
                </button-checkbox>

                <!-- Dig -->
                <button-checkbox v-else-if='move.boostedByDig'
                                 v-model='move.dig'
                                 size='small'>
                    {{ $tMove("Dig") }}
                </button-checkbox>

                <!-- Dive -->
                <button-checkbox v-else-if='move.boostedByDive'
                                 v-model='move.dive'
                                 size='small'>
                    {{ $tMove("Dive") }}
                </button-checkbox>

                <!-- Fly -->
                <button-checkbox v-else-if='move.boostedByFly'
                                 v-model='move.fly'
                                 size='small'>
                    {{ $tMove("Fly") }} / {{ $tMove("Bounce") }}
                </button-checkbox>
            </div>
        </div>
    </div>
</template>

<script>
import clamp from "lodash/clamp";

import {Multiselect} from "vue-multiselect";
import translationMixin from "../mixins/translation";
import sulcalcMixin from "../mixins/sulcalc";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";

import {Move, Pokemon, Gens, info} from "sulcalc";

export default {
    props: {
        move: Move,
        pokemon: Pokemon
    },
    model: {
        prop: "move",
        event: "input"
    },
    computed: {
        moves() {
            return info.releasedMoves(this.move.gen)
                .filter(id => info.isMoveUseful(id, this.move.gen))
                .map(id => ({
                    value: id,
                    label: this.$tMove({id})
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
        },
        valueObj() {
            if (this.move.name === "(No Move)") {
                return {};
            }
            return {
                value: this.move.id,
                label: this.$tMove(this.move)
            };
        },
        multiHitOptions() {
            const options = [{
                value: 0,
                label: "--"
            }];
            for (let i = this.move.minHits; i <= this.move.maxHits; i++) {
                options.push({
                    value: i,
                    label: `${i} hits`
                });
            }
            return options;
        },
        furyCutterOptions() {
            if (this.move.gen >= Gens.ORAS) return ordinalHitOptions(3);
            if (this.move.gen >= Gens.B2W2) return ordinalHitOptions(4);
            return ordinalHitOptions(5);
        },
        echoedVoiceOptions() {
            return ordinalHitOptions(5);
        },
        numberOfHitsInput() {
            return this.move.multipleHits && this.move.name !== "Beat Up";
        },
        happiness: {
            get() {
                return this.pokemon.happiness;
            },
            set(value) {
                this.pokemon.happiness = clamp(value, 0, 255);
            }
        }
    },
    methods: {
        updateValue($event) {
            const move = new Move({
                id: $event ? $event.value : 0,
                gen: this.move.gen
            });
            this.pokemon.happiness = move.optimalHappiness;
            this.$emit("input", move);
        }
    },
    mixins: [translationMixin, sulcalcMixin],
    components: {
        Multiselect,
        ButtonCheckbox
    }
};

function ordinalHitOptions(n) {
    return [
        "1st", "2nd", "3rd", "4th", "5th",
        "6th", "7th", "8th", "9th"
    ].slice(0, n).map((ord, value) => ({
        value,
        label: `${ord} hit`
    }));
}
</script>
