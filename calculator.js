var gen = 6, db = null;

function Database() {
    this.gens = [null, "db/rby/", "db/gsc/", "db/adv/", "db/hgss/", "db/b2w2/", "db/xy/"];
    this.damageClass = this.getJSON("db/damageClass.json");
    this.typeDamageClass = this.getJSON("db/typeDamageClass.json");
    this.pokemons = this.getJSON("db/pokemons.json");
    this.natures = this.getJSON("db/natures.json");
    this.abilities = this.getJSON("db/abilities.json");
    this.items = this.getJSON("db/items.json");
    this.moves = this.getJSON("db/moves.json");
    this.berryEffects = this.getJSON("db/berryEffects.json");
    this.itemEffects = this.getJSON("db/itemEffects.json");
    this.thisberryType = this.getJSON("db/berryType.json");
    this.berryPower = this.getJSON("db/berryPower.json");
    this.flingPower = this.getJSON("db/itemPower.json");
    this.weight = this.getJSON("db/weight.json");
    this.berries = this.getJSON("db/berries.json");
    this.recoil = this.getJSON("db/recoil.json");
    this.flags = this.getJSON("db/flags.json");
    this.flinch = this.getJSON("db/flinch.json");
    this.effects = this.getJSON("db/effect.json");
    this.abilityEffects = this.getJSON("db/abilityEffects.json");
    this.evolutions = this.getJSON("db/evolutions.json");
    this.stats = [];
    this.movePowers = [];
    this.moveTypes = [];
    this.pokeType1 = [];
    this.pokeType2 = [];
    this.typesTable = [];
    this.minMaxHits = [];
    this.ranges = [];
    for (var i = 1; i < this.gens.length; i++) {
        this.stats[i] = this.getJSON(this.gens[i] + "stats.json");
        this.movePowers[i] = this.getJSON(this.gens[i] + "power.json");
        this.moveTypes[i] = this.getJSON(this.gens[i] + "moveTypes.json");
        this.pokeType1[i] = this.getJSON(this.gens[i] + "pokeType1.json");
        this.pokeType2[i] = this.getJSON(this.gens[i] + "pokeType2.json");
        this.typesTable[i] = this.getJSON(this.gens[i] + "typesTable.json");
        this.minMaxHits[i] = this.getJSON(this.gens[i] + "minMaxHits.json");
        if (i === 1) {
            this.ranges[i] = null;
        } else {
            this.ranges[i] = this.getJSON(this.gens[i] + "range.json");
        }
    }
    // the rest is unneeded for calculations
    this.releasedPokes = this.getJSON("db/releasedPokes.json");
    this.releasedMoves = this.getJSON("db/releasedMoves.json");
    this.releasedItems = this.getJSON("db/releasedItems.json");
    this.releasedBerries = this.getJSON("db/releasedBerries.json");
    this.genders = this.getJSON("db/gender.json");
    this.types = this.getJSON("db/types.json");
};

Database.prototype.getJSON = function (file) {
    var httpreq;
    try {
        httpreq = new XMLHttpRequest(); // normal browsers
    } catch (e) {
        try {
            httpreq = new ActiveXObject("Msxml2.XMLHTTP"); // old version of ie
        } catch (f) {
            try {
                httpreq = new ActiveXObject("Microsoft.XMLHTTP"); // really, reeaaally old ie
            } catch (g) {
                alert("Nice potato!"); // compliment their potato
            }
        }
    }
    httpreq.open("GET", file, false);
    httpreq.send();
    return JSON.parse(httpreq.responseText);
};

(function() {

function WeightedArray(a) {
    // a is a non-empty array with numeric values
    // we will store the weighted array as [value, count]
    this.warray = [];
    if (a.length !== 0) {
        a = a.sort(function(a, b) {return a-b;});
        var temp = [a[0], 0];
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== temp[0]) {
                this.warray.push(temp);
                temp = [a[i], 1];
            } else {
                temp[1] += 1;
            }
        }
        this.warray.push(temp);
    }

    this.add = function(val, inc) {
        for (var i = 0; i < this.warray.length; i++) {
            if (val === this.warray[i][0]) {
                this.warray[i][1] += inc;
                return;
            } else if (val < this.warray[i][0]) {
                this.warray.splice(i, [val, inc]);
                return;
            }
        }
        this.warray.push([val, inc]);
    } 
           
    this.combine = function(w) {
        var temp = new WeightedArray([]);
        for (var i = 0; i < this.warray.length; i++) {
            for (var j = 0; j < w.warray.length; j++) {
                temp.add(this.warray[i][0] + w.warray[j][0],
                         this.warray[i][1] * w.warray[j][1]);
            }
        }
        return temp;
    }
    
    this.total = function() {
        var t = 0;
        for (var i = 0; i < this.warray.length; i++) {
            t += this.warray[i][1];
        }
        return t;
    }
            
    this.print = function() {
        var accstr = "";
        for(var i = 0; i < this.warray.length; i++) {
            accstr += this.warray[i][0] + ":" + this.warray[i][1] + ", ";
        }
        alert(accstr);
    }
}

var Stats = {HP : 0, ATK : 1, DEF : 2, SATK : 3, SDEF : 4, SPD : 5, ACC : 6, EVA : 7, SPC : 3};
var Genders = {NOGENDER : 0, MALE : 1, FEMALE : 2};
var DamageClasses = {OTHER : 0, PHYSICAL : 1, SPECIAL : 2};
var Weathers = {CLEAR : 0, SUN : 4, RAIN : 2, SAND : 3, HAIL : 1};
var Statuses = {NOSTATUS : 0, POISONED : 1, BADLYPOISONED : 2, BURNED : 3, PARALYZED : 4, ASLEEP : 5, FROZEN : 6};
var Types = {NORMAL : 0, FIGHTING : 1, FLYING : 2, POISON : 3, GROUND : 4, ROCK : 5, BUG : 6,
             GHOST : 7, STEEL : 8, FIRE : 9, WATER : 10, GRASS : 11, ELECTRIC : 12,
             PSYCHIC : 13, ICE : 14, DRAGON : 15, DARK : 16, FAIRY : 17, CURSE : 18};

function Pokemon() {
    this.id = "0:0";
    this.evs = gen <= 2 ? [255, 255, 255, 255, 255, 255]
                        : [0, 0, 0, 0, 0, 0];
    this.ivs = gen <= 2 ? [15, 15, 15, 15, 15, 15]
                        : [31, 31, 31, 31, 31, 31];
    this.boosts = [0, 0, 0, 0, 0, 0, 0, 0]; // "HP Boost" is just there to keep arrays in order, make sure you have a 0/ even though it isn't used!
    this.level = 100;
    this.nature = 0;
    this.status = Statuses.NOSTATUS; // NOSTATUS, POISONED, BADLYPOISONED, BURNED, PARALYZED, ASLEEP, FROZEN
    this.currentHP = 0;
    this.ability = new Ability();
    this.item = new Item();
    this.happiness = 0; // maximum of 255
    this.autotomize = false;
    this.unburden = false;
    this.tailwind = false;
    this.grounded = false;
    this.flowerGift = false;
    this.gender = Genders.NOGENDER; // NOGENDER, MALE, FEMALE
    this.addedType = Types.CURSE; // GHOST:Trick or Treat, GRASS:Forest's Curse, CURSE:Nothing; They can't exist simultaneously
    this.overrideTypes = [Types.CURSE, Types.CURSE]; // curse should be used for "no type"
    this.override = false;
    
    this.setNatureName = function (n) {
        for (nat in db.natures) {
            if (db.natures[nat] === n) {
                this.ability = nat;
                return;
            }
        }
    }
    
    this.setName = function (n) {
        for (p in db.pokemons) { // not particularly efficient
            if (db.pokemons[p] === n) {
                this.id = p;
                return;
            }
        }
    }
    
    this.name = function() {
        return db.pokemons[this.id];
    }
    
    this.form = function() {
        if (this.id.indexOf(":") !== this.id.lastIndexOf(":")) {
            return this.id.substring(this.id.indexOf(":") + 1, this.id.lastIndexOf(":"));
        }
        return this.id.substring(this.id.indexOf(":") + 1);
    }
    
    this.species = function() {
        return this.id.substring(0, this.id.indexOf(":"));
    }
    
    this.natureMultiplier = function (s) { // -1,0,1
        var stat2 = [0, 1, 2, 4, 5, 3];
        return ((Math.floor(this.nature / 5) === stat2[s] - 1) ? 1 : 0) - ((this.nature % 5 === stat2[s] - 1) ? 1 : 0);
    }
    
    this.stat = function (s) {
        // as a simplification to the gen 1/2 stat calculation I enter the EVs as /255 rather than /65535
        // the stats are exactly the same (can't get higher/lower or somewhere impossibly inbetween)
        // this makes it much easier for the user to enter them, as well as the programmer.
        var ev, iv;
        if (gen <= 2 && s === Stats.HP) {
            iv = (this.ivs[Stats.ATK] & 1) << 3 | (this.ivs[Stats.DEF] & 1) << 2 | (this.ivs[Stats.SPC] & 1) << 1 | (this.ivs[Stats.SPD] & 1);
            ev = this.evs[Stats.HP];
        } else if (gen === 2 && (s === Stats.SDEF || s === Stats.SATK)) {
            iv = this.ivs[Stats.SPC];
            ev = this.evs[Stats.SPC];
        } else {
            iv = this.ivs[s];
            ev = this.evs[s];
        }
        var base = this.baseStat(s);
        var n = this.natureMultiplier(s);
        // now that we're neat and tidy with ev, iv, base, and n
        if (s === Stats.HP) {
            if (gen <= 2) {
                return Math.floor(((iv + base) * 2 + (ev >> 2)) * this.level / 100) + this.level + 10;
            }
            if (this.id === "292:0") { // shedinja
                return 1;
            }
            // (iv+2*base+ev/4+100)*level/100+10
            return Math.floor((iv + 2 * base + (ev >> 2) + 100) * this.level / 100) + 10;
        }
        if (gen<=2) {
            return Math.floor(((iv + base) * 2 + (ev >> 2)) * this.level / 100) + 5;
        }
        // [(iv+2*base+ev/4)*level/100+5]*nature
        return Math.floor((Math.floor((iv + 2 * base + (ev >> 2)) * this.level / 100) + 5) * (10 + n) / 10);
    }
    
    this.boost = function (s) {
        return this.boosts[s];
    }
    
    this.boostedStat = function (s) {
        var boost = this.boosts[s];
        var num = 2;
        var den = 2;
        if (boost >= 0) {
            num += boost;
        } else {
            den -= boost;
        }
        return Math.floor(this.stat(s) * num / den); // stat * (2+boost) / (2-drop)
    }
    
    this.simpleBoostedStat = function (s) {
        var boost = this.boosts[s]*2;
        var num = 2;
        var den = 2;
        if (boost >= 0) {
            num += boost;
        } else {
            den += boost;
        }
        return Math.floor(this.stat(s) * num / den); // stat * (2+boost) / (2-drop)
    }
    
    this.baseStat = function (s) {
        var temp = this.species() + ":" + this.form(); // ignores any :H or :whatever stuff
        if (temp in db.stats[gen]) {
            return parseInt(db.stats[gen][temp].split(" ")[s], 10);
        }
        return parseInt(db.stats[gen][this.species() + ":0"].split(" ")[s], 10); // this is for keldeo and friends
    }
    
    this.type1 = function() {
        if (this.override) {
            return this.overrideTypes[0];
        }
        if ((this.species() + ":" + this.form()) in db.pokeType1[gen]) {
            return db.pokeType1[gen][this.species() + ":" + this.form()];
        }
        return db.pokeType1[gen][this.species() + ":0"];
    }
    
    this.type2 = function() {
        if (this.override) {
            return this.overrideTypes[1];
        }
        if ((this.species() + ":" + this.form()) in db.pokeType2[gen]) {
            return db.pokeType2[gen][this.species() + ":" + this.form()];
        } else if ((this.species() + ":0") in db.pokeType2[gen]) {
            return db.pokeType2[gen][this.species() + ":0"];
        }
        return Types.CURSE;
    }
    
    this.stab = function (t) {
        return (t === this.type1()
                || t === this.type2()
                || t === this.addedType)
               && t !== Types.CURSE; // no stab on ???
    }
    
    this.weight = function() {//kg
        if ((this.species() + ":" + this.form()) in db.weight) {
            return db.weight[this.species() + ":" + this.form()];
        }
        return db.weight[this.species() + ":0"];
    }
    
    this.hasEvolution = function() {
        return this.species() in db.evolutions;
    }
    
    this.gender = function () {
        if ((this.species() + this.form()) in db.genders) {
            return db.genders[this.species() + ":" + this.form()];
        }
        return db.genders[this.species() + ":0"];
    }
}

function Move() {
    this.id = "0";
    
    this.setName = function (n) {
        for (m in db.moves) { // not particularly efficient
            if (db.moves[m] === n) {
                this.id = m;
                return;
            }
        }
    }
    
    this.name = function() {
        return db.moves[this.id];
    }
    
    this.power = function() {
        return db.movePowers[gen][this.id];
    }
    
    this.damageClass = function() {
        return db.damageClass[this.id];
    }
    
    this.type = function() {
        return (this.id in db.moveTypes[gen]) ? db.moveTypes[gen][this.id] : Types.NORMAL;
    }
    
    this.hasRecoil = function() {
        return (this.id in db.recoil) ? (db.recoil[this.id] < 0) : false; // negative means it's actually recoil and not recovery!!!
    }
    
    this.isPunch = function() {
        return (this.id in db.flags) ? ((db.flags[this.id] & 0x80) === 0x80) : false;
    }
    
    this.sheerForce = function() {
        return (this.id in db.flinch) || (this.id in db.effects);
    }
    
    this.contact = function() {
        return (this.id in db.flags) ? ((db.flags[this.id] & 0x1) === 0x1) : false;
    }
    
    this.sound = function() {
        return (this.id in db.flags) ? ((db.flags[this.id] & 0x100) === 0x100) : false;
    }
    
    this.powder = function() {
        return (this.id in db.flags) ? ((db.flags[this.id] & 0x8000) === 0x8000) : false;
    }
    
    this.bite = function() {
        return (this.id in db.flags) ? ((db.flags[this.id] & 0x4000) === 0x4000) : false;
    }
    
    this.pulse = function() {
        return (this.id in db.flags) ? ((db.flags[this.id] & 0x800) === 0x800) : false;
    }
    
    this.ball = function() {
        return (this.id in db.flags) ? ((db.flags[this.id] & 0x10000) === 0x10000) : false;
    }
    
    this.minHits = function() {
        return (this.id in db.minMaxHits[gen]) ? db.minMaxHits[gen][this.id] & 0xF : 1;
    }
    
    this.maxHits = function() {
        return (this.id in db.minMaxHits[gen]) ? (db.minMaxHits[gen][this.id] & 0xF0) >> 4 : 1;
    }
    
    this.multiTargets = function() {
        return (this.id in db.ranges[gen]) ? (db.ranges[gen][this.id] === 4 || db.ranges[gen][this.id] === 5) : false;
    }
}

function Ability() {
    this.id = "0";
    
    this.setName = function (n) {
        for (a in db.abilities) { // not particularly efficient
            if (db.abilities[a] === n) {
                this.id = a;
                return;
            }
        }
    }
    
    this.name = function() {
        return db.abilities[this.id];
    }
    
    this.flagToValue = function (f) {
        if (!(this.id in db.abilityEffects)) return null;
        var effectsList = db.abilityEffects[this.id].split("|");
        for (e in effectsList) {
            if (effectsList[e].split("-")[0] === f) {
                return effectsList[e].split("-")[1];
            }
        }
        return null;
    }
    
    this.pinchType = function() {
        var v = this.flagToValue("7");
        return v !== null ? parseInt(v, 10) : -1;
    }
    
    this.weatherSpeedType = function() {
        var v = this.flagToValue("8");
        return v !== null ? parseInt(v, 10) : -1;
    }
    
    this.normalToType = function() {
        var v = this.flagToValue("102");
        return v !== null ? parseInt(v, 10) : -1;
    }
    
    this.immunityType = function() {
        var v = this.flagToValue("70"); // water absorb, volt absorb, etc.
        if (v !== null) {
            return parseInt(v, 10);
        }
        var v = this.flagToValue("38"); // storm drain, lightning rod, etc.
        if (v !== null) {
            return parseInt(v, 10);
        }
        if (db.abilityEffects[this.id] === "120") { // levitate
            return Sulcalc.Types.GROUND;
        }
        if (db.abilityEffects[this.id] === "41") { // motor drive
            return Sulcalc.Types.ELECTRIC;
        }
        var v = this.flagToValue("68"); // sap sipper, etc.
        if (v !== null) {
            return parseInt(v, 10);
        }
        return -1;
    }
    
    this.ignorable = function() {
        // alphabetize
        var aList = ["Aroma Veil", "Battle Armor", "Big Pecks", "Bulletproof", "Clear Body", "Contrary", "Damp", "Dry Skin",
                     "Filter", "Flash Fire", "Flower Gift", "Flower Veil", "Friend Guard", "Fur Coat", "Heatproof",
                     "Heavy Metal", "Hyper Cutter", "Immunity", "Inner Focus", "Insomnia", "Keen Eye", "Leaf Guard",
                     "Levitate", "Light Metal", "Lightning Rod", "Limber", "Magic Bounce", "Magma Armor", "Marvel Scale",
                     "Motor Drive", "Multiscale", "Oblivious", "Own Tempo", "Sand Veil", "Shell Armor", "Sap Sipper",
                     "Shield Dust", "Simple", "Snow Cloak", "Solid Rock", "Soundproof", "Sticky Hold", "Storm Drain",
                     "Sturdy", "Suction Cups", "Sweet Veil", "Tangled Feet", "Telepathy", "Thick Fat", "Unaware",
                     "Vital Spirit", "Volt Absorb", "Water Absorb", "Water Veil", "White Smoke", "Wonder Guard", "Wonder Skin"];
        return this.name() in aList;
    }
}

