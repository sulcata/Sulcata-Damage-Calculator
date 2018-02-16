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
        Inverted Battle
      </button-checkbox>
    </div>

    <!-- Weather -->
    <hr v-if='gen >= Gens.ORAS' class='row'>
    <div v-if='gen >= Gens.GSC' class='mt-1' :class='centeredRowClasses'>
      <button-radio-group
        :value='field.weather'
        :defaultValue='Weathers.CLEAR'
        :options='weathers'
        @input='weather => setWeather({weather})'
        size='small'
        type='secondary'
        />
    </div>
    <div v-if='gen >= Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <button-radio-group
        :value='field.weather'
        :defaultValue='Weathers.CLEAR'
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
          Water Sport
        </button-checkbox>
        <button-checkbox
          :value='field.mudSport'
          @input='toggleMudSport()'
          type='secondary'
          >
          Mud Sport
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
          Gravity
        </button-checkbox>
        <template v-if='gen >= Gens.B2W2'>
          <button-checkbox
            :value='field.magicRoom'
            @input='toggleMagicRoom()'
            type='secondary'
            >
            Magic Room
          </button-checkbox>
          <button-checkbox
            :value='field.wonderRoom'
            @input='toggleWonderRoom()'
            type='secondary'
            >
            Wonder Room
          </button-checkbox>
        </template>
      </div>
    </div>

    <!-- Terrain -->
    <div v-if='gen >= Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <button-radio-group
        :value='field.terrain'
        :defaultValue='Terrains.NO_TERRAIN'
        :options='terrains'
        @input='terrain => setTerrain({terrain})'
        size='small'
        type='secondary'
        />
    </div>

    <!-- Fairy Aura / Dark Aura / Aura Break -->
    <div v-if='gen >= Gens.ORAS' class='mt-1' :class='centeredRowClasses'>
      <div class='col-auto btn-group btn-group-sm'>
        <button-checkbox
          :value='field.fairyAura'
          @input='toggleFairyAura()'
          type='secondary'
          >
          Fairy Aura
        </button-checkbox>
        <button-checkbox
          :value='field.darkAura'
          @input='toggleDarkAura()'
          type='secondary'
          >
          Dark Aura
        </button-checkbox>
        <button-checkbox
          :value='field.auraBreak'
          @input='toggleAuraBreak()'
          type='secondary'
          >
          Aura Break
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
          Ion Deluge
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
          Stealth Rock
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
          Spikes
        </button-checkbox>

        <!-- Reflect / Light Screen -->
        <div class='btn-group btn-group-sm mt-1' :style='pokeAlign(side)'>
          <button-checkbox
            :value='pokemon.reflect'
            @input='toggleReflect({side})'
            type='secondary'
            >
            Reflect
          </button-checkbox>
          <button-checkbox
            :value='pokemon.lightScreen'
            @input='toggleLightScreen({side})'
            type='secondary'
            >
            Light Screen
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
          Foresight
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
          Friend Guard
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
          Aurora Veil
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
          Battery
        </button-checkbox>

      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { Multiselect } from "vue-multiselect";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { Terrains, Weathers, Gens } from "sulcalc";

export default {
  components: {
    Multiselect,
    ButtonCheckbox,
    ButtonRadioGroup
  },
  data() {
    return {
      Gens,
      Terrains,
      Weathers,
      battleModes: [
        { value: false, label: "Singles" },
        { value: true, label: "Doubles" }
      ],
      harshWeathers: [
        { value: Weathers.HARSH_SUN, label: "Harsh Sun" },
        { value: Weathers.HEAVY_RAIN, label: "Heavy Rain" },
        { value: Weathers.STRONG_WINDS, label: "Strong Winds" }
      ],
      spikes: [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3 Spikes" }
      ],
      centeredRowClasses: ["row", "justify-content-center", "no-gutters"]
    };
  },
  computed: {
    ...mapState(["gen", "field", "attacker", "defender"]),
    weathers() {
      const weathers = [
        { value: Weathers.SUN, label: "Sun" },
        { value: Weathers.RAIN, label: "Rain" },
        { value: Weathers.SAND, label: "Sand" }
      ];
      if (this.gen >= Gens.ADV) {
        weathers.push({ value: Weathers.HAIL, label: "Hail" });
      }
      return weathers;
    },
    terrains() {
      const terrains = [
        { value: Terrains.GRASSY_TERRAIN, label: "Grassy Terrain" },
        { value: Terrains.MISTY_TERRAIN, label: "Misty Terrain" },
        { value: Terrains.ELECTRIC_TERRAIN, label: "Electric Terrain" }
      ];
      if (this.gen >= Gens.SM) {
        terrains.push({
          value: Terrains.PSYCHIC_TERRAIN,
          label: "Psyhic Terrain"
        });
      }
      return terrains;
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
      "toggleFairyAura",
      "toggleDarkAura",
      "toggleAuraBreak",
      "toggleIonDeluge",
      "setWeather",
      "setTerrain",
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
