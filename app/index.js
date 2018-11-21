import "bootstrap/dist/css/bootstrap.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import "./custom.scss";
import Vue from "vue";
import { install as vuexInstall, Store } from "vuex";
import App from "./components/App.vue";
import store from "./store";

if ("serviceWorker" in navigator) {
  const registerServiceWorker = () => {
    // this gets written directly to dist/app by workbox
    // you'd think it would integrate with webpack better
    navigator.serviceWorker.register("service-worker.js");
  };
  const options = { once: true };
  window.addEventListener("load", registerServiceWorker, options);
}

Vue.use(vuexInstall);

const app = new Vue({
  render: h => h(App),
  store: new Store(store)
});

document.body.appendChild(app.$mount().$el);

export default app;
