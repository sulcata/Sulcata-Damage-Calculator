<template>
  <div class="d-flex flex-column align-items-center stack">
    <!-- Battle Mode -->
    <button-radio-group
      v-show="gen >= Generation.ADV"
      :value="field.multiBattle"
      :options="battleModes"
      size="small"
      type="secondary"
      @input="toggleMultiBattle()"
    />

    <!-- Inverted Battle -->
    <button-checkbox
      v-show="gen === Generation.ORAS"
      :value="field.invertedBattle"
      size="small"
      type="secondary"
      @input="toggleInvertedBattle()"
    >
      Inverted Battle
    </button-checkbox>

    <!-- Weather -->
    <div
      v-if="gen >= Generation.GSC"
      class="d-flex flex-column align-items-center w-100"
      :class="gen >= Generation.ORAS && 'border-top border-bottom p-1'"
    >
      <button-radio-group
        v-if="gen >= Generation.GSC"
        :value="field.weather"
        :default-value="Weather.CLEAR"
        :options="weathers"
        size="small"
        type="secondary"
        @input="weather => setWeather({ weather })"
      />
      <button-radio-group
        v-if="gen >= Generation.ORAS"
        :value="field.weather"
        :default-value="Weather.CLEAR"
        :options="harshWeathers"
        size="small"
        type="secondary"
        class="mt-1"
        @input="weather => setWeather({ weather })"
      />
    </div>

    <!-- Water Sport / Mud Sport -->
    <div v-show="gen >= Generation.ADV" class="btn-group btn-group-sm">
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

    <!-- Gravity / Magic Room / Wonder Room -->
    <div v-show="gen >= Generation.HGSS" class="btn-group btn-group-sm">
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

    <!-- Terrain -->
    <button-radio-group
      v-show="gen >= Generation.ORAS"
      :value="field.terrain"
      :default-value="Terrain.NO_TERRAIN"
      :options="terrains"
      size="small"
      type="secondary"
      @input="terrain => setTerrain({ terrain })"
    />

    <!-- Fairy Aura / Dark Aura / Aura Break -->
    <div v-show="gen >= Generation.ORAS" class="btn-group btn-group-sm">
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

    <!-- Ion Deluge -->
    <button-checkbox
      v-show="gen >= Generation.ORAS"
      :value="field.ionDeluge"
      size="small"
      type="secondary"
      @input="toggleIonDeluge()"
    >
      Ion Deluge
    </button-checkbox>

    <!-- attacker / defender -->
    <div class="d-flex justify-content-between w-100">
      <div
        v-for="(pokemon, side) in { attacker, defender }"
        :key="side"
        class="d-flex flex-column stack"
      >
        <!-- Stealth Rock -->
        <button-checkbox
          v-show="gen >= Generation.HGSS"
          :value="pokemon.stealthRock"
          size="small"
          type="secondary"
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
          @input="spikes => setSpikes({ side, spikes })"
        />
        <button-checkbox
          v-show="gen === Generation.GSC"
          :value="Boolean(pokemon.spikes)"
          size="small"
          type="secondary"
          @input="spikes => setSpikes({ side, spikes })"
        >
          Spikes
        </button-checkbox>

        <!-- Reflect / Light Screen -->
        <div class="btn-group btn-group-sm">
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
          @input="toggleBattery({ side })"
        >
          Battery
        </button-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { asThunkObject } from "../utilities";
import { Generation, Terrain, Weather } from "sulcalc";

export default {
  components: {
    ButtonCheckbox,
    ButtonRadioGroup
  },
  computed: {
    ...asThunkObject({
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
      ]
    }),
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
          label: "Psychic Terrain"
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
    ])
  }
};
</script>

<style lang="scss" scoped>
@import "node_modules/bootstrap/scss/functions";
@import "node_modules/bootstrap/scss/variables";
@import "node_modules/bootstrap/scss/mixins";

.stack {
  & > * {
    margin-bottom: map-get($spacers, 1);
  }

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
