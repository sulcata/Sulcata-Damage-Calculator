<template>
  <div class='mb-4'>
    <nav
      class='navbar navbar-expand-lg navbar-dark bg-dark'
      role='navigation'
      >
      <h1 class='navbar-brand mb-0'>sulcalc</h1>
      <ul class='navbar-nav mr-auto'>
        <li
          v-for='{href, label} in links'
          :key='href'
          class='nav-item'
          >
          <a :href='href' class='nav-link'>{{ label }}</a>
        </li>
      </ul>
    </nav>
    <sulcalc/>
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
          href: bugs.url,
          label: "Report a bug"
        },
        {
          href: repository.url,
          label: "GitHub"
        }
      ];
    }
  }
};
</script>
