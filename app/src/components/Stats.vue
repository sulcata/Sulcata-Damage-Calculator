<template>
    <div class='container-fluid'>
        <div class='row no-gutters'>
            <strong class='col-2 offset-md-1 text-center'>{{ $t("base") }}</strong>
            <strong class='col text-center'>{{ $t("ivs") }}</strong>
            <strong class='col text-center'>{{ $t("evs") }}</strong>
            <strong class='col-2'></strong>
            <strong class='col-2'></strong>
        </div>

        <div
            v-for='(statName, stat) in stats'
            v-if='statName'
            class='row align-items-center no-gutters'
            >

            <div class='col-1'>
                {{ $t(statName) }}
            </div>

            <div class='col-2 text-center'>
                {{ pokemon.baseStat(stat) }}
            </div>

            <div class='col'>
                <input
                    v-if='pokemon.gen <= Gens.GSC && stat === Stats.HP'
                    type='number'
                    min='0'
                    max='15'
                    disabled
                    :value='Pokemon.calcHealthDv(pokemon.ivs)'
                    class='form-control'
                    >
                <input
                    v-else-if='pokemon.gen <= Gens.GSC && stat === Stats.SDEF'
                    type='number'
                    min='0'
                    max='15'
                    disabled
                    :value='pokemon.ivs[Stats.SPC]'
                    class='form-control'
                    >
                <input
                    v-else
                    type='number'
                    min='0'
                    :max='maxIv'
                    v-model.number.lazy='pokemon.ivs[stat]'
                    @change='validateIv(stat)'
                    class='form-control'
                    >
            </div>

            <div class='col'>
                <input
                    v-if='pokemon.gen <= Gens.GSC && stat === Stats.SDEF'
                    type='number'
                    min='0'
                    max='252'
                    step='4'
                    disabled
                    :value='pokemon.evs[Stats.SPC]'
                    class='form-control'
                    >
                <input
                    v-else
                    type='number'
                    min='0'
                    max='252'
                    step='4'
                    v-model.number.lazy='pokemon.evs[stat]'
                    @change='validateEv(stat)'
                    class='form-control'
                    >
            </div>

            <div class='col-2 text-center'>{{ pokemon.boostedStat(stat) }}</div>

            <div class='col-2'>
                <select
                    v-model='pokemon.boosts[stat]'
                    class='form-control'
                    :class='{invisible: stat === Stats.HP}'
                    >
                    <option v-for='n in 13' :value='7 - n'>
                        {{ statBoost(7 - n) }}
                    </option>
                </select>
            </div>

        </div>
    </div>
</template>

<script>
import {clamp} from "lodash";
import sulcalcMixin from "../mixins/sulcalc";
import {Pokemon, Gens} from "sulcalc";

const {trunc} = Math;

export default {
    props: {
        pokemon: Pokemon
    },
    computed: {
        stats() {
            return this.pokemon.gen >= Gens.GSC
                ? ["hp", "atk", "def", "spAtk", "spDef", "spe"]
                : ["hp", "atk", "def", "spc", null, "spe"];
        },
        maxIv() {
            return this.pokemon.gen >= Gens.ADV ? 31 : 15;
        }
    },
    methods: {
        statBoost(boost) {
            if (boost > 0) {
                return "+" + boost;
            }
            if (boost < 0) {
                return boost;
            }
            return "--";
        },
        validateIv(stat) {
            const iv = this.pokemon.ivs[stat];
            this.pokemon.ivs[stat] = clamp(iv, 0, this.maxIv);
        },
        validateEv(stat) {
            const ev = this.pokemon.evs[stat];
            this.pokemon.evs[stat] = clamp(4 * trunc(ev / 4), 0, 252);
        }
    },
    mixins: [sulcalcMixin]
};
</script>
