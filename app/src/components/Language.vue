<template>
    <select :value='locale' class='form-control'>
        <option
            v-for='[locale, language] in languages'
            :key='locale'
            :value='locale'
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
            locale: state => state.i18n.locale,
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
