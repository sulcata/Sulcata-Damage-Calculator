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
            <form>
                <language></language>
            </form>
        </nav>
        <sulcalc></sulcalc>
    </div>
</template>

<script>
import Sulcalc from "./Sulcalc.vue";
import Language from "./Language.vue";

export default {
    components: {
        Sulcalc,
        Language
    },
    data() {
        const links = [
            {
                href: "https://github.com/sulcata/sulcalc/issues",
                label: "Report a Bug"
            },
            {
                href: "https://github.com/sulcata/sulcalc/",
                label: "Github"
            }
        ];
        return {links};
    }
};
</script>
