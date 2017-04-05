<template>
    <div class='mb-4'>
        <nav class='navbar navbar-toggleable-md navbar-light bg-faded' role='navigation'>
            <h1 class='navbar-brand mb-0'>sulcalc</h1>
            <ul class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <a href='#' class='nav-link'>Report a Bug</a>
                </li>
                <li class='nav-item'>
                    <a href='#' class='nav-link'>Github</a>
                </li>
            </ul>
            <form><language></language></form>
        </nav>
        <v-sulcalc></v-sulcalc>
    </div>
</template>

<script>
import vSulcalc from "./components/sulcalc.vue";
import Language from "./components/Language.vue";

export default {
    components: {
        vSulcalc,
        Language
    }
};
</script>
