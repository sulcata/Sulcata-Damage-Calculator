import "bootstrap/dist/css/bootstrap.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import "./custom.scss";
import Vue from "vue";
import { Store, install as vuexInstall } from "vuex";
import App from "./components/App.vue";
import store from "./store";

if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  const registerServiceWorker = () => {
    // this gets written directly to dist/app by workbox
    // you'd think it would integrate with webpack better
    navigator.serviceWorker.register("service-worker.js").catch(error => {
      /* eslint-disable-next-line no-console */
      console.error(error);
    });
  };
  window.addEventListener("load", registerServiceWorker, { once: true });
}

Vue.use(vuexInstall);

const app = new Vue({
  render: h => h(App),
  store: new Store(store)
});

document.body.appendChild(app.$mount().$el);

export default app;