function Item() {
    this.id = "0";
    
    this.setName = function (n) {
        for (i in db.items) {
            if (db.items[i] === n) {
                this.id = i;
            }
        }
        for (b in db.berries) {
            if (db.berries[b] === n) {
                this.id = b + 8000;
                return;
            }
        }
    }
    
    this.name = function() {
        return db.items[this.id];
    }
    
    this.flagToValue = function (f) {
        if (!(this.id in db.itemEffects)) return null;
        var effectList = db.itemEffects[this.id].split("|");
        for (e in effectList) {
            if (effectList[e].split("-")[0] === f) {
               return effectList[e].split("-")[1];
            }
        }
        return null;
    }
    
    this.typeBoosted = function() {
        var v = this.flagToValue("10");
        return v !== null ? parseInt(v, 10) : -1;
    }
    
    this.berryType = function() {
        if (this.id < 8000 || !((this.id - 8000) in berryEffects)) return -1; // not a berry
        var e = db.berryEffects[this.id - 8000].split("-");
        if (e[0] === "4") {
            return parseInt(e[1], 10);
        }
        return -1; // ???
    }
    
    this.gemType = function() {
        var v = this.flagToValue("37");
        return v !== null ? parseInt(v, 10) : -1;
    }
    
    this.megaPokeSpecies = function() {
        var v = this.flagToValue("66")
        return v.substring(0, v.indexOf(":"));
    }
    
    this.megaPokeForm = function() {
        var v = this.flagToValue("66");
        return v.substring(v.indexOf(":") + 1);
    }
    
    this.megaPoke = function() {
        return this.flagToValue("66");
    }
}

function Field() {
    this.multiBattle = false;
    this.lightScreen = false;
    this.reflect = false;
    this.friendGuard = false;
    this.critical = false;
    this.weather = Weathers.CLEAR; // CLEAR, SUN, RAIN, SAND, HAIL
    this.metronome = 0;
    this.minimize = false;
    this.dig = false;
    this.dive = false;
    this.targetMoved = false; // for payback and friends
    this.attackerDamaged = false; // for avalanche and friends
    this.furyCutter = 0;
    this.echoedVoice = 0;
    this.trumpPP = 5;
    this.roundBoost = false;
    this.fly = false; // if the opponent is flying/bouncing/sky dropping
    this.beatUpStats = [0]; // list of pokemon's attack stats, I leave that to you TUO
    this.beatUpHit = 0; // do not touch
    this.beatUpLevels = [1]; // this is the same length as beatUpStats
    this.stockpile = 0; // for spit up, 0-3
    this.switchOut = false; // did the opponent switch out? (for pursuit)
    this.present = 40; // assuming damage it's either 40, 80, or 120. lol present
    this.magnitude = 4; // magnitude 4, 5, 6, 7, 8, 9, 10
    this.rollout = 0; // 0-5, shared by ice ball
    this.defenseCurl = 0; // 0 or 1
    this.tripleKickCount = 1; // which hit is it? 1, 2, 3? Don't touch
    this.previouslyFainted = false; // for retaliate
    this.fusionBolt = false; // fusion bolt was used previously
    this.fusionFlare = false; // fusion flare was used previously
    this.meFirst = false;
    this.charge = false;
    this.helpingHand = false;
    this.waterSport = false;
    this.mudSport = false;
    this.flashFire = false;
    this.slowStart = false; // less than 5 turns
    this.grassyTerrain = false;
    this.mistyTerrain = false;
    this.electricTerrain = false;
    this.fairyAura = false;
    this.darkAura = false;
    this.auraBreak = false;
    this.plus = false;
    this.minus = false;
    this.airLock = false;
    this.painSplit = false; // was damage due to pain split? this is for avalance and revenge who do not count pain split for the boost
    this.magicRoom = false;
    this.wonderRoom = false;
    this.multiHits = 1; // set this to however many times the move is expected to hit (bullet seed, double slap, etc.)
    this.electrify = false;
    this.ionDeluge = false;
    this.invertedBattle = false; // inverts type matchups if true
    this.pledgeBoost = false;
    this.parentalBond = false; // do not touch
}

