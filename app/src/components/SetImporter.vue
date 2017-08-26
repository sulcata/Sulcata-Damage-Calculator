<template>
    <div>
        <textarea
            v-model='importText'
            class='form-control'
            style='resize: vertical;'
            rows='10'
        ></textarea>
        <div class='text-center mt-3'>
            <button
                @click='importPokemon({importText})'
                type='button'
                class='btn btn-primary'
                >
                {{ $t("import") }}
            </button>
        </div>
    </div>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    data() {
        return {importText: ""};
    },
    methods: {
        ...mapMutations([
            "importPokemon"
        ])
    }
};
</script>
