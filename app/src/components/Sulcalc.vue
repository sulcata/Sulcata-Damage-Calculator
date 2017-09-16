<template>
    <div class='container' style='min-width: 95rem;'>
        <div class='row justify-content-center mt-3'>
            <div class='col-auto'>
                <generation/>
            </div>
        </div>

        <div class='row mt-3'>
            <div class='col-4'>
                <report-selector :reports='attackerReports'/>
            </div>
            <div class='col-4'>
                <report-selector :reports='defenderReports'/>
            </div>
        </div>

        <div class='row mt-3' v-if='isReportSelected'>
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
import Pokemon from "./Pokemon.vue";
import Field from "./Field.vue";
import SetImporter from "./SetImporter.vue";
import SulcalcOptions from "./SulcalcOptions.vue";
import Generation from "./Generation.vue";
import ReportDisplay from "./ReportDisplay.vue";
import ReportSelector from "./ReportSelector.vue";
import TabContent from "./ui/TabContent.vue";

export default {
    components: {
        Pokemon,
        Field,
        SetImporter,
        SulcalcOptions,
        Generation,
        ReportDisplay,
        ReportSelector,
        TabContent
    },
    computed: {
        ...mapState([
            "attacker",
            "defender",
            "field"
        ]),
        ...mapGetters([
            "attackerReports",
            "defenderReports",
            "isReportSelected"
        ]),
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
            "setDefender"
        ])
    }
};
</script>
