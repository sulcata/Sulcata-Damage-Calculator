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
            <div class='col-4'>
                <button-radio-group layout='vertical'
                                    v-model='selectedReport'
                                    :options='attackerReports'
                ></button-radio-group>
            </div>
            <div class='col-4'>
                <button-radio-group layout='vertical'
                                    v-model='selectedReport'
                                    :options='defenderReports'
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
                <v-pokemon v-model='attacker'
                           @input='selectBestReport()'
                ></v-pokemon>
            </div>
            <div class='col-4'>
                <v-field :field='field'
                         :attacker='attacker'
                         :defender='defender'
                ></v-field>
            </div>
            <div class='col'>
                <v-pokemon v-model='defender'
                           @input='selectBestReport()'
                ></v-pokemon>
            </div>
        </div>
    </div>
</template>

<script>
import zip from "lodash/zip";

import translationMixin from "../mixins/translation";

import vPokemon from "./Pokemon.vue";
import vField from "./Field.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";

import sulcalc, {Pokemon, Field, maxGen, cmpStrs} from "sulcalc";

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
            selectedReport: {}
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
                this.selectedReport = {};
                this.attacker = new Pokemon({gen: value});
                this.defender = new Pokemon({gen: value});
                this.field = new Field({gen: value});
            }
        },
        reportText() {
            return this.selectedReport.report || "";
        },
        damageRoll() {
            if (!this.selectedReport.damage) return "";
            if (cmpStrs(this.selectedReport.damage.size, "39") > 0) return "";
            return `(${this.selectedReport.damage.toString(entryAsList)})`;
        },
        attackerReports() {
            const attacker = this.attacker;
            const defender = this.defender;
            return attacker.moves.map(move => {
                try {
                    return {
                        value: sulcalc(attacker, defender, move, this.field),
                        label: this.$tMove(move)
                    };
                } catch (error) {
                    return {
                        value: {},
                        label: this.$tMove(move)
                    };
                }
            });
        },
        defenderReports() {
            const attacker = this.attacker;
            const defender = this.defender;
            return defender.moves.map(move => {
                try {
                    return {
                        value: sulcalc(defender, attacker, move, this.field),
                        label: this.$tMove(move)
                    };
                } catch (error) {
                    return {
                        value: {},
                        label: this.$tMove(move)
                    };
                }
            });
        }
    },
    methods: {
        setHp() {
            const poke = this.selectedReport.defender;
            const report = this.selectedReport;
            poke.currentHpRange = report.remainingHealth;
            poke.currentHpRangeBerry = report.remainingHealthBerry;
        },
        selectBestReport() {
            const reports = [...this.attackerReports, ...this.defenderReports];
            const bestReport = reports.map(({value}) => value)
                                      .reduce(betterReport, {});
            this.selectedReport = bestReport;
        }
    },
    mixins: [translationMixin],
    components: {
        vPokemon,
        vField,
        ButtonRadioGroup
    }
};

function betterReport(report1, report2) {
    const chances1 = report1.roundedChances || [];
    const chances2 = report2.roundedChances || [];
    for (const [chance1 = 0, chance2 = 0] of zip(chances1, chances2)) {
        if (chance1 > chance2) return report1;
        if (chance2 > chance1) return report2;
    }
    return report1;
}

function entryAsList([value, multiplicity]) {
    return Array(Number(multiplicity)).fill(value).join(", ");
}
</script>

<style scoped>
.sulcalc-container {
    min-width: 95rem;
}
</style>
