<template>
    <select class='form-control'>
        <option
            v-for='[locale, language] in languages'
            @click='$setLocale(locale)'
            >
            {{ language }}
        </option>
    </select>
</template>

<script>
import translationMixin from "../mixins/translation";

export default {
    mixins: [translationMixin]
};
</script>
