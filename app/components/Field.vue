<template>
  <div class="container-fluid">
    <!-- Battle Mode -->
    <div v-show="gen >= Generation.ADV" :class="centeredRowClasses">
      <button-radio-group
        :value="field.multiBattle"
        :options="battleModes"
        size="small"
        type="secondary"
        @input="toggleMultiBattle()"
      />
    </div>

    <!-- Inverted Battle -->
    <div
      v-show="gen === Generation.ORAS"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <button-checkbox
        :value="field.invertedBattle"
        size="small"
        type="secondary"
        @input="toggleInvertedBattle()"
      >
        Inverted Battle
      </button-checkbox>
    </div>

    <!-- Weather -->
    <hr v-show="gen >= Generation.ORAS" class="row" />
    <div
      v-show="gen >= Generation.GSC"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <button-radio-group
        :value="field.weather"
        :default-value="Weather.CLEAR"
        :options="weathers"
        size="small"
        type="secondary"
        @input="weather => setWeather({ weather })"
      />
    </div>
    <div
      v-show="gen >= Generation.ORAS"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <button-radio-group
        :value="field.weather"
        :default-value="Weather.CLEAR"
        :options="harshWeathers"
        size="small"
        type="secondary"
        @input="weather => setWeather({ weather })"
      />
    </div>
    <hr v-show="gen >= Generation.ORAS" class="row" />

    <!-- Water Sport / Mud Sport -->
    <div
      v-show="gen >= Generation.ADV"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <div class="col-auto btn-group btn-group-sm">
        <button-checkbox
          :value="field.waterSport"
          type="secondary"
          @input="toggleWaterSport()"
        >
          Water Sport
        </button-checkbox>
        <button-checkbox
          :value="field.mudSport"
          type="secondary"
          @input="toggleMudSport()"
        >
          Mud Sport
        </button-checkbox>
      </div>
    </div>

    <!-- Gravity / Magic Room / Wonder Room -->
    <div
      v-show="gen >= Generation.HGSS"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <div class="col-auto btn-group btn-group-sm">
        <button-checkbox
          :value="field.gravity"
          type="secondary"
          @input="toggleGravity()"
        >
          Gravity
        </button-checkbox>
        <template v-show="gen >= Generation.B2W2">
          <button-checkbox
            :value="field.magicRoom"
            type="secondary"
            @input="toggleMagicRoom()"
          >
            Magic Room
          </button-checkbox>
          <button-checkbox
            :value="field.wonderRoom"
            type="secondary"
            @input="toggleWonderRoom()"
          >
            Wonder Room
          </button-checkbox>
        </template>
      </div>
    </div>

    <!-- Terrain -->
    <div
      v-show="gen >= Generation.ORAS"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <button-radio-group
        :value="field.terrain"
        :default-value="Terrain.NO_TERRAIN"
        :options="terrains"
        size="small"
        type="secondary"
        @input="terrain => setTerrain({ terrain })"
      />
    </div>

    <!-- Fairy Aura / Dark Aura / Aura Break -->
    <div
      v-show="gen >= Generation.ORAS"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <div class="col-auto btn-group btn-group-sm">
        <button-checkbox
          :value="field.fairyAura"
          type="secondary"
          @input="toggleFairyAura()"
        >
          Fairy Aura
        </button-checkbox>
        <button-checkbox
          :value="field.darkAura"
          type="secondary"
          @input="toggleDarkAura()"
        >
          Dark Aura
        </button-checkbox>
        <button-checkbox
          :value="field.auraBreak"
          type="secondary"
          @input="toggleAuraBreak()"
        >
          Aura Break
        </button-checkbox>
      </div>
    </div>

    <!-- Ion Deluge -->
    <div
      v-show="gen >= Generation.ORAS"
      class="mt-1"
      :class="centeredRowClasses"
    >
      <div class="col-auto">
        <button-checkbox
          :value="field.ionDeluge"
          size="small"
          type="secondary"
          @input="toggleIonDeluge()"
        >
          Ion Deluge
        </button-checkbox>
      </div>
    </div>

    <!-- attacker / defender -->
    <div class="mt-1" :class="centeredRowClasses">
      <div
        v-for="(pokemon, side) in { attacker, defender }"
        :key="side"
        class="col-6"
      >
        <!-- Stealth Rock -->
        <button-checkbox
          v-show="gen >= Generation.HGSS"
          :value="pokemon.stealthRock"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleStealthRock({ side })"
        >
          Stealth Rock
        </button-checkbox>

        <!-- Spikes -->
        <button-radio-group
          v-show="gen >= Generation.ADV"
          :value="pokemon.spikes"
          :options="spikes"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="spikes => setSpikes({ side, spikes })"
        />
        <button-checkbox
          v-show="gen === Generation.GSC"
          :value="Boolean(pokemon.spikes)"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="spikes => setSpikes({ side, spikes })"
        >
          Spikes
        </button-checkbox>

        <!-- Reflect / Light Screen -->
        <div class="btn-group btn-group-sm mt-1" :class="pokeAlign(side)">
          <button-checkbox
            :value="pokemon.reflect"
            type="secondary"
            @input="toggleReflect({ side })"
          >
            Reflect
          </button-checkbox>
          <button-checkbox
            :value="pokemon.lightScreen"
            type="secondary"
            @input="toggleLightScreen({ side })"
          >
            Light Screen
          </button-checkbox>
        </div>

        <!-- Foresight -->
        <button-checkbox
          v-show="gen >= Generation.GSC"
          :value="pokemon.foresight"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleForesight({ side })"
        >
          Foresight
        </button-checkbox>

        <!-- Friend Guard -->
        <button-checkbox
          v-show="gen >= Generation.B2W2"
          :value="pokemon.friendGuard"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleFriendGuard({ side })"
        >
          Friend Guard
        </button-checkbox>

        <!-- Aurora Veil -->
        <button-checkbox
          v-show="gen >= Generation.SM"
          :value="pokemon.auroraVeil"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleAuroraVeil({ side })"
        >
          Aurora Veil
        </button-checkbox>

        <!-- Battery -->
        <button-checkbox
          v-show="gen >= Generation.SM"
          :value="pokemon.battery"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleBattery({ side })"
        >
          Battery
        </button-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { Terrain, Weather, Generation } from "sulcalc";

