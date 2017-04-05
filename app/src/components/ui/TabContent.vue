<template>
    <div>
        <ul class='nav nav-tabs' role='tablist'>
            <li v-for='tab in tabs'
                role='presentation' class='nav-item nav-link'
                :class='{active: isActive(tab)}'
                @click='selectTab(tab)'>
                {{ tab }}
            </li>
        </ul>

        <div class='tab-content'>
            <div v-for='tab in tabs' class='tab-pane' :class='{active: isActive(tab)}'>
                <slot :name='tab'></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        tabs: Array
    },
    data() {
        return {
            activeTab: this.tabs[0]
        };
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
