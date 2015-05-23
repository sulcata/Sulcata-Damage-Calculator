db = new Database();
db.location = "";

// make the file size a little smaller
function getId (id) {
    return document.getElementById(id);
}

// to get the old values
var attackerOldAbility = "0", defenderOldAbility = "0"
    resultingDefenderHealth = null; // need this when we use setDefenderRemainingHp button

// a nice little conversion chart
var pokeToItem = {
    "25:0"   : "Light Ball", // Pikachu
    "104:0"  : "Thick Club", // Cubone
    "105:0"  : "Thick Club", // Marowak
    "649:1"  : "Douse Drive", // Genesect-D
    "649:2"  : "Shock Drive", // Genesect-S
    "649:3"  : "Burn Drive", // Genesect-B
    "649:4"  : "Chill Drive", // Genesect-C
    "487:1"  : "Griseous Orb", // Giratina-O
    "493:1"  : "Fist Plate", // Arceus-Fighting
    "493:2"  : "Sky Plate", // Arceus-Flying
    "493:3"  : "Toxic Plate", // Arceus-Poison
    "493:4"  : "Earth Plate", // Arceus-Ground
    "493:5"  : "Stone Plate", // Arceus-Rock
    "493:6"  : "Insect Plate", // Arceus-Bug
    "493:7"  : "Spooky Plate", // Arceus-Ghost
    "493:8"  : "Iron Plate", // Arceus-Steel
    "493:9"  : "Flame Plate", // Arceus-Fire
    "493:10" : "Splash Plate", // Arceus-Water
    "493:11" : "Meadow Plate", // Arceus-Grass
    "493:12" : "Zap Plate", // Arceus-Electric
    "493:13" : "Mind Plate", // Arceus-Psychic
    "493:14" : "Icicle Plate", // Arceus-Ice
    "493:15" : "Draco Plate", // Arceus-Dragon
    "493:16" : "Dread Plate", // Arceus-Dark
    "493:17" : "Pixie Plate", // Arceus-Fairy
    "460:1:M": "Abomasite", // Mega Abomasnow
    "359:1:M": "Absolite", // Mega Absol
    "142:1:M": "Aerodactylite", // Mega Aerodactyl
    "306:1:M": "Aggronite", // Mega Aggron
    "65:1:M" : "Alakazite", // Mega Alakazam
    "334:1:M": "Altarianite", // Mega Altaria
    "181:1:M": "Ampharosite", // Mega Ampharos
    "531:1:M": "Audinite", // Mega Audino
    "354:1:M": "Banettite", // Mega Banette
    "15:1:M" : "Beedrillite", // Mega Beedrill
    "9:1:M"  : "Blastoisinite", // Mega Blastoise
    "257:1:M": "Blazikenite", // Mega Blaziken
    "323:1:M": "Cameruptite", // Mega Camerupt
    "6:1:M"  : "Charizardite X", // Mega Charizard X
    "6:2:M"  : "Charizardite Y", // Mega Charizard Y
    "719:1:M": "Diancite", // Mega Diancie
    "475:1:M": "Galladite", // Mega Gallade
    "445:1:M": "Garchompite", // Mega Garchomp
    "282:1:M": "Gardevoirite", // Mega Gardevoir
    "94:1:M" : "Gengarite", // Mega Gengar
    "362:1:M": "Glalitite", // Mega Glalie
    "130:1:M": "Gyaradosite", // Mega Gyarados
    "214:1:M": "Heracronite", // Mega Heracross
    "229:1:M": "Houndoominite", // Mega Houndoom
    "115:1:M": "Kangaskhanite", // Mega Kangaskhan
    "380:1:M": "Latiasite", // Mega Latias
    "381:1:M": "Latiosite", // Mega Latios
    "428:1:M": "Lopunnity", // Mega Lopunny
    "448:1:M": "Lucarionite", // Mega Lucario
    "310:1:M": "Manectite", // Mega Manectric
    "303:1:M": "Mawilite", // Mega Mawile
    "308:1:M": "Medichamite", // Mega Medicham
    "376:1:M": "Metagrossite", // Mega Metagross
    "150:1:M": "Mewtwonite X", // Mega Mewtwo X
    "150:2:M": "Mewtwonite Y", // Mega Mewtwo Y
    "18:1:M" : "Pidgeotite", // Mega Pidgeot
    "127:1:M": "Pinsirite", // Mega Pinsir
    "302:1:M": "Sablenite", // Mega Sableye
    "373:1:M": "Salamencite", // Mega Salamence
    "254:1:M": "Sceptilite", // Mega Sceptile
    "212:1:M": "Scizorite", // Mega Scizor
    "319:1:M": "Sharpedonite", // Mega Sharpedo
    "80:1:M" : "Slowbronite", // Mega Slowbro
    "208:1:M": "Steelixite", // Mega Steelix
    "260:1:M": "Swampertite", // Mega Swampert
    "248:1:M": "Tyranitarite", // Mega Tyranitar
    "3:1:M"  : "Venusaurite", // Mega Venusaur
    "383:1:M": "Red Orb", // Primal Groudon
    "382:1:M": "Blue Orb" // Primal Kyogre
};

function convertToBaseN (n, base, paddingLength) {
    if (typeof n === "string" || n instanceof String) {
        n = parseInt(n, 10);
    }
    // base 64 lets me do EVs in one digit ((64-1)*4=252)
    // 252 is the maximum number of EVs that will matter and only multiples of 4 can change a Pokemon's stats.
    // also lets me represent pretty much everything in two digits
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // n = base^p
    // ln n = p ln base
    // (ln n)/(ln base) = p
    // floor p
    // p will be the largest integer such that n > base^p
    var p = Math.floor(Math.log(n) / Math.log(base));
    var result = "";
    while (p >= 0) {
        result += digits[Math.floor(n / Math.pow(base, p))];
        n %= Math.pow(base, p);
        p--;
    }
    for (var i = paddingLength - result.length; i > 0; i--) {
        result = "0" + result;
    }
    return result;
}

function convertFromBaseN (n, base) {
    // this is a lot easier
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // The index of the digit is its value, therefore 'Z'=63, '0'=0, and '-'=10.
    // The digit's contribution to the integer value is dependent on its position.
    // value += digit * base^position
    var result = 0;
    for (var i = 0; i < n.length; i++) {
        // We iterate forwards and read the values backwards because the power increases from right to left.
        result += digits.indexOf(n[n.length-1-i]) * Math.pow(base, i);
    }
    return result;
}

function binaryToBase64 (n) {
    // Converting the strings without an integer middleman prevents overflow
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    // A base-64 digit will store exactly 6 bits worth of data.
    // Before adding the digit to the string, we need to know all 6 bits.
    var temp = 0;
    for (var i = 0; i < n.length; i++) {
        /* Iterate forwards. Read right to left. Same reason as before.
         * Left shift is a convient and fast way to multiply by powers of 2.
         * a << b = a * 2^b
         * Each 6 bits translates to one 64-digit and does not effect the other digits.
         * Example:
         * 100101101010
         * 100101 in binary = 37 in decimal = z in base-64
         * 101010 in binary = 42 in decimal = E in base-64
         * 100101101010 in binary = zE in base-64
         */ 
        temp |= digits.indexOf(n[n.length-1-i])  << (i % 6);
        if ((i + 1) % 6 === 0) {
            // left append the digit and reset the temporary value
            result = digits[temp] + result;
            temp = 0;
        }
    }
    if (temp > 0) { // anything left over
        result = digits[temp] + result;
    }
    return result;
}

function base64ToBinary (n) {
    // We don't need to worry about overflow as we're converting one digit at a time.
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = 0; i < n.length; i++) {
        result += convertToBaseN(digits.indexOf(n[i]), 2, 6);
    }
    return result;
}

function pokeToBinary (p) {
    /* format info
     * gen 1 : 109 bits
     * gen 2 : 127 bits
     * gen 3 : 161 bits
     * gen 4 : 166 bits
     * gen 5 : 169 bits
     * gen 6 : 174 bits
     */
    var q = "";
    var poke = getId(p + "Poke").value;
    var species = pokeSpecies(poke);
    var form = pokeForm(poke);
    if (gen <= 2) {
        q += convertToBaseN(species, 2, 8);
    } else if (gen <= 4) {
        q += convertToBaseN(species, 2, 9);
    } else if (gen <= 6) {
        q += convertToBaseN(species, 2, 10);
    }
    if (gen >= 2) {
        q += convertToBaseN(form, 2, 5);
    }
    //released abilities (gen:num) - 3:76, 4:123, 5:164, 6:191
    if (gen === 3 || gen === 4) {
        q += convertToBaseN(getId(p + "Ability").value, 2, 7);
    } else if (gen === 5 || gen === 6) {
        q += convertToBaseN(getId(p + "Ability").value, 2, 8);
    }
    if (gen >= 3) {
        q += convertToBaseN(getId(p + "Nature").value, 2, 5);
    }
    if (gen >= 2) {
        var item = parseInt(getId(p + "Item").value, 10);
        if (item >= 8000) {
            item = (item - 8000) | 0x1000;
        }
        q += convertToBaseN(item, 2, 13);
    }
    q += convertToBaseN(getId(p + "Level").value, 2, 7);
    var stats = gen > 2 ? ["Hp", "Atk", "Def", "Satk", "Sdef", "Spd"]
                        : gen > 1 ? ["Hp", "Atk", "Def", "Satk", "Spd"]
                                  : ["Hp", "Atk", "Def", "Spc", "Spd"];
    for (var i = 0; i < stats.length; i++) {//
        var ev = parseInt(getId(p + stats[i] + "Ev").value, 10) >> 2;
        var iv = parseInt(getId(p + stats[i] + "Iv").value, 10);
        var boost = 6 + parseInt(getId(p + stats[i] + "Boost").value, 10);
        q += convertToBaseN(ev, 2, 6);
        q += convertToBaseN(iv, 2, gen <= 2 ? 5 : 6);
        if (i !== 0) {
            q += convertToBaseN(boost, 2, 4);
        } else if (i === 3 && gen === 2) {
            q += convertToBaseN(6 + parseInt(getId(p + "SdefBoost").value, 10), 2, 4);
        }
    }
    q += convertToBaseN(Math.round(getHpList(p).avg()), 2, 10);
    q += convertToBaseN(getId(p + "Status").value, 2, 3);
    q += convertToBaseN(getId(p + "Type1").value, 2, 5);
    q += convertToBaseN(getId(p + "Type2").value, 2, 5);
    if (gen >= 6) {
        q += convertToBaseN(getId(p + "TypeAdded").value, 2, 5);
    }
    if (gen >= 4) {
        q += getId(p + "FlowerGift").checked ? 1 : 0;
        q += getId(p + "Grounded").checked ? 1 : 0;
        q += getId(p + "PowerTrick").checked ? 1 : 0;
        q += getId(p + "Tailwind").checked ? 1 : 0;
        q += getId(p + "Unburden").checked ? 1 : 0;
    }
    if (gen >= 5) {
        q += getId(p + "Autotomize").checked ? 1 : 0;
    }
    return q;
}

