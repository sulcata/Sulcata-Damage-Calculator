import "bootstrap/dist/css/bootstrap.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import "./custom.scss";
import Vue from "vue";
import { install as vuexInstall, Store } from "vuex";
import App from "./components/App.vue";
import store from "./store";

Vue.use(vuexInstall);

const app = new Vue({
  render: h => h(App),
  store: new Store(store)
});

document.body.appendChild(app.$mount().$el);

export default app;