export default {
  components: {
    ButtonCheckbox,
    ButtonRadioGroup
  },
  data() {
    return {
      Generation,
      Terrain,
      Weather,
      battleModes: [
        { value: false, label: "Singles" },
        { value: true, label: "Doubles" }
      ],
      harshWeathers: [
        { value: Weather.HARSH_SUN, label: "Harsh Sun" },
        { value: Weather.HEAVY_RAIN, label: "Heavy Rain" },
        { value: Weather.STRONG_WINDS, label: "Strong Winds" }
      ],
      spikes: [
        { value: 0, label: "0" },
        { value: 1, label: "1" },
        { value: 2, label: "2" },
        { value: 3, label: "3 Spikes" }
      ],
      centeredRowClasses: ["form-row", "justify-content-center"]
    };
  },
  computed: {
    ...mapState(["gen", "field", "attacker", "defender"]),
    weathers() {
      const weathers = [
        { value: Weather.SUN, label: "Sun" },
        { value: Weather.RAIN, label: "Rain" },
        { value: Weather.SAND, label: "Sand" }
      ];
      if (this.gen >= Generation.ADV) {
        weathers.push({ value: Weather.HAIL, label: "Hail" });
      }
      return weathers;
    },
    terrains() {
      const terrains = [
        { value: Terrain.GRASSY_TERRAIN, label: "Grassy Terrain" },
        { value: Terrain.MISTY_TERRAIN, label: "Misty Terrain" },
        { value: Terrain.ELECTRIC_TERRAIN, label: "Electric Terrain" }
      ];
      if (this.gen >= Generation.SM) {
        terrains.push({
          value: Terrain.PSYCHIC_TERRAIN,
          label: "Psyhic Terrain"
        });
      }
      return terrains;
    }
  },
  methods: {
    ...mapActions([
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
      return side === "attacker" ? "align-left" : "align-right";
    }
  }
};
</script>

<style scoped>
.align-left {
  float: left;
  clear: left;
}

.align-right {
  float: right;
  clear: right;
}
</style>
