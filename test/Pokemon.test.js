import Pokemon from "../src/Pokemon";
import {Genders, Stats, Statuses, Types} from "../src/utilities";
import {
    ImportableEvError, ImportableIvError,
    ImportableLevelError, ImportableLineError
} from "../src/errors";

import matchers from "./matchers";

expect.extend(matchers);

describe("Pokemon", () => {
    let missingno;
    let mudkip;
    let marshtomp;
    let swampert;
    let megaSwampert;

    beforeEach(() => {
        missingno = new Pokemon();
        mudkip = new Pokemon("Mudkip");
        marshtomp = new Pokemon("Marshtomp");
        swampert = new Pokemon("Swampert");
        megaSwampert = new Pokemon("Mega Swampert");
    });

    test("#constructor()", () => {
        const pokemon1 = new Pokemon("Snorlax");
        expect(pokemon1.id).toEqual("143:0");

        const pokemon2 = new Pokemon({
            name: "Snorlax"
        });
        expect(pokemon2.id).toEqual("143:0");
        expect(pokemon2.evs).toEqual([0, 0, 0, 0, 0, 0]);
        expect(pokemon2.ivs).toEqual([31, 31, 31, 31, 31, 31]);

        const pokemon3 = new Pokemon({
            id: "143:0",
            gen: 2
        });
        expect(pokemon3.id).toEqual("143:0");
        expect(pokemon3.evs).toEqual([252, 252, 252, 252, 252, 252]);
        expect(pokemon3.ivs).toEqual([15, 15, 15, 15, 15, 15]);
    });

    describe("#export()", () => {
        test("handles simple sets", () => {
            const snorlax = new Pokemon({
                name: "Snorlax",
                gender: Genders.MALE,
                item: "Leftovers",
                ability: "Immunity",
                evs: [252, 212, 0, 0, 40, 0],
                natureName: "Careful",
                moves: ["Body Slam", "Curse", "Rest", "Earthquake"]
            });
            expect(snorlax.export()).toEqualImportable(
                `Snorlax (M) @ Leftovers
                Ability: Immunity
                EVs: 252 HP / 212 Atk / 40 SpD
                Careful Nature
                - Body Slam
                - Curse
                - Rest
                - Earthquake`
            );

            const bronzong = new Pokemon({
                name: "Bronzong",
                item: "Leftovers",
                ability: "Levitate",
                evs: [252, 0, 4, 0, 252, 0],
                ivs: [31, 31, 31, 31, 31, 0],
                natureName: "Sassy",
                moves: ["Stealth Rock", "Gyro Ball", "Psywave", "Toxic"]
            });
            expect(bronzong.export()).toEqualImportable(
                `Bronzong @ Leftovers
                Ability: Levitate
                EVs: 252 HP / 4 Def / 252 SpD
                IVs: 0 Spe
                Sassy Nature
                - Stealth Rock
                - Gyro Ball
                - Psywave
                - Toxic`
            );
        });

        test("handles sets with less than 4 moves", () => {
            const crobat = new Pokemon({
                name: "Crobat",
                gender: Genders.FEMALE,
                item: "Choice Band",
                ability: "Infiltrator",
                evs: [0, 252, 0, 0, 4, 252],
                natureName: "Jolly",
                moves: ["Brave Bird", "(No Move)", "U-turn", "Sleep Talk"]
            });
            expect(crobat.export()).toEqualImportable(
                `Crobat (F) @ Choice Band
                Ability: Infiltrator
                EVs: 252 Atk / 4 SpD / 252 Spe
                Jolly Nature
                - Brave Bird
                - U-turn
                - Sleep Talk`
            );
        });

        test("optionally adds nature info", () => {
            const munchlax = new Pokemon({
                name: "Munchlax",
                gender: Genders.MALE,
                natureName: "Relaxed"
            });
            expect(munchlax.export({natureInfo: true})).toEqualImportable(
                `Munchlax (M) @ (No Item)
                Ability: (No Ability)
                Relaxed Nature (+Def, -Spe)`
            );
            munchlax.natureName = "Serious";
            expect(munchlax.export({natureInfo: true})).toEqualImportable(
                `Munchlax (M) @ (No Item)
                Ability: (No Ability)
                Serious Nature`
            );
        });

        test("handles LC sets", () => {
            const porygon = new Pokemon({
                name: "Porygon",
                item: "Eviolite",
                ability: "Trace",
                evs: [236, 0, 116, 0, 156, 0],
                natureName: "Calm",
                moves: ["Ice Beam", "Thunderbolt", "Recover", "Tri Attack"]
            });
            expect(porygon.export()).toEqualImportable(
                `Porygon @ Eviolite
                Ability: Trace
                EVs: 236 HP / 116 Def / 156 SpD
                Calm Nature
                - Ice Beam
                - Thunderbolt
                - Recover
                - Tri Attack`
            );
        });

        test("handles GSC sets", () => {
            const zapdos = new Pokemon({
                name: "Zapdos",
                item: "Leftovers",
                ivs: [NaN, 15, 13, 15, 15, 15],
                moves: ["Thunder", "Hidden Power", "Rest", "Sleep Talk"]
            }, 2);
            expect(zapdos.export()).toEqualImportable(
                `Zapdos @ Leftovers
                - Thunder
                - Hidden Power [Ice]
                - Rest
                - Sleep Talk`
            );

            zapdos.evs = [252, 252, 252, 40, NaN, 252];
            zapdos.ivs = [NaN, 15, 15, 11, NaN, 15];
            expect(zapdos.export()).toEqualImportable(
                `Zapdos @ Leftovers
                EVs: 40 SpA / 40 SpD
                IVs: 11 SpA / 11 SpD
                - Thunder
                - Hidden Power [Dark]
                - Rest
                - Sleep Talk`
            );
        });

        test("handles RBY sets", () => {
            const tauros = new Pokemon({
                name: "Tauros",
                moves: ["Body Slam", "Hyper Beam", "Earthquake", "Blizzard"]
            }, 1);
            expect(tauros.export()).toEqualImportable(
                `Tauros
                - Body Slam
                - Hyper Beam
                - Earthquake
                - Blizzard`
            );

            tauros.evs = [252, 252, 200, 40, NaN, 252];
            tauros.ivs = [NaN, 15, 10, 11, NaN, 15];
            expect(tauros.export()).toEqualImportable(
                `Tauros
                EVs: 200 Def / 40 Spc
                IVs: 11 HP / 10 Def / 11 Spc
                - Body Slam
                - Hyper Beam
                - Earthquake
                - Blizzard`
            );
        });
    });

    test("#name", () => {
        expect(mudkip.name).toEqual("Mudkip");
        expect(missingno.name).toEqual("Missingno");

        const poke1 = new Pokemon();
        poke1.name = "   latias ";
        expect(poke1.id).toEqual("380:0");

        const poke2 = new Pokemon();
        poke2.name = " MEGA       laTIos ";
        expect(poke2.id).toEqual("381:1");

        const poke3 = new Pokemon();
        poke3.name = "SNOR LAX";
        expect(poke3.id).toEqual("0:0");
    });

    test("#natureName", () => {
        expect(mudkip.natureName).toEqual("Hardy");

        mudkip.nature = 5;
        expect(mudkip.natureName).toEqual("Bold");

        mudkip.natureName = " SAsSY   ";
        expect(mudkip.nature).toEqual(22);

        mudkip.natureName = "Bold";
        expect(mudkip.nature).toEqual(5);

        mudkip.natureName = "A damant";
        expect(mudkip.nature).toBeUndefined();
    });

    test("#num", () => {
        expect(missingno.num).toEqual(0);
        expect(mudkip.num).toEqual(258);
        expect(megaSwampert.num).toEqual(260);
    });

    test("#form", () => {
        expect(missingno.form).toEqual(0);
        expect(mudkip.form).toEqual(0);
        expect(megaSwampert.form).toEqual(1);
    });

    test("#stat()", () => {
        const nidoking = new Pokemon({
            name: "Nidoking",
            evs: [0, 0, 4, 252, 0, 252],
            ivs: [31, 0, 31, 31, 31, 31],
            natureName: "Modest"
        });
        expect(nidoking.stat(Stats.HP)).toEqual(303);
        expect(nidoking.stat(Stats.ATK)).toEqual(188);
        expect(nidoking.stat(Stats.DEF)).toEqual(191);
        expect(nidoking.stat(Stats.SATK)).toEqual(295);
        expect(nidoking.stat(Stats.SDEF)).toEqual(186);
        expect(nidoking.stat(Stats.SPD)).toEqual(269);

        nidoking.gen = 5;
        expect(nidoking.stat(Stats.HP)).toEqual(303);
        expect(nidoking.stat(Stats.ATK)).toEqual(170);
        expect(nidoking.stat(Stats.DEF)).toEqual(191);
        expect(nidoking.stat(Stats.SATK)).toEqual(295);
        expect(nidoking.stat(Stats.SDEF)).toEqual(186);
        expect(nidoking.stat(Stats.SPD)).toEqual(269);

        const shedinja = new Pokemon({
            name: "Shedinja",
            evs: [252, 252, 4, 0, 0, 0]
        });
        expect(shedinja.stat(Stats.HP)).toEqual(1);
        expect(shedinja.stat(Stats.ATK)).toEqual(279);
        expect(shedinja.stat(Stats.DEF)).toEqual(127);
        expect(shedinja.stat(Stats.SATK)).toEqual(96);
        expect(shedinja.stat(Stats.SDEF)).toEqual(96);
        expect(shedinja.stat(Stats.SPD)).toEqual(116);

        const gscSnorlax = new Pokemon("Snorlax", 2);
        expect(gscSnorlax.stat(Stats.HP)).toEqual(523);
        expect(gscSnorlax.stat(Stats.ATK)).toEqual(318);
        expect(gscSnorlax.stat(Stats.DEF)).toEqual(228);
        expect(gscSnorlax.stat(Stats.SATK)).toEqual(228);
        expect(gscSnorlax.stat(Stats.SDEF)).toEqual(318);
        expect(gscSnorlax.stat(Stats.SPD)).toEqual(158);
        gscSnorlax.evs[Stats.SPD] = 0;
        expect(gscSnorlax.stat(Stats.SPD)).toEqual(95);

        const gscZapdos = new Pokemon("Zapdos", 2);
        expect(gscZapdos.stat(Stats.HP)).toEqual(383);
        expect(gscZapdos.stat(Stats.ATK)).toEqual(278);
        expect(gscZapdos.stat(Stats.DEF)).toEqual(268);
        expect(gscZapdos.stat(Stats.SATK)).toEqual(348);
        expect(gscZapdos.stat(Stats.SDEF)).toEqual(278);
        expect(gscZapdos.stat(Stats.SPD)).toEqual(298);
        gscZapdos.ivs[Stats.DEF] = 13;
        expect(gscZapdos.stat(Stats.DEF)).toEqual(264);

        const rbyTauros = new Pokemon("Tauros", 1);
        expect(rbyTauros.stat(Stats.HP)).toEqual(353);
        expect(rbyTauros.stat(Stats.ATK)).toEqual(298);
        expect(rbyTauros.stat(Stats.DEF)).toEqual(288);
        expect(rbyTauros.stat(Stats.SPC)).toEqual(238);
        expect(rbyTauros.stat(Stats.SPD)).toEqual(318);

        const tauros = new Pokemon({
            name: "Tauros",
            powerTrick: true
        });
        expect(tauros.stat(Stats.HP)).toEqual(291);
        expect(tauros.stat(Stats.ATK)).toEqual(226);
        expect(tauros.stat(Stats.DEF)).toEqual(236);
        expect(tauros.stat(Stats.SATK)).toEqual(116);
        expect(tauros.stat(Stats.SDEF)).toEqual(176);
        expect(tauros.stat(Stats.SPD)).toEqual(256);

        mudkip.overrideStats = [0, 0, 244, 0, 0, 0];
        expect(mudkip.stat(Stats.HP)).toEqual(241);
        expect(mudkip.stat(Stats.ATK)).toEqual(176);
        expect(mudkip.stat(Stats.DEF)).toEqual(244);
        expect(mudkip.stat(Stats.SATK)).toEqual(136);
        expect(mudkip.stat(Stats.SDEF)).toEqual(136);
        expect(mudkip.stat(Stats.SPD)).toEqual(116);
    });

    test("#boost()", () => {
        mudkip.boosts = [NaN, 2, 3, 0, 1, 2, -1, 6];
        mudkip.ability.name = "Simple";
        expect(mudkip.boost(Stats.ATK)).toEqual(2);
        expect(mudkip.boost(Stats.DEF)).toEqual(3);
        expect(mudkip.boost(Stats.SATK)).toEqual(0);
        expect(mudkip.boost(Stats.SDEF)).toEqual(1);
        expect(mudkip.boost(Stats.SPD)).toEqual(2);
        expect(mudkip.boost(Stats.ACC)).toEqual(-1);
        expect(mudkip.boost(Stats.EVA)).toEqual(6);

        mudkip.gen = 4;
        expect(mudkip.boost(Stats.ATK)).toEqual(4);
        expect(mudkip.boost(Stats.DEF)).toEqual(6);
        expect(mudkip.boost(Stats.SATK)).toEqual(0);
        expect(mudkip.boost(Stats.SDEF)).toEqual(2);
        expect(mudkip.boost(Stats.SPD)).toEqual(4);
        expect(mudkip.boost(Stats.ACC)).toEqual(-2);
        expect(mudkip.boost(Stats.EVA)).toEqual(6);
    });

    test("#boostedStat()", () => {
        const mew = new Pokemon({
            name: "Mew",
            evs: [4, 252, 0, 0, 0, 252],
            boosts: [NaN, 2, 0, 0, 0, 0, 0, 0]
        });
        expect(mew.boostedStat(Stats.ATK)).toEqual(598);

        const bidoof = new Pokemon({
            name: "Bidoof",
            ability: "Simple",
            boosts: [NaN, 2, 0, 0, -1, 0, 0, 0]
        });
        expect(bidoof.boostedStat(Stats.ATK)).toEqual(252);
        expect(bidoof.boostedStat(Stats.SDEF)).toEqual(77);
        bidoof.gen = 4;
        bidoof.ability.gen = 4;
        expect(bidoof.boostedStat(Stats.ATK)).toEqual(378);
        expect(bidoof.boostedStat(Stats.SDEF)).toEqual(58);

        const gscSkarmory = new Pokemon({
            name: "Skarmory",
            boosts: [NaN, 1, 1, 0, 0, -1],
            gen: 2
        });
        expect(gscSkarmory.boostedStat(Stats.SPD)).toEqual(157);

        const gscSnorlax = new Pokemon("Snorlax", 2);
        expect(gscSnorlax.boostedStat(Stats.SPD)).toEqual(158);
    });

    test("#baseStat()", () => {
        const nidoking = new Pokemon("Nidoking");
        expect(nidoking.baseStat(Stats.HP)).toEqual(81);
        expect(nidoking.baseStat(Stats.ATK)).toEqual(102);
        expect(nidoking.baseStat(Stats.DEF)).toEqual(77);
        expect(nidoking.baseStat(Stats.SATK)).toEqual(85);
        expect(nidoking.baseStat(Stats.SDEF)).toEqual(75);
        expect(nidoking.baseStat(Stats.SPD)).toEqual(85);

        nidoking.gen = 5;
        expect(nidoking.baseStat(Stats.HP)).toEqual(81);
        expect(nidoking.baseStat(Stats.ATK)).toEqual(92);
        expect(nidoking.baseStat(Stats.DEF)).toEqual(77);
        expect(nidoking.baseStat(Stats.SATK)).toEqual(85);
        expect(nidoking.baseStat(Stats.SDEF)).toEqual(75);
        expect(nidoking.baseStat(Stats.SPD)).toEqual(85);

        const charizard = new Pokemon("Charizard");
        expect(charizard.baseStat(Stats.HP)).toEqual(78);
        expect(charizard.baseStat(Stats.ATK)).toEqual(84);
        expect(charizard.baseStat(Stats.DEF)).toEqual(78);
        expect(charizard.baseStat(Stats.SATK)).toEqual(109);
        expect(charizard.baseStat(Stats.SDEF)).toEqual(85);
        expect(charizard.baseStat(Stats.SPD)).toEqual(100);

        charizard.gen = 1;
        expect(charizard.baseStat(Stats.HP)).toEqual(78);
        expect(charizard.baseStat(Stats.ATK)).toEqual(84);
        expect(charizard.baseStat(Stats.DEF)).toEqual(78);
        expect(charizard.baseStat(Stats.SATK)).toEqual(85);
        expect(charizard.baseStat(Stats.SDEF)).toEqual(85);
        expect(charizard.baseStat(Stats.SPD)).toEqual(100);
    });

    test("#speed()", () => {
        mudkip.boosts = [NaN, 0, 0, 0, 0, 2, 0, 0];
        expect(mudkip.speed()).toEqual(232);

        mudkip.ability.name = "Swift Swim";
        expect(mudkip.speed()).toEqual(232);
        expect(mudkip.speed({rain: true})).toEqual(464);

        mudkip.ability.name = "Chlorophyll";
        expect(mudkip.speed()).toEqual(232);
        expect(mudkip.speed({sun: true})).toEqual(464);

        mudkip.ability.name = "(No Ability)";
        mudkip.item.name = "Choice Scarf";
        expect(mudkip.speed()).toEqual(348);

        mudkip.item.name = "Quick Powder";
        expect(mudkip.speed()).toEqual(232);

        const ditto = new Pokemon("Ditto");
        expect(ditto.speed()).toEqual(132);
        ditto.item.name = "Quick Powder";
        expect(ditto.speed()).toEqual(264);

        mudkip.item.name = "Iron Ball";
        expect(mudkip.speed()).toEqual(116);

        mudkip.status = Statuses.PARALYZED;
        expect(mudkip.speed()).toEqual(29);
        mudkip.ability.name = "Quick Feet";
        expect(mudkip.speed()).toEqual(174);

        mudkip.status = Statuses.NO_STATUS;
        mudkip.ability.name = "Slow Start";
        expect(mudkip.speed()).toEqual(116);
        mudkip.slowStart = true;
        expect(mudkip.speed()).toEqual(58);

        mudkip.ability.name = "Unburden";
        mudkip.item.name = "(No Item)";
        expect(mudkip.speed()).toEqual(232);
        mudkip.unburden = true;
        expect(mudkip.speed()).toEqual(464);

        mudkip.ability.name = "(No Ability)";
        mudkip.tailwind = true;
        expect(mudkip.speed()).toEqual(464);
    });

    test("#type1", () => {
        expect(mudkip.type1).toEqual(Types.WATER);
        expect(marshtomp.type1).toEqual(Types.WATER);

        const sceptile = new Pokemon("Sceptile");
        expect(sceptile.type1).toEqual(Types.GRASS);

        const megaSceptile = new Pokemon("Mega Sceptile");
        expect(megaSceptile.type1).toEqual(Types.GRASS);
    });

    test("#type2", () => {
        expect(mudkip.type2).toEqual(Types.CURSE);
        expect(marshtomp.type2).toEqual(Types.GROUND);

        const sceptile = new Pokemon("Sceptile");
        expect(sceptile.type2).toEqual(Types.CURSE);

        const megaSceptile = new Pokemon("Mega Sceptile");
        expect(megaSceptile.type2).toEqual(Types.DRAGON);
    });

    test("#overrideTypes", () => {
        mudkip.overrideTypes = [Types.NORMAL, Types.CURSE];
        expect(mudkip.type1).toEqual(Types.NORMAL);
        expect(mudkip.type2).toEqual(Types.CURSE);
        expect(mudkip.types).toEqual([Types.NORMAL]);
    });

    test("#types", () => {
        expect(mudkip.types).toEqual([Types.WATER]);

        expect(swampert.types).toEqual([Types.WATER, Types.GROUND]);

        const clefable = new Pokemon("Clefable");
        expect(clefable.types).toEqual([Types.FAIRY]);

        clefable.gen = 5;
        expect(clefable.types).toEqual([Types.NORMAL]);

        clefable.addedType = Types.WATER;
        expect(clefable.types).toEqual([Types.NORMAL, Types.WATER]);
    });

    test("#stab()", () => {
        expect(mudkip.stab(Types.WATER)).toBeTruthy();
        expect(mudkip.stab(Types.CURSE)).toBeFalsy();
        swampert.addedType = Types.FIRE;
        expect(swampert.stab(Types.WATER)).toBeTruthy();
        expect(swampert.stab(Types.GROUND)).toBeTruthy();
        expect(swampert.stab(Types.FIRE)).toBeTruthy();
    });

    test("#weight", () => {
        expect(mudkip.weight).toEqual(76);
        expect(marshtomp.weight).toEqual(280);
        expect(swampert.weight).toEqual(819);
        expect(megaSwampert.weight).toEqual(1020);

        mudkip.autotomize = true;
        expect(mudkip.weight).toEqual(1);

        mudkip.ability.name = "Light Metal";
        expect(mudkip.weight).toEqual(1);

        megaSwampert.autotomize = true;
        expect(megaSwampert.weight).toEqual(20);

        swampert.ability.name = "Light Metal";
        expect(swampert.weight).toEqual(409);

        swampert.ability.name = "Heavy Metal";
        expect(swampert.weight).toEqual(1638);

        swampert.ability.name = "(No Ability)";
        swampert.item.name = "Float Stone";
        expect(swampert.weight).toEqual(409);
    });

    test("#hasEvolution()", () => {
        expect(mudkip.hasEvolution()).toBeTruthy();
        expect(marshtomp.hasEvolution()).toBeTruthy();
        expect(swampert.hasEvolution()).toBeFalsy();
        expect(megaSwampert.hasEvolution()).toBeFalsy();

        const togetic = new Pokemon("Togetic");
        expect(togetic.hasEvolution()).toBeTruthy();
        togetic.gen = 3;
        expect(togetic.hasEvolution()).toBeFalsy();

        const floette = new Pokemon("Floette");
        expect(floette.hasEvolution()).toBeTruthy();
        const floetteEternal = new Pokemon("Floette-Eternal");
        expect(floetteEternal.hasEvolution()).toBeFalsy();
    });

    test("#hasPreEvolution()", () => {
        expect(mudkip.hasPreEvolution()).toBeFalsy();
        expect(marshtomp.hasPreEvolution()).toBeTruthy();
        expect(swampert.hasPreEvolution()).toBeTruthy();
        expect(megaSwampert.hasPreEvolution()).toBeTruthy();

        const snorlax = new Pokemon("Snorlax");
        expect(snorlax.hasPreEvolution()).toBeTruthy();
        snorlax.gen = 3;
        expect(snorlax.hasPreEvolution()).toBeFalsy();
    });

    test("#ability1", () => {
        expect(mudkip.ability1.name).toEqual("Torrent");
        expect(megaSwampert.ability1.name).toEqual("Swift Swim");
        const nidoking = new Pokemon("Nidoking");
        expect(nidoking.ability1.name).toEqual("Poison Point");
    });

    test("#ability2", () => {
        expect(mudkip.ability2.name).toEqual("(No Ability)");
        const nidoking = new Pokemon("Nidoking");
        expect(nidoking.ability2.name).toEqual("Rivalry");
    });

    test("#ability3", () => {
        expect(mudkip.ability3.name).toEqual("Damp");
        const nidoking = new Pokemon("Nidoking");
        expect(nidoking.ability3.name).toEqual("Sheer Force");
    });

    test("#hurtBySandstorm()", () => {
        expect(mudkip.hurtBySandstorm()).toBeTruthy();

        mudkip.item.name = "Safety Goggles";
        expect(mudkip.hurtBySandstorm()).toBeFalsy();

        mudkip.item.name = "(No Item)";
        mudkip.ability.name = "Sand Rush";
        expect(mudkip.hurtBySandstorm()).toBeFalsy();

        expect(marshtomp.hurtBySandstorm()).toBeFalsy();

        const tyranitar = new Pokemon("Tyranitar");
        expect(tyranitar.hurtBySandstorm()).toBeFalsy();

        const scizor = new Pokemon("Scizor");
        expect(scizor.hurtBySandstorm()).toBeFalsy();
    });

    test("#hurtByHail()", () => {
        expect(mudkip.hurtByHail()).toBeTruthy();

        mudkip.item.name = "Safety Goggles";
        expect(mudkip.hurtByHail()).toBeFalsy();

        mudkip.item.name = "(No Item)";
        mudkip.ability.name = "Ice Body";
        expect(mudkip.hurtByHail()).toBeFalsy();

        const froslass = new Pokemon("Froslass");
        expect(froslass.hurtByHail()).toBeFalsy();
    });

    test("#poisoned", () => {
        expect(mudkip.poisoned).toBeFalsy();

        mudkip.status = Statuses.POISONED;
        expect(mudkip.poisoned).toBeTruthy();

        mudkip.status = Statuses.BADLY_POISONED;
        expect(mudkip.poisoned).toBeFalsy();
    });

    test("#badlyPoisoned", () => {
        expect(mudkip.badlyPoisoned).toBeFalsy();

        mudkip.status = Statuses.POISONED;
        expect(mudkip.badlyPoisoned).toBeFalsy();

        mudkip.status = Statuses.BADLY_POISONED;
        expect(mudkip.badlyPoisoned).toBeTruthy();
    });

    test("#burned", () => {
        expect(mudkip.burned).toBeFalsy();

        mudkip.status = Statuses.POISONED;
        expect(mudkip.burned).toBeFalsy();

        mudkip.status = Statuses.BURNED;
        expect(mudkip.burned).toBeTruthy();
    });

    test("#paralyzed", () => {
        expect(mudkip.paralyzed).toBeFalsy();

        mudkip.status = Statuses.POISONED;
        expect(mudkip.paralyzed).toBeFalsy();

        mudkip.status = Statuses.PARALYZED;
        expect(mudkip.paralyzed).toBeTruthy();
    });

    test("#asleep", () => {
        expect(mudkip.asleep).toBeFalsy();

        mudkip.status = Statuses.POISONED;
        expect(mudkip.asleep).toBeFalsy();

        mudkip.status = Statuses.ASLEEP;
        expect(mudkip.asleep).toBeTruthy();
    });

    test("#frozen", () => {
        expect(mudkip.frozen).toBeFalsy();

        mudkip.status = Statuses.POISONED;
        expect(mudkip.frozen).toBeFalsy();

        mudkip.status = Statuses.FROZEN;
        expect(mudkip.frozen).toBeTruthy();
    });

    test("#male", () => {
        expect(mudkip.male).toBeFalsy();

        mudkip.gender = Genders.MALE;
        expect(mudkip.male).toBeTruthy();

        mudkip.gender = Genders.FEMALE;
        expect(mudkip.male).toBeFalsy();

        mudkip.gender = Genders.NO_GENDER;
        expect(mudkip.male).toBeFalsy();
    });

    test("#female", () => {
        expect(mudkip.female).toBeFalsy();

        mudkip.gender = Genders.FEMALE;
        expect(mudkip.female).toBeTruthy();

        mudkip.gender = Genders.MALE;
        expect(mudkip.female).toBeFalsy();

        mudkip.gender = Genders.NO_GENDER;
        expect(mudkip.female).toBeFalsy();
    });

    test("#hasPlate()", () => {
        expect(swampert.hasPlate()).toBeFalsy();

        swampert.item.name = "Earth Plate";
        expect(swampert.hasPlate()).toBeTruthy();
    });

    test("#hasDrive()", () => {
        expect(swampert.hasDrive()).toBeFalsy();

        swampert.item.name = "Chill Drive";
        expect(swampert.hasDrive()).toBeTruthy();
    });

    test("#knockOff()", () => {
        expect(mudkip.knockOff()).toBeFalsy();

        mudkip.item.name = "Leftovers";
        expect(mudkip.knockOff()).toBeTruthy();

        mudkip.ability.name = "Sticky Hold";
        expect(mudkip.knockOff()).toBeFalsy();

        mudkip.ability.name = "(No Ability)";
        mudkip.item.disabled = true;
        expect(mudkip.knockOff()).toBeTruthy();

        mudkip.item.disabled = false;
        mudkip.item.used = true;
        expect(mudkip.knockOff()).toBeFalsy();

        mudkip.item.used = false;
        mudkip.item.name = "Swampertite";
        expect(mudkip.knockOff()).toBeFalsy();

        megaSwampert.item.name = "Swampertite";
        expect(megaSwampert.knockOff()).toBeFalsy();

        mudkip.item.name = "Griseous Orb";
        expect(mudkip.knockOff()).toBeTruthy();

        const giratina = new Pokemon({
            name: "Giratina",
            item: "Griseous Orb"
        });
        expect(giratina.knockOff()).toBeFalsy();

        const giratinaOrigin = new Pokemon({
            name: "Giratina-Origin",
            item: "Griseous Orb"
        });
        expect(giratinaOrigin.knockOff()).toBeFalsy();

        const genesectChill = new Pokemon({
            name: "Genesect-Chill",
            item: "Chill Drive"
        });
        expect(genesectChill.knockOff()).toBeFalsy();

        mudkip.ability.name = "Multitype";
        mudkip.item.name = "Earth Plate";
        expect(mudkip.knockOff()).toBeFalsy();
        mudkip.item.name = "Leftovers";
        expect(mudkip.knockOff()).toBeTruthy();

        const groudon = new Pokemon({
            name: "Groudon",
            item: "Red Orb"
        });
        expect(groudon.knockOff()).toBeFalsy();
        groudon.item.name = "Blue Orb";
        expect(groudon.knockOff()).toBeTruthy();

        const primalGroudon = new Pokemon({
            name: "Primal Groudon",
            item: "Red Orb"
        });
        expect(primalGroudon.knockOff()).toBeFalsy();
        primalGroudon.item.name = "Blue Orb";
        expect(primalGroudon.knockOff()).toBeTruthy();

        const kyogre = new Pokemon({
            name: "Kyogre",
            item: "Blue Orb"
        });
        expect(kyogre.knockOff()).toBeFalsy();
        kyogre.item.name = "Red Orb";
        expect(kyogre.knockOff()).toBeTruthy();

        const primalKyogre = new Pokemon({
            name: "Primal Kyogre",
            item: "Blue Orb"
        });
        expect(primalKyogre.knockOff()).toBeFalsy();
        primalKyogre.item.name = "Red Orb";
        expect(primalKyogre.knockOff()).toBeTruthy();

        /* HGSS */
        const hgssMudkip = new Pokemon("Mudkip", 4);

        expect(hgssMudkip.knockOff()).toBeFalsy();

        hgssMudkip.item.name = "Leftovers";
        expect(hgssMudkip.knockOff()).toBeTruthy();

        hgssMudkip.ability.name = "Sticky Hold";
        expect(hgssMudkip.knockOff()).toBeFalsy();

        hgssMudkip.ability.name = "(No Ability)";
        hgssMudkip.item.disabled = true;
        expect(hgssMudkip.knockOff()).toBeTruthy();

        hgssMudkip.item.disabled = false;
        hgssMudkip.item.used = true;
        expect(hgssMudkip.knockOff()).toBeFalsy();

        hgssMudkip.item.used = false;
        hgssMudkip.item.name = "Griseous Orb";
        expect(hgssMudkip.knockOff()).toBeTruthy();

        const hgssGiratina = new Pokemon({
            name: "Giratina",
            item: "Griseous Orb",
            gen: 4
        });
        expect(hgssGiratina.knockOff()).toBeFalsy();
        hgssGiratina.item.name = "Leftovers";
        expect(hgssGiratina.knockOff()).toBeTruthy();

        const hgssGiratinaOrigin = new Pokemon({
            name: "Giratina-Origin",
            item: "Griseous Orb",
            gen: 4
        });
        expect(hgssGiratinaOrigin.knockOff()).toBeFalsy();
        hgssGiratinaOrigin.item.name = "Leftovers";
        expect(hgssGiratinaOrigin.knockOff()).toBeTruthy();

        hgssMudkip.ability.name = "Multitype";
        hgssMudkip.item.name = "Earth Plate";
        expect(hgssMudkip.knockOff()).toBeFalsy();

        hgssMudkip.item.name = "Leftovers";
        expect(hgssMudkip.knockOff()).toBeFalsy();
    });

    test("#knockOffBoost()", () => {
        expect(mudkip.knockOffBoost()).toBeFalsy();

        mudkip.item.name = "Leftovers";
        expect(mudkip.knockOffBoost()).toBeTruthy();

        mudkip.ability.name = "Sticky Hold";
        expect(mudkip.knockOffBoost()).toBeTruthy();

        mudkip.ability.name = "(No Ability)";
        mudkip.item.disabled = true;
        expect(mudkip.knockOffBoost()).toBeTruthy();

        mudkip.item.disabled = false;
        mudkip.item.used = true;
        expect(mudkip.knockOffBoost()).toBeFalsy();

        mudkip.item.used = false;
        mudkip.item.name = "Swampertite";
        expect(mudkip.knockOffBoost()).toBeFalsy();

        megaSwampert.item.name = "Swampertite";
        expect(megaSwampert.knockOffBoost()).toBeFalsy();

        mudkip.item.name = "Griseous Orb";
        expect(mudkip.knockOffBoost()).toBeTruthy();

        const giratina = new Pokemon({
            name: "Giratina",
            item: "Griseous Orb"
        });
        expect(giratina.knockOffBoost()).toBeFalsy();

        const giratinaOrigin = new Pokemon({
            name: "Giratina-Origin",
            item: "Griseous Orb"
        });
        expect(giratinaOrigin.knockOffBoost()).toBeFalsy();

        const genesectChill = new Pokemon({
            name: "Genesect-Chill",
            item: "Chill Drive"
        });
        expect(genesectChill.knockOffBoost()).toBeFalsy();

        mudkip.ability.name = "Multitype";
        mudkip.item.name = "Earth Plate";
        expect(mudkip.knockOffBoost()).toBeFalsy();
        mudkip.item.name = "Leftovers";
        expect(mudkip.knockOffBoost()).toBeTruthy();

        const groudon = new Pokemon({
            name: "Groudon",
            item: "Red Orb"
        });
        expect(groudon.knockOffBoost()).toBeFalsy();
        groudon.item.name = "Blue Orb";
        expect(groudon.knockOffBoost()).toBeTruthy();

        const primalGroudon = new Pokemon({
            name: "Primal Groudon",
            item: "Red Orb"
        });
        expect(primalGroudon.knockOffBoost()).toBeFalsy();
        primalGroudon.item.name = "Blue Orb";
        expect(primalGroudon.knockOffBoost()).toBeTruthy();

        const kyogre = new Pokemon({
            name: "Kyogre",
            item: "Blue Orb"
        });
        expect(kyogre.knockOffBoost()).toBeFalsy();
        kyogre.item.name = "Red Orb";
        expect(kyogre.knockOffBoost()).toBeTruthy();

        const primalKyogre = new Pokemon({
            name: "Primal Kyogre",
            item: "Blue Orb"
        });
        expect(primalKyogre.knockOffBoost()).toBeFalsy();
        primalKyogre.item.name = "Red Orb";
        expect(primalKyogre.knockOffBoost()).toBeTruthy();
    });

    test(".calcHealthDv()", () => {
        expect(Pokemon.calcHealthDv([NaN, 15, 15, 15, 15, 15])).toEqual(15);
        expect(Pokemon.calcHealthDv([NaN, 15, 14, 15, 15, 15])).toEqual(11);
        expect(Pokemon.calcHealthDv([NaN, 15, 9, 8, 8, 15])).toEqual(14);
        expect(Pokemon.calcHealthDv([NaN, 1, 15, 5, 5, 4])).toEqual(13);
        expect(Pokemon.calcHealthDv([NaN, 0, 2, 4, 4, 8])).toEqual(0);
    });

    describe(".import()", () => {
        test("handles simple importables", () => {
            const arceusGround = Pokemon.import(
                `Arceus-Ground (M) @ Earth Plate
                Ability: Multitype
                EVs: 252 SpA / 4 SpD / 252 Spe
                Timid Nature
                IVs: 0 Atk
                - Judgment
                - Ice Beam
                - Refresh
                - Recover`,
                6
            );
            expect(arceusGround).toMatchObject({
                gen: 6,
                id: "493:4",
                gender: Genders.MALE,
                item: {
                    id: 187,
                    gen: 6
                },
                ability: {
                    id: 121,
                    gen: 6
                },
                level: 100,
                evs: [0, 0, 0, 252, 4, 252],
                ivs: [31, 0, 31, 31, 31, 31],
                nature: 10,
                moves: [
                    {
                        id: 449,
                        gen: 6
                    },
                    {
                        id: 58,
                        gen: 6
                    },
                    {
                        id: 287,
                        gen: 6
                    },
                    {
                        id: 105,
                        gen: 6
                    }
                ]
            });
        });

        test("handles LC importables", () => {
            const chinchou = Pokemon.import(
                `sparkle (Chinchou) (F) @ Choice Scarf
                Ability: Volt Absorb
                Level: 5
                EVs: 52 Def / 232 SpA / 224 Spe
                Timid Nature
                - Volt Switch
                - Scald
                - Ice Beam
                - Hidden Power [GrOUnd  ]`,
                6
            );
            expect(chinchou).toMatchObject({
                id: "170:0",
                gender: Genders.FEMALE,
                level: 5
            });
        });

        test("handles GSC importables", () => {
            const snorlax = Pokemon.import(
                `zorofat (Snorlax) @ Leftovers
                - Toxic
                - Double-Edge
                - Flamethrower
                - Rest`,
                2
            );
            expect(snorlax).toMatchObject({
                gen: 2,
                id: "143:0",
                gender: Genders.NO_GENDER,
                item: {
                    id: 15,
                    gen: 2
                },
                level: 100,
                evs: [252, 252, 252, 252, 252, 252],
                ivs: [15, 15, 15, 15, 15, 15],
                moves: [
                    {
                        id: 92,
                        gen: 2
                    },
                    {
                        id: 38,
                        gen: 2
                    },
                    {
                        id: 53,
                        gen: 2
                    },
                    {
                        id: 156,
                        gen: 2
                    }
                ]
            });
        });

        test("accounts for different IVs for Hidden Power", () => {
            const landorusTherian = Pokemon.import(
                `Landorus-Therian
                IVs: 30 Spd
                - Hidden Power [Ice]`,
                6
            );
            expect(landorusTherian.ivs).toEqual([31, 31, 31, 31, 31, 30]);
        });

        test("sets happiness to 255 for Return, 0 otherwise", () => {
            const returnSnorlax = Pokemon.import(
                `Snorlax
                - Return`,
                6
            );
            expect(returnSnorlax.happiness).toEqual(255);

            const snorlax = Pokemon.import(
                `Snorlax
                - Waterfall`,
                6
            );
            expect(snorlax.happiness).toEqual(0);
        });

        test("puts (No Move) last", () => {
            const landorusTherian = Pokemon.import(
                `Landorus-Therian
                - Hidden Power [Ice]
                - asdfgrthr
                - (No Move)
                - Rest`,
                6
            );
            expect(landorusTherian.moves).toMatchObject([
                {id: 237}, {id: 156}, {id: 0}, {id: 0}
            ]);
        });

        test("recognizes the shiny property", () => {
            expect(() =>
                Pokemon.import(
                    `sparkle (Chinchou) (F) @ Choice Scarf
                    Ability: Volt Absorb
                    Level: 5
                    EVs: 52 Def / 232 SpA / 224 Spe
                    Shiny: no its sparkly
                    Timid Nature
                    - Volt Switch
                    - Scald
                    - Ice Beam
                    - Hidden Power [Ground]`,
                    6
                )
            ).not.toThrow();
        });

        test("throws an error for invalid properties", () => {
            expect(() =>
                Pokemon.import(
                    `sparkle (Chinchou) (F) @ Choice Scarf
                    Ability: Volt Absorb
                    Level: 5
                    EVs: 52 Def / 232 SpA / 224 Spe
                    INVALID PROP: value
                    Timid Nature
                    - Volt Switch
                    - Scald
                    - Ice Beam
                    - Hidden Power [Ground]`,
                    6
                )
            ).toThrow(ImportableLineError);
        });

        test("throws an error for invalid lines", () => {
            expect(() =>
                Pokemon.import(
                    `sparkle (Chinchou) (F) @ Choice Scarf
                    Ability: Volt Absorb
                    Level: 5
                    EVs: 52 Def / 232 SpA / 224 Spe
                    NOT A PROPER LINE
                    Timid Nature
                    - Volt Switch
                    - Scald
                    - Ice Beam
                    - Hidden Power [Ground]`,
                    6
                )
            ).toThrow(ImportableLineError);
        });

        test("throws an error for invalid EVs", () => {
            expect(() =>
                Pokemon.import(
                    `sparkle (Chinchou) (F) @ Choice Scarf
                    Ability: Volt Absorb
                    Level: 5
                    EVs: 552 Def / 232 SpA / 224 Spe
                    Timid Nature
                    - Volt Switch
                    - Scald
                    - Ice Beam
                    - Hidden Power [Ground]`,
                    6
                )
            ).toThrow(ImportableEvError);

            expect(() =>
                Pokemon.import(
                    `sparkle (Chinchou) (F) @ Choice Scarf
                    Ability: Volt Absorb
                    Level: 5
                    EVs: 10 Def / -5 SpA / 224 Spe
                    Timid Nature
                    - Volt Switch
                    - Scald
                    - Ice Beam
                    - Hidden Power [Ground]`,
                    6
                )
            ).toThrow(ImportableEvError);

            expect(() =>
                Pokemon.import(
                    `sparkle (Chinchou) (F) @ Choice Scarf
                    Ability: Volt Absorb
                    Level: 5
                    EVs: 10 Def / NaN SpA / 224 Spe
                    Timid Nature
                    - Volt Switch
                    - Scald
                    - Ice Beam
                    - Hidden Power [Ground]`,
                    6
                )
            ).toThrow(ImportableEvError);

            expect(() =>
                Pokemon.import(
                    `sparkle (Chinchou) (F) @ Choice Scarf
                    Ability: Volt Absorb
                    Level: 5
                    EVs: 52 Def / 232 NOTASTAT / 224 Spe
                    Timid Nature
                    - Volt Switch
                    - Scald
                    - Ice Beam
                    - Hidden Power [Ground]`,
                    6
                )
            ).toThrow(ImportableEvError);
        });

        test("throws an error for invalid IVs", () => {
            expect(() =>
                Pokemon.import(
                    `Arceus-Ground (M) @ Earth Plate
                    Ability: Multitype
                    EVs: 252 SpA / 4 SpD / 252 Spe
                    Timid Nature
                    IVs: 34 Atk
                    - Judgment
                    - Ice Beam
                    - Refresh
                    - Recover`,
                    6
                )
            ).toThrow(ImportableIvError);

            expect(() =>
                Pokemon.import(
                    `Snorlax @ Leftovers
                    IVs: 16 Atk
                    - Toxic
                    - Double-Edge
                    - Flamethrower
                    - Rest`,
                    2
                )
            ).toThrow(ImportableIvError);

            expect(() =>
                Pokemon.import(
                    `Arceus-Ground (M) @ Earth Plate
                    Ability: Multitype
                    EVs: 252 SpA / 4 SpD / 252 Spe
                    Timid Nature
                    IVs: -3 Atk
                    - Judgment
                    - Ice Beam
                    - Refresh
                    - Recover`,
                    6
                )
            ).toThrow(ImportableIvError);

            expect(() =>
                Pokemon.import(
                    `Arceus-Ground (M) @ Earth Plate
                    Ability: Multitype
                    EVs: 252 SpA / 4 SpD / 252 Spe
                    Timid Nature
                    IVs: NaN Atk
                    - Judgment
                    - Ice Beam
                    - Refresh
                    - Recover`,
                    6
                )
            ).toThrow(ImportableIvError);

            expect(() =>
                Pokemon.import(
                    `Arceus-Ground (M) @ Earth Plate
                    Ability: Multitype
                    EVs: 252 SpA / 4 SpD / 252 Spe
                    Timid Nature
                    IVs: 0 NOTASTAT
                    - Judgment
                    - Ice Beam
                    - Refresh
                    - Recover`,
                    6
                )
            ).toThrow(ImportableIvError);
        });

        test("throws an error for an invalid level", () => {
            expect(() =>
                Pokemon.import(
                    `Snorlax
                    Level: -Infinity`,
                    6
                )
            ).toThrow(ImportableLevelError);
        });
    });

    test(".export()", () => {
        const munchlax = new Pokemon({
            name: "Munchlax",
            gender: Genders.MALE,
            natureName: "Relaxed"
        });
        expect(Pokemon.export(munchlax, {natureInfo: true})).toEqualImportable(
            `Munchlax (M) @ (No Item)
            Ability: (No Ability)
            Relaxed Nature (+Def, -Spe)`
        );
    });
});