function calcToQueryString() {
    var q = "";
    var moveId = getId("move").value;
    q += convertToBaseN(gen, 2, 4);
    q += pokeToBinary("attacker");
    q += pokeToBinary("defender");
    q += convertToBaseN(moveId, 2, 10);
    q += getId("critical").checked ? 1 : 0;
    q += 0;
    q += getId("screens").checked ? 1 : 0;
    if (gen >= 3) {
        q += getId("helpingHand").checked ? 1 : 0;
        q += getId("charge").checked ? 1 : 0;
        q += getId("multiBattle").checked ? 1 : 0;
        q += getId("waterSport").checked ? 1 : 0;
        q += getId("mudSport").checked ? 1 : 0;
    }
    if (gen >= 4) {
        q += getId("meFirst").checked ? 1 : 0;
    }
    if (gen >= 5) {
        q += getId("friendGuard").checked ? 1 : 0;
        q += getId("magicRoom").checked ? 1 : 0;
        q += getId("wonderRoom").checked ? 1 : 0;
    }
    if (gen >= 6) {
        q += getId("grassyTerrain").checked ? 1 : 0;
        q += getId("mistyTerrain").checked ? 1 : 0;
        q += getId("electricTerrain").checked ? 1 : 0;
        q += getId("invertedBattle").checked ? 1 : 0;
        q += getId("fairyAura").checked ? 1 : 0;
        q += getId("darkAura").checked ? 1 : 0;
        q += getId("auraBreak").checked ? 1 : 0;
        q += getId("electrify").checked ? 1 : 0;
        q += getId("ionDeluge").checked ? 1 : 0;
    }
    if (gen === 2) {
        q += convertToBaseN(parseInt(getId("weather").value, 10), 2, 2);
    } else if (gen > 2 && gen < 6) {
        q += convertToBaseN(parseInt(getId("weather").value, 10), 2, 3);
    } else if (gen >= 6) {
        q += convertToBaseN(parseInt(getId("weather").value, 10), 2, 4);
    }
    if (db.minMaxHits(gen, moveId) && db.minMaxHits(gen, moveId) > 1 && db.moves(moveId) !== "Beat Up") {
        q += convertToBaseN(parseInt(getId("minMaxHits").value, 10), 2, 3);
    }
    while (q.length % 6 !== 0) {
        q += "0";
    }
    return binaryToBase64(q);
}

function binaryToPoke (p, str) {
    var poke;
    var ptr = 0;
    if (gen <= 2) {
        poke = convertFromBaseN(str.substr(ptr, 8), 2) + ":";
        ptr += 8;
    } else if (gen <= 4) {
        poke = convertFromBaseN(str.substr(ptr, 9), 2) + ":";
        ptr += 9;
    } else if (gen <= 6) {
        poke = convertFromBaseN(str.substr(ptr, 10), 2) + ":";
        ptr += 10;
    }
    if (gen >= 2) {
        poke += convertFromBaseN(str.substr(ptr, 5), 2);
        ptr += 5;
    }
    setPoke(p + "Poke", poke);
    if (gen === 3 || gen === 4) {
        setSelectByValue(p + "Ability", convertFromBaseN(str.substr(ptr, 7), 2) + "");
        ptr += 7;
    } else if (gen === 5 || gen === 6) {
        setSelectByValue(p + "Ability", convertFromBaseN(str.substr(ptr, 8), 2) + "");
        ptr += 8;
    }
    if (gen >= 3) {
        setSelectByValue(p + "Nature", convertFromBaseN(str.substr(ptr, 5), 2) + "");
        ptr += 5;
    }
    if (gen >= 2) {
        var itemNum = convertFromBaseN(str.substr(ptr, 13), 2);
        ptr += 13;
        if (itemNum & 0x1000) {
            itemNum = (itemNum & ~0x1000) + 8000;
        }
        setSelectByValue(p + "Item", itemNum + "");
    }
    getId(p + "Level").value = convertFromBaseN(str.substr(ptr, 7), 2);
    ptr += 7;
    var stats = gen > 2 ? ["Hp", "Atk", "Def", "Satk", "Sdef", "Spd"]
                        : gen > 1 ? ["Hp", "Atk", "Def", "Satk", "Spd"]
                                  : ["Hp", "Atk", "Def", "Spc", "Spd"];
    for (var i = 0; i < stats.length; i++) {
        var temp = convertFromBaseN(str.substr(ptr, 6), 2) << 2;
        getId(p + stats[i] + "Ev").value = gen < 3 && temp >= 252 ? 255 : temp;
        ptr += 6;
        getId(p + stats[i] + "Iv").value = convertFromBaseN(str.substr(ptr, gen <= 2 ? 5 : 6), 2);
        ptr += gen <= 2 ? 5 : 6;
        if (i !== 0) {
            setSelectByValue(p + stats[i] + "Boost", (convertFromBaseN(str.substr(ptr, 4), 2) - 6) + "");
            ptr += 4;
        } else if (i === 3 && gen === 2) {
            setSelectByValue(p + "SdefBoost", (convertFromBaseN(str.substr(ptr, 4), 2) - 6) + "");
            ptr += 4;
        }
    }
    getId(p + "HP").value = convertFromBaseN(str.substr(ptr, 10), 2);
    ptr += 10;
    setSelectByValue(p + "Status", convertFromBaseN(str.substr(ptr, 3), 2) + "");
    ptr += 3;
    setSelectByValue(p + "Type1", convertFromBaseN(str.substr(ptr, 5), 2) + "");
    ptr += 5;
    setSelectByValue(p + "Type2", convertFromBaseN(str.substr(ptr, 5), 2) + "");
    ptr += 5;
    if (gen >= 6) {
        setSelectByValue(p + "TypeAdded", convertFromBaseN(str.substr(ptr, 5), 2) + "");
        ptr += 5;
    }
    if (gen >= 4) {
        getId(p + "FlowerGift").checked = str[ptr++] === "1";
        getId(p + "Grounded").checked = str[ptr++] === "1";
        getId(p + "PowerTrick").checked = str[ptr++] === "1";
        getId(p + "Tailwind").checked = str[ptr++] === "1";
        getId(p + "Unburden").checked = str[ptr++] === "1";
    }
    if (gen >= 5) {
        getId(p + "Autotomize").checked = str[ptr++] === "1";
    }
    updateStats(p);
}

function loadQueryString (q) {
    /* poke format info
     * gen 1 : 109 bits
     * gen 2 : 127 bits
     * gen 3 : 161 bits
     * gen 4 : 166 bits
     * gen 5 : 169 bits
     * gen 6 : 174 bits
     */
    q = base64ToBinary(q);
    var ptr = 0;
    changeGen(convertFromBaseN(q.substr(ptr, 4), 2), true);
    ptr += 4;
    var size = [0, 109, 127, 161, 166, 169, 174];
    binaryToPoke("attacker", q.substr(ptr, size[gen]));
    ptr += size[gen];
    binaryToPoke("defender", q.substr(ptr, size[gen]));
    ptr += size[gen];
    
    var moveId = convertFromBaseN(q.substr(ptr, 10), 2) + "";
    setSelectByValue("move", moveId);
    ptr += 10;
    getId("critical").checked = q[ptr++] === "1";
    ptr++; // old flash fire
    getId("screens").checked = q[ptr++] === "1";
    if (gen >= 3) {
        getId("helpingHand").checked = q[ptr++] === "1";
        getId("charge").checked = q[ptr++] === "1";
        getId("multiBattle").checked = q[ptr++] === "1";
        getId("waterSport").checked = q[ptr++] === "1";
        getId("mudSport").checked = q[ptr++] === "1";
    }
    if (gen >= 4) {
        getId("meFirst").checked = q[ptr++] === "1";
    }
    if (gen >= 5) {
        getId("friendGuard").checked = q[ptr++] === "1";
        getId("magicRoom").checked = q[ptr++] === "1";
        getId("wonderRoom").checked = q[ptr++] === "1";
    }
    if (gen >= 6) {
        getId("grassyTerrain").checked = q[ptr++] === "1";
        getId("mistyTerrain").checked = q[ptr++] === "1";
        getId("electricTerrain").checked = q[ptr++] === "1";
        getId("invertedBattle").checked = q[ptr++] === "1";
        getId("fairyAura").checked = q[ptr++] === "1";
        getId("darkAura").checked = q[ptr++] === "1";
        getId("auraBreak").checked = q[ptr++] === "1";
        getId("electrify").checked = q[ptr++] === "1";
        getId("ionDeluge").checked = q[ptr++] === "1";
    }
    if (gen === 2 && q.length - ptr >= 2) {
        setSelectByValue("weather", convertFromBaseN(q.substr(ptr, 2), 2) + "");
        ptr += 2;
    } else if (gen > 2 && gen < 6 && q.length - ptr >= 3) {
        setSelectByValue("weather", convertFromBaseN(q.substr(ptr, 3), 2) + "");
        ptr += 3;
    } else if (gen >= 6 && q.length - ptr >= 4) {
        setSelectByValue("weather", convertFromBaseN(q.substr(ptr, 4), 2) + "");
        ptr += 4;
    }
    if (q.length - ptr >= 3 && db.minMaxHits(gen, moveId) && db.minMaxHits(gen, moveId) > 1 && db.moves(moveId) !== "Beat Up") {
        setSelectByValue("minMaxHits", convertFromBaseN(q.substr(ptr, 3), 2) + "");
        ptr += 3;
    }
    updateMoveOptions();
    updateAttackerItemOptions();
    updateAttackerAbilityOptions();
    updateDefenderAbilityOptions();
}

function setText (id, txt) {
    if ("textContent" in document.body) {
        getId(id).textContent = txt;
    } else {
        getId(id).innerText = txt;
    }
}

function getText (id) {
    if ("textContent" in document.body) {
        return getId(id).textContent;
    }
    return getId(id).innerText;
}

function setTextE (e, txt) {
    if ("textContent" in document.body) {
        e.textContent = txt;
    } else {
        e.innerText = txt;
    }
}

function getTextE (e) {
    if ("textContent" in document.body) {
        return e.textContent;
    }
    return e.innerText;
}

/*
 * http://blog.stevenlevithan.com/archives/faster-than-innerhtml
 * Literally made this application not a nightmare to use when not using Chrome (i.e. on Firefox)
 * Very useful snippet of code. I've adapted it slightly as needed for my purposes.
 * Also, it's a good thing this code is compatible with GPLv3.
 */
function replaceHtml (id, html) {
    var oldE = getId(id);
    /*@cc_on
        oldE.innerHTML = html;
        return;
    @*/
    var newE = oldE.cloneNode(false);
    ["onclick", "onchange"].forEach(function (val, idx, arr) { // I don't feel like finding them all
        newE[val] = oldE[val];
    });
    newE.innerHTML = html;
    oldE.parentNode.replaceChild(newE, oldE);
};


function replaceHtmlE (oldE, html) {
    /*@cc_on
        oldE.innerHTML = html;
        return;
    @*/
    var newE = oldE.cloneNode(false);
    ["onclick", "onchange"].forEach(function (val, idx, arr) { // I don't feel like finding them all
        newE[val] = oldE[val];
    });
    newE.innerHTML = html;
    oldE.parentNode.replaceChild(newE, oldE);
};

