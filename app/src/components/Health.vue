<template>
    <div>
        <label>{{ $t("hp") }}</label>
        <input v-model.lazy='actualHealth' class='form-control small-control'>
        /{{ totalHp }} (
        <input v-model.lazy='percentHealth'
               type='number' min='1' max='100'
               class='form-control small-control'>
        %)
    </div>
</template>

<script>
import clamp from "lodash/clamp";
import {Pokemon, Stats, Multiset} from "sulcalc";

const {ceil, floor, max} = Math;

const damageListRegex = /^(\d+(:\d+)?,)*\d+(:\d+)?$/;
const intRegex = /^\d+$/;

export default {
    props: {
        pokemon: Pokemon
    },
    computed: {
        percentHealth: {
            get() {
                return max(1, floor(100 * this.pokemon.currentHp
                                    / this.totalHp));
            },
            set(value) {
                const normalized = String(value).replace(/\s/g, "");
                const percent = intRegex.test(normalized)
                    ? clamp(Number(normalized), 1, 100) : 100;
                const [minHp, maxHp] = minMaxHp(this.totalHp, percent);
                const newHealth = new Multiset();
                for (let hp = minHp; hp <= maxHp; hp++) {
                    newHealth.add(hp);
                }
                this.pokemon.currentHpRange = newHealth;
                this.pokemon.currentHpRangeBerry = new Multiset();
            }
        },
        actualHealth: {
            get() {
                return this.pokemon.currentHpRange.toString(prettyPrintItems);
            },
            set(value) {
                const normalized = value.replace(/\s/g, "");
                let newHealth;
                if (damageListRegex.test(normalized)) {
                    newHealth = parseHealthList(normalized, 0, this.totalHp);
                } else {
                    newHealth = new Multiset([this.totalHp]);
                }
                this.pokemon.currentHpRange = newHealth;
                this.pokemon.currentHpRangeBerry = new Multiset();
            }
        },
        totalHp() {
            return this.pokemon.stat(Stats.HP);
        }
    }
};

function parseItem(item, min, max) {
    const [health, multiplicity = "1"] = item.split(":");
    return [clamp(Number(health), min, max), multiplicity];
}

function parseHealthList(list, min, max) {
    const pairs = list.split(",").map(item => parseItem(item, min, max));
    return new Multiset(new Map(pairs));
}

function minMaxHp(totalHp, percent) {
    const minHp = ceil(percent / 100 * totalHp);
    const maxHp = clamp(ceil((percent + 1) / 100 * totalHp) - 1,
                        minHp, totalHp);
    return percent === 1 ? [1, maxHp] : [minHp, maxHp];
}

function prettyPrintItems([value, multiplicity]) {
    return multiplicity === "1" ? value : `${value}:${multiplicity}`;
}
</script>

<style scoped>
.small-control {
    display: inline-block;
    width: 6rem;
}
</style>
