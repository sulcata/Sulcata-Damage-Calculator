<template>
  <div class='container-fluid'>
    <!-- Battle Mode -->
    <div v-if='gen >= Gens.ADV' :class='centeredRowClasses'>
      <button-radio-group
        :value='field.multiBattle'
        :options='battleModes'
        @input='toggleMultiBattle()'
        size='small'
        type='secondary'
        />
    </div>

    <!-- Inverted Battle -->
    <div v-if='gen === Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <button-checkbox
        :value='field.invertedBattle'
        @input='toggleInvertedBattle()'
        size='small'
        type='secondary'
        >
        {{ $t("invertedBattle") }}
      </button-checkbox>
    </div>

    <!-- Weather -->
    <hr v-if='gen >= Gens.ORAS' class='row'>
    <div v-if='gen >= Gens.GSC' class='mt-1' :class='centeredRowClasses'>
      <button-radio-group
        :value='field.weather'
        :options='weathers'
        @input='weather => setWeather({weather})'
        size='small'
        type='secondary'
        />
    </div>
    <div v-if='gen >= Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <button-radio-group
        :value='field.weather'
        :options='harshWeathers'
        @input='weather => setWeather({weather})'
        size='small'
        type='secondary'
        />
    </div>
    <hr v-if='gen >= Gens.ORAS' class='row'>

    <!-- Water Sport / Mud Sport -->
    <div v-if='gen >= Gens.ADV' class='mt-1' :class='centeredRowClasses'>
      <div class='col-auto btn-group btn-group-sm'>
        <button-checkbox
          :value='field.waterSport'
          @input='toggleWaterSport()'
          type='secondary'
          >
          {{ $tMove("Water Sport") }}
        </button-checkbox>
        <button-checkbox
          :value='field.mudSport'
          @input='toggleMudSport()'
          type='secondary'
          >
          {{ $tMove("Mud Sport") }}
        </button-checkbox>
      </div>
    </div>

    <!-- Gravity / Magic Room / Wonder Room -->
    <div v-if='gen >= Gens.HGSS' class='mt-1' :class='centeredRowClasses'>
      <div class='col-auto btn-group btn-group-sm'>
        <button-checkbox
          :value='field.gravity'
          @input='toggleGravity()'
          type='secondary'
          >
          {{ $tMove("Gravity") }}
        </button-checkbox>
        <template v-if='gen >= Gens.B2W2'>
          <button-checkbox
            :value='field.magicRoom'
            @input='toggleMagicRoom()'
            type='secondary'
            >
            {{ $tMove("Magic Room") }}
          </button-checkbox>
          <button-checkbox
            :value='field.wonderRoom'
            @input='toggleWonderRoom()'
            type='secondary'
            >
            {{ $tMove("Wonder Room") }}
          </button-checkbox>
        </template>
      </div>
    </div>

    <!-- Grassy / Electric / Misty / Psychic Terrain -->
    <div v-if='gen >= Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <div class='col-auto btn-group btn-group-sm'>
        <button-checkbox
          :value='field.grassyTerrain'
          @input='toggleGrassyTerrain()'
          type='secondary'
          >
          {{ $tMove("Grassy Terrain") }}
        </button-checkbox>
        <button-checkbox
          :value='field.electricTerrain'
          @input='toggleElectricTerrain()'
          type='secondary'
          >
          {{ $tMove("Electric Terrain") }}
        </button-checkbox>
        <button-checkbox
          :value='field.mistyTerrain'
          @input='toggleMistyTerrain()'
          type='secondary'
          >
          {{ $tMove("Misty Terrain") }}
        </button-checkbox>
        <button-checkbox
          v-if='gen >= Gens.SM'
          :value='field.psychicTerrain'
          @input='togglePsychicTerrain()'
          type='secondary'
          >
          {{ $tMove("Psychic Terrain") }}
        </button-checkbox>
      </div>
    </div>

    <!-- Fairy Aura / Dark Aura / Aura Break -->
    <div v-if='gen >= Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <div class='col-auto btn-group btn-group-sm'>
        <button-checkbox
          :value='field.fairyAura'
          @input='toggleFairyAura()'
          type='secondary'
          >
          {{ $tAbility("Fairy Aura") }}
        </button-checkbox>
        <button-checkbox
          :value='field.darkAura'
          @input='toggleDarkAura()'
          type='secondary'
          >
          {{ $tAbility("Dark Aura") }}
        </button-checkbox>
        <button-checkbox
          :value='field.auraBreak'
          @input='toggleAuraBreak()'
          type='secondary'
          >
          {{ $tAbility("Aura Break") }}
        </button-checkbox>
      </div>
    </div>

    <!-- Ion Deluge -->
    <div v-if='gen >= Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <div class='col-auto'>
        <button-checkbox
          :value='field.ionDeluge'
          @input='toggleIonDeluge()'
          size='small'
          type='secondary'
          >
          {{ $tMove("Ion Deluge") }}
        </button-checkbox>
      </div>
    </div>

      <!-- attacker / defender -->
    <div class='mt-1' :class='centeredRowClasses'>
      <div
        v-for='(pokemon, side) in {attacker, defender}'
        :key='side'
        class='col-6'
        >

        <!-- Stealth Rock -->
        <button-checkbox
          v-if='gen >= Gens.HGSS'
          :value='pokemon.stealthRock'
          @input='toggleStealthRock({side})'
          size='small'
          type='secondary'
          class='mt-1'
          :style='pokeAlign(side)'
          >
          {{ $tMove("Stealth Rock") }}
        </button-checkbox>

        <!-- Spikes -->
        <button-radio-group
          v-if='gen >= Gens.ADV'
          :value='pokemon.spikes'
          @input='spikes => setSpikes({side, spikes})'
          :options='spikes'
          size='small'
          type='secondary'
          class='mt-1'
          :style='pokeAlign(side)'
          />
        <button-checkbox
          v-if='gen === Gens.GSC'
          :value='Boolean(pokemon.spikes)'
          @input='spikes => setSpikes({side, spikes})'
          size='small'
          type='secondary'
          class='mt-1'
          :style='pokeAlign(side)'
          >
          {{ $tMove("Spikes") }}
        </button-checkbox>

        <!-- Reflect / Light Screen -->
        <div class='btn-group btn-group-sm mt-1' :style='pokeAlign(side)'>
          <button-checkbox
            :value='pokemon.reflect'
            @input='toggleReflect({side})'
            type='secondary'
            >
            {{ $tMove("Reflect") }}
          </button-checkbox>
          <button-checkbox
            :value='pokemon.lightScreen'
            @input='toggleLightScreen({side})'
            type='secondary'
            >
            {{ $tMove("Light Screen") }}
          </button-checkbox>
        </div>

        <!-- Foresight -->
        <button-checkbox
          v-if='gen >= Gens.GSC'
          :value='pokemon.foresight'
          @input='toggleForesight({side})'
          size='small'
          type='secondary'
          class='mt-1'
          :style='pokeAlign(side)'
          >
          {{ $tMove("Foresight") }}
        </button-checkbox>

        <!-- Friend Guard -->
        <button-checkbox
          v-if='gen >= Gens.B2W2'
          :value='pokemon.friendGuard'
          @input='toggleFriendGuard({side})'
          size='small'
          type='secondary'
          class='mt-1'
          :style='pokeAlign(side)'
          >
          {{ $tAbility("Friend Guard") }}
        </button-checkbox>

        <!-- Aurora Veil -->
        <button-checkbox
          v-if='gen >= Gens.SM'
          :value='pokemon.auroraVeil'
          @input='toggleAuroraVeil({side})'
          size='small'
          type='secondary'
          class='mt-1'
          :style='pokeAlign(side)'
          >
          {{ $tMove("Aurora Veil") }}
        </button-checkbox>

        <!-- Battery -->
        <button-checkbox
          v-if='gen >= Gens.SM'
          :value='pokemon.battery'
          @input='toggleBattery({side})'
          size='small'
          type='secondary'
          class='mt-1'
          :style='pokeAlign(side)'
          >
          {{ $tAbility("Battery") }}
        </button-checkbox>

      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { Multiselect } from "vue-multiselect";
