import { createLocalVue, shallowMount } from "@vue/test-utils";
import { install as vuexInstall, Store } from "vuex";
import SetSelector from "./SetSelector.vue";
import { Gens, Pokemon } from "sulcalc";

const localVue = createLocalVue();
localVue.use(vuexInstall);

let store;
beforeEach(() => {
  store = new Store({
    state: {
      gen: Gens.GSC
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

it("emits a Pokemon on updates", () => {
  const wrapper = shallowMount(SetSelector, {
    localVue,
    store,
    propsData: { pokemon: new Pokemon() }
  });
  wrapper.vm.updatePokemon({
    pokemonId: "snorlax",
    set: {},
    gen: Gens.GSC
  });
  expect(wrapper.emitted().input).toHaveLength(1);
  const [emittedPokemon] = wrapper.emitted().input[0];
  expect(emittedPokemon).toBeInstanceOf(Pokemon);
  expect(emittedPokemon).toMatchObject({
    id: "snorlax",
    evs: Array(6).fill(252),
    ivs: Array(6).fill(15),
    set: {},
    gen: Gens.GSC
  });
});