function Calculator() {
    this.move = new Move();
    this.attacker = new Pokemon();
    this.defender = new Pokemon();
    this.field = new Field();
    
    this.typeEffectiveness = function (aType, dType) {
        // 0:immune, 1:resisted, 2:neutral, 4:super effective
        return parseInt(db.typesTable[gen][aType].split(" ")[dType], 10);
    }
    
    this.effective = function (aTypes, dTypes, foresight, freezeDry) {
        var e = 1;
            for (d in dTypes) {
                for (a in aTypes) {
                    if (foresight && (aTypes[a] === Types.FIGHTING || aTypes[a] === Types.NORMAL) && dTypes[d] === Types.GHOST) {
                        e *= 2;
                    } else if (freezeDry && dTypes[d] === Types.WATER) {
                        e *= 4;
                    } else {
                        e *= this.typeEffectiveness(aTypes[a], dTypes[d]);
                    }
                }
            }
        return e;
    }
    
    this.invert = function (e) {
        if (e <= 1) {
            return 4;
        } else if (e === 4) {
            return 1;
        }
        return 2;
    }

    this.invertedEffective = function (aTypes, dTypes) { // foresight has no effect, freeze dry still works
        var e = 1;
        for (d in dTypes) {
            for (a in aTypes) {
                if (freezeDry && dTypes[d] === Types.WATER) {
                    e *= 4;
                } else {
                    e *= this.invert(this.typeEffectiveness(aTypes[a], dTypes[d]));
                }
            }
        }
        return e;
    }
    
    this.chainMod = function (m1, m2) {
        return (m1 * m2 + 0x800) >> 12;
    }
    
    this.applyMod = function (m, d) {
        // there's weird rounding, <= is accurate. It's rounding "half-down". Happens a lot in gen 5 (possibly 6)
        var temp = d * m / 0x1000;
        if (temp - Math.floor(temp) <= .5) {
            return Math.floor(temp);
        } else {
            return Math.ceil(temp);
        }
    }
    
    this.applyModA = function (m, s) {
        for (var i = 0; i < s.length; i++) {
            s[i] = this.applyMod(m, s[i]);
        }
        return s;
    }
    
    this.flail = function (current, total) {
        var p = Math.floor(48 * current / total);
        if (p <= 1) {
            return 200
        } else if (p <= 4) {
            return 150;
        } else if (p <= 9) {
            return 100;
        } else if (p <= 16) {
            return 80;
        } else if (p <= 32) {
            return 40;
        }
        return 20;
    }
    
    this.hiddenPowerP = function (ivs) {
        return Math.floor(((ivs[Stats.HP] & 2)
                            | ((ivs[Stats.ATK] & 2) << 1)
                            | ((ivs[Stats.DEF] & 2) << 2)
                            | ((ivs[Stats.SPD] & 2) << 3)
                            | ((ivs[Stats.SATK] & 2) << 4)
                            | ((ivs[Stats.SDEF] & 2) << 5)
                          ) * 40 / 63 + 30);
    }
    
    this.hiddenPowerT = function (ivs) {
        return 1 + Math.floor(((ivs[Stats.HP] & 1)
                                | ((ivs[Stats.ATK] & 1) << 1)
                                | ((ivs[Stats.DEF] & 1) << 2)
                                | ((ivs[Stats.SPD] & 1) << 3)
                                | ((ivs[Stats.SATK] & 1) << 4)
                                | ((ivs[Stats.SDEF] & 1) << 5)
                              ) * 15 / 63);
    }
    
    this.magnitudePower = function (m) {
        var pows = [10, 30, 50, 70, 90, 110, 150];
        return pows[m - 4];
    }
    
    this.weatherBall = function (w) {
        if (w === Weathers.SUN) {
            return 9;
        } else if (w === Weathers.RAIN) {
            return 10;
        } else if (w === Weathers.SAND) {
            return 5;
        } else if (w === Weathers.HAIL) {
            return 14;
        }
        return 0;
    }
    
    this.trumpPower = function (pp) {
        var t = [200, 80, 60, 50, 40];
        return t[Math.min(4, pp)];
    }
    
    this.electroBall = function (a, b) {
        var s = a / Math.max(1, b);
        if (s >= 4) {
            return 150;
        } else if (s >= 3) {
            return 120;
        } else if (s >= 2) {
            return 80;
        } else if (s >= 1) {
            return 60;
        }
        return 40;
    }
    
    this.gyroBall = function (a, b) {
        return Math.min(150, 1 + Math.floor(25 * b / Math.max(1, a)));
    }
    
    this.punishment = function (a) {
        var statBoostTotal = 0;
        for (var i = 0; i < a.length; i++) {
            if (a[i] > 0) {
                statBoostTotal += a[i];
            }
        }
        return Math.min(120, 60 + 20 * statBoostTotal);
    }
    
    this.grassKnot = function (w) { // w in kg * 10
        if (w >= 2000) {
            return 120;
        } else if (w >= 1000) {
            return 100;
        } else if (w >= 500) {
            return 80;
        } else if (w >= 250) {
            return 60;
        } else if (w >= 100) {
            return 40;
        }
        return 20;
    }
    
    this.heavySlam = function (w1, w2) {
        var w = Math.floor(w1 / w2);
        if (w >= 5) {
            return 120;
        } else if (w === 4) {
            return 100;
        } else if (w === 3) {
            return 80;
        } else if (w === 2) {
            return 60;
        }
        return 40;
    }
    
    this.storedPower = function (b) {
        var statBoostTotal = 1;
        for (var i = 0; i < b.length; i++) {
            if (b[i] > 0) {
                statBoostTotal += b[i];
            }
        }
        return 20 * statBoostTotal;
    }
    
    this.xy_calculate = function() {
        var moveType = this.move.type();
        var movePower = this.move.power();
        var atk = 0, def = 0, satk = 0, sdef = 0;
        var attackerWeight = this.attacker.weight() * 10;
        var defenderWeight = this.defender.weight() * 10;
        var attackerAbility = new Ability();
        attackerAbility.id = this.attacker.ability.id;
        var defenderAbility = new Ability();
        defenderAbility.id = this.defender.ability.id;
        if (attackerAbility.name() === "Mold Breaker" && defenderAbility.ignorable()) {
            defenderAbility.id = "0";
        }
        if (this.move.sound() && defenderAbility.name() === "Soundproof"
            || this.move.ball() && defenderAbility.name() === "Bulletproof") {
            return [0];
        }
        var attackerItem = new Item();
        attackerItem.id = (this.field.magicRoom || attackerAbility.name() === "Klutz") ? "0" : this.attacker.item.id;
        var defenderItem = new Item();
        defenderItem.id = (this.field.magicRoom || defenderAbility.name() === "Klutz") ? "0" : this.defender.item.id;
        var weather = this.field.airLock ? Weathers.CLEAR : this.field.weather;
        var crit = this.field.critical;
        var attackerSpeed = this.attacker.boostedStat(Stats.SPD);
        var defenderSpeed = this.defender.boostedStat(Stats.SPD);
        if ((weather === Weathers.RAIN && attackerAbility.name() === "Swift Swim") || (weather === Weathers.SUN && attackerAbility.name() === "Chlorophyll")) {
            attackerSpeed *= 2;
        }
        if ((weather === Weathers.RAIN && defenderAbility.name() === "Swift Swim") || (weather === Weathers.SUN && defenderAbility.name() === "Chlorophyll")) {
            defenderSpeed *= 2;
        }
        if (this.attacker.item.name() === "Iron Ball" // ignore embargo & klutz
            || this.attacker.item.name() === "Macho Brace"
            || this.attacker.item.name() === "Power Bracer"
            || this.attacker.item.name() === "Power Belt"
            || this.attacker.item.name() === "Power Lens"
            || this.attacker.item.name() === "Power Band"
            || this.attacker.item.name() === "Power Anklet"
            || this.attacker.item.name() === "Power Weight") {
            attackerSpeed >>= 1;
        }
        if (this.defender.item.name() === "Iron Ball"
            || this.defender.item.name() === "Macho Brace"
            || this.defender.item.name() === "Power Bracer"
            || this.defender.item.name() === "Power Belt"
            || this.defender.item.name() === "Power Lens"
            || this.defender.item.name() === "Power Band"
            || this.defender.item.name() === "Power Anklet"
            || this.defender.item.name() === "Power Weight") {
            defenderSpeed >>= 1;
        }
        if (attackerItem.name() === "Choice Scarf") {
            attackerSpeed = (attackerSpeed * 3) >> 1;
        }
        if (defenderItem.name() === "Choice Scarf") {
            defenderSpeed = (defenderSpeed * 3) >> 1;
        }
        if (attackerItem.name() === "Quick Powder" && this.attacker.name() === "Ditto") {
            attackerSpeed *= 2;
        }
        if (defenderItem.name() === "Quick Powder" && this.defender.name() === "Ditto") {
            defenderSpeed *= 2;
        }
        if (attackerAbility.name() === "Quick Feet" && this.attacker.status !== Statuses.NOSTATUS) {
            attackerSpeed = (attackerSpeed * 3) >> 1;
        } else if (this.attacker.status === Statuses.PARALYZED) {
            attackerSpeed >>= 2;
        }
        if (defenderAbility.name() === "Quick Feet" && this.defender.status !== Statuses.NOSTATUS) {
            defenderSpeed = (defenderSpeed * 3) >> 1;
        } else if (this.defender.status === Statuses.PARALYZED) {
            defenderSpeed >>= 2;
        }
        if (attackerAbility.name() === "Slow Start" && this.field.slowStart) {
            attackerSpeed >>= 1;
        }
        if (this.attacker.item.id === "0" && attackerAbility.name() === "Unburden" && this.attacker.unburden) {
            attackerSpeed *= 2;
        }
        if (this.defender.item.id === "0" && attackerAbility.name() === "Unburden" && this.defender.unburden) {
            defenderSpeed *= 2;
        }
        if (this.attacker.tailwind) {
            attackerSpeed *= 2;
        }
        if (this.defender.tailwind) {
            defenderSpeed *= 2;
        }

        if (this.attacker.autotomize) {
            attackerWeight -= 1000;
        }
        if (attackerAbility.name() === "Light Metal") {
            attackerWeight /= 2;
        } else if (attackerAbility.name() === "Heavy Metal") {
            attackerWeight *= 2;
        }
        if (attackerItem.name() === "Float Stone") {
            attackerWeight /= 2;
        }
        attackerWeight = Math.max(1, attackerWeight - Math.floor(attackerWeight) > 0.5 ? 1 + Math.floor(attackerWeight) : Math.floor(attackerWeight));
        
        if (this.defender.autotomize) {
            defenderWeight -= 1000;
        }
        if (defenderAbility.name() === "Light Metal") {
            defenderWeight /= 2;
        } else if (defenderAbility.name() === "Heavy Metal") {
            defenderWeight *= 2;
        }
        if (defenderItem.name() === "Float Stone") {
            defenderWeight /= 2;
        }
        defenderWeight = Math.max(1, defenderWeight - Math.floor(defenderWeight) > 0.5 ? 1 + Math.floor(defenderWeight) : Math.floor(defenderWeight));
        
        if (this.move.name() === "Seismic Toss" || this.move.name() === "Night Shade") {
            return [this.attacker.level];
        } else if (this.move.name() === "Dragon Rage") {
            return [40];
        } else if (this.move.name() === "Sonic Boom") {
            return [20];
        } else if (this.move.name() === "Guillotine" || this.move.name() === "Horn Drill" || this.move.name() === "Fissure" || this.move.name() === "Sheer Cold") {
            return [65535];
        } else if (this.move.name() === "Endeavor") {
            return [this.attacker.currentHP>=this.defender.currentHP ? 0 : this.defender.currentHP-this.attacker.currentHP];
        } else if (this.move.name() === "Psywave") {
            var range = [];
            for (var i = 0; i <= 100; i++) {
                range[i] = Math.max(1, Math.floor(this.attacker.level * (i + 50) / 100))
            }
            return range;
        } else if (this.move.name() === "Super Fang") {
            return [Math.max(1, this.defender.currentHP >> 1)];
        } else if (this.move.name() === "Weather Ball") {
            moveType = this.weatherBall(weather);
            movePower = moveType === Types.NORMAL ? 50 : 100;
        } else if (this.move.name() === "Frustration") {
            movePower = Math.max(1,Math.floor((255 - this.attacker.happiness) * 10 / 25));
        } else if (this.move.name() === "Return") {
            movePower = Math.max(1, Math.floor(this.attacker.happiness * 10 / 25));
        } else if (this.move.name() === "Payback" && this.field.targetMoved) {
            movePower *= 2;
        } else if (this.move.name() === "Electro Ball") {
            movePower = this.electroBall(attackerSpeed, defenderSpeed);
        } else if (((this.move.name() === "Avalanche" && !this.field.painSplit) || (this.move.name() === "Revenge" && !this.field.painSplit) || this.move.name === "Assurance") && this.field.attackerDamaged) {
            movePower *= 2;
        } else if (this.move.name() === "Gyro Ball") {
            movePower = this.gyroBall(attackerSpeed, defenderSpeed);
        } else if (this.move.name() === "Water Spout" || this.move.name() === "Eruption") {
            movePower = Math.max(1, Math.floor(150 * this.attacker.currentHP / this.attacker.stat(Stats.HP)));
        } else if (this.move.name() === "Punishment") {
            movePower = this.punishment(this.defender.boosts);
        } else if (this.move.name() === "Fury Cutter") {
            movePower = Math.min(160, 40 << this.field.furyCutter);
        } else if (this.move.name() === "Low Kick" || this.move.name() === "Grass Knot") { // very effective on zorodark
            movePower = this.grassKnot(defenderWeight);
        } else if (this.move.name() === "Echoed Voice") {
            movePower = Math.min(200, 40+40*field.echoedVoice);
        } else if (this.move.name() === "Hex" && this.defender.status !== Statuses.NOSTATUS) {
            movePower *= 2;
        } else if (this.move.name() === "Wring Out" || this.move.name() === "Crush Grip") {
            var r = 120 * defender.currentHP / defender.getStat(Stats.HP);
            r = (r - Math.floor(r) > 0.5) ? 1 + Math.floor(r) : Math.floor(r);
            movePower = Math.max(1, r);
        } else if (this.move.name() === "Heavy Slam" || this.move.name() === "Heat Crash") {
            movePower = this.heavySlam(attackerWeight, defenderWeight);
        } else if (this.move.name() === "Stored Power") {
            movePower = this.storedPower(this.attacker.boosts);
        } else if (this.move.name() === "Flail" || this.move.name()==="Reversal") {
            movePower = this.flail(this.attacker.currentHP, this.attacker.stat(Stats.HP));
        } else if (this.move.name() === "Trump Card") {
            movePower = this.trumpPower(this.field.trumpPP);
        } else if (this.move.name() === "Round" && this.field.roundBoost) {
            movePower *= 2;
        } else if (this.move.name() === "Wake-Up Slap" && this.defender.status === Statuses.ASLEEP) {
            movePower *= 2;
        } else if (this.move.name() === "Smelling Salts" && this.defender.status === Statuses.PARALYZED) {
            movePower *= 2;
        } else if ((this.move.name() === "Twister" || this.move.name() === "Gust") && this.field.fly) {
            movePower *= 2;
        } else if (this.move.name() === "Beat Up") {
            movePower = Math.floor(this.field.beatUpStats[this.field.beatUpHit]/10)+5;
        } else if (this.move.name() === "Hidden Power") {
            moveType = this.hiddenPowerT(this.attacker.ivs);
        } else if (this.move.name() === "Spit Up") {
            movePower = 100*this.field.stockpile;
        } else if (this.move.name() === "Pursuit" && this.field.switchOut) {
            movePower *= 2;
        } else if (this.move.name() === "Present") {
            movePower = this.field.present;
        } else if (this.move.name() === "Natural Gift" && attackerItem.name() >= 8000) {
            movePower = db.berryPower[atackerItem.id - 8000];
            moveType = db.berryType[attackerItem.id - 8000];
        } else if (this.move.name() === "Magnitude") {
            movePower = this.magnitudePower(this.field.magnitude);
        } else if (this.move.name() === "Rollout" || this.move.name() === "Ice Ball") {
            movePower = 30 << (this.field.defenseCurl + this.field.rollout);
        } else if (this.move.name() === "Fling") {
            movePower = (attackerItem.id in db.flingPower) ? db.flingPower[attackerItem.id] : 10;
        } else if ((this.move.name() === "Fire Pledge" || this.move.name() === "Water Pledge" || this.move.name() === "Grass Pledge") && this.field.pledgeBoost) {
            movePower *= 2; /* I'm assuming smogon is wrong here,
                             * fuzzy pointed out that stab is applied,
                             * so in past gens it'd have been 50*2*1.5
                             * They probably plugged in a value to test
                             * the BP and forgot STAB /ramble
                             */
        } else if (this.move.name() === "Triple Kick") {
            movePower = 10 * this.field.tripleKickCount;
        } else if ((this.move.name() === "Self-Destruct" || this.move.name() === "Explosion") && defenderAbility.name() === "Damp") {
            return [0];
        }
        var gemBoost;
        if (moveType === attackerItem.gemType()) {
            attackerItem.id = "0";
            this.attacker.item.id = "0"; // consumable for the calculation
            gemBoost = true;
        }
        if (this.move.name() === "Acrobatics") {
            if (attackerItem.name() === "(No Item)") { // gems are "used" earlier in calc and item set to 0
                movePower *= 2;
            }
        }
        
        var movePowerMod = 0x1000;
        if (attackerAbility.name() === "Technician" && movePower <= 60) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        } else if (attackerAbility.name() === "Flare Boost" && this.attacker.status === Statuses.BURNED && this.move.damageClass() === DamageClasses.SPECIAL) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        } else if (attackerAbility.name() === "Analytic" && this.field.targetMoved) {
            movePowerMod = this.chainMod(0x14CD, movePowerMod);
        } else if (attackerAbility.name() === "Reckless" && (this.move.name() === "Jump Kick" || this.move.name() === "High Jump Kick" || this.move.hasRecoil())) {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        } else if (attackerAbility.name() === "Iron Fist" && this.move.isPunch()) {
            movePowerMod = this.chainMod(0x1333, movePowerMod)
        } else if (attackerAbility.name() === "Toxic Boost" && (this.attacker.status === Statuses.POISONED || this.attacker.status === Statuses.BADLYPOISONED) && this.move.damageClass() === DamageClasses.PHYSICAL) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        } else if (attackerAbility.name() === "Rivalry") {
            if (this.attacker.gender !== this.defender.gender && this.attacker.gender !== NOGENDER) {
                movePowerMod = this.chainMod(0x1400, movePowerMod);
            } else if (this.attacker.gender === this.defender.gender && this.attacker.gender !== NOGENDER) {
                movePowerMod = this.chainMod(0xC00, movePowerMod);
            }
        } else if (attackerAbility.name() === "Sand Force" && weather === Weathers.SAND && (moveType === Types.GROUND || moveType === Types.ROCK || moveType === Types.STEEL)) {
            movePowerMod = this.chainMod(0x14CD, movePowerMod)
        } else if (attackerAbility.normalToType() !== -1 && moveType === 0) { // refrigerate, etc
            movePowerMod = this.chainMod(0x14CD, movePowerMod);
            moveType = attackerAbility.normalToType();
        } else if (attackerAbility.name() === "Normalize") {
            moveType = Types.NORMAL;
        } else if (attackerAbility.name() === "Tough Claws" && this.move.contact()) {
            movePowerMod = this.chainMod(0x1555, movePowerMod);
        } else if (attackerAbility.name() === "Strong Jaw" && this.move.bite()) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        } else if (attackerAbility.name() === "Mega Launcher" && this.move.pulse()) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        } else if (attackerAbility.name() === "Parental Bond" && this.field.parentalBond) {
            movePowerMod = this.chainMod(0x800, movePowerMod); // also probably where this goes
        }
        if (defenderAbility.name() === "Heatproof" && moveType === Types.FIRE) {
            movePowerMod = this.chainMod(0x800, movePowerMod);
        } else if (defenderAbility.name() === "Dry Skin" && moveType === Types.FIRE) {
            movePowerMod = this.chainMod(0x1400, movePowerMod);
        } else if (attackerAbility.name() === "Sheer Force" && this.move.sheerForce()) {
            movePowerMod = this.chainMod(0x14CD, movePowerMod);
        }
        if (attackerItem.typeBoosted() === moveType) {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        } else if (attackerItem.name() === "Muscle Band" && this.move.damageClass() === DamageClasses.PHYSICAL) {
            movePowerMod = this.chainMod(0x1199, movePowerMod);
        } else if (attackerItem.name() === "Lustrous Orb" && (moveType === 10 || moveType === 15) && this.attacker.name() === "Palkia") {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        } else if (attackerItem.name() === "Wise Glasses" && this.move.damageClass() === DamageClasses.SPECIAL) {
            movePowerMod = this.chainMod(0x1199, movePowerMod);
        } else if (attackerItem.name() === "Griseous Orb" && (moveType === 7 || moveType === 15) && this.attacker.name() === "Giratina-O") {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        } else if (gemBoost) {
            movePowerMod = this.chainMod(0x14CD, movePowerMod);
        } else if (attackerItem.name() === "Adamant Orb" && (moveType === 8 || moveType === 15) && this.attacker.name() === "Dialga") {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        }
        if (this.move.name() === "Facade" && this.attacker.status !== Statuses.NOSTATUS) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        } else if (this.move.name() === "Brine" && this.defender.currentHP * 2 <= this.defender.stat(Stats.HP)) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        } else if (this.move.name() === "Venoshock" && (this.attacker.status === Statuses.POISONED || this.attacker.status === Statuses.BADLYPOISONED)) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        } else if (this.move.name() === "Retaliate" && this.field.previouslyFainted) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        } else if ((this.move.name() === "Fusion Bolt" && this.field.fusionFlare) || (this.move.name() === "Fusion Flare" && this.field.fusionBolt)) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if (this.field.meFirst) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (this.move.name() === "Solar Beam" && (weather !== Weathers.SUN && weather !== Weathers.CLEAR)) {
            movePowerMod = this.chainMod(0x800, movePowerMod);
        }
        if (this.move.name() === "Knock Off"
            && this.defender.item.megaPoke() !== null
            && this.defender.item.name() !== "(No Item)"
            && !(this.defender.item.name() === "Griseous Orb" && this.defender.name().indexOf("Giratina") !== -1)
            && !(this.defender.item.name().indexOf(" Drive") !== -1 && this.defender.name().indexOf("Genesect") !== -1)
            && !(defenderAbility.name() === "Multitype" && this.defender.item.name().indexOf(" Plate") !== -1)) {
            movePowerMod = this.chainMod(0x1800, movePowerMod); // most likely it goes here, idk
            this.defender.item.id = "0";
        }
        if (this.field.charge && moveType === Types.ELECTRIC) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if (this.field.helpingHand) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (this.field.waterSport && moveType === Types.FIRE) {
            movePowerMod = this.chainMod(0x548, movePowerMod);
        }
        if (this.field.mudSport && moveType === Types.ELECTRIC) {
            movePowerMod = this.chainMod(0x548, movePowerMod);
        }
        if (moveType === Types.GRASS && this.field.grassyTerrain && this.attacker.grounded) { // both described as 50% move boost, unconfirmed
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (moveType === Types.ELECTRIC && this.field.electricTerrain && this.attacker.grounded) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if ((this.field.ionDeluge && moveType === Types.NORMAL) || this.field.electrify) {
            moveType = Types.ELECTRIC;
        }
        movePower = Math.max(1, this.applyMod(movePowerMod, movePower));
        
        var _def = this.field.wonderRoom ? Stats.SDEF : Stats.DEF;
        var _sdef = this.field.wonderRoom ? Stats.DEF : Stats.SDEF;
        var unawareA = attackerAbility.name() === "Unaware";
        var unawareD = defenderAbility.name() === "Unaware";
        if (this.move.name() === "Foul Play") {
            if (unawareA) {
                def = this.defender.stat(_def);
                sdef = this.defender.stat(_sdef);
                atk = this.defender.stat(Stats.ATK);
            } else {
                def = crit ? Math.min(this.defender.stat(_def), this.defender.boostedStat(_def))
                           : this.defender.boostedStat(_def);
                sdef = crit ? Math.min(this.defender.stat(_sdef), this.defender.boostedStat(_sdef))
                            : this.defender.boostedStat(_sdef);
                atk = crit ? Math.max(this.defender.stat(Stats.ATK), this.defender.boostedStat(Stats.ATK))
                           : this.defender.boostedStat(Stats.ATK);
            }
            if (unawareD) {
                satk = this.attacker.stat(Stats.SATK);
            } else {
                satk = crit ? Math.max(this.attacker.stat(Stats.SATK), this.attacker.boostedStat(Stats.SATK))
                            : this.attacker.boostedStat(Stats.SATK);
            }
        } if (this.move.name() === "Chip Away" || this.move.name() === "Sacred Sword") {
            def = this.defender.stat(_def);
            sdef = this.defender.stat(_sdef);
            if (unawareD) {
                atk = this.attacker.stat(Stats.ATK);
                satk = this.attacker.stat(Stats.SATK);
            } else {
                atk = crit ? Math.max(this.attacker.stat(Stats.ATK), this.attacker.boostedStat(Stats.ATK))
                           : this.attacker.boostedStat(Stats.ATK);
                satk = crit ? Math.max(this.attacker.stat(Stats.SATK), this.attacker.boostedStat(Stats.SATK))
                            : this.attacker.boostedStat(Stats.SATK);
            }
        } else {
            if (unawareA) {
                def = this.defender.stat(_def);
                sdef = this.defender.stat(_sdef);
            } else {
                def = crit ? Math.min(this.defender.stat(_def), this.defender.boostedStat(_def)) : this.defender.boostedStat(_def);
                sdef = crit ? Math.min(this.defender.stat(_sdef), this.defender.boostedStat(_sdef)) : this.defender.boostedStat(_sdef);
            }
            if (unawareD) {
                atk = this.attacker.stat(Stats.ATK);
                satk = this.attacker.stat(Stats.SATK);
            } else {
                atk = crit ? Math.max(this.attacker.stat(Stats.ATK), this.attacker.boostedStat(Stats.ATK)) : this.attacker.boostedStat(Stats.ATK);
                satk = crit ? Math.max(this.attacker.stat(Stats.SATK), this.attacker.boostedStat(Stats.SATK)) : this.attacker.boostedStat(Stats.SATK);
            }
        }
        
        var atkMod = 0x1000, satkMod = 0x1000;
        if (defenderAbility.name() === "Thick Fat" && (moveType === Types.FIRE || moveType === Types.ICE)) {
            atkMod = this.chainMod(0x800, atkMod);
            satkMod = this.chainMod(0x800, satkMod);
        }
        if (attackerAbility.pinchType() === moveType && this.attacker.stat(Stats.HP) >= this.attacker.currentHP * 3) {
            atkMod = this.chainMod(0x1800, atkMod); // blaze, torrent, overgrow, ...
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Guts" && this.defender.status !== Statuses.NOSTATUS) {
            atkMod = this.chainMod(0x1800, atkMod);
        }
        if ((attackerAbility.name() === "Plus" && this.field.minus) || (attackerAbility.name() === "Minus" && this.field.plus)) {
            atkMod = this.chainMod(0x1800, atkMod);
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Defeatist" && this.attacker.currentHP*2 <= this.attacker.stat(Stats.HP)) {
            atkMod = this.chainMod(0x800, atkMod);
            satkMod = this.chainMod(0x800, satkMod);
        }
        if (attackerAbility.name() === "Huge Power" || attackerAbility.name() === "Pure Power") {
            atkMod = this.chainMod(0x2000, atkMod);
        }
        if (attackerAbility.name() === "Solar Power" && weather === Weathers.SUN) {
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Hustle") {
            atk = this.applyMod(0x1800, atk);
        }
        if (attackerAbility.name() === "Flash Fire" && this.field.flashFire && moveType === Types.FIRE) {
            atkMod = this.chainMod(0x1800, atkMod);
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Slow Start" && this.field.slowStart) {
            atkMod = this.chainMod(0x800, atkMod);
        }
        if (this.attacker.flowerGift && weather === Weathers.SUN) {
            atkMod = this.chainMod(0x1800, atkMod);
        }
        if (attackerItem.name() === "Thick Club" && (this.attacker.name() === "Cubone" || this.attacker.name() === "Marowak")) {
            atkMod = this.chainMod(0x2000, atkMod);
        }
        if (attackerItem.name() === "Deep Sea Tooth" && this.attacker.name() === "Clamperl") {
            satkMod = this.chainMod(0x2000, satkMod);
        }
        if (attackerItem.name() === "Light Ball" && this.attacker.name() === "Pikachu") {
            atkMod = this.chainMod(0x2000, atkMod);
            satkMod = this.chainMod(0x2000, satkMod);
        }
        if (attackerItem.name() === "Soul Dew" && (this.attacker.name() === "Latias" || this.attacker.name() === "Latios")) {
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerItem.name() === "Choice Band") {
            atkMod = this.chainMod(0x1800, atkMod);
        }
        if (attackerItem.name() === "Choice Specs") {
            satkMod = this.chainMod(0x1800, satkMod);
        }
        atk = this.applyMod(atkMod, atk);
        satk = this.applyMod(satkMod, satk);
        
        if (weather === Weathers.SAND && (this.defender.type1() === Types.ROCK || this.defender.type2() === Types.ROCK)) {
            sdef = this.applyMod(0x1800, sdef);
        }
        var defMod = 0x1000, sdefMod = 0x1000;
        if (defenderAbility.name() === "Marvel Scale" && this.defender.status !== Statuses.NOSTATUS) {
            defMod = this.chainMod(0x1800, defMod);
        }
        if (defenderAbility.name() === "Grass Pelt" && this.field.grassyTerrain) { // unconfirmed
            defMod = this.chainMod(0x1800, defMod);
        }
        if (this.defender.flowerGift && weather === Weathers.SUN) {
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        if (defenderItem.name() === "Deep Sea Scale" && this.defender.name() === "Clamperl") {
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        if (defenderItem.name() === "Metal Powder" && this.defender.name() === "Ditto") {
            defMod = this.chainMod(0x2000, defMod);
        }
        if (defenderItem.name() === "Eviolite" && this.defender.hasEvolution()) {
            defMod = this.chainMod(0x1800, defMod);
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        if (defenderItem.name() === "Soul Dew" && (this.defender.name() === "Latias" || this.defender.name() === "Latios")) {
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        def = this.applyMod(defMod, def);
        sdef = this.applyMod(sdefMod, sdef);
        
        var a = 0, d = 0;
        if (this.move.name() === "Psyshock" || this.move.name() === "Psystrike" || this.move.name() === "Secret Sword") {
            a = satk;
            d = def;
        } else if (this.move.damageClass() === DamageClasses.PHYSICAL) {
            a = atk;
            d = def;
        } else {
            a = satk;
            d = sdef;
        }
        
        var baseDamage = Math.floor(Math.floor((Math.floor(2 * this.attacker.level / 5) + 2) * movePower * a / d) / 50) + 2;

        if (this.field.multiBattle && this.move.multiTargets()) {
            baseDamage = this.applyMod(0xC00, baseDamage);
        }

        if (weather === Weathers.SUN) {
            if (moveType === Types.FIRE) {
                baseDamage = this.applyMod(0x1800, baseDamage);
            } else if (moveType === Types.WATER) {
                baseDamage = this.applyMod(0x800, baseDamage);
            }
        } else if (weather === Weathers.RAIN) {
            if (moveType === Types.WATER) {
                baseDamage = this.applyMod(0x1800, baseDamage);
            } else if (moveType === Types.FIRE) {
                baseDamage = this.applyMod(0x800, baseDamage);
            }
        }

        if (crit) { // I'm guessing this is how GameFreak does it, although I believe x1.5 round down has the same effect anyway
            baseDamage = this.applyMod(0x1800, baseDamage);
        }

        // now we diverge into the randomization, wheeee
        var damages = [];
        for (var i=0; i<16; i++) {
            damages[i] = Math.floor(baseDamage * (85 + i) / 100);
        }

        if (this.attacker.stab(moveType)) {
            if (attackerAbility.name() === "Adaptability") {
                damages = this.applyModA(0x2000, damages);
            } else {
                damages = this.applyModA(0x1800, damages);
            }
        }

        var attackTypes = [moveType, this.move.name() === "Flying Press" ? Types.FLYING : Types.CURSE];
        var eff = 0;
        if (this.field.invertedBattle) {
            eff = this.invertedEffective(attackTypes,
                                         [this.defender.type1(), this.defender.type2(), this.defender.addedType],
                                         this.field.foresight || attackerAbility.name() === "Scrappy");
        } else {
            eff = this.effective(attackTypes,
                                 [this.defender.type1(), this.defender.type2(), this.defender.addedType],
                                 this.field.foresight || attackerAbility.name() === "Scrappy",
                                 this.move.name() === "Freeze-Dry");
        }
        
        for (var i = 0; i < damages.length; i++) {
            damages[i] = (damages[i] * eff) >> 6;
        }

        if (this.attacker.status === Statuses.BURNED && this.move.damageClass() === DamageClasses.PHYSICAL && attackerAbility.name() !== "Guts") {
            for (var i = 0; i < damages.length; i++) {
                damages[i] = damages[i] >> 1;
            }
        }

        for (var i = 0; i < damages.length; i++) {// ensure one damage
            damages[i] = Math.max(1, damages[i]);
        }

        var finalMod = 0x1000;
        if (this.field.reflect && !crit
                               && (this.move.damageClass === DamageClasses.PHYSICAL
                                   || this.move.name() === "Psyshock"
                                   || this.move.name() === "Psystrike"
                                   || this.move.name() === "Secret Sword")
                               && attackerAbility.name() !== "Infiltrator") {
            finalMod = chainMod(this.field.multiBattle ? 0xA8F : 0x800, finalMod);
        } else if (this.field.lightScreen && !crit
                                          && (this.move.damageClass === DamageClasses.SPECIAL
                                              && !this.move.name() === "Psyshock"
                                              && !this.move.name() === "Psystrike"
                                              && !this.move.name() === "Secret Sword")
                                          && attackerAbility.name() !== "Infiltrator") {
            finalMod = chainMod(this.field.multiBattle ? 0xA8F : 0x800, finalMod);
        }
        if (defenderAbility.name() === "Multiscale" && this.defender.currentHP === this.defender.stat(Stats.HP)) {
            finalMod = this.chainMod(0x800, finalMod);
        }
        if (attackerAbility.name() === "Tinted Lens" && eff < 64) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        if (this.field.friendGuard) {
            finalMod = this.chainMod(0xC00, finalMod);
        }
        if (attackerAbility.name() === "Sniper" && crit) {
            finalMod = this.chainMod(0x1800, finalMod);
        }
        if ((defenderAbility.name() === "Filter" || defenderAbility.name() === "Solid Rock") && eff > 64) {
            finalMod = this.chainMod(0xC00, finalMod);
        }
        if (attackerItem.name() === "Metronome") {
            finalMod = this.chainMod(this.field.metronome <= 4 ? (0x1000 + this.field.metronome * 0x333) : 0x2000, finalMod);
        }
        if (attackerItem.name() === "Expert Belt" && eff > 64) {
            finalMod = this.chainMod(0x1333, finalMod);
        }
        if (attackerItem.name() === "Life Orb") {
            finalMod = this.chainMod(0x14CC, finalMod);
        }
        if (defenderItem.berryType() === moveType && (eff > 64 || moveType === Types.NORMAL)) {
            finalMod = this.chainMod(0x800, finalMod);
            this.defender.item.id = "0";
        }
        if (this.field.minimize && (this.move.name() === "Stomp" || this.move.name() === "Steamroller" || this.move.name() === "Phantom Force" || this.move.name() === "Flying Press")) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        if (this.field.dig && (this.move.name() === "Earthquake" || this.move.name() === "Magnitude")) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        if (this.field.dive && (this.move.name() === "Surf" || this.move.name() === "Whirlpool")) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        if (this.field.mistyTerrain && this.defender.grounded) { // unconfirmed
            finalMod = this.chainMod(0x800, finalMod); // it says that it "divides damage" by half, not attack
        }
        if (defenderAbility.name() === "Fur Coat") { // unconfirmed
            finalMod = this.chainMod(0x800, finalMod);
        }
        if ((this.field.fairyAura && moveType === Types.FAIRY) || (this.field.darkAura && moveType === Types.DARK)) {
            if (this.field.auraBreak) {
                finalMod = this.chainMod(0xAAA, finalMod);
            } else {
                finalMod = this.chainMod(0x1555, finalMod);
            }
        }
        this.applyModA(finalMod, damages);
        
        if (defenderAbility.name() === "Sturdy") {
            for (var i = 0; i < damages.length; i++) {
                damages[i] = Math.min(damages.length, this.defender.stat(Stats.HP) - 1);
            }
        }
        
        return damages;
    }
    
    this.rby_calculate = function() {
        // massive shoutout to Crystal_ for verifying the RBY/GSC mechanics for me
        if (this.move.name() === "Seismic Toss" || this.move.name() === "Night Shade") {
            return [this.attacker.level];
        } else if (this.move.name() === "Dragon Rage") {
            return [40];
        } else if (this.move.name() === "Sonic Boom") {
            return [20];
        } else if (this.move.name() === "Guillotine" || this.move.name() === "Horn Drill" || this.move.name() === "Fissure") {
            return [65535];
        } else if (this.move.name() === "Psywave") {
            var range = [];
            for (var i = 1; i <= Math.floor(this.attacker.level*3/2-1); i++) {
                range[i-1] = i;
            }
            return range;
        } else if (this.move.name() === "Super Fang") {
            return [Math.max(1, this.defender.currentHP >> 1)];
        }
        var lvl, atk, def, spc_a, spc_d;
        if (this.field.critical) {
            lvl = this.attacker.level * 2;
            atk = this.attacker.stat(Stats.ATK);
            def = this.defender.stat(Stats.DEF);
            spc_a = this.attacker.stat(Stats.SPC);
            spc_d = this.defender.stat(Stats.SPC);
        } else {
            lvl = this.attacker.level;
            atk = Math.min(999, this.attacker.boostedStat(Stats.ATK) >> (this.attacker.status === Statuses.BURNED ? 1 : 0));
            def = Math.min(999, this.defender.boostedStat(Stats.DEF));
            spc_a = Math.min(999, this.attacker.boostedStat(Stats.SPC));
            spc_d = Math.min(999, this.defender.boostedStat(Stats.SPC));
        }
        if (this.field.reflect && !this.field.critical) {
            def *= 2;
        }
        if (this.field.lightScreen && !this.field.critical) {
            spc_d *= 2;
        }
        if (this.move.name() === "Explosion" || this.move.name() === "Self-Destruct") {
            def >>= 1;
        }
        
        var a = (db.typeDamageClass[this.move.type()] === DamageClasses.PHYSICAL) ? atk : spc_a;
        var d = (db.typeDamageClass[this.move.type()] === DamageClasses.PHYSICAL) ? def : spc_d;
        
        if ((a > 255) || (d > 255)) { // is attack or defense greater than 255?
            a = (a >> 2) & 0xFF;
            d = (d >> 2) & 0xFF;
        }
        
        d = Math.max(1, d);
        
        var baseDamage = Math.min(997, Math.floor(Math.floor((Math.floor(2 * lvl / 5) + 2) * a * this.move.power() / d) / 50)) + 2;
        if (this.attacker.stab(this.move.type())) {
            baseDamage = (baseDamage * 3) >> 1;
        }
        baseDamage = (baseDamage * this.effective([this.move.type()],
                                                  [this.defender.type1(), this.defender.type2()],
                                                  false,
                                                  false)) >> 2;
        // 768+ not having damage variance seems to be proven false.
        damages = [];
        for (var i = 0; i < 39; i++) {
            damages[i] = Math.floor(baseDamage * (217 + i) / 255);
        }
        return damages;
    }
    
    this.gsc_calculate = function() {
        // massive shoutout to Crystal_ for verifying the RBY/GSC mechanics for me
        
        var moveType = this.move.type();
        var movePower = this.move.power();
        
        if (this.move.name() === "Hidden Power") {
            moveType = 1 + (((this.attacker.ivs[Stats.ATK] & 3) << 2) | (this.attacker.ivs[Stats.DEF] & 3));
            movePower = 31 + ((5 * ((this.attacker.ivs[Stats.SPC] >> 3)
                                     | ((this.attacker.ivs[Stats.SPD] >> 2) & 2)
                                     | ((this.attacker.ivs[Stats.DEF] >> 1) & 4)
                                     | (this.attacker.ivs[Stats.ATK] & 8)
                                   ) + (this.attacker.ivs[Stats.SPC] & 3)
                              ) >> 1
                             );
        } else if (this.move.name() === "Reversal" || this.move.name() === "Flail") {
            movePower = this.flail(this.attacker.currentHP, this.attacker.stat(Stats.HP));
        } else if (this.move.name() === "Frustration") {
            movePower = Math.max(1, Math.floor((255 - this.attacker.happiness) * 10 / 25));
        } else if (this.move.name() === "Return") {
            movePower = Math.max(1, Math.floor(this.attacker.happiness * 10 / 25));
        } else if (this.move.name() === "Future Sight") {
            moveType = 18; // curse so there is no type effectiveness nor stab
        } else if (this.move.name() === "Magnitude") {
            movePower = this.magnitudePower(this.field.magnitude);
        } else if (this.move.name() === "Present") {
            movePower = this.field.present;
        } else if (this.move.name() === "Seismic Toss" || this.move.name() === "Night Shade") {
            return [this.attacker.level];
        } else if (this.move.name() === "Dragon Rage") {
            return [40];
        } else if (this.move.name() === "Sonic Boom") {
            return [20];
        } else if (this.move.name() === "Guillotine" || this.move.name() === "Horn Drill" || this.move.name() === "Fissure") {
            return [65535];
        } else if (this.move.name() === "Psywave") {
            var range = [];
            for (var i = 1; i <= Math.floor(this.attacker.level * 3 / 2 - 1); i++) {
                range[i-1] = i;
            }
            return range;
        } else if (this.move.name() === "Super Fang") {
            return [Math.max(1, this.defender.currentHP >> 1)];
        } else if (this.move.name() === "Rollout") {
            movePower = 30<<(this.field.defenseCurl+this.field.rollout);
        } else if (this.move.name() === "Triple Kick") {
            movePower = 10*this.field.tripleKickCount;
        } else if (this.move.name() === "Fury Cutter") {
            movePower = Math.min(160, 10 << this.field.furyCutter);
        } else if (this.move.name() === "Beat Up") {
            moveType = Types.CURSE;
        }
        if ((this.move.name() === "Magnitude" || this.move.name() === "Earthquake") && this.field.dig) {
            movePower *= 2;
        } else if ((this.move.name() === "Gust" || this.move.name() === "Twister") && this.field.fly) {
            movePower *= 2;
        }
        
        lvl = this.attacker.level;
        var crit = this.field.critical && this.move.name() !== "Reversal" && this.move.name() !== "Flail" && this.move.name() !== "Future Sight"; // moves can't crit
        var ignoreAtkBoosts = crit && !(this.attacker.boost(Stats.ATK) > this.defender.boost(Stats.DEF));
        var ignoreSpcBoosts = crit && !(this.attacker.boost(Stats.SATK) > this.defender.boost(Stats.SDEF));
        var atk = Math.min(999, this.attacker.boostedStat(Stats.ATK) >> (this.attacker.status===Statuses.BURNED ? 1 : 0));
        var def = Math.min(999, this.defender.boostedStat(Stats.DEF));
        var satk = Math.min(999, this.attacker.boostedStat(Stats.SATK));
        var sdef = Math.min(999, this.defender.boostedStat(Stats.SDEF));
        if (ignoreAtkBoosts) { // crits are weird. thanks to crystal_ and the gsc community on the mt. silver boards
            atk = this.attacker.stat(Stats.ATK);
            def = this.defender.stat(Stats.DEF);
        }
        if (ignoreSpcBoosts) {
            satk = this.attacker.stat(Stats.SATK);
            sdef = this.defender.stat(Stats.SDEF);
        }
        if (this.field.reflect && !ignoreAtkBoosts) {
            def *= 2;
        }
        if (this.field.lightScreen && !ignoreSpcBoosts) {
            sdef *= 2;
        }
        if (this.attacker.name() === "Pikachu" && this.attacker.item.name() === "Light Ball") {
            satk *= 2;
        }
        if ((this.attacker.name() === "Marowak" || this.attacker.name() === "Cubone") && this.attacker.item.name() === "Thick Club") {
            atk *= 2;
        }
        if (this.move.name() === "Explosion" || this.move.name() === "Self-Destruct") {
            def >>= 1;
        }
        if (this.attacker.name() === "Ditto" && this.attacker.item.name() === "Metal Powder") {
            sdef = (spc_d * 3) >> 1;
            def = (def * 3) >> 1;
        }
        
        var a = (db.typeDamageClass[moveType] === DamageClasses.PHYSICAL) ? atk : satk;
        var d = (db.typeDamageClass[moveType] === DamageClasses.PHYSICAL) ? def : sdef;
        
        if ((a > 255) || (d > 255)) { // is attack or defense greater than 255?
            a = (a >> 2) & 0xFF;
            d = (d >> 2) & 0xFF;
        }
        d = Math.max(1, d);
        
        if (this.move.name() === "Beat Up") {
            a = this.field.beatUpStats[this.field.beatUpHit];
            lvl = this.field.beatUpLevels[this.field.beatUpHit];
            d = this.defender.baseStat(Stats.DEF);
        }
        
        var baseDamage = Math.floor(Math.floor((Math.floor(2 * lvl / 5) + 2) * a * movePower / d) / 50);
        
        baseDamage *= crit ? 2 : 1;
        
        if (moveType === this.attacker.item.typeBoosted()) {
            baseDamage = Math.floor(baseDamage * 110 / 100);
        }
        
        baseDamage = Math.min(997, baseDamage)+2;
        
        if (this.field.weather === Weathers.SUN) {
            if (moveType === Types.FIRE) {
                baseDamage = (baseDamage * 3) >> 1;
            } else if (moveType === Types.WATER) {
                baseDamage >>= 1;
            }
        } else if (this.field.weather === Weathers.RAIN) {
            if (moveType === Types.WATER) {
                baseDamage = (baseDamage * 3) >> 1;
            } else if (moveType === Types.FIRE || this.move.name() === "Solar Beam") {
                baseDamage >>= 1;
            }
        }
        
        if (this.move.name() === "Pursuit" && this.field.switchOut) {
            baseDamage *= 2;
        }
        
        if (this.attacker.stab(moveType)) {
            baseDamage = (baseDamage * 3) >> 1;
        }
        
        baseDamage = (baseDamage * this.effective([moveType],
                                                  [this.defender.type1(), this.defender.type2()],
                                                  this.field.foresight,
                                                  false)) >> 2;
        // 768+ not having damage variance seems to be proven false.
        if (this.move.name() === "Reversal" || this.move.name() === "Flail") { // these don't have damage variance
            return [baseDamage];
        }
        
        damages = [];
        for (var i = 0; i < 39; i++) {
            damages[i] = Math.floor(baseDamage * (217 + i) / 255);
        }
        return damages;
    }
    
    this.adv_calculate = function() {
        var moveType = this.move.type();
        var movePower = this.move.power();
        var attackerAbility = new Ability();
        attackerAbility.id = this.attacker.ability.id;
        var defenderAbility = new Ability();
        defenderAbility.id = this.defender.ability.id;
        if (this.move.sound() && defenderAbility.name() === "Soundproof") {
            return [0];
        }
        var attackerItem = new Item();
        attackerItem.id = this.attacker.item.id;
        var defenderItem = new Item();
        defenderItem.id = this.defender.item.id;
        var weather = airLock ? Weathers.CLEAR : this.field.weather;
        if (this.move.name() === "Hidden Power") {
            movePower = this.hiddenPowerP(this.attacker.ivs);
            moveType = this.hiddenPowerT(this.attacker.ivs);
        } else if (this.move.name() === "Reversal" || this.move.name() === "Flail") {
            movePower = this.flail(this.attacker.currentHP, this.attacker.stat(Stats.HP));
        } else if (this.move.name() === "Frustration") {
            movePower = Math.max(1, Math.floor((255 - this.attacker.happiness) * 10 / 25));
        } else if (this.move.name() === "Return") {
            movePower = Math.max(1,Math.floor(this.attacker.happiness * 10 / 25));
        } else if (this.move.name() === "Future Sight" || this.move.name() === "Doom Desire") {
            moveType = 18; // curse so there is no type effectiveness nor stab
        } else if (this.move.name() === "Magnitude") {
            movePower = this.magnitudePower(this.field.magnitude);
        } else if (this.move.name() === "Present") {
            movePower = this.field.present;
        } else if (this.move.name() === "Seismic Toss" || this.move.name() === "Night Shade") {
            return [this.attacker.level];
        } else if (this.move.name() === "Dragon Rage") {
            return [40];
        } else if (this.move.name() === "Sonic Boom") {
            return [20];
        } else if (this.move.name() === "Guillotine" || this.move.name() === "Horn Drill" || this.move.name() === "Fissure" || this.move.name() === "Sheer Cold") {
            return [65535];
        } else if (this.move.name() === "Endeavor") {
            return [this.attacker.currentHP >= this.defender.currentHP ? 0 : this.defender.currentHP - this.attacker.currentHP];
        } else if (this.move.name() === "Psywave") {
            var temp = [];
            for (var i = 0; i <= 10; i++) {
                temp[i] = Math.max(1, Math.floor(this.attacker.level * (i * 10 + 50) / 100));
            }
            return temp;
        } else if (this.move.name() === "Super Fang") {
            return [Math.max(1, this.defender.currentHP >> 1)];
        } else if (this.move.name() === "Weather Ball") {
            moveType = this.weatherBall(weather);
        } else if (this.move.name() === "Rollout" || this.move.name() === "Ice Ball") {
            movePower = 30<<(this.field.defenseCurl+this.field.rollout);
        } else if (this.move.name() === "Triple Kick") {
            movePower = 10*this.field.tripleKickCount;
        } else if (this.move.name() === "Water Spout" || this.move.name() === "Eruption") {
            movePower = Math.max(1, Math.floor(150*this.attacker.currentHP/this.attacker.stat(Stats.HP)));
        } else if (this.move.name() === "Fury Cutter") {
            movePower = Math.min(160, 10 << this.field.furyCutter);
        } else if (this.move.name() === "Beat Up") {
            moveType = Types.CURSE;
        }
        if ((this.move.name() === "Surf" || this.move.name() === "Whirlpool") && this.field.dive) {
            movePower *= 2;
        } else if ((this.move.name() === "Magnitude" || this.move.name() === "Earthquake") && this.field.dig) {
            movePower *= 2;
        } else if ((this.move.name() === "Gust" || this.move.name() === "Twister") && this.field.fly) {
            movePower *= 2;
        }
        
        var atk = this.attacker.stat(Stats.ATK);
        var def = this.defender.stat(Stats.DEF);
        var satk = this.attacker.stat(Stats.SATK);
        var sdef = this.attacker.stat(Stats.SDEF);
        var crit = this.field.critical && this.move.name() !== "Reversal"
                                       && this.move.name() !== "Flail"
                                       && this.move.name() !== "Future Sight"
                                       && this.move.name() !== "Doom Desire"
                                       && this.move.name() !== "Spit Up"
                                       && defenderAbility.name() !== "Battle Armor";

        if (attackerAbility.name() === "Huge Power" || attackerAbility.name() === "Pure Power") {
            atk *= 2;
        }
        if (attackerItem.typeBoosted() === moveType) {
            if (db.typeDamageClass[moveType] === DamageClasses.PHYSICAL) { // make sure we are boosting the right stat
                atk = Math.floor(atk * 11 / 10);
            } else {
                satk = Math.floor(satk * (attackerItem.name() === "Sea Incense" ? 105 : 110) / 100); // sea incense is 1.05
            }
        }
        if (attackerItem.name() === "Choice Band") {
            atk = (atk * 3) >> 1;
        }
        if (attackerItem.name() === "Soul Dew") {
            satk = (satk * 3) >> 1;
        }
        if (defenderItem.name() === "Soul Dew") {
            sdef = (sdef * 3) >> 1;
        }
        if (attackerItem.name() === "DeepSeaTooth" && this.attacker.name() === "Clamperl") {
            satk *= 2;
        }
        if (defenderItem.name() === "DeepSeaScale" && this.defender.name() === "Clamperl") {
            sdef *= 2;
        }
        if (attackerItem.name() === "Light Ball" && this.attacker.name() === "Pikachu") {
            satk *= 2;
        }
        if (defenderItem.name() === "Metal Powder" && this.defender.name() === "Ditto") {
            def *= 2;
        }
        if (attackerItem.name() === "Thick Club" && (this.attacker.name() === "Marowak" || this.defender.name() === "Cubone")) {
            atk *= 2;
        }
        if (defenderAbility.name() === "Thick Fat" && (moveType === Types.FIRE || moveType === Types.ICE)) {
            satk >>= 1;
        }
        if (attackerAbility.name() === "Hustle") {
            atk = (atk * 3) >> 1;
        }
        if ((attackerAbility.name() === "Plus" && this.field.minus) || (attackerAbility.name() === "Minus" && this.field.plus)) {
            satk = (satk * 3) >> 1;
        }
        if (attackerAbility.name() === "Guts" && this.attacker.status !== Statuses.NOSTATUS) {
            atk = (atk * 3) >> 1;
        }
        if (defenderAbility.name() === "Marvel Scale" && this.defender.status !== Statuses.NOSTATUS) {
            def = (def * 3) >> 1;
        }
        if ((this.field.mudSport && moveType === Types.ELECTRIC) || (this.field.waterSport && moveType === Types.FIRE)) {
            movePower >>= 1;
        }
        if (attackerAbility.pinchType() === moveType && this.attacker.stat(Stats.HP) >= this.attacker.currentHP * 3) {
            movePower = (movePower * 3) >> 1;
        }
        if (this.move.name() === "Self-Destruct" || this.move.name() === "Explosion") {
            if (defenderAbility.name() === "Damp") return [0];
            def >>= 1;
        }
        if (crit) {
            atk = Math.floor((this.attacker.boosts[Stats.ATK] > 0 ? 2 + this.attacker.boosts[Stats.ATK] : 2) * atk / 2);
            satk = Math.floor((this.attacker.boosts[Stats.SATK] > 0 ? 2 + this.attacker.boosts[Stats.SATK] : 2) * satk / 2);
            def = Math.floor(2 * def / (this.defender.boosts[Stats.DEF] < 0 ? 2 - this.defender.boosts[Stats.DEF] : 2));
            sdef = Math.floor(2 * sdef / (this.defender.boosts[Stats.SDEF] < 0 ? 2 - this.defender.boosts[Stats.SDEF] : 2));
        } else {
            atk = Math.floor(atk * (this.attacker.boosts[Stats.ATK] > 0 ? 2 + this.attacker.boosts[Stats.ATK] : 2) / (this.attacker.boosts[Stats.ATK] < 0 ? 2 - this.attacker.boosts[Stats.ATK] : 2));
            satk = Math.floor(satk * (this.attacker.boosts[Stats.SATK] > 0 ? 2 + this.attacker.boosts[Stats.SATK] : 2) / (this.attacker.boosts[Stats.SATK] < 0 ? 2 - this.attacker.boosts[Stats.SATK] : 2));
            def = Math.floor(def * (this.defender.boosts[Stats.DEF] > 0 ? 2 + this.defender.boosts[Stats.DEF] : 2) / (this.defender.boosts[Stats.DEF] < 0 ? 2 - this.defender.boosts[Stats.DEF] : 2));
            sdef = Math.floor(sdef*(this.defender.boosts[Stats.SDEF] > 0 ? 2 + this.defender.boosts[Stats.SDEF] : 2) / (this.defender.boosts[Stats.SDEF] < 0 ? 2 - this.defender.boosts[Stats.SDEF] : 2));
        }

        a = (db.typeDamageClass[moveType] === DamageClasses.PHYSICAL) ? atk : satk;
        d = (db.typeDamageClass[moveType] === DamageClasses.PHYSICAL) ? def : sdef;
        if (this.move.name() === "Beat Up") {
            a = this.field.beatUpStats[this.field.beatUpHit];
            lvl = this.field.beatUpLevels[this.field.beatUpHit];
            d = this.defender.baseStat(Stats.DEF);
        }
        
        var baseDamage = Math.floor(Math.floor((Math.floor(2 * this.attacker.level / 5) + 2) * a * movePower / d) / 50);
        
        if (this.attacker.status === Statuses.BURNED && attackerAbility.name() !== "Guts" && this.move.name() !== "Beat Up") {
            baseDamage >>= 1;
        }
        if ((this.field.reflect && db.typeDamageClass[moveType] === DamageClasses.PHYSICAL) || (this.field.lightScreen && db.typeDamageClass[moveType] === DamageClasses.SPECIAL)) {
            if (!crit && this.move.name() !== "Beat Up") {
                if (this.field.multiBattle) {
                    baseDamage = Math.floor(baseDamage * 2 / 3);
                } else {
                    baseDamage >>= 1;
                }
            }
        }
                
        if (this.field.multiBattle && this.move.multiTargets()) {
            baseDamage >>= 1;
        }
        
        if (weather === Weathers.SUN) {
            if (moveType === Types.FIRE) {
                baseDamage = (baseDamage * 3) >> 1;
            } else if (moveType === Types.WATER) {
                baseDamage >>= 1;
            }
        } else if (weather === Weathers.RAIN) {
            if (moveType === Types.WATER) {
                baseDamage = (baseDamage * 3) >> 1;
            } else if (moveType === Types.FIRE) {
                baseDamage >>= 1;
            }
        }
        if (weather !== Weathers.CLEAR && weather !== Weathers.SUN && this.move.name() === "Solar Beam") {
            baseDamage >>= 1;
        }
        
        if (attackerAbility.name() === "Flash Fire" && moveType === Types.FIRE && this.field.flashFire) {
            baseDamage = (baseDamage * 3) >> 1;
        }
        
        if (db.typeDamageClass[moveType] === DamageClasses.PHYSICAL) {
            baseDamage = Math.max(1, baseDamage);
        }
        
        baseDamage += 2;
        
        baseDamage *= crit ? 2 : 1;
        
        if (this.move.name() === "Facade" && this.attacker.status !== NONE) {
            baseDamage *= 2;
        } else if (this.move.name() === "Pursuit" && this.field.switchOut) {
            baseDamage *= 2;
        } else if (this.move.name() === "Revenge" && this.field.attackerDamaged) {
            baseDamage *= 2;
        } else if (this.move.name() === "Smelling Salts" && this.defender.status === Statuses.PARALYZED) {
            baseDamage *= 2;
        } else if ((this.move.name() === "Stomp" || this.move.name() === "Extrasensory" || this.move.name() === "Astonish" || this.move.name() === "Needle Arm") && this.field.minimize) {
            baseDamage *= 2;
        } else if (this.move.name() === "Weather Ball" && weather !== Weathers.CLEAR) {
            baseDamage *= 2;
        }
        
        if (this.field.charge && moveType === Types.ELECTRIC) {
            baseDamage *= 2;
        }
        
        if (this.field.helpingHand) {
            baseDamage = (baseDamage * 3) >> 1;
        }
        
        if (this.attacker.stab(moveType)) {
            baseDamage = (baseDamage * 3) >> 1;
        }
        
        baseDamage = (baseDamage * this.effective([moveType],
                                                  [this.defender.type1(), this.defender.type2()],
                                                  this.field.foresight,
                                                  false)) >> 2;
        
        if (this.move.name() === "Spit Up") {
            return [this.field.stockpile > 0 ? baseDamage : 0]
        }
        
        var damages = [];
        for (var i = 0; i < 16; i++) {
            damages[i] = Math.max(1, Math.floor(baseDamage * (85 + i) / 100));
        }
        if (defenderAbility.name() === "Sturdy") {
            for (var i = 0; i < damages.length; i++) {
                damages[i] = Math.min(damages.length, this.defender.stat(Stats.HP) - 1);
            }
        }
        return damages;
    }
    
    this.hgss_calculate = function() {
        var moveType = this.move.type();
        var movePower = this.move.power();
        var attackerAbility = new Ability();
        attackerAbility.id = this.attacker.ability.id;
        var defenderAbility = new Ability();
        defenderAbility.id = this.defender.ability.id;
        if (attackerAbility.name() === "Mold Breaker" && defenderAbility.ignorable()) {
            defenderAbility.id = "0";
        }
        if (this.move.sound() && defenderAbility.name() === "Soundproof") {
            return [0];
        }
        var attackerItem = new Item();
        var attackerItem = new Item();
        attackerItem.id = attackerAbility.name() === "Klutz" ? "0" : this.attacker.item.id;
        var defenderItem = new Item();
        defenderItem.id = defenderAbility.name() === "Klutz" ? "0" : this.defender.item.id;
        var weather = this.field.airLock ? Weathers.CLEAR : this.field.weather;
        
        var attackerSpeed = attackerAbility.name() === "Simple" ? this.attacker.simpleBoostedStat(Stats.SPD) : this.attacker.boostedStat(Stats.SPD);
        var defenderSpeed = defenderAbility.name() === "Simple" ? this.defender.simpleBoostedStat(Stats.SPD) : this.defender.boostedStat(Stats.SPD);
        if ((weather === Weathers.RAIN && attackerAbility.name() === "Swift Swim") || (weather === Weathers.SUN && attackerAbility.name() === "Chlorophyll")) {
            attackerSpeed *= 2;
        }
        if ((weather === Weathers.RAIN && defenderAbility.name() === "Swift Swim") || (weather === Weathers.SUN && defenderAbility.name() === "Chlorophyll")) {
            defenderSpeed *= 2;
        }
        if (this.attacker.item.name() === "Iron Ball" // ignore embargo & klutz
            || this.attacker.item.name() === "Macho Brace"
            || this.attacker.item.name() === "Power Bracer"
            || this.attacker.item.name() === "Power Belt"
            || this.attacker.item.name() === "Power Lens"
            || this.attacker.item.name() === "Power Band"
            || this.attacker.item.name() === "Power Anklet"
            || this.attacker.item.name() === "Power Weight") {
            attackerSpeed >>= 1;
        }
        if (this.defender.item.name() === "Iron Ball"
            || this.defender.item.name() === "Macho Brace"
            || this.defender.item.name() === "Power Bracer"
            || this.defender.item.name() === "Power Belt"
            || this.defender.item.name() === "Power Lens"
            || this.defender.item.name() === "Power Band"
            || this.defender.item.name() === "Power Anklet"
            || this.defender.item.name() === "Power Weight") {
            defenderSpeed >>= 1;
        }
        if (attackerItem.name() === "Choice Scarf") {
            attackerSpeed = (attackerSpeed * 3) >> 1;
        }
        if (defenderItem.name() === "Choice Scarf") {
            defenderSpeed = (defenderSpeed * 3) >> 1;
        }
        if (attackerItem.name() === "Quick Powder" && this.attacker.name() === "Ditto") {
            attackerSpeed *= 2;
        }
        if (defenderItem.name() === "Quick Powder" && this.defender.name() === "Ditto") {
            defenderSpeed *= 2;
        }
        if (attackerAbility.name() === "Quick Feet" && this.attacker.status !== Statuses.NOSTATUS) {
            attackerSpeed = (attackerSpeed * 3) >> 1;
        } else if (this.attacker.status === Statuses.PARALYZED) {
            attackerSpeed >>= 2;
        }
        if (defenderAbility.name() === "Quick Feet" && this.defender.status !== Statuses.NOSTATUS) {
            defenderSpeed = (defenderSpeed * 3) >> 1;
        } else if (this.defender.status === Statuses.PARALYZED) {
            defenderSpeed >>= 2;
        }
        if (attackerAbility.name() === "Slow Start" && this.field.slowStart) {
            attackerSpeed >>= 1;
        }
        if (this.attacker.item.id === "0" && attackerAbility.name() === "Unburden") {
            attackerSpeed *= 2;
        }
        if (this.defender.item.id === "0" && attackerAbility.name() === "Unburden") {
            defenderSpeed *= 2;
        }
        if (this.attacker.tailwind) {
            attackerSpeed *= 2;
        }
        if (this.defender.tailwind) {
            defenderSpeed *= 2;
        }
        
        if (this.move.name() === "Hidden Power") {
            movePower = this.hiddenPowerP(this.attacker.ivs);
            moveType = this.hiddenPowerT(this.attacker.ivs);
        } else if (this.move.name() === "Reversal" || this.move.name() === "Flail") {
            var n = Math.floor(this.attacker.currentHP * 64 / this.attacker.stat(Stats.HP));
            if (n < 2) {
                movePower = 200;
            } else if (n < 6) {
                movePower = 150;
            } else if (n < 13) {
                movePower = 100;
            } else if (n < 22) {
                movePower = 80;
            } else if (n < 43) {
                movePower = 40;
            } else {
                movePower = 20;
            }
        } else if (this.move.name() === "Frustration") {
            movePower = Math.max(1, Math.floor((255 - this.attacker.happiness) * 10 / 25));
        } else if (this.move.name() === "Return") {
            movePower = Math.max(1, Math.floor(this.attacker.happiness * 10 / 25));
        } else if (this.move.name() === "Future Sight" || this.move.name() === "Doom Desire") {
            moveType = 18; // curse so there is no type effectiveness nor stab
        } else if (this.move.name() === "Magnitude") {
            movePower = this.magnitudePower(this.field.magnitude);
        } else if (this.move.name() === "Present") {
            movePower = this.field.present;
        } else if (this.move.name() === "Seismic Toss" || this.move.name() === "Night Shade") {
            return [this.attacker.level];
        } else if (this.move.name() === "Dragon Rage") {
            return [40];
        } else if (this.move.name() === "Sonic Boom") {
            return [20];
        } else if (this.move.name() === "Guillotine" || this.move.name() === "Horn Drill" || this.move.name() === "Fissure" || this.move.name() === "Sheer Cold") {
            return [65535];
        } else if (this.move.name() === "Endeavor") {
            return [this.attacker.currentHP >= this.defender.currentHP ? 0 : this.defender.currentHP - this.attacker.currentHP];
        } else if (this.move.name() === "Psywave") {
            var temp = [];
            for (var i = 0; i <= 10; i++) {
                temp[i] = Math.max(1, (Math.floor(this.attacker.level * (10 * i + 50) / 100)));
            }
            return temp;
        } else if (this.move.name() === "Super Fang") {
            return [Math.max(1, this.defender.currentHP >> 1)];
        } else if (this.move.name() === "Weather Ball") {
            moveType = this.weatherBall(weather);
            movePower = moveType === Types.NORMAL ? 50 : 100;
        } else if (this.move.name() === "Rollout" || this.move.name() === "Ice Ball") {
            movePower = 30 << (this.field.defenseCurl + this.field.rollout);
        } else if (this.move.name() === "Triple Kick") {
            movePower = 10 * this.field.tripleKickCount;
        } else if (((this.move.name() === "Avalanche" && !this.field.painSplit) || (this.move.name() === "Revenge" && !this.field.painSplit) || this.move.name === "Assurance") && this.field.attackerDamaged) {
            movePower *= 2;
        } else if (this.move.name() === "Wring Out" || this.move.name() === "Crush Grip") {
            movePower = Math.floor(this.defender.currentHP * 120 / Math.max(1, this.defender.stat(Stats.HP))) + 1;
        } else if (this.move.name() === "Water Spout" || this.move.name() === "Eruption") {
            movePower = Math.max(1, Math.floor(150 * this.attacker.currentHP / this.attacker.stat(Stats.HP)));
        } else if (this.move.name() === "Brine" && this.defender.currentHP * 2 <= this.defender.stat(Stats.HP)) {
            movePower *= 2;
        } else if (this.move.name() === "Echoed Voice") {
            movePower = Math.min(200, 40 + 40 * field.echoedVoice);
        } else if (this.move.name() === "Facade" && this.attacker.status !== Statuses.NOSTATUS) {
            movePower *= 2;
        } else if (this.move.name() === "Trump Card") {
            movePower = this.trumpPower(this.field.trumpPP);
        } else if (this.move.name() === "Wake-Up Slap" && this.defender.status === Statuses.ASLEEP) {
            movePower *= 2;
        } else if (this.move.name() === "Smelling Salts" && this.defender.status === Statuses.PARALYZED) {
            movePower *= 2;
        } else if (this.move.name() === "Gyro Ball") {
            movePower = this.gyroBall(attackerSpeed, defenderSpeed);
        } else if (this.move.name() === "Low Kick" || this.move.name() === "Grass Knot") { // very effective on zorodark
            movePower = this.grassKnot(defenderWeight);
        } else if (this.move.name() === "Fury Cutter") {
            movePower = Math.min(160, 10 << this.field.furyCutter);
        } else if (this.move.name() === "Punishment") {
            movePower = this.punishment(this.defender.boosts);
        } else if (this.move.name() === "Pursuit" && this.field.switchOut) {
            movePower *= 2;
        } else if (this.move.name() === "Stomp" && this.field.minimize) {
            movePower *= 2;
        } else if (this.move.name() === "Spit Up") {
           movePower = 100 * this.field.stockpile;
            if (movePower === 0) {
                return [0];
            }
        } else if (this.move.name() === "Natural Gift" && attackerItem.name() >= 8000) {
            movePower = db.berryPower[atackerItem.id-8000];
            moveType = db.berryType[attackerItem.id-8000];
        } else if (this.move.name() === "Fling") {
            movePower = (attackerItem.id in db.flingPower) ? db.flingPower[attackerItem.id] : 10;
        } else if (this.move.name() === "Beat Up") {
            moveType = Types.CURSE;
        }
        if ((this.move.name() === "Surf" || this.move.name() === "Whirlpool") && this.field.dive) {
            movePower *= 2;
        } else if ((this.move.name() === "Magnitude" || this.move.name() === "Earthquake") && this.field.dig) {
            movePower *= 2;
        } else if ((this.move.name() === "Gust" || this.move.name() === "Twister") && this.field.fly) {
            movePower *= 2;
        }
        
        if (this.field.helpingHand) {
            movePower = (movePower * 3) >> 1;
        }
        
        if ((attackerItem.name() === "Muscle Band" && this.move.damageClass === DamageClasses.PHYSICAL) || (attackerItem.name() === "Wise Glasses" && this.move.damageClass === DamageClasses.SPECIAL)) {
            movePower = Math.floor(movePower * 11 / 10);
        } else if (attackerItem.name() === "Lustrous Orb" && (moveType === Types.WATER || moveType === Types.DRAGON) && this.attacker.name() === "Palkia") {
            movePower = Math.floor(movePower * 12 / 10);
        } else if (attackerItem.name() === "Griseous Orb" && (moveType === Types.GHOST || moveType === Types.DRAGON) && this.attacker.name() === "Giratina-O") {
            movePower = Math.floor(movePower * 12 / 10);
        } else if (attackerItem.name() === "Adamant Orb" && (moveType === Types.STEEL || moveType === Types.DRAGON) && this.attacker.name() === "Dialga") {
            movePower = Math.floor(movePower * 12 / 10);
        } else if (attackerItem.typeBoosted() === moveType) {
            movePower = Math.floor(movePower * 12 / 10);
        }
        
        if (this.field.charge && moveType === Types.ELECTRIC) {
            movePower *= 2;
        }
        
        if (attackerAbility.name() === "Rivalry") {
            if (this.attacker.gender !== this.defender.gender && this.attacker.gender !== Genders.NOGENDER) {
                movePower = (movePower * 5) >> 2; // 125/100
            } else if (this.attacker.gender===this.defender.gender && this.attacker.gender!==Genders.NOGENDER) {
                movePower = (movePower * 3 ) >> 2; // 75/100
            }
        } else if (attackerAbility.name() === "Reckless" && (this.move.name() === "Jump Kick" || this.move.name() === "High Jump Kick" || this.move.hasRecoil())) {
            movePower = Math.floor(movePower * 12 / 10);
        } else if (attackerAbility.name() === "Iron Fist" && this.move.isPunch()) {
            movePower = Math.floor(movePower * 12 / 10);
        } else if (attackerAbility.name() === "Technician" && movePower <= 60) {
            movePower = (movePower * 3) >> 1;
        }
        
        if (defenderAbility.name() === "Heatproof" && moveType === Types.FIRE) {
            movePower >>= 1;
        } else if (defenderAbility.name() === "Thick Fat" && (moveType === Types.FIRE || moveType === Types.ICE)) {
            movePower >>= 1;
        } else if (defenderAbility.name() === "Dry Skin" && moveType === Types.FIRE) {
            movePower = (moverPower*5)>>2;
        }
        if ((this.field.mudSport && moveType === Types.ELECTRIC) || (this.field.waterSport && moveType === Types.FIRE)) {
            movePower = movePower >> 1;
        }
        
        var atk, def, sdef, satk;
        var simpleA = attackerAbility.name() === "Simple";
        var simpleD = defenderAbility.name() === "Simple";
        var unawareA = attackerAbility.name() === "Unaware";
        var unawareD = defenderAbility.name() === "Unaware";
        if (this.field.crit) {
            if (unawareA) {
                def = this.defender.stat(Stats.DEF);
                sdef = this.defender.stat(Stats.SDEF);
            } else {
                def = Math.min(this.defender.stat(Stats.DEF), simpleD ? this.defender.simpleBoostedStat(Stats.DEF)
                                                                      : this.defender.boostedStat(Stats.DEF));
                sdef = Math.min(this.defender.stat(Stats.SDEF), simpleD ? this.defender.simpleBoostedStat(Stats.SDEF)
                                                                        : this.defender.boostedStat(Stats.SDEF));
            }
            if (unawareD) {
                atk = this.defender.stat(Stats.ATK);
                satk = this.defender.stat(Stats.SATK);
            } else {
                atk = Math.max(this.attacker.stat(Stats.ATK), simpleA ? this.attacker.simpleBoostedStat(Stats.ATK)
                                                                      : this.attacker.boostedStat(Stats.ATK));
                satk = Math.max(this.attacker.stat(Stats.SATK), simpleA ? this.attacker.simpleBoostedStat(Stats.SATK)
                                                                        : this.attacker.boostedStat(Stats.SATK));
            }
        } else {
            if (unawareA) {
                def = this.defender.stat(Stats.DEF);
                sdef = this.defender.stat(Stats.SDEF);
            } else {
                def = simpleD ? this.defender.simpleBoostedStat(Stats.DEF)
                              : this.defender.boostedStat(Stats.DEF);
                sdef = simpleD ? this.defender.simpleBoostedStat(Stats.SDEF)
                               : this.defender.boostedStat(Stats.SDEF);
            }
            if (unawareD) {
                atk = this.defender.stat(Stats.ATK);
                satk = this.defender.stat(Stats.SATK);
            } else {
                atk = simpleA ? this.attacker.simpleBoostedStat(Stats.ATK)
                              : this.attacker.boostedStat(Stats.ATK);
                satk = simpleA ? this.attacker.simpleBoostedStat(Stats.SATK)
                               : this.attacker.boostedStat(Stats.SATK);
            }
        }
        
        if (attackerAbility.name() === "Huge Power" || attackerAbility.name() === "Pure Power") {
            atk *= 2;
        } else if (this.attacker.flowerGift && weather === Weathers.SUN) {
            atk *= 2;
        } else if (attackerAbility.name() === "Guts" && this.attacker.status !== Statuses.NOSTATUS) {
            atk = (atk * 3) >> 1;
        } else if (attackerAbility.name() === "Hustle") {
            atk = (atk * 3) >> 1;
        } else if (attackerAbility.name() === "Slow Start" && this.field.slowStart) {
            atk >>= 1;
        } else if ((attackerAbility.name() === "Plus" && this.field.minus) || (attackerAbility.name() === "Minus" && this.field.plus)) {
            satk = (satk * 3) >> 1;
        } else if (attackerAbility.name() === "Solar Power" && weather === Weathers.SUN) {
            satk *= 2;
        }
        
        if (attackerItem.name() === "Choice Band") {
            atk *= 2;
        } else if (attackerItem.name() === "Light Ball" && this.attacker.name() === "Pikachu") {
            atk *= 2;
            satk *= 2;
        } else if (attackerItem.name() === "Thick Club" && (this.attacker.name() === "Cubone" || this.attacker.name() === "Marowak")) {
            atk *= 2;
        } else if (attackerItem.name() === "Choice Specs") {
            satk = (satk * 3) >> 1;
        } else if (attackerItem.name() === "Soul Dew" && (this.attacker.name() === "Latias" || this.attacker.name() === "Latios")) {
            satk = (satk * 3) >> 1;
        } else if (attackerItem.name() === "DeepSeaTooth" && this.attacker.name() === "Clamperl") {
            satk *= 2;
        }
        
        if (this.move.name() === "Explosion" || this.move.name() === "Self-Destruct") {
            if (defenderAbility.name() === "Damp") return [0];
            def >>= 1;
        }
        
        if (defenderAbility.name() === "Marvel Scale" && this.defender.status !== Statuses.NOSTATUS) {
            def = (def * 3) >> 1;
        }
        
        if (this.defender.flowerGift && weather === Weathers.SUN) {
            sdef = (sdef * 3) >> 1;
        }
        
        if (defenderItem.name() === "Metal Powder" && this.defender.name() === "Ditto") {
            def *= 2;
        } else if (defenderItem.name() === "Soul Dew" && (this.defender.name() === "Latias" || this.defender.name() === "Latios")) {
            sdef = (sdef * 3) >> 1;
        } else if (defenderItem.name() === "DeepSeaScale" && this.defender.name() === "Clamperl") {
            sdef *= 2;
        }
        
        if (weather === Weathers.SAND && (this.defender.type1() === Types.ROCK || this.defender.type2() === Types.ROCK)) {
            sdef = (sdef * 3) >> 1;
        }
        
        a = (this.move.damageClass() === DamageClasses.PHYSICAL) ? atk : satk;
        d = (this.move.damageClass() === DamageClasses.PHYSICAL) ? def : sdef;
        if (this.move.name() === "Beat Up") {
            a = this.field.beatUpStats[this.field.beatUpHit];
            lvl = this.field.beatUpLevels[this.field.beatUpHit];
            d = this.defender.baseStat(Stats.DEF);
        }
        var baseDamage = Math.floor(Math.floor((Math.floor(2 * this.attacker.level / 5) + 2) * a * movePower / d) / 50);
        
        if (this.attacker.status === BURN && attackerAbility.name() !== "Guts" && this.move.damageClass() === DamageClasses.PHYSICAL && this.move.name() !== "Beat Up") {
            baseDamage >>= 1;
        }
        
        if ((this.move.damageClass() === DamageClasses.PHYSICAL && this.field.reflect) || (this.move.damageClass() === DamageClasses.SPECIAL && this.field.lightScreen)) {
            if (this.move.name() !== "Beat Up" && !this.field.crit) {
                if (this.field.multiBattle) {
                    baseDamage = Math.floor(baseDamage * 2 / 3);
                } else {
                    baseDamage >>= 1;
                }
            }
        }
        
        if (this.field.multiBattle && this.move.multiTargets()) {
            baseDamage = (baseDamage * 3) >> 2;
        }
        
        if (weather === Weathers.SUN) {
            if (moveType === Types.FIRE) {
                baseDamage = (baseDamage * 3) >> 1;
            } else if (moveType === Types.WATER) {
                baseDamage >>= 1;
            }
        } else if (weather === Weathers.RAIN) {
            if (moveType === Types.WATER) {
                baseDamage = (baseDamage * 3) >> 1;
            } else if (moveType === Types.FIRE) {
                baseDamage >>= 1;
            }
        }
        if (weather !== Weathers.CLEAR && weather !== Weathers.SUN && this.move.name() === "Solar Beam") {
            baseDamage >>= 1;
        }
        
        if (attackerAbility.name() === "Flash Fire" && this.field.flashFire && moveType === Types.FIRE) {
            baseDamage = (baseDamage * 3) >> 1;
        }
        
        baseDamage += 2;
        baseDamage *= this.field.critical ? (attackerAbility.name() === "Sniper" ? 3 : 2) : 1;
        
        if (attackerItem.name() === "Life Orb" && this.move.name() !== "Beat Up") {
            baseDamage = Math.floor(baseDamage * 13 / 10);
        } else if (attackerItem.name() === "Metronome" && this.move.name() !== "Beat Up") {
            baseDamage = Math.floor(baseDamage*Math.min(20, 10 + this.field.metronome) / 10);
        }
        
        if (this.field.meFirst && this.move.name() !== "Beat Up") {
            baseDamage = (baseDamage * 3) >> 1;
        }
        
        var damages = [];
        for (var i = 0; i < 16; i++) {
            damages[i] = Math.max(1, Math.floor(baseDamage * (85 + i) / 100));
        }
        
        if (this.attacker.stab(moveType)) {
            for (var i = 0; i < 16; i++) {
                damages[i] = (damages[i] * 3) >> 1;
            }
        }
        
        var e = this.effective([moveType],
                               [this.defender.type1(), this.defender.type2()],
                               this.field.foresight || attackerAbility.name() === "Scrappy",
                               false);
        for (var i = 0; i < 16; i++) {
            damages[i] = (damages[i] * e) >> 2;
        }
        
        if ((defenderAbility.name() === "Solid Rock" || defenderAbility.name() === "Filter") && e > 4) {
            for (var i = 0; i < 16; i++) {
                damages[i] = (damages[i] * 3) >> 2;
            }
        }
        
        if (attackerItem.name() === "Expert Belt" && e > 4) {
            for (var i = 0; i < 16; i++) {
                damages[i] = Math.floor(damages[i] * 12 / 10);
            }
        }
        
        if (defenderItem.berryType() === moveType && eff > 4) {
            for (var i = 0; i < 16; i++) {
                damages[i] >>= 1;
            }
        }
        
        if (attackerAbility.name() === "Tinted Lens" && eff < 4) {
            for (var i = 0; i < 16; i++) {
                damages[i] *= 2;
            }
        }
        
        if (defenderItem.berryType() === Types.NORMAL && moveType === Types.NORMAL) {
            for (var i = 0; i < 16; i++) {
                damages[i] >>= 1;
            }
        }
        
        if (defenderAbility.name() === "Sturdy") {
            for (var i = 0; i < damages.length; i++) {
                damages[i] = Math.min(damages.length, this.defender.stat(Stats.HP) - 1);
            }
        }
        
        return damages;
    }
    
    this.b2w2_calculate = function() {
        var moveType = this.move.type();
        var movePower = this.move.power();
        var atk = 0, def = 0, satk = 0, sdef = 0;
        var attackerWeight = this.attacker.weight() * 10;
        var defenderWeight = this.defender.weight() * 10;
        var attackerAbility = new Ability();
        attackerAbility.id = this.attacker.ability.id;
        var defenderAbility = new Ability();
        defenderAbility.id = this.defender.ability.id;
        if (attackerAbility.name() === "Mold Breaker" && defenderAbility.ignorable()) {
            defenderAbility.id = "0";
        }
        if (this.move.sound() && defenderAbility.name() === "Soundproof") {
            return [0];
        }
        var attackerItem = new Item();
        attackerItem.id = this.attacker.item.id;
        var attackerItem = new Item();
        attackerItem.id = (this.field.magicRoom || attackerAbility.name() === "Klutz") ? "0" : this.attacker.item.id;
        var defenderItem = new Item();
        defenderItem.id = (this.field.magicRoom || defenderAbility.name() === "Klutz") ? "0" : this.defender.item.id;
        var weather = this.field.airLock ? Weathers.CLEAR : this.field.weather;
        var crit = this.field.critical;
        var attackerSpeed = this.attacker.boostedStat(Stats.SPD);
        var defenderSpeed = this.defender.boostedStat(Stats.SPD);
        if ((weather === Weathers.RAIN && attackerAbility.name() === "Swift Swim") || (weather === Weathers.SUN && attackerAbility.name() === "Chlorophyll")) {
            attackerSpeed *= 2;
        }
        if ((weather === Weathers.RAIN && defenderAbility.name() === "Swift Swim") || (weather === Weathers.SUN && defenderAbility.name() === "Chlorophyll")) {
            defenderSpeed *= 2;
        }
        if (this.attacker.item.name() === "Iron Ball" // ignore embargo & klutz
            || this.attacker.item.name() === "Macho Brace"
            || this.attacker.item.name() === "Power Bracer"
            || this.attacker.item.name() === "Power Belt"
            || this.attacker.item.name() === "Power Lens"
            || this.attacker.item.name() === "Power Band"
            || this.attacker.item.name() === "Power Anklet"
            || this.attacker.item.name() === "Power Weight") {
            attackerSpeed >>= 1;
        }
        if (this.defender.item.name() === "Iron Ball"
            || this.defender.item.name() === "Macho Brace"
            || this.defender.item.name() === "Power Bracer"
            || this.defender.item.name() === "Power Belt"
            || this.defender.item.name() === "Power Lens"
            || this.defender.item.name() === "Power Band"
            || this.defender.item.name() === "Power Anklet"
            || this.defender.item.name() === "Power Weight") {
            defenderSpeed >>= 1;
        }
        if (attackerItem.name() === "Choice Scarf") {
            attackerSpeed = (attackerSpeed * 3) >> 1;
        }
        if (defenderItem.name() === "Choice Scarf") {
            defenderSpeed = (defenderSpeed * 3) >> 1;
        }
        if (attackerItem.name() === "Quick Powder" && this.attacker.name() === "Ditto") {
            attackerSpeed *= 2;
        }
        if (defenderItem.name() === "Quick Powder" && this.defender.name() === "Ditto") {
            defenderSpeed *= 2;
        }
        if (attackerAbility.name() === "Quick Feet" && this.attacker.status !== Statuses.NOSTATUS) {
            attackerSpeed = (attackerSpeed * 3) >> 1;
        } else if (this.attacker.status === Statuses.PARALYZED) {
            attackerSpeed >>= 2;
        }
        if (defenderAbility.name() === "Quick Feet" && this.defender.status !== Statuses.NOSTATUS) {
            defenderSpeed = (defenderSpeed * 3) >> 1;
        } else if (this.defender.status === Statuses.PARALYZED) {
            defenderSpeed >>= 2;
        }
        if (attackerAbility.name() === "Slow Start" && this.field.slowStart) {
            attackerSpeed >>= 1;
        }
        if (this.attacker.item.id === "0" && attackerAbility.name() === "Unburden") {
            attackerSpeed *= 2;
        }
        if (this.defender.item.id === "0" && attackerAbility.name() === "Unburden") {
            defenderSpeed *= 2;
        }
        if (this.attacker.tailwind) {
            attackerSpeed *= 2;
        }
        if (this.defender.tailwind) {
            defenderSpeed *= 2;
        }

        if (this.attacker.autotomize) {
            attackerWeight -= 1000;
        }
        if (attackerAbility.name() === "Light Metal") {
            attackerWeight /= 2;
        } else if (attackerAbility.name() === "Heavy Metal") {
            attackerWeight *= 2;
        }
        if (attackerItem.name() === "Float Stone") {
            attackerWeight /= 2;
        }
        attackerWeight = Math.max(1, attackerWeight - Math.floor(attackerWeight) > 0.5 ? 1 + Math.floor(attackerWeight) : Math.floor(attackerWeight));
        
        if (this.defender.autotomize) {
            defenderWeight -= 1000;
        }
        if (defenderAbility.name() === "Light Metal") {
            defenderWeight /= 2;
        } else if (defenderAbility.name() === "Heavy Metal") {
            defenderWeight *= 2;
        }
        if (defenderItem.name() === "Float Stone") {
            defenderWeight /= 2;
        }
        defenderWeight = Math.max(1, defenderWeight - Math.floor(defenderWeight) > 0.5 ? 1 + Math.floor(defenderWeight) : Math.floor(defenderWeight));
        
        if (this.move.name() === "Seismic Toss" || this.move.name() === "Night Shade") {
            return [this.attacker.level];
        } else if (this.move.name() === "Dragon Rage") {
            return [40];
        } else if (this.move.name() === "Sonic Boom") {
            return [20];
        } else if (this.move.name() === "Guillotine" || this.move.name() === "Horn Drill" || this.move.name() === "Fissure" || this.move.name() === "Sheer Cold") {
            return [65535];
        } else if (this.move.name() === "Endeavor") {
            return [this.attacker.currentHP >= this.defender.currentHP ? 0 : this.defender.currentHP - this.attacker.currentHP];
        } else if (this.move.name() === "Psywave") {
            var range = [];
            for (var i = 0; i <= 100; i++) {
                range[i] = Math.max(1, Math.floor(this.attacker.level * (i + 50) / 100))
            }
            return range;
        } else if (this.move.name() === "Super Fang") {
            return [Math.max(1, this.defender.currentHP >> 1)];
        } else if (this.move.name() === "Weather Ball") {
            moveType = this.weatherBall(weather);
            movePower = moveType === 0 ? 50 : 100;
        } else if (this.move.name() === "Frustration") {
            movePower = Math.max(1, Math.floor((255 - this.attacker.happiness) * 10 / 25));
        } else if (this.move.name() === "Return") {
            movePower = Math.max(1, Math.floor(this.attacker.happiness * 10 / 25));
        } else if (this.move.name() === "Payback" && this.field.targetMoved) {
            movePower *= 2;
        } else if (this.move.name() === "Electro Ball") {
            movePower = this.electroBall(attackerSpeed, defenderSpeed);
        } else if (((this.move.name() === "Avalanche" && !this.field.painSplit) || (this.move.name() === "Revenge" && !this.field.painSplit) || this.move.name === "Assurance") && this.field.attackerDamaged) {
            movePower *= 2;
        } else if (this.move.name() === "Gyro Ball") {
            movePower = this.gyroBall(attackerSpeed, defenderSpeed);
        } else if (this.move.name() === "Water Spout" || this.move.name() === "Eruption") {
            movePower = Math.max(1, Math.floor(150 * this.attacker.currentHP / this.attacker.stat(Stats.HP)));
        } else if (this.move.name() === "Punishment") {
            movePower = this.punishment(this.defender.boosts);
        } else if (this.move.name() === "Fury Cutter") {
            movePower = Math.min(160, 20 << this.field.furyCutter);
        } else if (this.move.name() === "Low Kick" || this.move.name() === "Grass Knot") { // very effective on zorodark
            movePower = this.grassKnot(defenderWeight);
        } else if (this.move.name() === "Echoed Voice") {
            movePower = Math.min(200, 40 + 40 * field.echoedVoice);
        } else if (this.move.name() === "Hex" && this.defender.status !== Statuses.NOSTATUS) {
            movePower *= 2;
        } else if (this.move.name() === "Wring Out" || this.move.name() === "Crush Grip") {
            var r = 120 * defender.currentHP / defender.getStat(Stats.HP);
            r = (r - Math.floor(r) > 0.5) ? 1 + Math.floor(r) : Math.floor(r);
            movePower = Math.max(1, r);
        } else if (this.move.name() === "Heavy Slam" || this.move.name() === "Heat Crash") {
            movePower = this.heavySlam(attackerWeight, defenderWeight);
        } else if (this.move.name() === "Stored Power") {
            movePower = this.storedPower(this.attacker.boosts);
        } else if (this.move.name() === "Flail" || this.move.name() === "Reversal") {
            movePower = this.flail(this.attacker.currentHP, this.attacker.stat(Stats.HP));
        } else if (this.move.name() === "Trump Card") {
            movePower = this.trumpPower(this.field.trumpPP);
        } else if (this.move.name() === "Round" && this.field.roundBoost) {
            movePower *= 2;
        } else if (this.move.name() === "Wake-Up Slap" && this.defender.status === Statuses.ASLEEP) {
            movePower *= 2;
        } else if (this.move.name() === "Smelling Salts" && this.defender.status === Statuses.PARALYZED) {
            movePower *= 2;
        } else if ((this.move.name() === "Twister" || this.move.name() === "Gust") && this.field.fly) {
            movePower *= 2;
        } else if (this.move.name() === "Beat Up") {
            movePower = Math.floor(this.field.beatUpStats[this.field.beatUpHit] / 10) + 5;
        } else if (this.move.name() === "Hidden Power") {
            movePower = this.hiddenPowerP(this.attacker.ivs);
            moveType = this.hiddenPowerT(this.attacker.ivs);
        } else if (this.move.name() === "Spit Up") {
            movePower = 100 * this.field.stockpile;
            if (movePower === 0) {
                return [0];
            }
        } else if (this.move.name() === "Pursuit" && this.field.switchOut) {
            movePower *= 2;
        } else if (this.move.name() === "Present") {
            movePower = this.field.present;
        } else if (this.move.name() === "Natural Gift" && attackerItem.name() >= 8000) {
            movePower = db.berryPower[atackerItem.id - 8000];
            moveType = db.berryType[attackerItem.id - 8000];
        } else if (this.move.name() === "Magnitude") {
            movePower = this.magnitudePower(this.field.magnitude);
        } else if (this.move.name() === "Rollout" || this.move.name() === "Ice Ball") {
            movePower = 30 << (this.field.defenseCurl + this.field.rollout);
        } else if (this.move.name() === "Fling") {
            movePower = (attackerItem.id in db.flingPower) ? db.flingPower[attackerItem.id] : 10;
        } else if ((this.move.name() === "Fire Pledge" || this.move.name() === "Water Pledge" || this.move.name() === "Grass Pledge") && this.field.pledgeBoost) {
            movePower *= 2;
        } else if (this.move.name() === "Triple Kick") {
            movePower = 10 * this.field.tripleKickCount;
        } else if ((this.move.name() === "Self-Destruct" || this.move.name() === "Explosion") && defenderAbility.name() === "Damp") {
            return [0];
        }
        var gemBoost;
        if (moveType === attackerItem.gemType()) {
            attackerItem.id = "0";
            this.attacker.item.id = "0";
            gemBoost = true;
        }
        if (this.move.name() === "Acrobatics") {
            if (attackerItem.name() === "(No Item)") { // gems are "used" earlier in calc and item set to 0
                movePower *= 2;
            }
        }
        
        var movePowerMod = 0x1000;
        if (attackerAbility.name() === "Technician" && movePower<=60) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (attackerAbility.name() === "Flare Boost" && this.attacker.status === Statuses.BURNED && this.move.damageClass() === DamageClasses.SPECIAL) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (attackerAbility.name() === "Analytic" && this.field.targetMoved) {
            movePowerMod = this.chainMod(0x14CD, movePowerMod);
        }
        if (attackerAbility.name() === "Reckless" && (this.move.name() === "Jump Kick" || this.move.name() === "High Jump Kick" || this.move.hasRecoil())) {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        }
        if (attackerAbility.name() === "Iron Fist" && this.move.isPunch()) {
            movePowerMod = this.chainMod(0x1333, movePowerMod)
        }
        if (attackerAbility.name() === "Toxic Boost" && (this.attacker.status === Statuses.POISONED || this.attacker.status === Statuses.BADLYPOISONED) && this.move.damageClass() === DamageClasses.PHYSICAL) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (attackerAbility.name() === "Rivalry") {
            if (this.attacker.gender !== this.defender.gender && this.attacker.gender !== Genders.NOGENDER) {
                movePowerMod = this.chainMod(0x1400, movePowerMod);
            } else if (this.attacker.gender === this.defender.gender && this.attacker.gender !== Genders.NOGENDER) {
                movePowerMod = this.chainMod(0xC00, movePowerMod);
            }
        }
        if (attackerAbility.name() === "Sand Force" && weather === Weathers.SAND && (moveType === Types.GROUND || moveType === Types.ROCK || moveType === Types.STEEL)) {
            movePowerMod = this.chainMod(0x14CD, movePowerMod)
        }
        if (attackerAbility.name() === "Normalize") {
            moveType = 0;
        }
        if (defenderAbility.name() === "Heatproof" && moveType === Types.FIRE) {
            movePowerMod = this.chainMod(0x800, movePowerMod);
        }
        if (defenderAbility.name() === "Dry Skin" && moveType === Types.FIRE) {
            movePowerMod = this.chainMod(0x1400, movePowerMod);
        }
        if (attackerAbility.name() === "Sheer Force" && this.move.sheerForce()) {
            movePowerMod = this.chainMod(0x14CD, movePowerMod);
        }
        if (attackerItem.typeBoosted() === moveType) {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        }
        if (attackerItem.name() === "Muscle Band" && this.move.damageClass() === DamageClasses.PHYSICAL) {
            movePowerMod = this.chainMod(0x1199, movePowerMod);
        }
        if (attackerItem.name() === "Lustrous Orb" && (moveType === Types.WATER || moveType === Types.DRAGON) && this.attacker.name() === "Palkia") {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        }
        if (attackerItem.name() === "Wise Glasses" && this.move.damageClass() === DamageClasses.SPECIAL) {
            movePowerMod = this.chainMod(0x1199, movePowerMod);
        }
        if (attackerItem.name() === "Griseous Orb" && (moveType === Types.GHOST || moveType === Types.DRAGON) && this.attacker.name() === "Giratina-O") {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        }
        if (gemBoost) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (attackerItem.name() === "Adamant Orb" && (moveType === Types.STEEL || moveType === Types.DRAGON) && this.attacker.name() === "Dialga") {
            movePowerMod = this.chainMod(0x1333, movePowerMod);
        }
        if (this.move.name() === "Facade" && this.attacker.status !== Statuses.NOSTATUS) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if (this.move.name() === "Brine" && this.defender.currentHP * 2 <= this.defender.stat(Stats.HP)) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if (this.move.name() === "Venoshock" && (this.attacker.status === Statuses.POISONED || this.attacker.status === Statuses.BADLYPOISONED)) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if (this.move.name() === "Retaliate" && this.field.previouslyFainted) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if ((this.move.name() === "Fusion Bolt" && this.field.fusionFlare) || (this.move.name() === "Fusion Flare" && this.field.fusionBolt)) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if (this.field.meFirst) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (this.move.name() === "Solar Beam" && (weather !== Weathers.SUN && weather !== Weathers.CLEAR)) {
            movePowerMod = this.chainMod(0x800, movePowerMod);
        }
        if (this.field.charge && moveType === Types.ELECTRIC) {
            movePowerMod = this.chainMod(0x2000, movePowerMod);
        }
        if (this.field.helpingHand) {
            movePowerMod = this.chainMod(0x1800, movePowerMod);
        }
        if (this.field.waterSport && moveType === Types.FIRE) {
            movePowerMod = this.chainMod(0x548, movePowerMod);
        }
        if (this.field.mudSport && moveType === Types.ELECTRIC) {
            movePowerMod = this.chainMod(0x548, movePowerMod);
        }
        movePower = Math.max(1, this.applyMod(movePowerMod, movePower));

        var _def = this.field.wonderRoom ? Stats.SDEF : Stats.DEF;
        var _sdef = this.field.wonderRoom ? Stats.DEF : Stats.SDEF;
        var unawareA = attackerAbility.name() === "Unaware";
        var unawareD = defenderAbility.name() === "Unaware";
        if (this.move.name() === "Foul Play") {
            if (unawareA) {
                def = this.defender.stat(_def);
                sdef = this.defender.stat(_sdef);
                atk = this.defender.stat(Stats.ATK);
            } else {
                def = crit ? Math.min(this.defender.stat(_def), this.defender.boostedStat(_def))
                           : this.defender.boostedStat(_def);
                sdef = crit ? Math.min(this.defender.stat(_sdef), this.defender.boostedStat(_sdef))
                            : this.defender.boostedStat(_sdef);
                atk = crit ? Math.max(this.defender.stat(Stats.ATK), this.defender.boostedStat(Stats.ATK))
                           : this.defender.boostedStat(Stats.ATK);
            }
            if (unawareD) {
                satk = this.attacker.stat(Stats.SATK);
            } else {
                satk = crit ? Math.max(this.attacker.stat(Stats.SATK), this.attacker.boostedStat(Stats.SATK))
                            : this.attacker.boostedStat(Stats.SATK);
            }
        } if (this.move.name() === "Chip Away" || this.move.name() === "Sacred Sword") {
            def = this.defender.stat(_def);
            sdef = this.defender.stat(_sdef);
            if (unawareD) {
                atk = this.attacker.stat(Stats.ATK);
                satk = this.attacker.stat(Stats.SATK);
            } else {
                atk = crit ? Math.max(this.attacker.stat(Stats.ATK), this.attacker.boostedStat(Stats.ATK))
                           : this.attacker.boostedStat(Stats.ATK);
                satk = crit ? Math.max(this.attacker.stat(Stats.SATK), this.attacker.boostedStat(Stats.SATK))
                            : this.attacker.boostedStat(Stats.SATK);
            }
        } else {
            if (unawareA) {
                def = this.defender.stat(_def);
                sdef = this.defender.stat(_sdef);
            } else {
                def = crit ? Math.min(this.defender.stat(_def), this.defender.boostedStat(_def)) : this.defender.boostedStat(_def);
                sdef = crit ? Math.min(this.defender.stat(_sdef), this.defender.boostedStat(_sdef)) : this.defender.boostedStat(_sdef);
            }
            if (unawareD) {
                atk = this.attacker.stat(Stats.ATK);
                satk = this.attacker.stat(Stats.SATK);
            } else {
                atk = crit ? Math.max(this.attacker.stat(Stats.ATK), this.attacker.boostedStat(Stats.ATK)) : this.attacker.boostedStat(Stats.ATK);
                satk = crit ? Math.max(this.attacker.stat(Stats.SATK), this.attacker.boostedStat(Stats.SATK)) : this.attacker.boostedStat(Stats.SATK);
            }
        }
        
        var atkMod = 0x1000, satkMod = 0x1000;
        if (defenderAbility.name() === "Thick Fat" && (moveType === Types.FIRE || moveType === Types.ICE)) {
            atkMod = this.chainMod(0x800, atkMod);
            satkMod = this.chainMod(0x800, satkMod);
        }
        if (attackerAbility.pinchType() === moveType && this.attacker.stat(Stats.HP) >= this.attacker.currentHP * 3) {
            atkMod = this.chainMod(0x1800, atkMod); // blaze, torrent, overgrow, ...
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Guts" && this.defender.status !== Statuses.NOSTATUS) {
            atkMod = this.chainMod(0x1800, atkMod);
        }
        if ((attackerAbility.name() === "Plus" && this.field.minus) || (attackerAbility.name() === "Minus" && this.field.plus)) {
            atkMod = this.chainMod(0x1800, atkMod);
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Defeatist" && this.attacker.currentHP * 2 <= this.attacker.stat(Stats.HP)) {
            atkMod = this.chainMod(0x800, atkMod);
            satkMod = this.chainMod(0x800, satkMod);
        }
        if (attackerAbility.name() === "Huge Power" || attackerAbility.name() === "Pure Power") {
            atkMod = this.chainMod(0x2000, atkMod);
        }
        if (attackerAbility.name() === "Solar Power" && weather === Weathers.SUN) {
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Hustle") {
            atk = this.applyMod(0x1800, atk);
        }
        if (attackerAbility.name() === "Flash Fire" && this.field.flashFire && moveType === Types.FIRE) {
            atkMod = this.chainMod(0x1800, atkMod);
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerAbility.name() === "Slow Start" && this.field.slowStart) {
            atkMod = this.chainMod(0x800, atkMod);
        }
        if (this.attacker.flowerGift && weather === Weathers.SUN) {
            atkMod = this.chainMod(0x1800, atkMod);
        }
        if (attackerItem.name() === "Thick Club" && (this.attacker.name() === "Cubone" || this.attacker.name() === "Marowak")) {
            atkMod = this.chainMod(0x2000, atkMod);
        }
        if (attackerItem.name() === "Deep Sea Tooth" && this.attacker.name() === "Clamperl") {
            satkMod = this.chainMod(0x2000, satkMod);
        }
        if (attackerItem.name() === "Light Ball" && this.attacker.name() === "Pikachu") {
            atkMod = this.chainMod(0x2000, atkMod);
            satkMod = this.chainMod(0x2000, satkMod);
        }
        if (attackerItem.name() === "Soul Dew" && (this.attacker.name() === "Latias" || this.attacker.name() === "Latios")) {
            satkMod = this.chainMod(0x1800, satkMod);
        }
        if (attackerItem.name() === "Choice Band") {
            atkMod = this.chainMod(0x1800, atkMod);
        }
        if (attackerItem.name() === "Choice Specs") {
            satkMod = this.chainMod(0x1800, satkMod);
        }
        atk = this.applyMod(atkMod, atk);
        satk = this.applyMod(satkMod, satk);
        
        if (weather === Weathers.SAND && (this.defender.type1() === Types.ROCK || this.defender.type2() === Types.ROCK)) {
            sdef = this.applyMod(0x1800, sdef);
        }
        var defMod = 0x1000, sdefMod = 0x1000;
        if (defenderAbility.name() === "Marvel Scale" && this.defender.status !== Statuses.NOSTATUS) {
            defMod = this.chainMod(0x1800, defMod);
        }
        if (this.defender.flowerGift && weather === Weathers.SUN) {
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        if (defenderItem.name() === "DeepSeaScale" && this.defender.name() === "Clamperl") {
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        if (defenderItem.name() === "Metal Powder" && this.defender.name() === "Ditto") {
            defMod = this.chainMod(0x2000, defMod);
        }
        if (defenderItem.name() === "Eviolite" && this.defender.hasEvolution()) {
            defMod = this.chainMod(0x1800, defMod);
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        if (defenderItem.name() === "Soul Dew" && (this.defender.name() === "Latias" || this.defender.name() === "Latios")) {
            sdefMod = this.chainMod(0x1800, sdefMod);
        }
        def = this.applyMod(defMod, def);
        sdef = this.applyMod(sdefMod, sdef);
        
        var a = 0, d = 0;
        if (this.move.name() === "Psyshock" || this.move.name() === "Psystrike" || this.move.name() === "Secret Sword") {
            a = satk;
            d = def;
        } else if (this.move.damageClass() === DamageClasses.PHYSICAL) {
            a = atk;
            d = def;
        } else {
            a = satk;
            d = sdef;
        }

        var baseDamage = Math.floor(Math.floor((Math.floor((2 * this.attacker.level) / 5) + 2) * movePower * a / d) / 50) + 2;

        if (this.field.multiBattle && this.move.multiTargets()) {
            baseDamage = this.applyMod(0xC00, baseDamage);
        }

        if (weather === Weathers.SUN) {
            if (moveType === Types.FIRE) {
                baseDamage = this.applyMod(0x1800, baseDamage);
            } else if (moveType === Types.WATER) {
                baseDamage = this.applyMod(0x800, baseDamage);
            }
        } else if (weather === Weathers.RAIN) {
            if (moveType === Types.WATER) {
                baseDamage = this.applyMod(0x1800, baseDamage);
            } else if (moveType === Types.FIRE) {
                baseDamage = this.applyMod(0x800, baseDamage);
            }
        }

        if (crit) {
            baseDamage = this.applyMod(0x2000, baseDamage);
        }

        var damages = [];
        for (var i = 0; i < 16; i++) {
            damages[i] = Math.floor(baseDamage * (85 + i) / 100);
        }

        if (this.attacker.stab(moveType)) {
            if (attackerAbility.name() === "Adaptability") {
                damages = this.applyModA(0x2000, damages);
            } else {
                damages = this.applyModA(0x1800, damages);
            }
        }

        var eff = this.effective([moveType],
                                 [this.defender.type1(), this.defender.type2()],
                                 this.field.foresight || attackerAbility.name() === "Scrappy",
                                 false);
        for (var i = 0; i < damages.length; i++) {
            damages[i] = (damages[i] * eff) >> 2;
        }

        if (this.attacker.status === Statuses.BURNED && this.move.damageClass() === DamageClasses.PHYSICAL && attackerAbility.name() !== "Guts") {
            for (var i = 0; i < damages.length; i++) {
                damages[i] = damages[i] >> 1;
            }
        }

        for (var i = 0; i < damages.length; i++) {// ensure one damage
            damages[i] = damages[i] === 0 ? 1 : damages[i];
        }

        var finalMod = 0x1000;
        if (this.field.reflect && !crit
                               && (this.move.damageClass === DamageClasses.PHYSICAL
                                   || this.move.name() === "Psyshock"
                                   || this.move.name() === "Psystrike"
                                   || this.move.name() === "Secret Sword")
                               && attackerAbility.name() !== "Infiltrator") {
            finalMod = chainMod(this.field.multiBattle ? 0xA8F : 0x800, finalMod);
        } else if (this.field.lightScreen && !crit
                                          && (this.move.damageClass === DamageClasses.SPECIAL
                                              && !this.move.name() === "Psyshock"
                                              && !this.move.name() === "Psystrike"
                                              && !this.move.name() === "Secret Sword")
                                          && attackerAbility.name() !== "Infiltrator") {
            finalMod = chainMod(this.field.multiBattle ? 0xA8F : 0x800, finalMod);
        }
        if (defenderAbility.name() === "Multiscale" && this.defender.currentHP === this.defender.stat(Stats.HP)) {
            finalMod = this.chainMod(0x800, finalMod);
        }
        if (attackerAbility.name() === "Tinted Lens" && eff < 4) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        if (this.field.friendGuard) {
            finalMod = this.chainMod(0xC00, finalMod);
        }
        if (attackerAbility.name() === "Sniper" && crit) {
            finalMod = this.chainMod(0x1800, finalMod);
        }
        if ((defenderAbility.name() === "Filter" || defenderAbility.name() === "Solid Rock") && eff > 4) {
            finalMod = this.chainMod(0xC00, finalMod);
        }
        if (attackerItem.name() === "Metronome") {
            finalMod = this.chainMod(this.field.metronome <= 4 ? (0x1000 + this.field.metronome * 0x333) : 0x2000, finalMod);
        }
        if (attackerItem.name() === "Expert Belt" && eff > 4) {
            finalMod = this.chainMod(0x1333, finalMod);
        }
        if (attackerItem.name() === "Life Orb") {
            finalMod = this.chainMod(0x14CC, finalMod);
        }
        if (defenderItem.berryType() === moveType && (eff > 4 || moveType === 0)) {
            finalMod = this.chainMod(0x800, finalMod);
            this.defenderitem.id = "0";
        }
        if (this.field.minimize && (this.move.name() === "Stomp" || this.move.name() === "Steamroller")) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        if (this.field.dig && (this.move.name() === "Earthquake" || this.move.name() === "Magnitude")) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        if (this.field.dive && (this.move.name() === "Surf" || this.move.name() === "Whirlpool")) {
            finalMod = this.chainMod(0x2000, finalMod);
        }
        this.applyModA(finalMod, damages);
        
        if (defenderAbility.name() === "Sturdy") {
            for (var i = 0; i < damages.length; i++) {
                damages[i] = Math.min(damages.length, this.defender.stat(Stats.HP) - 1);
            }
        }
        
        
        if (this.move.name() === "Knock Off"
            && this.defender.item.name() !== "(No Item)"
            && !(this.defender.item.name() === "Griseous Orb" && this.defender.name().indexOf("Giratina") !== -1)
            && !(this.defender.item.name().indexOf(" Drive") !== -1 && this.defender.name().indexOf("Genesect") !== -1)
            && !(defenderAbility.name() === "Multitype" && this.defender.item.name().indexOf(" Plate") !== -1)) {
            this.defender.item.id = "0";
        }
        
        return damages;
    }
    
    this.selCalc = function() {
        if (gen === 1) {
            return this.rby_calculate();
        } else if (gen === 2) {
            return this.gsc_calculate();
        } else if (gen === 3) {
            return this.adv_calculate();
        } else if (gen === 4) {
            return this.hgss_calculate();
        } else if (gen === 5) {
            return this.b2w2_calculate();
        } else if (gen === 6) {
            return this.xy_calculate();
        } // can't figure out how to do this as aliased function, so doing this instead. Will replace if I figure it out.
        return [0]; // ok
    }
    
    this.calculate = function() {
        if (this.move.name() === "Triple Kick") {
            var dmg = new WeightedArray([0]);
            var hits = [];
            for (var i = 0; i < 3; i++) {
                this.field.tripleKickCount = i + 1;
                hits[i] = new WeightedArray(this.selCalc());
            }
            this.field.tripleKickCount = 1;
            for (var i = 0; i < hits.length; i++) {
                dmg = dmg.combine(hits[i]);
            }
            return dmg;
        } else if (this.move.name() === "Beat Up") {
            var dmg = new WeightedArray([0]);
            var hits = [];
            for (var i = 0; i < this.field.beatUpStats.length; i++) {
                this.field.beatUpHit = i;
                hits[i] = new WeightedArray(this.selCalc());
            }
            this.field.beatUpHit = 0;
            for (var i = 0; i < hits.length; i++) {
                dmg = dmg.combine(hits[i]);
            }
            return dmg;
        } else if (this.attacker.ability.name() === "Parental Bond") {
            var dmg = new WeightedArray([0]);
            var first = new WeightedArray(this.selCalc());
            var second;
            if (!this.move.multiTargets()) { // isn't multi hit on seismic toss
                this.field.parentalBond = true;
                second = new WeightedArray(this.selCalc());
                this.field.parentalBond = false;
            }
            dmg = first.combine(second);
            return dmg;
        } else if (this.move.maxHits() !== 1) {
            var dmg = new WeightedArray([0]);
            var tempdmg = new WeightedArray(this.selCalc());
            var nHits = (this.attacker.ability.name() === "Skill Link") ? this.move.maxHits()
                                                                          : Math.min(this.move.maxHits(),
                                                                                     Math.max(this.move.minHits(),
                                                                                              this.field.multiHits
                                                                                     )
                                                                            );
            for (var i = 0; i < nHits; i++) {
                dmg = dmg.combine(tempdmg);
            }
            return dmg;
        }
        return new WeightedArray(this.selCalc());
    }
}

Sulcalc = { Database : Database,
            db : db,
            gen : gen,
            Stats : Stats,
            Genders : Genders,
            DamageClasses : DamageClasses,
            Weathers : Weathers,
            Statuses : Statuses,
            Types : Types,
            Pokemon : Pokemon,
            Move : Move,
            Ability : Ability,
            Item : Item,
            Field : Field,
            Calculator : Calculator
          };
}());