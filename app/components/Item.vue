<template>
  <multiselect
    track-by='value'
    label='label'
    :show-labels='false'
    placeholder='Item'
    :value='valueObj'
    :options='items'
    @input='updateItem'
    />
</template>

<script>
import { mapState } from "vuex";
import VueMultiselect from "vue-multiselect";
import { Item, info } from "sulcalc";

const { Multiselect } = VueMultiselect;

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