function setPoke(e, p) {
    if ((typeof e === "string") || (e instanceof String)) {
        e = getId(e);
    }
    for (var i = e.options.length - 1; i >= 0; i--) {
        if (e.options[i].value.substr(0, p.length) === p) {
            e.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function setSelectByValue(e, value) {
    if ((typeof e === "string") || (e instanceof String)) {
        e = getId(e);
    }
    for (var i = e.options.length - 1; i >= 0; i--) {
        if (e.options[i].value === value) {
            e.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function setSelectByText(e, text) {
    if ((typeof e === "string") || (e instanceof String)) {
        e = getId(e);
    }
    for (var i = e.options.length - 1; i >= 0; i--) {
        if (e.options[i].text === text) {
            e.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function updateFormatting() {
    // valign labels next to the inputs because doing it with pure HTML/CSS is hard
    // make sure everything is displaying
    var toggleElements = document.getElementsByClassName("morePokeOptions"),
        originalDisplay = [];
    for (var i = toggleElements.length - 1; i >= 0; i--) {
        originalDisplay[i] = toggleElements[i].style.display;
        toggleElements[i].style.display = "";
    }
    var strs = ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"];
    for (var i = 0; i < strs.length; i++) {
        var e = getId("attacker" + strs[i] + "Stat");
        e.style.lineHeight = e.parentNode.offsetHeight + "px";
        e = getId("defender" + strs[i] + "Stat");
        e.style.lineHeight = e.parentNode.offsetHeight + "px";
    }
    
    var levelButtons = document.getElementsByClassName("levelButton");
    for (var i = levelButtons.length - 1; i >= 0; i--) {
        levelButtons[i].style.lineHeight = (levelButtons[i].parentNode.clientHeight - 6) + "px";
    }
    
    var statNames = document.getElementsByClassName("textLabel");
    for (var i = statNames.length - 1; i >= 0; i--) {
        statNames[i].style.lineHeight = statNames[i].parentNode.offsetHeight + "px";
    }
    
    var h = document.getElementsByClassName("textLabel");
    for (var i = h.length - 1; i >= 0; i--) {
        h[i].style.lineHeight = h[i].parentNode.offsetHeight + "px";
    }
    
    for (var i = 0; i < 6; i++) {
        getId("beatUpLevel" + i).style.display = (gen <= 4 ? "" : "none");
    }
    getId("beatUpLevelLabel").style.display = (gen <= 4 ? "" : "none");
    
    var w = Math.max(getId("attacker").offsetWidth, getId("defender").offsetWidth) * 2;
    getId("calculator").style.width = w + "px";
    getId("calculator").style.marginLeft = "auto";
    getId("calculator").style.marginRight = "auto";
    getId("calculator").style.cssFloat = "none";
    getId("calc").style.width = w + "px";
    // possibly rehide
    for (var i = toggleElements.length - 1; i >= 0; i--) {
        toggleElements[i].style.display = originalDisplay[i];
    }
}

function changeGen (n, light) {
    light = !!light;
    resultingDefenderHealth = null;
    var oldgen = gen;
    gen = n;
    // reset form first
    setText("results", "");
    getId("attackerNature").selectedIndex = 0;
    if (!light) updateAttackerItemOptions();
    getId("attackerLevel").value = 100;
    getId("attackerHP").value = "";
    getId("attackerHPp").value = "";
    setText("attackerTotalHP", "???");
    getId("attackerGrounded").checked = false;
    getId("attackerTailwind").checked = false;
    getId("attackerUnburden").checked = false;
    getId("attackerAutotomize").checked = false;
    getId("attackerFlowerGift").checked = false;
    getId("attackerPowerTrick").checked = false;
    getId("defenderNature").selectedIndex = 0;
    getId("defenderLevel").value = 100;
    getId("defenderHP").value = "";
    getId("defenderHPp").value = "";
    setText("defenderTotalHP", "???");
    getId("defenderGrounded").checked = false;
    getId("defenderTailwind").checked = false;
    getId("defenderUnburden").checked = false;
    getId("defenderAutotomize").checked = false;
    getId("defenderFlowerGift").checked = false;
    getId("defenderPowerTrick").checked = false;
    function makeCheckbox (id, label) {
        return "<label><input type='checkbox' id='" + id + "' />" + label + "</label>";
    }
    if (gen <= 2) {
        replaceHtml("col1", makeCheckbox("critical", "Critical Hit")
                            + makeCheckbox("screens", "Light Screen/Reflect"));
        if (gen === 2) {
            replaceHtml("col2", makeCheckbox("foresight", "Foresight"));
        } else {
            replaceHtml("col2", "");
        }
        replaceHtml("col3", "");
    } else if (gen === 3) {
        replaceHtml("col1", makeCheckbox("critical", "Critical Hit")
                            + makeCheckbox("screens", "Light Screen/Reflect")
                            + makeCheckbox("foresight", "Foresight"));
        replaceHtml("col2", makeCheckbox("multiBattle", "Doubles Battle")
                            + makeCheckbox("helpingHand", "Helping Hand")
                            + makeCheckbox("charge", "Charge"));
        replaceHtml("col3", makeCheckbox("waterSport", "Water Sport")
                            + makeCheckbox("mudSport", "Mud Sport"));
    } else if (gen === 4) {
        replaceHtml("col1", makeCheckbox("critical", "Critical Hit")
                            + makeCheckbox("screens", "Light Screen/Reflect")
                            + makeCheckbox("foresight", "Foresight"));
        replaceHtml("col2", makeCheckbox("multiBattle", "Doubles/Triples Battle")
                            + makeCheckbox("helpingHand", "Helping Hand")
                            + makeCheckbox("meFirst", "Me First"));
        replaceHtml("col3", makeCheckbox("waterSport", "Water Sport")
                            + makeCheckbox("mudSport", "Mud Sport")
                            + makeCheckbox("charge", "Charge"));
    } else if (gen === 5) {
        replaceHtml("col1", makeCheckbox("critical", "Critical Hit")
                            + makeCheckbox("screens", "Light Screen/Reflect")
                            + makeCheckbox("foresight", "Foresight")
                            + makeCheckbox("meFirst", "Me First"));
        replaceHtml("col2", makeCheckbox("multiBattle", "Doubles/Triples Battle")
                            + makeCheckbox("helpingHand", "Helping Hand")
                            + makeCheckbox("friendGuard", "Friend Guard")
                            + makeCheckbox("charge", "Charge"));
        replaceHtml("col3", makeCheckbox("waterSport", "Water Sport")
                            + makeCheckbox("mudSport", "Mud Sport")
                            + makeCheckbox("magicRoom", "Magic Room")
                            + makeCheckbox("wonderRoom", "Wonder Room"));
    } else if (gen === 6) {
        replaceHtml("col1", makeCheckbox("critical", "Critical Hit")
                            + makeCheckbox("screens", "Light Screen/Reflect")
                            + makeCheckbox("invertedBattle", "Inverted Battle")
                            + makeCheckbox("foresight", "Foresight")
                            + makeCheckbox("meFirst", "Me First")
                            + makeCheckbox("electrify", "Electrify")
                            + makeCheckbox("ionDeluge", "Ion Deluge"));
        replaceHtml("col2", makeCheckbox("multiBattle", "Doubles/Triples Battle")
                            + makeCheckbox("helpingHand", "Helping Hand")
                            + makeCheckbox("friendGuard", "Friend Guard")
                            + makeCheckbox("waterSport", "Water Sport")
                            + makeCheckbox("mudSport", "Mud Sport")
                            + makeCheckbox("magicRoom", "Magic Room")
                            + makeCheckbox("wonderRoom", "Wonder Room"));
        replaceHtml("col3", makeCheckbox("charge", "Charge")
                            + makeCheckbox("grassyTerrain", "Grassy Terrain")
                            + makeCheckbox("mistyTerrain", "Misty Terrain")
                            + makeCheckbox("electricTerrain", "Electric Terrain")
                            + makeCheckbox("fairyAura", "Fairy Aura")
                            + makeCheckbox("darkAura", "Dark Aura")
                            + makeCheckbox("auraBreak", "Aura Break"));
    }
    getId("minimize").checked = false;
    getId("dig").checked = false;
    getId("dive").checked = false;
    getId("moved").checked = false;
    getId("damaged").checked = false;
    getId("echoedVoice").selectedIndex = 0;
    getId("trumpCardPP").selectedIndex = 0;
    getId("round").checked = false;
    getId("fly").checked = false;
    resetBeatUp();
    getId("stockpile").value = 0;
    getId("switchOut").checked = false;
    getId("present").selectedIndex = 0;
    getId("magnitude").selectedIndex = 0;
    getId("defenseCurl").checked = false;
    getId("rollout").selectedIndex = 0;
    getId("previouslyFainted").checked = false;
    getId("fusionBolt").checked = false;
    getId("fusionFlare").checked = false;
    getId("pledge").checked = false;

    if (gen >= 3) {
        getId("attackerSdefIv").disabled = false;
        getId("attackerSdefEv").disabled = false;
        getId("attackerHpIv").disabled = false;
        getId("defenderSdefIv").disabled = false;
        getId("defenderSdefEv").disabled = false;
        getId("defenderHpIv").disabled = false;
        replaceHtml("hiddenPowerIvs", "<option value='0'>31-31-31-31-31-31</option>");
    } else if (gen === 2) {
        getId("attackerSdefIv").disabled = true;
        getId("attackerSdefEv").disabled = true;
        getId("attackerHpIv").disabled = true;
        getId("defenderSdefIv").disabled = true;
        getId("defenderSdefEv").disabled = true;
        getId("defenderHpIv").disabled = true;
        replaceHtml("hiddenPowerIvs", "<option value='0'>15-15-15-15-15-15</option>");
    } else {
        getId("attackerHpIv").disabled = true;
        getId("defenderHpIv").disabled = true;
    }
    setSelectByText(getId("hiddenPowerType"), "Dark");
    
    var ops = "";
    var end = gen < 5 ? 10 : 5;
    var step = gen < 5 ? 1 : 2;
    for (var i = 0; i <= end; i++) {
        ops += "<option value='" + i + "'>" + i;
        if (i === end) {
            ops += "+";
        }
        ops += " (" + Math.floor(i * step / 10 + 1) + "." + ((i * step) % 10) + "x)</option>";
    }
    replaceHtml("metronome", ops);
    
    var bp = gen < 5 ? 10 : (gen < 6 ? 20 : 40);
    end = gen < 5 ? 4 : (gen < 6 ? 3 : 2);
    ops = "";
    for (var i = 0; i <= end; i++) {
        ops += "<option value='" + i + "'>" + i;
        if (i === end) {
            ops += "+";
        }
        ops += " hits (" + (bp << i) + " BP)</option>";
    }
    replaceHtml("furyCutter", ops);
    
    var strs = [["attacker", "defender"], ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"]];
    for (var i = 0; i < strs[0].length; i++) {
        for (var j = 0; j < strs[1].length; j++) {
            getId(strs[0][i] + strs[1][j] + "Ev").value = gen > 2 ? 0 : 255;
            getId(strs[0][i] + strs[1][j] + "Iv").value = gen > 2 ? 31 : 15;
            setText(strs[0][i] + strs[1][j] + "Stat", "");
            if (strs[1][j] !== "Hp") {
                getId(strs[0][i] + strs[1][j] + "Boost").selectedIndex = 6;
            }
        }
    }
    
    var insertOpOrder = function (arr, a) {
        var low = 0, mid = 0, high = arr.length;
        if (high < 1) {
            arr.push(a);
            return arr;
        }
        while (high - low > 1) {
            mid = (low + high) >> 1;
            if (a[1] > arr[mid][1]) {
                low = mid;
            } else if (a[1] < arr[mid][1]) {
                high = mid;
            } else {
                arr.splice(mid, 0, a);
                return arr;
            }
        }
        while (low < high && a[1] > arr[low][1]) {
            ++low;
        }
        arr.splice(low, 0, a);
        return arr;
    };
    
    var getOptions = function (ops) {
        var s = "";
        for (var i = 0; i < ops.length; i++) {
            s += "<option value='" + ops[i][0] + "'>" + ops[i][1] + "</option>";
        }
        return s;
    };
    
    db.preload("pokemons", 0, "pokemons.json", function() {
    db.preload("releasedPokes", 0, "releasedPokes.json", function() {
        var arr = [], id = "";
        var onlyZero = ["201", "666", "676", "25", "669", "671", "585", "586", "172", "422", "423", "550", "716"];
        var redundantForms = ["493:18", "0:0"];
        if (gen === 6) { // just a quick fix to unreleased stuff
            for (var a in db.pokemons()) {
                if (redundantForms.indexOf(a) > -1
                    || (onlyZero.indexOf(a.substring(0, a.indexOf(":"))) > -1 && a.charAt(a.indexOf(":") + 1) !== "0")
                    || (a.indexOf("670:") === 0 && a.charAt(4) !== "0" && a.charAt(4) !== "5")) {
                    continue;
                }
                arr = insertOpOrder(arr, [a, db.pokemons(a)]);
            }
        } else {
            for (var a in db.releasedPokes(gen)) {
                id = db.releasedPokes(gen, a);
                if (db.pokemons(id + ":H")) {
                    id += ":H";
                } else if (db.pokemons(id + ":M")) {
                    continue;
                } else if (db.pokemons(id + ":B")) {
                    id += ":B";
                } else if (id === "292:0") {
                    id = "292:0:1";
                }
                if (redundantForms.indexOf(id) > -1
                    || (onlyZero.indexOf(id.substring(0, id.indexOf(":"))) > -1 && id.charAt(id.indexOf(":") + 1) !== "0")
                    || (id.indexOf("670:") === 0 && id.charAt(4) !== "0" && id.charAt(4) !== "5")) {
                    continue;
                }
                arr = insertOpOrder(arr, [id, db.pokemons(id)]);
            }
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0].charAt(arr[i][0].lastIndexOf(":") + 1) === "H") {
                var j = 0;
                var s = arr[i][0].substr(0, arr[i][0].indexOf(":"));
                while ((db.releasedPokes(gen).indexOf(s + ":" + ++j) > -1 || gen === 6) // stay positive and bypass released pokes
                       && db.pokemons(s + ":" + j + ":M") !== undefined) {
                    arr.splice(++i, 0, [s + ":" + j + ":M", db.pokemons(s + ":" + j + ":M")]);
                }
            }
        }
        arr.splice(0, 0, ["0:0", "Missingno"]);
        var htmlOps = getOptions(arr);
        replaceHtml("attackerPoke", htmlOps);
        replaceHtml("defenderPoke", htmlOps);
    });
    });
    updateAttackerSets();
    updateDefenderSets();

    db.preload("abilities", 0, "abilities.json", function() {
        var arr = [];
        var genAbilityLists = [null, 0, 0, 76, 123, 164, 191];
        for (var i = 0; i < genAbilityLists[gen]; i++) {
            arr = insertOpOrder(arr, [i, db.abilities(i)]);
        }
        var htmlOps = getOptions(arr);
        replaceHtml("attackerAbility", htmlOps);
        replaceHtml("defenderAbility", htmlOps);
    });
    
    db.preload("moves", 0, "moves.json", function() {
    db.preload("releasedMoves", 0, "releasedMoves.json", function() {
    db.preload("movePowers", 6, "power.json", function() {
        var arr = [], id = "";
        var isMoveUseless = function (m) {
            if (db.movePowers(6, m) > 0) {
                return false;
            }
            return m !== "0";
        };
        for (var a in db.releasedMoves(gen)) {
            if (!isMoveUseless(a)) {
                id = db.releasedMoves(gen, a);
                arr = insertOpOrder(arr, [id, db.moves(id)]);
            }
        }
        replaceHtml("move", getOptions(arr));
    });
    });
    });
    
    db.preload("items", 0, "items.json", function() {
    db.preload("releasedItems", 0, "releasedItems.json", function() {
    db.preload("berries", 0, "berries.json", function() {
    db.preload("releasedBerries", 0, "releasedBerries.json", function() {
        var arr = [], id = "";
        var suggestions = [];
        for (var a in db.releasedItems(gen)) {
            id = db.releasedItems(gen, a);
            arr = insertOpOrder(arr, [id, db.items(id)]);
        }
        for (var a in db.releasedBerries(gen)) {
            id = db.releasedBerries(gen, a);
            arr = insertOpOrder(arr, [parseInt(id, 10) + 8000, db.berries(id)]);
        }
        var htmlOps = getOptions(arr);
        replaceHtml("attackerItem", htmlOps);
        replaceHtml("defenderItem", htmlOps);
    });
    });
    });
    });
    
    var typeOps = "<option value='18'>---</option>";
    for (var i = 0; i < 18; i++) {
        if ((gen === 1 && (i === 8 || i === 16))
            || (gen < 6 && i === 17)) {
            continue;
        }
        typeOps += "<option value='" + i + "'>" + db.types(i) + "</option>";
    }
    var typeLists = document.getElementsByClassName("typeList");
    for (var i = typeLists.length - 1; i >= 0; i--) {
        replaceHtmlE(typeLists[i], typeOps);
    }
    
    str = "<option value='0'>Clear</option><option value='4'>Sun</option><option value='2'>Rain</option><option value='3'>Sand</option>";
    str += gen >= 3 ? "<option value='1'>Hail</option>" : "";
    str += gen >= 6 ? "<option value='6'>Harsh Sun</option><option value='5'>Heavy Rain</option><option value='7'>Strong Winds</option>" : "";
    replaceHtml("weather", str);
    
    for (var i = 1; i <= 6; i++) {
        getId("cgen" + i).className = (gen === i) ? "selectGen selectedGen" : "selectGen";
    }
    
    var g = document.getElementsByTagName("*");
    for (var i = g.length - 1; i >= 0; i--) {
        if (g[i].className) {
            if (g[i].className.indexOf("G_") > -1) {
                if (g[i].className.substring(g[i].className.indexOf("G_") + 2).indexOf(gen + "") > -1) {
                    g[i].style.display = "";
                } else {
                    g[i].style.display = "none";
                }
            }
        }
    }
    
    if (!light) {
        updateMoveOptions();
        updateAttackerAbilityOptions();
        updateDefenderAbilityOptions();
    }
    updateFormatting();
}

function pokeForm (id) {
    if (id.indexOf(":") !== id.lastIndexOf(":")) {
        return id.substring(id.indexOf(":") + 1, id.lastIndexOf(":"));
    }
    return id.substring(id.indexOf(":") + 1);
}

function pokeSpecies (id) {
    return id.substring(0, id.indexOf(":"));
}

function options (j) {
    var str = "";
    for (var a in j) {
        str += "<option value='" + a + "'>" + j[a] + "</option>";
    }
    return str;
}

function options8000 (j) {
    var str="";
    for (var a in j) {
        str += "<option value='" + (parseInt(a, 10)+8000) + "'>" + j[a] + "</option>";
    }
    return str;
}

function getEvs (p) {
    return [ parseInt(getId(p + "HpEv").value, 10),
             parseInt(getId(p + "AtkEv").value, 10),
             parseInt(getId(p + "DefEv").value, 10),
             gen > 1 ? parseInt(getId(p + "SatkEv").value, 10) : parseInt(getId(p + "SpcEv").value, 10),
             gen > 1 ? parseInt(getId(p + "SdefEv").value, 10) : parseInt(getId(p + "SpcEv").value, 10),
             parseInt(getId(p + "SpdEv").value, 10) ];
}

function getIvs (p) {
    return [ parseInt(getId(p + "HpIv").value, 10),
             parseInt(getId(p + "AtkIv").value, 10),
             parseInt(getId(p + "DefIv").value, 10),
             gen > 1 ? parseInt(getId(p + "SatkIv").value, 10) : parseInt(getId(p + "SpcIv").value, 10),
             gen > 1 ? parseInt(getId(p + "SdefIv").value, 10) : parseInt(getId(p + "SpcIv").value, 10),
             parseInt(getId(p + "SpdIv").value, 10) ];
}

function getBoosts (p) {
    return [ 0,
             parseInt(getId(p + "AtkBoost").value, 10),
             parseInt(getId(p + "DefBoost").value, 10),
             gen > 1 ? parseInt(getId(p + "SatkBoost").value, 10) : parseInt(getId(p + "SpcBoost").value, 10),
             gen > 1 ? parseInt(getId(p + "SdefBoost").value, 10) : parseInt(getId(p + "SpcBoost").value, 10),
             parseInt(getId(p + "SpdBoost").value, 10),
             0, 0 ];
}
    
function setEvs (p, e) {
    getId(p + "HpEv").value = e[Sulcalc.Stats.HP];
    getId(p + "AtkEv").value = e[Sulcalc.Stats.ATK];
    getId(p + "DefEv").value = e[Sulcalc.Stats.DEF];
    getId(p + "SatkEv").value = gen > 2 ? e[Sulcalc.Stats.SATK] : e[Sulcalc.Stats.SPC];
    getId(p + "SdefEv").value = gen > 2 ? e[Sulcalc.Stats.SDEF] : e[Sulcalc.Stats.SPC];
    getId(p + "SpcEv").value = e[Sulcalc.Stats.SPC];
    getId(p + "SpdEv").value = e[Sulcalc.Stats.SPD];
}

function setIvs (p, i) {
    getId(p + "HpIv").value = (gen > 2) ? i[Sulcalc.Stats.HP] : (i[1] & 1) << 3 | (i[2] & 1) << 2 | (i[5] & 1) << 1 | (i[3] & 1);
    getId(p + "AtkIv").value = i[Sulcalc.Stats.ATK];
    getId(p + "DefIv").value = i[Sulcalc.Stats.DEF];
    getId(p + "SatkIv").value = i[Sulcalc.Stats.SATK];
    getId(p + "SdefIv").value = i[Sulcalc.Stats.SDEF];
    getId(p + "SpcIv").value = i[Sulcalc.Stats.SPC];
    getId(p + "SpdIv").value = i[Sulcalc.Stats.SPD];
}

function setBoosts (p, b) {
    getId(p + "AtkBoost").value = b[Sulcalc.Stats.ATK];
    getId(p + "DefBoost").value = b[Sulcalc.Stats.DEF];
    getId(p + "SatkBoost").value = b[Sulcalc.Stats.SATK];
    getId(p + "SdefBoost").value = b[Sulcalc.Stats.SDEF];
    getId(p + "SpcBoost").value = b[Sulcalc.Stats.SPC];
    getId(p + "SpdBoost").value = b[Sulcalc.Stats.SPD];
}

function updatePoke (p) {
    var poke = new Sulcalc.Pokemon();
    poke.id = getId(p + "Poke").value;
    getId(p + "Nature").selectedIndex = 0;
    if (gen > 1) {
        if (poke.id in pokeToItem) {
            setSelectByText(p + "Item", pokeToItem[poke.id]);
        } else {
            getId(p + "Item").selectedIndex = 0;
        }
    }
    getId(p + "Status").selectedIndex = 0;
    
    db.preload("evolutions", 0, "evolutions.json", function() {
    db.preload("releasedPokes", 0, "releasedPokes.json", function() {
        var released = db.releasedPokes(gen);
        if (gen >= 5 && getId(p + "Item").value === "0" && poke.hasEvolution()) {
            setSelectByText(p + "Item", "Eviolite");
        }
        var hasPreEvo = false; // Little Cup check
        for (var e in db.evolutions()) {
            if (released.indexOf(e + ":0") > -1 && db.evolutions(e).indexOf(parseInt(poke.species(), 10)) > -1) {
                hasPreEvo = true;
                break;
            }
        }
        getId(p + "Level").value = !hasPreEvo && poke.hasEvolution() ? 5 : 100;
    });
    });
    
    db.preload("pokeType1", gen, "pokeType1.json", function() {
    db.preload("pokeType2", gen, "pokeType2.json", function() {
        setSelectByValue(p + "Type1", poke.type1() + "");
        setSelectByValue(p + "Type2", poke.type2() + "");
    });
    });
    
    var strs = ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"];
    for (var i = 0; i < strs.length; i++) {
        getId(p + strs[i] + "Ev").value = gen > 2 ? 0 : 255;
        getId(p + strs[i] + "Iv").value = gen > 2 ? 31 : 15;
        getId(p + strs[i] + "Boost").selectedIndex = 6;
    }
    
    getId(p + "HP").value = getId(p + "HPp").value = "";
    
    db.preload("ability1", 0, "ability1.json", function() {
    db.preload("ability2", 0, "ability2.json", function() {
        var suggestions = "";
        if (gen < 5) {
            if (poke.ability1() > 0) {
                suggestions += "<option value='" + poke.ability1() + "'>" + db.abilities(poke.ability1()) + "</option>";
            }
            if (poke.ability2() > 0) {
                suggestions += "<option value='" + poke.ability2() + "'>" + db.abilities(poke.ability2()) + "</option>";
            }
        } else db.preload("ability3", 0, "ability3.json", function() {
            if (poke.ability1() > 0) {
                suggestions += "<option value='" + poke.ability1() + "'>" + db.abilities(poke.ability1()) + "</option>";
            }
            if (poke.ability2() > 0) {
                suggestions += "<option value='" + poke.ability2() + "'>" + db.abilities(poke.ability2()) + "</option>";
            }
            if (poke.ability3() > 0) {
                suggestions += "<option value='" + poke.ability3() + "'>" + db.abilities(poke.ability3()) + "</option>";
            }
            if (suggestions !== "") {
                suggestions += "<option value='divider' disabled>─────────────</option>";
            }
            eAbility = getId(p + "Ability");
            var tempHtml = eAbility.innerHTML;
            if (tempHtml.lastIndexOf("─") > -1) {
                tempHtml = tempHtml.substr(tempHtml.lastIndexOf("─") + 10);
            } else {
                tempHtml = tempHtml.substr(39);
            }
            replaceHtmlE(eAbility, "<option value='0'>(No Ability)</option>" + suggestions + tempHtml);
            eAbility.selectedIndex = 0;
        });
    });
    });
    
    updateStats(p);
}

function updateHpPercent (p, ranged) {
    var poke = new Sulcalc.Pokemon();
    poke.id = getId(p + "Poke").value;
    if (poke.id === "0:0") {
        getId(p + "HP").value = "";
        return;
    }
    poke.level = parseInt(getId(p + "Level").value, 10);
    poke.evs = getEvs(p);
    poke.ivs = getIvs(p);
    var total = poke.stat(Sulcalc.Stats.HP),
        currentPoints = getId(p + "HP").value;
    // getHpList is not used here as it does not validate the data
    if (currentPoints.length === 0) {
        getId(p + "HPp").value = "100";
        getId(p + "HP").value = total;
        return;
    }
    if (ranged && currentPoints.indexOf("-") > -1) {
        // ranged, not a damage roll
        if (currentPoints.indexOf("-") !== currentPoints.lastIndexOf("-")) {
            getId(p + "HPp").value = "100";
            getId(p + "HP").value = total;
            return;
        }
        currentPoints = currentPoints.replace(/\s/g, "").split("-");
        if (currentPoints[0].match(/[^0-9]/g) !== null || currentPoints[1].match(/[^0-9]/g) !== null) {
            // one side of the range is not a number, so just default to max hp
            getId(p + "HPp").value = "100";
            getId(p + "HP").value = total;
            return;
        }
        currentPoints[0] = Math.max(1, Math.min(total, parseInt(currentPoints[0], 10)));
        currentPoints[1] = Math.max(1, Math.min(total, parseInt(currentPoints[1], 10)));
        if (currentPoints[1] === currentPoints[0]) {
            getId(p + "HPp").value = Math.max(1, Math.min(100, Math.floor(100 * currentPoints[0] / total)));
            getId(p + "HP").value = Math.max(1, Math.min(total, currentPoints[0]));
        } else {
            getId(p + "HPp").value = Math.max(1, Math.min(100, Math.floor(100 * Math.min(currentPoints[0], currentPoints[1]) / total)));
            getId(p + "HP").value = Math.min(currentPoints[0], currentPoints[1]) + " - " + Math.max(currentPoints[0], currentPoints[1]);
        }
    } else if (ranged && currentPoints.indexOf(":") > -1) {
        // ranged, damage roll
        currentPoints = currentPoints.replace(/\s/g, "").split(",");
        var numArr = new Sulcalc.WeightedArray([]), tempVal = 0, strList = "";
        for (var i = 0; i < currentPoints.length; i++) {
            currentPoints[i] = currentPoints[i].split(":");
            if (currentPoints[i][0].length === 0 || currentPoints[i][0].match(/[^0-9]/g) !== null) continue;
            if (currentPoints[i].length === 1) {
                numArr.add(parseInt(currentPoints[i][0], 10), 1);
            } else if (currentPoints[i].length === 2 && currentPoints[i][1].length !== 0
                       && currentPoints[i][1].match(/[^0-9]/g) === null) {
                // the weight is converted to a string anyway and we already made sure it's a number
                numArr.add(Math.max(0, Math.min(total, parseInt(currentPoints[i][0], 10))),
                           currentPoints[i][1]);
            }
            // if the weight is empty or NaN then we just skip adding
        }
        var tempAvg = numArr.avg();
        if (tempAvg === null) {
            getId(p + "HP").value = total;
            getId(p + "HPp").value = "100";
        } else {
            getId(p + "HP").value = numArr+"";
            getId(p + "HPp").value = Math.max(1, Math.min(100, Math.floor(tempAvg * 100 / total)));
        }
    } else if (ranged && currentPoints.indexOf(",") > -1) {
        // unweighted
        currentPoints = currentPoints.replace(/\s/g, "");
        var tempAcc = "", numArr = [];
        for (var i = 0; i < currentPoints.length; i++) {
            if (currentPoints.charCodeAt(i) >= 48 && currentPoints.charCodeAt(i) <= 57) {
                tempAcc += currentPoints.charAt(i);
            } else if (currentPoints.charAt(i) === "," && tempAcc.length > 0) {
                numArr.push(Math.max(0, Math.min(total, parseInt(tempAcc, 10))));
                tempAcc = "";
            } else {
                tempAcc = "";
            }
        }
        if (tempAcc.length > 0) {
            numArr.push(Math.max(0, Math.min(total, parseInt(tempAcc, 10))));
        }
        numArr.sort(function (a, b) {
            return a - b;
        });
        var strList = "";
        for (var i = 0; i < numArr.length; i++) {
            strList += (i > 0 ? ", " : "") + numArr[i];
        }
        getId(p + "HP").value = strList;
        getId(p + "HPp").value = Math.max(1, Math.min(100, Math.floor(numArr[0] * 100 / total)));
    } else {
        // either not ranged, or not supposed to be ranged
        if (currentPoints.match(/[^0-9]/g) !== null) {
            currentPoints = total;
        } else {
            currentPoints = parseInt(currentPoints, 10);
        }
        getId(p + "HPp").value = Math.max(1, Math.min(100, Math.floor(100 * currentPoints / total)));
        getId(p + "HP").value = Math.max(1, Math.min(total, currentPoints));
    }
}
    
function updateHpPoints (p, ranged) {
    var poke = new Sulcalc.Pokemon();
    poke.id = getId(p + "Poke").value;
    if (poke.id === "0:0") {
        getId(p + "HPp").value = "";
        return;
    }
    poke.level = parseInt(getId(p + "Level").value, 10);
    poke.evs = getEvs(p);
    poke.ivs = getIvs(p);
    var total = poke.stat(Sulcalc.Stats.HP);
    var currentPercent = getId(p + "HPp").value;
    if (currentPercent.match(/[^0-9]/g) !== null) {
        currentPercent = 100;
    } else {
        currentPercent = parseInt(currentPercent, 10);
    }
    getId(p + "HPp").value = Math.max(1, Math.min(100, currentPercent));
    var hpLow = Math.max(1, Math.min(total, Math.floor(currentPercent * total / 100)));
    var hpHigh = Math.max(1, Math.min(total, (Math.ceil(total / 100) - 1 + hpLow)));
    if (ranged && hpLow < hpHigh) {
        getId(p + "HP").value = hpLow + " - " + Math.max(1, Math.min(total, Math.ceil(total / 100) - 1 + hpLow));
    } else {
        getId(p + "HP").value = hpLow;
    }
}

function getHpList (p) {
    var tempHp = getId(p + "HP").value;
    var hpList = new Sulcalc.WeightedArray([]);
    if (tempHp.indexOf("-") > -1) {
        // ranged, not a damage roll (i.e. not a comma separated list)
        tempHp = tempHp.replace(/\s/g, "").split("-");
        tempHp[0] = parseInt(tempHp[0], 10);
        tempHp[1] = parseInt(tempHp[1], 10);
        for (var i = tempHp[0]; i <= tempHp[1]; i++) {
            hpList.add(i, 1);
        }
    } else if (tempHp.indexOf(",") > -1) {
        // ranged, damage roll
        tempHp = tempHp.replace(/\s/g, "").split(",");
        for (var i = 0; i < tempHp.length; i++) {
            tempHp[i] = tempHp[i].split(":");
            if (tempHp[i].length > 1) {
                hpList.add(parseInt(tempHp[i][0], 10), tempHp[i][1]);
            } else {
                hpList.add(parseInt(tempHp[i][0], 10), 1);
            }
        }
    } else {
        hpList.add(parseInt(tempHp.split(":")[0], 10), 1);
    }
    return hpList;
}

function setDefenderRemainingHp() {
    if (resultingDefenderHealth === null) return false;
    var totalHp = getText("defenderTotalHP");
    if (totalHp === "???") return false;
    if (resultingDefenderHealth.values.length === 1) {
        getId("defenderHP").value = resultingDefenderHealth.values[0];
    } else {
        getId("defenderHP").value = resultingDefenderHealth+"";
    }
    getId("defenderHPp").value = Math.floor(resultingDefenderHealth.avg() * 100 / parseInt(totalHp, 10));
    return true;
}

function updateStats (p) {
    db.preload("stats", gen, "stats.json", function() {
    // ev and iv are unified in a "special" stat, but the base stats are different.
    // I recall reading it was because GSC and RBY used the same data structures.
    if (gen === 2) {
        getId(p + "SdefEv").value = getId(p + "SatkEv").value;
        getId(p + "SdefIv").value = getId(p + "SatkIv").value;
    }
    // there is no HP iv in gens 1 & 2, it is determined by other ivs
    if (gen <= 2) {
        getId(p + "HpIv").value = (parseInt(getId(p + "AtkIv").value, 10) & 1) << 3
                                   | (parseInt(getId(p + "DefIv").value, 10) & 1) << 2
                                   | (parseInt(getId(p + "SpdIv").value, 10) & 1) << 1
                                   | (parseInt(getId(p + "SpcIv").value, 10) & 1);
    }
    // update the /??? for the HP and reset percentage to 100%
    var poke = new Sulcalc.Pokemon();
    poke.level = getId(p + "Level").value;
    if (poke.level.match(/[^0-9]/g) !== null) {
        poke.level = 100;
    } else {
        poke.level = Math.max(1, Math.min(100, parseInt(poke.level, 10)));
    }
    getId(p + "Level").value = poke.level;
    poke.evs = getEvs(p);
    poke.ivs = getIvs(p);
    for (var i = 0; i < 6; i++) {
        poke.evs[i] = Math.max(0, Math.min(255, isNaN(poke.evs[i]) ? (gen > 2 ? 0 : 255) : poke.evs[i]));
        if (!(gen <= 2 && poke.evs[i] === 255)) {
            poke.evs[i] = (poke.evs[i] / 4) << 2;
        }
        poke.ivs[i] = Math.max(0, Math.min(gen > 2 ? 31 : 15, isNaN(poke.ivs[i]) ? (gen > 2 ? 31 : 15) : poke.ivs[i]));
    }
    // correct the EVs and IVs by setting them after doing the above checks.
    setEvs(p, poke.evs);
    setIvs(p, poke.ivs);
    poke.boosts = getBoosts(p);
    poke.nature = parseInt(getId(p + "Nature").value, 10);
    poke.id = getId(p + "Poke").value;
    if (poke.id === "0:0") {
        setText(p + "TotalHP", "???");
        getId(p + "HP").value = getId(p + "HPp").value = "";
    } else {
        setText(p + "TotalHP", poke.stat(Sulcalc.Stats.HP));
        getId(p + "HP").value = poke.stat(Sulcalc.Stats.HP);
        getId(p + "HPp").value = "100";
    }
    var strs = [["Hp", 0], ["Atk", 1], ["Def", 2], ["Satk", 3], ["Spc", 3], ["Sdef", 4], ["Spd", 5]];
    if (poke.id === "0:0") {
        setText(p + "HpStat", "");
        setText(p + "AtkStat", "");
        setText(p + "DefStat", "");
        setText(p + "SatkStat", "");
        setText(p + "SpcStat", "");
        setText(p + "SdefStat", "");
        setText(p + "SpdStat", "");
    } else {
        for (var i = 0; i < strs.length; i++) {
            if (gen > 2) {
                setText(p + strs[i][0] + "Stat", poke.boostedStat(strs[i][1]));
            } else {
                setText(p + strs[i][0] + "Stat", Math.min(999, poke.boostedStat(strs[i][1])));
            }
        }
    }
    });
}

function updateHiddenPowerType() {
    var ivs = getIvs("attacker");
    var t;
    if (gen > 2) {
        t = Sulcalc.hiddenPowerT(ivs);
    } else {
        t = Sulcalc.hiddenPowerT2(ivs);
    }
    setSelectByValue("hiddenPowerType", t + "");
    updatePossibleHiddenPowers();
}

function updatePossibleHiddenPowers() {
    var p = [];
    var hpType = getId("hiddenPowerType").value;
    if (gen > 2) {
        p = db.hiddenPowers(hpType);
    } else {
        p = db.hiddenPowersGen2(hpType);
    }
    var acc = "";
    for (var i = 0; i < p.length; i++) {
        acc += "<option value='" + i + "'";
        if (this.value === "14" && i === 1) {
            acc += "selected";
        }
        acc += ">";
        for (var j = 0; j < p[i].length; j++) {
            acc += p[i][j];
            if (j + 1 !== p[i].length) {
                acc += "-"
            }
        }
        acc += "</option>";
    }
    replaceHtml("hiddenPowerIvs", acc);
}

function getBeatUpStats() {
    var s = [];
    for (var i = 0; i < 6; i++) {
        var temp = getId("beatUpStat" + i).value;
        s[i] = (temp === "") ? null : parseInt(temp, 10);
    }
    return s;
}

function getBeatUpLevels() {
    var l = [];
    for (var i = 0; i < 6; i++) {
        var temp = getId("beatUpLevel" + i).value;
        l[i] = (temp === "") ? null : parseInt(temp, 10);
    }
    return l;
}

function resetBeatUp() {
    for (var i = 0; i < 6; i++) {
        getId("beatUpLevel" + i).value = ""
        getId("beatUpStat" + i).value = ""
    }
}

function toggleOptions() {
    var moreOptionsOn = getTextE(this) === "More Options";
    setTextE(this, moreOptionsOn ? "Less Options" : "More Options");
    var toggleElements = document.getElementsByClassName("morePokeOptions");
    for (var i = toggleElements.length - 1; i >= 0; i--) {
        toggleElements[i].style.display = moreOptionsOn ? "" : "none";
    }
}

function swapPokemon() {
    var swapIdx = ["Poke", "Nature", "Item", "Status", "Type1", "Type2", "TypeAdded"];
    for (var i = 0; i < swapIdx.length; i++) {
        var a = getId("attacker" + swapIdx[i]),
            d = getId("defender" + swapIdx[i]);
        var tempIdx = a.selectedIndex;
        a.selectedIndex = d.selectedIndex;
        d.selectedIndex = tempIdx;
    }
    var a = getId("attackerAbility"),
        d = getId("defenderAbility");
    var tempIdx = a.selectedIndex,
        tempHtml = a.innerHTML;
    replaceHtmlE(a, d.innerHTML);
    a.selectedIndex = d.selectedIndex;
    replaceHtmlE(d, tempHtml);
    d.selectedIndex = tempIdx;
    var swapStats = ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"];
    for (var i = 0; i < swapStats.length; i++) {
        var a = [ getId("attacker" + swapStats[i] + "Ev"),
                  getId("attacker" + swapStats[i] + "Iv"),
                  getId("attacker" + swapStats[i] + "Boost"),
                  getId("attacker" + swapStats[i] + "Stat") ],
            d = [ getId("defender" + swapStats[i] + "Ev"),
                  getId("defender" + swapStats[i] + "Iv"),
                  getId("defender" + swapStats[i] + "Boost"),
                  getId("defender" + swapStats[i] + "Stat") ];
        var temp = a[0].value;
        a[0].value = d[0].value;
        d[0].value = temp;
        temp = a[1].value;
        a[1].value = d[1].value;
        d[1].value = temp;
        temp = a[2].selectedIndex;
        a[2].selectedIndex = d[2].selectedIndex;
        d[2].selectedIndex = temp;
        temp = getTextE(a[3]);
        setTextE(a[3], getTextE(d[3]));
        setTextE(d[3], temp);
    }
    var swapCheckboxes = ["Grounded", "Tailwind", "Unburden", "Autotomize", "FlowerGift"];
    for (var i = 0; i < swapCheckboxes.length; i++) {
        var a = getId("attacker" + swapCheckboxes[i]),
            d = getId("defender" + swapCheckboxes[i]);
        var tempBool = a.checked;
        a.checked = d.checked;
        d.checked = tempBool;
    }
    var swapVals = ["HPp", "Level"];
    for (var i = 0; i < swapVals.length; i++) {
        var a = getId("attacker" + swapVals[i]),
            d = getId("defender" + swapVals[i]);
        var tempVal = a.value;
        a.value = d.value;
        d.value = tempVal;
    }
    var swapText = ["TotalHP"];
    for (var i = 0; i < swapText.length; i++) {
        var a = getId("attacker" + swapText[i]),
            d = getId("defender" + swapText[i]);
        var tempText = getTextE(a);
        setTextE(a, getTextE(d));
        setTextE(d, tempText);
    }
    var a = getId("attackerHP"),
        d = getId("defenderHP");
    var tempD = getHpList("defender");
    d.value = a.value;
    a.value = Math.floor(tempD.avg());
    updateHiddenPowerType();
}

function updateAttackerItemOptions() {
    var a = getId("battleOptions").getElementsByTagName("div");
    for (var i = a.length - 1; i >= 0; i--) {
        if (a[i].className && a[i].className.indexOf("I_") > -1) {
            a[i].style.display = "none";
        }
    }
    if (gen < 3) return;
    if (getId("attackerItem").value === "102") { // Metronome
        getId("metronome").parentElement.style.display = "";
    }
}

function updateMoveOptions() {
    var a = document.getElementsByTagName("div");
    var moveId = getId("move").value;
    for (var i = a.length - 1; i >= 0; i--) {
        if (a[i].className && a[i].className.indexOf("M_") > -1) {
            a[i].style.display = "none";
        }
    }
    var showInput = function (id) {
        getId(id).parentElement.style.display = "";
    }
    if (moveId === "210") { // Fury Cutter
        showInput("furyCutter");
    } else if ((gen > 1 && ["23", "537", "566"].indexOf(moveId) > -1) // Stomp, Steamroller, Flying Press
               || (gen === 3 && ["326", "310", "302"].indexOf(moveId) > -1) // Extrasensory, Astonish, Needle Arm
               || (gen >= 6 && ["34", "407", "578"].indexOf(moveId) > -1)) { // Body Slam, Dragon Rush, Phantom Force
        showInput("minimize");
    } else if (["222", "89"].indexOf(moveId) > -1) { // Magnitude, Earthquake
        if (gen > 1) {
            showInput("dig");
        }
        if (moveId === "222") { // Magnitude
            showInput("Magnitude");
        }
    } else if (gen >= 3 && ["57", "250"].indexOf(moveId) > -1) { // Surf, Whirlpool
        showInput("dive");
    } else if (moveId === "497") { // Echoed Voice
        showInput("echoedVoice");
    } else if (moveId === "376") { // Trump Card
        showInput("trumpCardPP");
    } else if (moveId === "496") { // Round
        showInput("round");
    } else if (gen > 1 && ["239", "16"].indexOf(moveId) > -1) { // Twister, Gust
        showInput("fly")
    } else if (moveId === "251") { // Beat Up
        resetBeatUp();
        showInput("beatUpStat0");
        getId("beatUpStatLabel").style.width = getId("beatUpStat0").offsetWidth + "px";
        getId("beatUpLevelLabel").style.width = getId("beatUpLevel0").offsetWidth + "px";
        for (var n = 0; n < 6; n++) {
            getId("beatUpLevel" + i).style.display = (gen <= 4 ? "" : "none");
        }
        getId("beatUpLevelLabel").style.display = (gen <= 4 ? "" : "none");
    } else if (moveId === "255") { // Spit Up
        showInput("stockpile");
    } else if (moveId === "228") { // Pursuit
        showInput("switchOut");
    } else if (moveId === "217") { // Present
        showInput("present");
    } else if (["205", "301"].indexOf(moveId) > -1) { // Rollout, Ice Ball
        showInput("rollout");
        showInput("defenseCurl");
    } else if (moveId === "514") { // Retaliate
        showInput("previouslyFainted");
    } else if (moveId === "558") { // Fusion Flare
        showInput("fusionBolt");
    } else if (moveId === "559") { // Fusion Bolt
        showInput("fusionFlare");
    } else if (moveId === "371") { // Payback
        showInput("moved");
    } else if (["372", "419", "279"].indexOf(moveId) > -1) { // Assurance, Avalanche, Revenge
        showInput("damaged");
    } else if (["519", "518", "520"].indexOf(moveId) > -1) { // Fire Pledge, Water Pledge, Grass Pledge
        showInput("pledge");
    } else if (moveId === "216") { // Return
        showInput("happiness");
        getId("happiness").value = 255;
    } else if (moveId === "218") { // Frustration
        showInput("happiness");
        getId("happiness").value = 0;
    } else if (moveId === "237") { // Hidden Power
        showInput("hiddenPowerType");
        updateHiddenPowerType();
    } else {
        db.preload("minMaxHits", gen, "minMaxHits.json", function() {
            if (db.minMaxHits(gen, moveId) && db.minMaxHits(gen, moveId) > 1 && moveId !== "251") { // Beat Up
                var moveInfo = new Sulcalc.Move(),
                    multiOps = "";
                moveInfo.id = moveId;
                if (db.abilities(getId("attackerAbility").value) === "Skill Link") {
                    multiOps = "<option value='" + moveInfo.maxHits() + "'>" + moveInfo.maxHits() + " hits</option>";
                } else for (var h = moveInfo.minHits(); h <= moveInfo.maxHits(); h++) {
                    multiOps += "<option value='" + h + "'>" + h + " hits</option>";
                }
                var eMultiHits = getId("multiHits");
                replaceHtmlE(eMultiHits, multiOps);
                eMultiHits.selectedIndex = 0;
                showInput("multiHits");
            }
        });
    }
    // maybe toggle health and speed based inputs, idk
}

// (No Ability), Snow Warning, Drizzle, Sandstream, Drought, Primordial Sea, Desolate Land, Delta Stream
var weatherAbilities = ["0", "117", "2", "45", "70", "190", "189", "191"];

function updateAttackerAbilityOptions() {
    var a = document.getElementsByTagName("div");
    var abilityId = getId("attackerAbility").value;
    for (var i = a.length - 1; i >= 0; i--) {
        if (a[i].className && a[i].className.indexOf("AA_") > -1) {
            a[i].style.display = "none";
        }
    }
    if (gen < 3) return;
    var showInput = function (id) {
        getId(id).parentElement.style.display = "";
    }
    if (abilityId === "79") { // Rivalry
        showInput("rivalryGenders");
    } else if (abilityId === "137") { // Toxic Boost
        setSelectByText("attackerStatus", "Poisoned");
    } else if (abilityId === "138" || abilityId === "62") { // Flare Boost, Guts
        setSelectByText("attackerStatus", "Burned");
    }
    if (weatherAbilities.indexOf(abilityId) > 0 || weatherAbilities.indexOf(attackerOldAbility) > 0) {
        updateWeatherOptions("attacker");
    }
    if (["137", "138", "62"].indexOf(attackerOldAbility) > -1) { // Toxic Boost, Flare Boost, Guts: resetting
        setSelectByValue("attackerStatus", "0");
    }
    db.preload("minMaxHits", gen, "minMaxHits.json", function() {
        if (db.minMaxHits(gen, getId("move").value) !== undefined) {
            var oldHits = getId("multiHits").value;
            updateMoveOptions();
            setSelectByValue("multiHits", oldHits);
        }
    });
    attackerOldAbility = abilityId;
}

function updateDefenderAbilityOptions() {
    if (gen < 3) return;
    var a = document.getElementsByTagName("div");
    var abilityId = getId("defenderAbility").value;
    for (var i = a.length - 1; i >= 0; i--) {
        if (a[i].className && a[i].className.indexOf("DA_") > -1) {
            a[i].style.display = "none";
        }
    }
    var showInput = function (id) {
        getId(id).parentElement.style.display = "";
    }
    if (weatherAbilities.indexOf(abilityId) > 0 || weatherAbilities.indexOf(defenderOldAbility) > 0) {
        updateWeatherOptions("defender");
    }
    defenderOldAbility = abilityId;
}

function updateWeatherOptions (p) {
    var weatherWeights = [0, 1, 1, 1, 1, 2, 2, 3];
    var aWeather = weatherAbilities.indexOf(getId("attackerAbility").value);
    var dWeather = weatherAbilities.indexOf(getId("defenderAbility").value);
    if (aWeather | dWeather === 0) {
        setSelectByValue("weather", "0");
    }
    if (weatherWeights[aWeather] > weatherWeights[dWeather]) {
        setSelectByValue("weather", aWeather + "");
    } else if (weatherWeights[dWeather] > weatherWeights[aWeather]) {
        setSelectByValue("weather", dWeather + "");
    } else {
        setSelectByValue("weather", "" + (p === "attacker" ? aWeather : dWeather));
    }
}

function updateAttackerSets() {
    if (gen < 3) {
        getId("attackerSets").parentNode.style.display = "none";
        return;
    }
    getId("attackerSets").parentNode.style.display = "";
    var offensiveSets = "<option value='No Set'>No Set</option>";
    var a = getId("attackerPoke").value;
    offensiveSets += "<option value='Fast Physical'>Fast Physical</option>";
    offensiveSets += "<option value='Fast Special'>Fast Special</option>";
    offensiveSets += "<option value='Bulky Physical'>Bulky Physical</option>";
    offensiveSets += "<option value='Bulky Special'>Bulky Special</option>";
    replaceHtml("attackerSets", offensiveSets); 
}

function updateDefenderSets() {
    if (gen < 3) {
        getId("defenderSets").parentNode.style.display = "none";
        return;
    }
    getId("defenderSets").parentNode.style.display = "";
    var defensiveSets = "<option value='No Set'>No Set</option>"
                      + "<option value='Physical Wall'>Physical Wall</option>"
                      + "<option value='Special Wall'>Special Wall</option>"
                      + "<option value='Mixed Wall'>Mixed Wall</option>"
                      + "<option value='Bulky'>Bulky</option>";
    replaceHtml("defenderSets", defensiveSets);
}

function changeSet (p, setName) {
    if (gen < 3) {
        return;
    }
    var poke = new Sulcalc.Pokemon();
    poke.id = getId(p + "Poke").value;
    if (setName === "Fast Physical") {
        setEvs(p, [0, 252, 0, 4, 0, 252]);
    } else if (setName === "Fast Special") {
        setEvs(p, [0, 4, 0, 252, 0, 252]);
    } else if (setName === "Bulky Physical") {
        setEvs(p, [252, 252, 4, 0, 0, 0]);
        setSelectByValue(p + "Nature", "3");
    } else if (setName === "Bulky Special") {
        setEvs(p, [252, 0, 4, 252, 0, 0]);
        setSelectByValue(p + "Nature", "15");
    } else if (setName === "Physical Wall") {
        setEvs(p, [252, 0, 252, 0, 4, 0]);
        setSelectByText(p + "Item", gen >= 5 && poke.hasEvolution() ? "Eviolite" : "Leftovers");
        setSelectByValue(p + "Nature", poke.baseStat(Sulcalc.Stats.ATK) >  poke.baseStat(Sulcalc.Stats.SATK) ? "8" : "5");
    } else if (setName === "Special Wall") {
        setEvs(p, [252, 0, 4, 0, 252, 0]);
        setSelectByText(p + "Item", gen >= 5 && poke.hasEvolution() ? "Eviolite" : "Leftovers");
        setSelectByValue(p + "Nature", poke.baseStat(Sulcalc.Stats.ATK) >  poke.baseStat(Sulcalc.Stats.SATK) ? "23" : "20");
    } else if (setName === "Mixed Wall") { // make "fatest set" algorithm
        setEvs(p, [4, 0, 252, 0, 252, 0]);
        setSelectByText(p + "Item", gen >= 5 && poke.hasEvolution() ? "Eviolite" : "Leftovers");
        if (poke.baseStat(Sulcalc.Stats.DEF) >  poke.baseStat(Sulcalc.Stats.SDEF)) {
            setSelectByValue(p + "Nature", poke.baseStat(Sulcalc.Stats.ATK) >  poke.baseStat(Sulcalc.Stats.SATK) ? "23" : "20");
        } else {
            setSelectByValue(p + "Nature", poke.baseStat(Sulcalc.Stats.ATK) >  poke.baseStat(Sulcalc.Stats.SATK) ? "8" : "5");
        }
    } else if (setName === "Bulky") {
        setEvs(p, [252, 0, 4, 0, 4, 0]);
        setSelectByText(p + "Item", gen >= 5 && poke.hasEvolution() ? "Eviolite" : "Leftovers");
    } else if (setName === "No Set") {
        setEvs(p, [0, 0, 0, 0, 0, 0]);
        setIvs(p, [31, 31, 31, 31, 31, 31]);
        setSelectByValue(p + "Item", "0");
        setSelectByValue(p + "Ability", "0");
        setSelectByValue(p + "Nature", "0");
    }

    if (poke.id in pokeToItem) {
        setSelectByText(p + "Item", pokeToItem[poke.id]);
    }
    
    updateStats(p);
}

function natureOptions() {
    var stat2 = [0, 1, 2, 4, 5, 3];
    var statToName = ["HP", "Atk", "Def", "SAtk", "SDef", "Spd"];
    var acc = "";
    for (var n = 0; n < 25; n++) {
        var inc = -1, dec = -1;
        for (var i = 1; i < 6; i++) {
            var boost = ((Math.floor(n / 5) === stat2[i] - 1) ? 1 : 0) - ((n % 5 === stat2[i] - 1) ? 1 : 0);
            if (boost > 0) {
                inc = i;
            } else if (boost < 0) {
                dec = i;
            }
        }
        acc += "<option value='" + n + "'>" + db.natures(n);
        if (inc !== -1) {
            acc += " (+" + statToName[inc] + ", -" + statToName[dec] + ")";
        }
        acc += "</option>";
    }
    return acc;
}

function calculateResults() {
    var c = new Sulcalc.Calculator();
    c.attacker.id = getId("attackerPoke").value;
    c.attacker.evs = getEvs("attacker");
    c.attacker.ivs = getIvs("attacker");
    c.attacker.boosts = getBoosts("attacker");
    c.attacker.nature = getId("attackerNature").value;
    c.attacker.ability.id = getId("attackerAbility").value;
    c.attacker.item.id = getId("attackerItem").value;
    c.attacker.status = parseInt(getId("attackerStatus").value, 10);
    c.attacker.currentHP = parseInt(getId("attackerHP").value, 10);
    c.attacker.level = parseInt(getId("attackerLevel").value, 10);
    c.attacker.addedType = parseInt(getId("attackerTypeAdded").value, 10);
    c.attacker.overrideTypes = [parseInt(getId("attackerType1").value, 10), parseInt(getId("attackerType2").value, 10)];
    c.attacker.grounded = getId("attackerGrounded").checked;
    c.attacker.tailwind = getId("attackerTailwind").checked;
    c.attacker.unburden = getId("attackerUnburden").checked;
    c.attacker.autotomize = getId("attackerAutotomize").checked;
    c.attacker.flowerGift = getId("attackerFlowerGift").checked;
    c.attacker.powerTrick = getId("attackerPowerTrick").checked;
    c.attacker.happiness = parseInt(getId("happiness").value, 10);

    c.defender.id = getId("defenderPoke").value;
    c.defender.evs = getEvs("defender");
    c.defender.ivs = getIvs("defender");
    c.defender.boosts = getBoosts("defender");
    c.defender.nature = getId("defenderNature").value;
    c.defender.ability.id = getId("defenderAbility").value;
    c.defender.item.id = getId("defenderItem").value;
    c.defender.status = parseInt(getId("defenderStatus").value, 10);
    c.defender.currentHP = Math.floor((c.defender.currentHPRange = getHpList("defender")).avg());
    c.defender.level = parseInt(getId("defenderLevel").value, 10);
    c.defender.addedType = parseInt(getId("defenderTypeAdded").value, 10);
    c.defender.overrideTypes = [parseInt(getId("defenderType1").value, 10), parseInt(getId("defenderType2").value, 10)];
    c.defender.grounded = getId("defenderGrounded").checked;
    c.defender.tailwind = getId("defenderTailwind").checked;
    c.defender.unburden = getId("defenderUnburden").checked;
    c.defender.autotomize = getId("defenderAutotomize").checked;
    c.defender.flowerGift = getId("defenderFlowerGift").checked;
    c.defender.powerTrick = getId("defenderPowerTrick").checked;

    var g = getId("rivalryGenders").value;
    if (g === "same") {
        c.attacker.gender = Sulcalc.Genders.MALE;
        c.defender.gender = Sulcalc.Genders.MALE;
    } else {
        c.attacker.gender = Sulcalc.Genders.MALE;
        c.defender.gender = Sulcalc.Genders.FEMALE;
    }

    c.move.id = getId("move").value;

    c.field.critical = getId("critical").checked;
    c.field.lightScreen = getId("screens").checked;
    c.field.reflect = getId("screens").checked;
    if (gen >= 2) {
        c.field.foresight = getId("foresight").checked;
    }
    if (gen >= 3) {
        c.field.helpingHand = getId("helpingHand").checked;
        c.field.charge = getId("charge").checked;
        c.field.multiBattle = getId("multiBattle").checked;
        c.field.waterSport = getId("waterSport").checked;
        c.field.mudSport = getId("mudSport").checked;
    }
    if (gen >= 4) {
        c.field.meFirst = getId("meFirst").checked;
    }
    if (gen >= 5) {
        c.field.friendGuard = getId("friendGuard").checked;
        c.field.magicRoom = getId("magicRoom").checked;
        c.field.wonderRoom = getId("wonderRoom").checked;
    }
    if (gen >= 6) {
        c.field.grassyTerrain = getId("grassyTerrain").checked;
        c.field.mistyTerrain = getId("mistyTerrain").checked;
        c.field.electricTerrain = getId("electricTerrain").checked;
        c.field.fairyAura = getId("fairyAura").checked;
        c.field.darkAura = getId("darkAura").checked;
        c.field.auraBreak = getId("auraBreak").checked;
        c.field.electrify = getId("electrify").checked;
        c.field.ionDeluge = getId("ionDeluge").checked;
        c.field.invertedBattle = getId("invertedBattle").checked;
    }
    c.field.flashFire = c.attacker.ability.name() === "Flash Fire";
    c.field.metronome = parseInt(getId("metronome").value, 10);
    c.field.minimize = getId("minimize").checked;
    c.field.dig = getId("dig").checked;
    c.field.dive = getId("dive").checked;
    c.field.targetMoved = getId("moved").checked || c.attacker.ability.name() === "Analytic";
    c.field.attackerDamaged = getId("damaged").checked;
    c.field.furyCutter = parseInt(getId("furyCutter").value, 10);
    c.field.echoedVoice = parseInt(getId("echoedVoice").value, 10);
    c.field.trumpPP = parseInt(getId("trumpCardPP").value, 10);
    c.field.roundBoost = getId("round").checked;
    c.field.fly = getId("fly").checked;
    c.field.beatUpStats = [];
    c.field.beatUpLevels = [];
    var tempStats = getBeatUpStats();
    var tempLevels = getBeatUpLevels();
    for (var i = 0; i < 6; i++) {
        if (tempStats[i] !== null && (tempLevels[i] !== null || gen > 4)) {
            c.field.beatUpStats.push(tempStats[i]);
            c.field.beatUpLevels.push(tempLevels[i]);
        }
    }
    c.field.stockpile = getId("stockpile").value;
    c.field.switchOut = getId("switchOut").checked;
    c.field.present = parseInt(getId("present").value, 10);
    c.field.magnitude = parseInt(getId("magnitude").value, 10);
    c.field.defenseCurl = getId("defenseCurl").checked;
    c.field.rollout = parseInt(getId("rollout").value, 10);
    c.field.previouslyFainted = getId("previouslyFainted").checked;
    c.field.fusionBolt = getId("fusionBolt").checked;
    c.field.fusionFlare = getId("fusionFlare").checked;
    c.field.multiHits = parseInt(getId("multiHits").value, 10);
    c.field.slowStart = db.abilities(getId("attackerAbility").value) === "Slow Start";
    c.field.plus = db.abilities(getId("attackerAbility").value) === "Minus";
    c.field.minus = db.abilities(getId("attackerAbility").value) === "Plus";
    c.field.pledge = getId("pledge").checked;
    c.field.weather = parseInt(getId("weather").value, 10);
    c.field.airLock = c.attacker.ability.name() === "Air Lock" || c.defender.ability.name() === "Air Lock";

    var rpt = c.report();
    
    if (rpt.damage === null) { // some error or whatever
        replaceHtml("results", rpt.report);
    } else {
        // in most cases javascript:void(0); is a bad idea, but right clicking for a new tab doesn't make sense anyway
        resultingDefenderHealth = rpt.remainingHealth; // save for later
        replaceHtml("results", rpt.report
                               + "<br /><div style='font-size: 0.7em;'>"
                               + (Sulcalc.gtStr(rpt.damage[0].count(), "39") ? rpt.damage[0] : rpt.damage[0].print())
                               + " (<a href='javascript:void(0);' onclick='setDefenderRemainingHp();'>set hp</a>)</div>");
    }
}

window.onload = function() {
    var natOps = natureOptions();
    replaceHtml("attackerNature", natOps);
    replaceHtml("defenderNature", natOps);
    
    [1, 2, 3, 4, 5, 6].forEach(function (val, idx, array) {
        getId("cgen" + val).onclick = function() {
            if (gen !== val) {
                changeGen(val);
            }
        };
    });
    
    getId("attackerItem").onchange = updateAttackerItemOptions;
    getId("attackerAbility").onchange = updateAttackerAbilityOptions;
    getId("defenderAbility").onchange = updateDefenderAbilityOptions;
    getId("move").onchange = updateMoveOptions;
    getId("attackerPoke").onchange = function() {
        updatePoke("attacker");
        updateAttackerSets();
        updateAttackerAbilityOptions();
    };
    getId("defenderPoke").onchange = function() {
        resultingDefenderHealth = null;
        updatePoke("defender");
        updateDefenderSets();
        updateDefenderAbilityOptions();
        if (gen === 2 && this.value !== "0:0" && getId("defenderItem").value === "0") {
            setSelectByText("defenderItem", "Leftovers");
        }
    };
    getId("attackerHP").onchange = function() {updateHpPercent("attacker", false);};
    getId("attackerHPp").onchange = function() {updateHpPoints("attacker", false);};
    getId("defenderHP").onchange = function() {updateHpPercent("defender", true);};
    getId("defenderHPp").onchange = function() {updateHpPoints("defender", true);};
    getId("attackerSets").onchange = function() {changeSet("attacker", this.value);};
    getId("defenderSets").onchange = function() {changeSet("defender", this.value);};
    getId("attackerNature").onchange = getId("attackerLevel").onchange = function() {updateStats("attacker");};
    getId("defenderNature").onchange = getId("defenderLevel").onchange = function() {updateStats("defender");};
    getId("toggleOptions").onclick = toggleOptions;
    getId("swap").onclick = swapPokemon;
    getId("export").onclick = function() {
        db.preload("minMaxHits", gen, "minMaxHits.json", function() {
            var href = document.location.href;
            if (href.indexOf("?") > -1) {
                href = href.substr(0, href.indexOf("?"));
            }
            getId("exportText").value = href + "?" + calcToQueryString();
        });
    };
    
    getId("happiness").onchange = function() {
        // "216":"Return"
        if (this.value.match(/[^0-9]/g) !== null) {
            this.value = getId("move").value === "216" ? 255 : 0;
        } else {
            this.value = Math.max(0, Math.min(255, parseInt(this.value)));
        }
    };
    
    ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"].forEach(function (val, idx, arr) {
        ["Ev", "Iv", "Boost"].forEach(function (val2, idx2, arr2) {
            if (val2 === "Iv") {
                getId("attacker" + val + "Iv").onchange = function() {
                    updateStats("attacker");
                    updateHiddenPowerType();
                };
                getId("defender" + val + "Iv").onchange = function() {
                    updateStats("defender");
                };
            } else if (val !== "Hp" || val2 !== "Boost") {
                getId("attacker" + val + val2).onchange = function() {
                    updateStats("attacker");
                };
                getId("defender" + val + val2).onchange = function() {
                    updateStats("defender");
                };
            }
        });
    });
    
    [5, 50, 100].forEach(function (val, idx, arr) {
        getId("attackerLevel" + val).onclick = function() {
            getId("attackerLevel").value = val;
            updateStats("attacker");
        };
        getId("defenderLevel" + val).onclick = function() {
            getId("defenderLevel").value = val;
            updateStats("defender");
        };
    });
    
    for (var i = 0; i < 6; i++) {
        getId("beatUpLevel" + i).onchange = (function (n) {
            return (function() {
                if (this.value.match(/[^0-9]/g) !== null) {
                    this.value = "";
                } else {
                    var level = parseInt(this.value, 10);
                    this.value = (level === 0) ? "" : Math.max(1, Math.min(100, level));
                }
            });
        }(i));
        getId("beatUpStat" + i).onchange = (function (n) {
            return (function() {
                if (this.value.match(/[^0-9]/g) !== null) {
                    this.value = "";
                } else {
                    var stat = parseInt(this.value, 10);
                    this.value = (stat === 0) ? "" : Math.max(1, Math.min(255, level));
                }
            });
        }(i));
    }
    
    getId("hiddenPowerType").onchange = function() {
        updatePossibleHiddenPowers();
        if (gen > 2) {
            setIvs("attacker", db.hiddenPowers(this.value)[hiddenPowerIvs.value]);
        } else {
            setIvs("attacker", db.hiddenPowersGen2(this.value)[hiddenPowerIvs.value]);
        }
        updateStats("attacker");
    };
    
    getId("hiddenPowerIvs").onchange = function() {
        var hiddenPowerType = getId("hiddenPowerType");
        if (gen > 2) {
            setIvs("attacker", db.hiddenPowers(hiddenPowerType.value)[parseInt(this.value, 10)]);
        } else {
            setIvs("attacker", db.hiddenPowersGen2(hiddenPowerType.value)[parseInt(this.value, 10)]);
        }
        updateStats("attacker");
    };

    var toggleElements = document.getElementsByClassName("morePokeOptions");
    for (var i = toggleElements.length - 1; i >= 0; i--) {
        toggleElements[i].style.display = "none";
    }
    
    getId("calc").onclick = calculateResults;
    
    db.preload("minMaxHits", gen, "minMaxHits.json", function() {
    db.preload("pokemons", 0, "pokemons.json", function() {
    db.preload("stats", gen, "stats.json", function() {
        var q = document.location.href;
        if (q.indexOf("?") > -1) {
            loadQueryString(q.substr(q.indexOf("?") + 1));
            calculateResults();
        } else {
            changeGen(6);
        }
    });
    });
    });
};
