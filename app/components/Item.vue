<template>
  <multiselect
    track-by="value"
    label="label"
    :show-labels="false"
    placeholder="Item"
    :value="valueObj"
    :options="items"
    :options-limit="20"
    @input="updateItem"
  >
    <span slot="noResult">No Item found.</span>
  </multiselect>
</template>

<script>
import { mapState } from "vuex";
import { Multiselect } from "vue-multiselect";
import { Item, info } from "sulcalc";

export default {
  components: {
    Multiselect
  },
  model: {
    prop: "item",
    event: "input"
  },
  props: {
    item: {
      required: true,
      type: Item
    }
  },
  computed: {
    ...mapState(["gen"]),
    items() {
      return info
        .releasedItems(this.gen)
        .map(id => ({ value: id, label: info.itemName(id) }));
    },
    valueObj() {
      return this.item.name === "(No Item)"
        ? null
        : { value: this.item.id, label: this.item.name };
    }
  },
  methods: {
    updateItem(event) {
      this.$emit(
        "input",
        new Item({
          id: event ? event.value : "noitem",
          gen: this.gen
        })
      );
    }
  }
};
</script>
