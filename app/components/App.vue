<template>
  <div class='mb-4'>
    <nav
      class='navbar navbar-expand-lg navbar-dark bg-dark'
      role='navigation'
      >
      <h1 class='navbar-brand mb-0'>sulcalc</h1>
      <ul class='navbar-nav mr-auto'>
        <li
          v-for='{url, label} in links'
          :key='url'
          class='nav-item'
          >
          <a :href='url' class='nav-link'>{{ label }}</a>
        </li>
      </ul>
    </nav>
    <sulcalc class='app-container'/>
  </div>
</template>

<script>
import Sulcalc from "./Sulcalc.vue";
import { bugs, repository } from "package";

export default {
  components: {
    Sulcalc
  },
  computed: {
    links() {
      return [
        {
          url: bugs.url,
          label: "Report a bug"
        },
        {
          url: repository.url,
          label: "GitHub"
        }
      ];
    }
  }
};
</script>

<style scoped>
.app-container {
  min-width: 95rem;
}
</style>
