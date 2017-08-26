<template>
    <select class='form-control'>
        <option
            v-for='[locale, language] in languages'
            :key='locale'
            @click='setLocale({locale})'
            >
            {{ language }}
        </option>
    </select>
</template>

<script>
import {mapState, mapActions} from "vuex";

export default {
    computed: {
        ...mapState({
            languages: state => state.i18n.languages
        })
    },
    methods: {
        ...mapActions([
            "setLocale"
        ])
    }
};
</script>
