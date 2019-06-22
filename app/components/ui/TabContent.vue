<template>
  <div>
    <ul role="tablist" class="nav nav-tabs">
      <li
        v-for="[tab, tabId, tabContentId] in tabsWithIds"
        :id="tabId"
        :key="tab"
        role="tab"
        :aria-controls="tabContentId"
        :aria-selected="isActive(tab)"
        class="nav-item nav-link clickable-control"
        :class="{ active: isActive(tab) }"
        @click="selectTab(tab)"
      >
        {{ tab }}
      </li>
    </ul>

    <div class="tab-content">
      <div
        v-for="[tab, tabId, tabContentId] in tabsWithIds"
        :id="tabContentId"
        :key="tab"
        role="tabpanel"
        :aria-labelledby="tabId"
        class="tab-pane fade"
        :class="isActive(tab) ? ['show', 'active'] : []"
      >
        <slot :name="tab"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      required: true,
      type: String
    },
    tabs: {
      required: true,
      type: Array,
      validator(value) {
        return value.every(item => typeof item === "string");
      }
    }
  },
  data() {
    return {
      activeTab: this.tabs[0]
    };
  },
  computed: {
    tabsWithIds() {
      const { id, tabs } = this;
      return tabs.map(tab => [
        tab,
        `${id}-tab-${tab}`,
        `${id}-tabpanel-${tab}`
      ]);
    }
  },
  methods: {
    selectTab(tab) {
      this.activeTab = tab;
    },
    isActive(tab) {
      return this.activeTab === tab;
    }
  }
};
</script>

<style scoped>
.clickable-control {
  cursor: pointer;
  user-select: none;
}
</style>