import translationMixin from "../mixins/translation";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { Weathers, Gens } from "sulcalc";

export default {
  components: {
    Multiselect,
    ButtonCheckbox,
    ButtonRadioGroup
  },
  mixins: [translationMixin],
  data() {
    return {
      Gens,
      centeredRowClasses: ["row", "justify-content-center", "no-gutters"]
    };
  },
  computed: {
    ...mapState(["gen", "field", "attacker", "defender"]),
    battleModes() {
      return ["singles", "doubles"].map((mode, idx) => ({
        value: Boolean(idx),
        label: this.$t(mode)
      }));
    },
    weathers() {
      const weathers = [
        Weathers.CLEAR,
        Weathers.SUN,
        Weathers.RAIN,
        Weathers.SAND
      ];
      if (this.gen >= Gens.ADV) {
        weathers.push(Weathers.HAIL);
      }
      return weathers.map(value => ({
        value,
        label: this.$tWeather(value)
      }));
    },
    harshWeathers() {
      return [
        Weathers.HARSH_SUN,
        Weathers.HEAVY_RAIN,
        Weathers.STRONG_WINDS
      ].map(value => ({
        value,
        label: this.$tWeather(value)
      }));
    },
    spikes() {
      const options = [];
      for (let i = 0; i <= 3; i++) {
        options.push({
          value: i,
          label: String(i)
        });
      }
      options[3].label += " " + this.$tMove("Spikes");
      return options;
    }
  },
  methods: {
    ...mapMutations([
      "toggleMultiBattle",
      "toggleInvertedBattle",
      "toggleWaterSport",
      "toggleMudSport",
      "toggleGravity",
      "toggleMagicRoom",
      "toggleWonderRoom",
      "toggleGrassyTerrain",
      "toggleElectricTerrain",
      "toggleMistyTerrain",
      "togglePsychicTerrain",
      "toggleFairyAura",
      "toggleDarkAura",
      "toggleAuraBreak",
      "toggleIonDeluge",
      "setWeather",
      "toggleStealthRock",
      "toggleReflect",
      "toggleLightScreen",
      "toggleForesight",
      "toggleFriendGuard",
      "toggleAuroraVeil",
      "toggleBattery",
      "setSpikes"
    ]),
    pokeAlign(side) {
      if (side === "attacker") {
        return { float: "left", clear: "left" };
      }
      return { float: "right", clear: "right" };
    }
  }
};
</script>
