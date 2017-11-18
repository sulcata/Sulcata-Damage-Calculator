<template>
  <multiselect
    track-by='value'
    label='label'
    :show-labels='false'
    placeholder='Item'
    :value='valueObj'
    :options='items'
    @input='updateValue'
    />
</template>

<script>
import { mapState } from "vuex";
import { Multiselect } from "vue-multiselect";
import { Item, info } from "sulcalc";

export default {
  model: {
    prop: "item",
    event: "input"
  },
  components: {
    Multiselect
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
      if (this.item.name === "(No Item)") {
        return {};
      }
      return { value: this.item.id, label: this.item.name };
    }
  },
  methods: {
    updateValue(event) {
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
