<template>
    <multiselect
        track-by='value'
        label='label'
        :show-labels='false'
        :placeholder='$t("item")'
        :value='valueObj'
        :options='items'
        @input='updateValue'
    />
</template>

<script>
import {mapState} from "vuex";
import {Multiselect} from "vue-multiselect";
import translationMixin from "../mixins/translation";
import {Item, info} from "sulcalc";

export default {
    model: {
        prop: "item",
        event: "input"
    },
    components: {
        Multiselect
    },
    mixins: [
        translationMixin
    ],
    props: {
        item: {
            required: true,
            type: Item
        }
    },
    computed: {
        ...mapState([
            "gen"
        ]),
        items() {
            return info.releasedItems(this.gen)
                .filter(id => info.isItemUseful(id))
                .map(id => ({
                    value: id,
                    label: this.$tItem({id})
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
        },
        valueObj() {
            if (this.item.name === "(No Item)") {
                return {};
            }
            return {
                value: this.item.id,
                label: this.$tItem(this.item)
            };
        }
    },
    methods: {
        updateValue(event) {
            this.$emit("input", new Item({
                id: event ? event.value : 0,
                gen: this.gen
            }));
        }
    }
};
</script>
