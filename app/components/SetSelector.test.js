import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import SetSelector from "./SetSelector.vue";
import { Generation, Pokemon } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store;
beforeEach(() => {
  store = new Store({
    state: {
      gen: Generation.GSC
    },
    getters: {
      sets: jest.fn().mockReturnValue([
        {
          pokemonName: "Batman",
          sets: [
            {
              pokemonName: "Christian Bale",
              set: {}
            },
            {
              pokemonName: "Michael Keaton",
              set: {}
            }
          ]
        },
        {
          pokemonName: "The Joker",
          sets: [
            {
              pokemonName: "Heath Ledger",
              set: {}
            },
            {
              pokemonName: "Jack Nicholson",
              set: {}
            }
          ]
        }
      ])
    }
  });
});

test("emits a Pokemon on updates", () => {
  const wrapper = shallowMount(SetSelector, {
    localVue,
    store,
    propsData: { pokemon: new Pokemon() }
  });
  const gen = Generation.GSC;

  wrapper.vm.updatePokemon({
    pokemonId: "snorlax",
    set: {},
    gen
  });
  expect(wrapper.emitted().input).toHaveLength(1);
  const [emittedPokemon] = wrapper.emitted().input[0];
  expect(emittedPokemon).toBeInstanceOf(Pokemon);
  expect(emittedPokemon).toMatchObject({
    id: "snorlax",
    evs: Array(6).fill(252),
    ivs: Array(6).fill(15),
    set: {},
    gen
  });
});

test("resets when a Pokemon is unselected", () => {
  const wrapper = shallowMount(SetSelector, {
    localVue,
    store,
    propsData: { pokemon: new Pokemon() }
  });
  const gen = Generation.GSC;

  wrapper.vm.updatePokemon(null);
  expect(wrapper.emitted().input).toHaveLength(1);
  const [emittedPokemon] = wrapper.emitted().input[0];
  expect(emittedPokemon).toBeInstanceOf(Pokemon);
  expect(emittedPokemon.name).toBe("(No Pokemon)");
});
