<template>
    <div class='container sulcalc-container'>
        <div class='row justify-content-center mt-3'>
            <div class='col-auto'>
                <button-radio-group v-model='gen'
                                    :options='gens'
                ></button-radio-group>
            </div>
        </div>

        <div class='row mt-3'>
            <div class='col-4' v-for='pokes in pokeGroups'>
                <button-radio-group layout='vertical'
                                    v-model='selectedMove'
                                    :options='moveList(...pokes)'
                ></button-radio-group>
            </div>
        </div>

        <div class='row mt-3' v-if='reportText'>
            <div class='col'>
                <strong>{{ reportText }}</strong><br>
                <small>{{ damageRoll }}</small>
                <button type='button' class='btn btn-sm btn-secondary'
                        @click='setHp()'>
                    {{ $t("setHp") }}
                </button>
            </div>
        </div>

        <div class='row mt-3'>
            <div class='col'>
                <v-pokemon v-model='attacker'></v-pokemon>
            </div>
            <div class='col-4'>
                <v-field :field='field'
                         :attacker='attacker'
                         :defender='defender'
                ></v-field>
            </div>
            <div class='col'>
                <v-pokemon v-model='defender'></v-pokemon>
            </div>
        </div>
    </div>
</template>

<script>
import translationMixin from "../mixins/translation";

import vPokemon from "./Pokemon.vue";
import vField from "./Field.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";

import sulcalc, {
    Pokemon, Field, maxGen, cmpStrs,
    NoMoveError, MissingnoError
} from "sulcalc";

export default {
    data() {
        const attacker = new Pokemon();
        const defender = new Pokemon();
        const field = new Field();
        return {
            attacker,
            defender,
            field,
            genData: maxGen,
            selectedMove: null
        };
    },
    computed: {
        gens() {
            const options = [];
            for (let value = 1; value <= maxGen; value++) {
                options.push({
                    value,
                    label: this.$tGen(value)
                });
            }
            return options;
        },
        gen: {
            get() {
                return this.genData;
            },
            set(value) {
                this.genData = value;
                this.selectedMove = null;
                this.attacker = new Pokemon({gen: value});
                this.defender = new Pokemon({gen: value});
                this.field = new Field({gen: value});
            }
        },
        pokeGroups() {
            return [["attacker", "defender"], ["defender", "attacker"]];
        },
        report() {
            if (this.selectedMove) {
                try {
                    return sulcalc(this[this.selectedMove.user],
                                   this[this.selectedMove.target],
                                   this.selectedMove.move,
                                   this.field);
                } catch (error) {
                    if (!(error instanceof NoMoveError)
                        && !(error instanceof MissingnoError)) {
                        throw error;
                    }
                }
            }
            return {};
        },
        reportText() {
            return this.report.report || "";
        },
        damageRoll() {
            if (!this.report.damage) return "";
            if (cmpStrs(this.report.damage.size, "39") > 0) return "";
            return `(${this.report.damage.toString(entryAsList)})`;
        }
    },
    methods: {
        moveList(user, target) {
            return this[user].moves.map(move => ({
                value: {
                    move,
                    user,
                    target
                },
                label: this.$tMove(move)
            }));
        },
        setHp() {
            const poke = this[this.selectedMove.target];
            const report = this.report;
            poke.currentHpRange = report.remainingHealth;
            poke.currentHpRangeBerry = report.remainingHealthBerry;
        }
    },
    mixins: [translationMixin],
    components: {
        vPokemon,
        vField,
        ButtonRadioGroup
    }
};

function entryAsList([value, multiplicity]) {
    return Array(Number(multiplicity)).fill(value).join(", ");
}
</script>

<style scoped>
.sulcalc-container {
    min-width: 95rem;
}
</style>
