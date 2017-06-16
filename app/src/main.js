import "bootstrap/dist/css/bootstrap.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Vue from "vue";
import App from "./App.vue";
import {i18n} from "./mixins/translation";

// eslint-disable-next-line no-new
new Vue({
    el: "#app",
    render: h => h(App),
    i18n
});
