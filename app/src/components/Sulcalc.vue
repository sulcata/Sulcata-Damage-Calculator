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
                    :value='selectedReport'
                    :options='attackerReportOptions'
                    @input='report => setReport({report})'
                    layout='vertical'
                ></button-radio-group>
            </div>
            <div class='col-4'>
                <button-radio-group
                    :value='selectedReport'
                    :options='defenderReportOptions'
                    @input='report => setReport({report})'
                    layout='vertical'
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
import {mapState, mapGetters, mapMutations} from "vuex";
import translationMixin from "../mixins/translation";
import Pokemon from "./Pokemon.vue";
import Field from "./Field.vue";
import SetImporter from "./SetImporter.vue";
import SulcalcOptions from "./SulcalcOptions.vue";
import Generation from "./Generation.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import TabContent from "./ui/TabContent.vue";
import {cmpStrs} from "sulcalc";

export default {
    components: {
        Pokemon,
        Field,
        SetImporter,
        SulcalcOptions,
        Generation,
        ButtonRadioGroup,
        TabContent
    },
    mixins: [
        translationMixin
    ],
    computed: {
        ...mapState([
            "attacker",
            "defender",
            "field",
            "fractions",
            "longRolls"
        ]),
        ...mapGetters([
            "selectedReport",
            "attackerReports",
            "defenderReports"
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
        attackerReportOptions() {
            return this.reportOptions(this.attackerReports);
        },
        defenderReportOptions() {
            return this.reportOptions(this.defenderReports);
        }
    },
    methods: {
        ...mapMutations([
            "setAttacker",
            "setDefender",
            "setReport"
        ]),
        reportOptions(reports) {
            return reports.map(value => ({
                value,
                label: this.$tMove(value.move)
            }));
        },
        setHp() {
            const report = this.selectedReport;
            const pokemon = this.selectedReport.defender;
            if (this.attackerReports.includes(report)) {
                pokemon.event = this.defender.event;
                this.setDefender({pokemon});
            } else if (this.defenderReports.includes(report)) {
                pokemon.event = this.attacker.event;
                this.setAttacker({pokemon});
            }
        }
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
