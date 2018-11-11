<template>
  <div class="container-fluid">
    <!-- Battle Mode -->
    <div v-show="gen >= Gens.ADV" :class="centeredRowClasses">
      <button-radio-group
        :value="field.multiBattle"
        :options="battleModes"
        size="small"
        type="secondary"
        @input="toggleMultiBattle();"
      />
    </div>

    <!-- Inverted Battle -->
    <div v-show="gen === Gens.ORAS" class="mt-1" :class="centeredRowClasses">
      <button-checkbox
        :value="field.invertedBattle"
        size="small"
        type="secondary"
        @input="toggleInvertedBattle();"
      >
        Inverted Battle
      </button-checkbox>
    </div>

    <!-- Weather -->
    <hr v-show="gen >= Gens.ORAS" class="row" />
    <div v-show="gen >= Gens.GSC" class="mt-1" :class="centeredRowClasses">
      <button-radio-group
        :value="field.weather"
        :default-value="Weathers.CLEAR"
        :options="weathers"
        size="small"
        type="secondary"
        @input="weather => setWeather({ weather })"
      />
    </div>
    <div v-show="gen >= Gens.ORAS" class="mt-1" :class="centeredRowClasses">
      <button-radio-group
        :value="field.weather"
        :default-value="Weathers.CLEAR"
        :options="harshWeathers"
        size="small"
        type="secondary"
        @input="weather => setWeather({ weather })"
      />
    </div>
    <hr v-show="gen >= Gens.ORAS" class="row" />

    <!-- Water Sport / Mud Sport -->
    <div v-show="gen >= Gens.ADV" class="mt-1" :class="centeredRowClasses">
      <div class="col-auto btn-group btn-group-sm">
        <button-checkbox
          :value="field.waterSport"
          type="secondary"
          @input="toggleWaterSport();"
        >
          Water Sport
        </button-checkbox>
        <button-checkbox
          :value="field.mudSport"
          type="secondary"
          @input="toggleMudSport();"
        >
          Mud Sport
        </button-checkbox>
      </div>
    </div>

    <!-- Gravity / Magic Room / Wonder Room -->
    <div v-show="gen >= Gens.HGSS" class="mt-1" :class="centeredRowClasses">
      <div class="col-auto btn-group btn-group-sm">
        <button-checkbox
          :value="field.gravity"
          type="secondary"
          @input="toggleGravity();"
        >
          Gravity
        </button-checkbox>
        <template v-show="gen >= Gens.B2W2">
          <button-checkbox
            :value="field.magicRoom"
            type="secondary"
            @input="toggleMagicRoom();"
          >
            Magic Room
          </button-checkbox>
          <button-checkbox
            :value="field.wonderRoom"
            type="secondary"
            @input="toggleWonderRoom();"
          >
            Wonder Room
          </button-checkbox>
        </template>
      </div>
    </div>

    <!-- Terrain -->
    <div v-show="gen >= Gens.ORAS" class="mt-1" :class="centeredRowClasses">
      <button-radio-group
        :value="field.terrain"
        :default-value="Terrains.NO_TERRAIN"
        :options="terrains"
        size="small"
        type="secondary"
        @input="terrain => setTerrain({ terrain })"
      />
    </div>

    <!-- Fairy Aura / Dark Aura / Aura Break -->
    <div v-show="gen >= Gens.ORAS" class="mt-1" :class="centeredRowClasses">
      <div class="col-auto btn-group btn-group-sm">
        <button-checkbox
          :value="field.fairyAura"
          type="secondary"
          @input="toggleFairyAura();"
        >
          Fairy Aura
        </button-checkbox>
        <button-checkbox
          :value="field.darkAura"
          type="secondary"
          @input="toggleDarkAura();"
        >
          Dark Aura
        </button-checkbox>
        <button-checkbox
          :value="field.auraBreak"
          type="secondary"
          @input="toggleAuraBreak();"
        >
          Aura Break
        </button-checkbox>
      </div>
    </div>

    <!-- Ion Deluge -->
    <div v-show="gen >= Gens.ORAS" class="mt-1" :class="centeredRowClasses">
      <div class="col-auto">
        <button-checkbox
          :value="field.ionDeluge"
          size="small"
          type="secondary"
          @input="toggleIonDeluge();"
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
          v-show="gen >= Gens.HGSS"
          :value="pokemon.stealthRock"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleStealthRock({ side });"
        >
          Stealth Rock
        </button-checkbox>

        <!-- Spikes -->
        <button-radio-group
          v-show="gen >= Gens.ADV"
          :value="pokemon.spikes"
          :options="spikes"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="spikes => setSpikes({ side, spikes })"
        />
        <button-checkbox
          v-show="gen === Gens.GSC"
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
            @input="toggleReflect({ side });"
          >
            Reflect
          </button-checkbox>
          <button-checkbox
            :value="pokemon.lightScreen"
            type="secondary"
            @input="toggleLightScreen({ side });"
          >
            Light Screen
          </button-checkbox>
        </div>

        <!-- Foresight -->
        <button-checkbox
          v-show="gen >= Gens.GSC"
          :value="pokemon.foresight"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleForesight({ side });"
        >
          Foresight
        </button-checkbox>

        <!-- Friend Guard -->
        <button-checkbox
          v-show="gen >= Gens.B2W2"
          :value="pokemon.friendGuard"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleFriendGuard({ side });"
        >
          Friend Guard
        </button-checkbox>

        <!-- Aurora Veil -->
        <button-checkbox
          v-show="gen >= Gens.SM"
          :value="pokemon.auroraVeil"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleAuroraVeil({ side });"
        >
          Aurora Veil
        </button-checkbox>

        <!-- Battery -->
        <button-checkbox
          v-show="gen >= Gens.SM"
          :value="pokemon.battery"
          size="small"
          type="secondary"
          class="mt-1"
          :class="pokeAlign(side)"
          @input="toggleBattery({ side });"
        >
          Battery
        </button-checkbox>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import ButtonCheckbox from "./ui/ButtonCheckbox.vue";
import ButtonRadioGroup from "./ui/ButtonRadioGroup.vue";
import { Terrains, Weathers, Gens } from "sulcalc";

export default {
  components: {
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
      centeredRowClasses: ["form-row", "justify-content-center"]
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
