import "bootstrap/dist/css/bootstrap.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Vue from "vue";
import Vuex from "vuex";
import App from "./components/App.vue";
import store from "./store";

Vue.use(Vuex);

const vm = new Vue({
  render: h => h(App),
  store
});

document.body.appendChild(vm.$mount().$el);
