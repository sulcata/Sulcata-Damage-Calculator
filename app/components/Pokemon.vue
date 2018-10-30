<template>
  <div>
    <set-selector :pokemon='pokemon' @input='updateNewPokemon'/>

    <div v-show='pokemon.gen >= Gens.GSC' class='mt-1'>
      <item :item='pokemon.item' @input='updateItem'/>
    </div>

    <div v-show='pokemon.gen >= Gens.ADV' class='mt-1'>
      <ability :ability='pokemon.ability' @input='updateAbility'/>
    </div>

    <div v-show='pokemon.gen >= Gens.ADV' class='mt-1'>
      <nature :nature='pokemon.nature' @input='updateNature'/>
    </div>

    <div class='mt-1'>
      <strong>Level: </strong>
      <integer-input
        :min='1'
        :max='100'
        :value='pokemon.level'
        class='small-fixed-width'
        @input='updateLevel'
        />
    </div>

    <div class='mt-1'>
      <stats :pokemon='pokemon' @input='updatePokemon'/>
    </div>

    <div v-for='i in pokemon.moves.length' :key='i' class='mt-1'>
      <move
        :move='pokemon.moves[i - 1]'
        :happiness='pokemon.happiness'
        @input='move => updateMove(i - 1, move)'
        @input-happiness='updateHappiness'
        />
    </div>

    <div class='mt-1'>
      <div class='container-fluid p-0'>
        <div class='row'>
          <div class='col'>
            <status :status='pokemon.status' @input='updateStatus'/>
          </div>
          <div class='col-auto'>
            <health
              :total-hp='pokemon.stat(Stats.HP)'
              :current-hp='pokemon.currentHp'
              :current-hp-range='pokemon.currentHpRange'
              :current-hp-range-berry='pokemon.currentHpRangeBerry'
              @input='updateHealth'
              />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SetSelector from "./SetSelector.vue";
import AbilityComponent from "./Ability.vue";
import ItemComponent from "./Item.vue";
import MoveComponent from "./Move.vue";
import NatureComponent from "./Nature.vue";
import StatusComponent from "./Status.vue";
import StatsComponent from "./Stats.vue";
import Health from "./Health.vue";
import IntegerInput from "./ui/IntegerInput.vue";
import { Gens, Stats, Pokemon, Move } from "sulcalc";

export default {
  components: {
    SetSelector,
    Ability: AbilityComponent,
    Item: ItemComponent,
    Move: MoveComponent,
    Nature: NatureComponent,
    Status: StatusComponent,
    Stats: StatsComponent,
    Health,
    IntegerInput
  },
  model: {
    prop: "pokemon",
    event: "input"
  },
  props: {
    pokemon: {
      required: true,
      type: Pokemon
    }
  },
  data() {
    return { Gens, Stats };
  },
  methods: {
    updatePokemon(pokemon) {
      this.$emit("input", pokemon);
    },
    updateNewPokemon(pokemon) {
      const suggestions = Object.assign(
        {},
        ...pokemon.moves.map(move => suggestedMoveChanges(move))
      );
      this.$emit("input", new Pokemon({ ...pokemon, ...suggestions }));
    },
    updateItem(item) {
      this.$emit("input", new Pokemon({ ...this.pokemon, item }));
    },
    updateAbility(ability) {
      this.$emit("input", new Pokemon({ ...this.pokemon, ability }));
    },
    updateNature(nature) {
      this.$emit("input", new Pokemon({ ...this.pokemon, nature }));
    },
    updateLevel(level) {
      this.$emit("input", new Pokemon({ ...this.pokemon, level }));
    },
    updateMove(i, move) {
      const moves = this.pokemon.moves.slice(0);
      move.user = this.pokemon;
      moves[i] = move;
      const suggestions = suggestedMoveChanges(move);
      const pokemon = new Pokemon({ ...this.pokemon, moves, ...suggestions });
      this.$emit("input", pokemon);
    },
    updateHappiness(happiness) {
      this.$emit("input", new Pokemon({ ...this.pokemon, happiness }));
    },
    updateHealth(health) {
      this.$emit("input", new Pokemon({ ...this.pokemon, ...health }));
    },
    updateStatus(status) {
      this.$emit("input", new Pokemon({ ...this.pokemon, status }));
    }
  }
};

function suggestedMoveChanges(move) {
  const suggestions = {};
  if (move.usesHappiness()) {
    suggestions.happiness = move.optimalHappiness();
  }
  if (
    move.isHiddenPower() &&
    move.gen < Gens.SM &&
    move.type() !== Move.hiddenPowerType(move.user.ivs, move.gen)
  ) {
    suggestions.ivs = Move.hiddenPowers(move.type(), move.gen)[0];
  }
  return suggestions;
}
</script>

<style scoped>
.small-fixed-width {
  width: 6rem;
  display: inline-block;
}
</style>
