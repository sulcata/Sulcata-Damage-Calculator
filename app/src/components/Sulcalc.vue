<template>
    <div class='container' style='min-width: 95rem;'>
        <div class='row justify-content-center mt-3'>
            <div class='col-auto'>
                <generation/>
            </div>
        </div>

        <div class='row mt-3'>
            <div class='col-4'>
                <button-radio-group
                    :value='selectedReport'
                    :options='attackerReportOptions'
                    @input='report => setReport({report})'
                    layout='vertical'
                />
            </div>
            <div class='col-4'>
                <button-radio-group
                    :value='selectedReport'
                    :options='defenderReportOptions'
                    @input='report => setReport({report})'
                    layout='vertical'
                />
            </div>
        </div>

        <div class='row mt-3' v-if='selectedReport.summary'>
            <div class='col'>
                <report-display/>
            </div>
        </div>

        <div class='row mt-3'>
            <div class='col'>
                <pokemon
                    :pokemon='attacker'
                    @input='pokemon => setAttacker({pokemon})'
                />
            </div>
            <div class='col-4'>
                <tab-content :tabs='tabs'>
                    <div :slot='$t("tabs.general")' class='mt-3'>
                        <field/>
                    </div>
                    <div :slot='$t("tabs.importTeam")' class='mt-3'>
                        <set-importer/>
                    </div>
                    <div :slot='$t("tabs.moreOptions")' class='mt-3'>
                        <sulcalc-options/>
                    </div>
                </tab-content>
            </div>
            <div class='col'>
                <pokemon
                    :pokemon='defender'
                    @input='pokemon => setDefender({pokemon})'
                />
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
import ReportDisplay from "./ReportDisplay.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import TabContent from "./ui/TabContent.vue";

export default {
    components: {
        Pokemon,
        Field,
        SetImporter,
        SulcalcOptions,
        Generation,
        ReportDisplay,
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
            "field"
        ]),
        ...mapGetters([
            "selectedReport",
            "attackerReports",
            "defenderReports"
        ]),
        attackerReportOptions() {
            return this.reportOptions(this.attackerReports);
        },
        defenderReportOptions() {
            return this.reportOptions(this.defenderReports);
        },
        tabs() {
            return [
                this.$t("tabs.general"),
                this.$t("tabs.importTeam"),
                this.$t("tabs.moreOptions")
            ];
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
        }
    }
};
</script>
