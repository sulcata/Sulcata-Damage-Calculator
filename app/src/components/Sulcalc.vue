<template>
    <div class='container sulcalc-container'>
        <div class='row justify-content-center mt-3'>
            <div class='col-auto'>
                <generation></generation>
            </div>
        </div>

        <div class='row mt-3'>
            <div class='col-4'>
                <button-radio-group
                    layout='vertical'
                    v-model='selectedReport'
                    :options='attackerReports'
                ></button-radio-group>
            </div>
            <div class='col-4'>
                <button-radio-group
                    layout='vertical'
                    v-model='selectedReport'
                    :options='defenderReports'
                ></button-radio-group>
            </div>
        </div>

        <div class='row mt-3' v-if='summary'>
            <div class='col'>
                <strong>{{ summary }}</strong>
                <br>
                <small>{{ damageRoll }}</small>
                <button
                    type='button'
                    class='btn btn-sm btn-light'
                    @click='setHp'
                    >
                    {{ $t("setHp") }}
                </button>
                <br>
                <small v-if='fractions'>
                    {{ fractionalChances }}
                </small>
            </div>
        </div>

        <div class='row mt-3'>
            <div class='col'>
                <pokemon
                    :pokemon='attacker'
                    @input='pokemon => setAttacker({pokemon})'
                ></pokemon>
            </div>
            <div class='col-4'>
                <tab-content :tabs='[
                        $t("tabs.general"),
                        $t("tabs.importTeam"),
                        $t("tabs.moreOptions")
                    ]'>
                    <field :slot='$t("tabs.general")' class='mt-3'></field>
                    <div :slot='$t("tabs.importTeam")' class='mt-3'>
                        <set-importer></set-importer>
                    </div>
                    <div :slot='$t("tabs.moreOptions")' class='mt-3'>
                        <div class='mt-1'>
                            <sulcalc-options></sulcalc-options>
                        </div>
                    </div>
                </tab-content>
            </div>
            <div class='col'>
                <pokemon
                    :pokemon='defender'
                    @input='pokemon => setDefender({pokemon})'
                ></pokemon>
            </div>
        </div>
    </div>
</template>

<script>
import {zip} from "lodash";
import {mapState, mapMutations} from "vuex";
import translationMixin from "../mixins/translation";
import PokemonComponent from "./Pokemon.vue";
import FieldComponent from "./Field.vue";
import SetImporter from "./SetImporter.vue";
import SulcalcOptions from "./SulcalcOptions.vue";
import Generation from "./Generation.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import TabContent from "./ui/TabContent.vue";
import sulcalc, {cmpStrs} from "sulcalc";

export default {
    components: {
        Pokemon: PokemonComponent,
        Field: FieldComponent,
        SetImporter,
        SulcalcOptions,
        Generation,
        ButtonRadioGroup,
        TabContent
    },
    mixins: [
        translationMixin
    ],
    data() {
        return {overrideReport: null};
    },
    computed: {
        ...mapState([
            "attacker",
            "defender",
            "field",
            "fractions",
            "longRolls"
        ]),
        summary() {
            return this.selectedReport.summary || "";
        },
        damageRoll() {
            const damage = this.selectedReport.damage;
            if (!damage) return "";
            if (cmpStrs(damage.size, "39") > 0) {
                return this.longRolls ? String(damage) : "";
            }
            return `(${damage.toString(entryAsList)})`;
        },
        fractionalChances() {
            const chances = this.selectedReport.fractionalChances;
            if (!chances) return "";
            return chances.map(chance => chance.join(" / ")).join(", ");
        },
        reports() {
            return [...this.attackerReports, ...this.defenderReports];
        },
        attackerReports() {
            const {attacker, defender, field} = this;
            return attacker.moves.map(move => {
                try {
                    return {
                        value: sulcalc(attacker, defender, move, field),
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
            const {attacker, defender, field} = this;
            return defender.moves.map(move => {
                try {
                    return {
                        value: sulcalc(defender, attacker, move, field),
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
        selectedReport: {
            get() {
                const reports = this.reports.map(({value}) => value);
                if (reports.includes(this.overrideReport)) {
                    return this.overrideReport;
                }
                return reports.reduce(betterReport, {});
            },
            set(value) {
                this.overrideReport = value;
            }
        }
    },
    methods: {
        ...mapMutations([
            "setAttacker",
            "setDefender"
        ]),
        setHp() {
            const report = this.selectedReport;
            const pokemon = this.selectedReport.defender;
            if (this.isAttackerReport(report)) {
                pokemon.event = this.defender.event;
                this.setDefender({pokemon});
            } else if (this.isDefenderReport(report)) {
                pokemon.event = this.attacker.event;
                this.setAttacker({pokemon});
            }
        },
        removeReportOverride() {
            this.overrideReport = null;
        },
        isAttackerReport(report) {
            const reports = this.attackerReports.map(({value}) => value);
            return reports.includes(report);
        },
        isDefenderReport(report) {
            const reports = this.defenderReports.map(({value}) => value);
            return reports.includes(report);
        }
    }
};

function betterReport(report1, report2) {
    const chances1 = report1.roundedChances || [];
    const chances2 = report2.roundedChances || [];
    for (const [chance1 = 0, chance2 = 0] of zip(chances1, chances2)) {
        if (chance1 > chance2) return report1;
        if (chance2 > chance1) return report2;
    }
    if (!report2.damage) return report1;
    if (!report1.damage) return report2;
    return report1.damage.max() > report2.damage.max() ? report1 : report2;
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
