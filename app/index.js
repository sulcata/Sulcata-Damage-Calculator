import "bootstrap/dist/css/bootstrap.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import Vue from "vue";
import App from "./components/App.vue";
import store from "./store";

const vm = new Vue({
  render: h => h(App),
  store
}).$mount();

document.body.appendChild(vm.$el);
