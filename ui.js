/** to-do
 * make calculations less slow (timeouts?)
 * quench karppu's autism
 */

db = new Database();

var pokemons = [null, null, null, null, null, null, null];
var abilities = [null, null, null, null, null, null, null];
var items = [null, null, null, null, null, null, null];
var moves = [null, null, null, null, null, null, null];
var cacheDisabled = false;

function convertToBaseN(n, base, len) {
    if (typeof n === "string" || n instanceof String) {
        n = parseInt(n, 10);
    }
    // base 64 lets me do EVs in one digit ((64-1)*4=252)
    // also lets me represent pretty much everything in two digits
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // n = base^p
    // ln n = p ln base
    // (ln n)/(ln base) = p
    // floor p
    var p = Math.floor(Math.log(n) / Math.log(base));
    var result = "";
    while (p >= 0) {
        result += digits[Math.floor(n / Math.pow(base, p))];
        n %= Math.pow(base, p);
        p--;
    }
    for (var i = len - result.length; i > 0; i--) {
        result = "0" + result;
    }
    return result;
}



function convertFromBaseN(n, base) {
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = 0;
    for (var i = 0; i < n.length; i++) {
        result += digits.indexOf(n[n.length-1-i]) * Math.pow(base, i);
    }
    return result;
}

function binaryToBase64(n) {
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    var temp = 0;
    for (var i = 0; i < n.length; i++) {
        temp |= digits.indexOf(n[n.length-1-i])  << (i % 6);
        if ((i + 1) % 6 === 0) {
            result = digits[temp] + result;
            temp = 0;
        }
    }
    if (temp > 0) {
        result = digits[temp] + result;
    }
    return result;
}

function base64ToBinary(n) {
    var digits = "0123456789-_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = 0; i < n.length; i++) {
        result += convertToBaseN(digits.indexOf(n[i]), 2, 6);
    }
    return result;
}

function pokeToBinary(p) {
    /* format info
     * gen 1 : 109 bits
     * gen 2 : 127 bits
     * gen 3 : 161 bits
     * gen 4 : 166 bits
     * gen 5 : 169 bits
     * gen 6 : 174 bits
     */
    var q = "";
    var poke = document.getElementById(p + "Poke").value;
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
    //released abilities (gen:num) - 3:76, 4:123, 5:164, 6:188
    if (gen === 3 || gen === 4) {
        q += convertToBaseN(document.getElementById(p + "Ability").value, 2, 7);
    } else if (gen === 5 || gen === 6) {
        q += convertToBaseN(document.getElementById(p + "Ability").value, 2, 8);
    }
    if (gen >= 3) {
        q += convertToBaseN(document.getElementById(p + "Nature").value, 2, 5);
    }
    if (gen >= 2) {
        var item = parseInt(document.getElementById(p + "Item").value, 10);
        if (item >= 8000) {
            item = (item - 8000) | 0x1000;
        }
        q += convertToBaseN(item, 2, 13);
    }
    q += convertToBaseN(document.getElementById(p + "Level").value, 2, 7);
    var stats = gen > 2 ? ["Hp", "Atk", "Def", "Satk", "Sdef", "Spd"]
                        : gen === 2 ? ["Hp", "Atk", "Def", "Satk", "Spd"]
                                    : ["Hp", "Atk", "Def", "Spc", "Spd"];
    for (var i = 0; i < stats.length; i++) {//
        var ev = parseInt(document.getElementById(p + stats[i] + "Ev").value, 10) >> 2;
        var iv = parseInt(document.getElementById(p + stats[i] + "Iv").value, 10);
        var boost = 6 + parseInt(document.getElementById(p + stats[i] + "Boost").value, 10);
        q += convertToBaseN(ev, 2, 6);
        q += convertToBaseN(iv, 2, gen <= 2 ? 5 : 6);
        if (i !== 0) {
            q += convertToBaseN(boost, 2, 4);
        } else if (i === 3 && gen === 2) {
            q += convertToBaseN(6 + parseInt(document.getElementById(p + "SdefBoost").value, 10), 2, 4);
        }
    }
    q += convertToBaseN(document.getElementById(p + "HP").value, 2, 10);
    q += convertToBaseN(document.getElementById(p + "Status").value, 2, 3);
    q += convertToBaseN(document.getElementById(p + "Type1").value, 2, 5);
    q += convertToBaseN(document.getElementById(p + "Type2").value, 2, 5);
    if (gen >= 6) {
        q += convertToBaseN(document.getElementById(p + "TypeAdded").value, 2, 5);
    }
    if (gen >= 4) {
        q += document.getElementById(p + "FlowerGift").checked ? 1 : 0;
        q += document.getElementById(p + "Grounded").checked ? 1 : 0;
        q += document.getElementById(p + "PowerTrick").checked ? 1 : 0;
        q += document.getElementById(p + "Tailwind").checked ? 1 : 0;
        q += document.getElementById(p + "Unburden").checked ? 1 : 0;
    }
    if (gen >= 5) {
        q += document.getElementById(p + "Autotomize").checked ? 1 : 0;
    }
    return q;
}

function calcToQueryString() {
    var q = "";
    q += convertToBaseN(gen, 2, 4);
    q += pokeToBinary("attacker");
    q += pokeToBinary("defender");
    q += convertToBaseN(document.getElementById("move").value, 2, 10);
    q += document.getElementById("critical").checked ? 1 : 0;
    q += document.getElementById("screens").checked ? 1 : 0;
    if (gen >= 3) {
        q += document.getElementById("helpingHand").checked ? 1 : 0;
        q += document.getElementById("charge").checked ? 1 : 0;
        q += document.getElementById("multiBattle").checked ? 1 : 0;
        q += document.getElementById("waterSport").checked ? 1 : 0;
        q += document.getElementById("mudSport").checked ? 1 : 0;
    }
    if (gen >= 4) {
        q += document.getElementById("meFirst").checked ? 1 : 0;
    }
    if (gen >= 5) {
        q += document.getElementById("friendGuard").checked ? 1 : 0;
        q += document.getElementById("magicRoom").checked ? 1 : 0;
        q += document.getElementById("wonderRoom").checked ? 1 : 0;
    }
    if (gen >= 6) {
        q += document.getElementById("grassyTerrain").checked ? 1 : 0;
        q += document.getElementById("mistyTerrain").checked ? 1 : 0;
        q += document.getElementById("electricTerrain").checked ? 1 : 0;
        q += document.getElementById("invertedBattle").checked ? 1 : 0;
        q += document.getElementById("fairyAura").checked ? 1 : 0;
        q += document.getElementById("darkAura").checked ? 1 : 0;
        q += document.getElementById("auraBreak").checked ? 1 : 0;
        q += document.getElementById("electrify").checked ? 1 : 0;
        q += document.getElementById("ionDeluge").checked ? 1 : 0;
    }
    while (q.length % 6 !== 0) {
        q += "0";
    }
    return binaryToBase64(q);
}

function binaryToPoke(p, str) {
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
    document.getElementById(p + "Level").value = convertFromBaseN(str.substr(ptr, 7), 2);
    ptr += 7;
    var stats = gen > 2 ? ["Hp", "Atk", "Def", "Satk", "Sdef", "Spd"]
                        : gen === 2 ? ["Hp", "Atk", "Def", "Satk", "Spd"]
                                    : ["Hp", "Atk", "Def", "Spc", "Spd"];
    for (var i = 0; i < stats.length; i++) {
        document.getElementById(p + stats[i] + "Ev").value = convertFromBaseN(str.substr(ptr, 6), 2) << 2;
        ptr += 6;
        document.getElementById(p + stats[i] + "Iv").value = convertFromBaseN(str.substr(ptr, gen <= 2 ? 5 : 6), 2);
        ptr += gen <= 2 ? 5 : 6;
        if (i !== 0) {
            setSelectByValue(p + stats[i] + "Boost", (convertFromBaseN(str.substr(ptr, 4), 2) - 6) + "");
            ptr += 4;
        } else if (i === 3 && gen === 2) {
            setSelectByValue(p + "SdefBoost", (convertFromBaseN(str.substr(ptr, 4), 2) - 6) + "");
            ptr += 4;
        }
    }
    document.getElementById(p + "HP").value = convertFromBaseN(str.substr(ptr, 10), 2);
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
        document.getElementById(p + "FlowerGift").checked = str[ptr++] === "1";
        document.getElementById(p + "Grounded").checked = str[ptr++] === "1";
        document.getElementById(p + "PowerTrick").checked = str[ptr++] === "1";
        document.getElementById(p + "Tailwind").checked = str[ptr++] === "1";
        document.getElementById(p + "Unburden").checked = str[ptr++] === "1";
    }
    if (gen >= 5) {
        document.getElementById(p + "Autotomize").checked = str[ptr++] === "1";
    }
    updateStats(p);
    changeSprite(p + "Sprite", poke);
}

function loadQueryString(q) {
    /* format info
     * gen 1 : 109 bits
     * gen 2 : 127 bits
     * gen 3 : 161 bits
     * gen 4 : 166 bits
     * gen 5 : 169 bits
     * gen 6 : 174 bits
     */
    q = base64ToBinary(q);
    var ptr = 0;
    changeGen(convertFromBaseN(q.substr(ptr, 4), 2));
    ptr += 4;
    var size = [0, 109, 127, 161, 166, 169, 174];
    binaryToPoke("attacker", q.substr(ptr, size[gen]));
    ptr += size[gen];
    binaryToPoke("defender", q.substr(ptr, size[gen]));
    ptr += size[gen];
    
    setSelectByValue("move", convertFromBaseN(q.substr(ptr, 10), 2) + "");
    ptr += 10;
    document.getElementById("critical").checked = q[ptr++] === "1";
    document.getElementById("screens").checked = q[ptr++] === "1";
    if (gen >= 3) {
        document.getElementById("helpingHand").checked = q[ptr++] === "1";
        document.getElementById("charge").checked = q[ptr++] === "1";
        document.getElementById("multiBattle").checked = q[ptr++] === "1";
        document.getElementById("waterSport").checked = q[ptr++] === "1";
        document.getElementById("mudSport").checked = q[ptr++] === "1";
    }
    if (gen >= 4) {
        document.getElementById("meFirst").checked = q[ptr++] === "1";
    }
    if (gen >= 5) {
        document.getElementById("friendGuard").checked = q[ptr++] === "1";
        document.getElementById("magicRoom").checked = q[ptr++] === "1";
        document.getElementById("wonderRoom").checked = q[ptr++] === "1";
    }
    if (gen >= 6) {
        document.getElementById("grassyTerrain").checked = q[ptr++] === "1";
        document.getElementById("mistyTerrain").checked = q[ptr++] === "1";
        document.getElementById("electricTerrain").checked = q[ptr++] === "1";
        document.getElementById("invertedBattle").checked = q[ptr++] === "1";
        document.getElementById("fairyAura").checked = q[ptr++] === "1";
        document.getElementById("darkAura").checked = q[ptr++] === "1";
        document.getElementById("auraBreak").checked = q[ptr++] === "1";
        document.getElementById("electrify").checked = q[ptr++] === "1";
        document.getElementById("ionDeluge").checked = q[ptr++] === "1";
    }
}

function changeSprite(img, id) {
    var gens = [null, "RBY/", "GSC/", "ADV/", "HGSS/", "B2W2/", "XY/"];
    var imgurl = "sprites/" + gens[gen] + pokeSpecies(id);
    if (pokeForm(id) !== "0") {
        imgurl += "-" + pokeForm(id);
    }
    if (pokeSpecies(id) === "0") {
        imgurl = "sprites/XY/0";
    }
    document.getElementById(img).src = imgurl + ".png";
}

function setText(e, txt) {
    if ((typeof e === "string") || (e instanceof String)) {
        e = document.getElementById(e);
    }
    if ('textContent' in document.body) {
        e.textContent = txt;
    } else {
        e.innerText = txt;
    }
}

function getText(e) {
    if (typeof(e) === "string" || (e instanceof String)) {
        e = document.getElementById(e);
    }
    if ('textContent' in document.body) {
        return e.textContent;
    }
    return e.innerText;
}

function replaceHtml(e, html) {
    var oldE = (typeof e === "string") || (e instanceof String) ? document.getElementById(e) : e;
    /*@cc_on
        oldE.innerHTML = html;
        return;
    @*/
    var newE = oldE.cloneNode(false);
    ["onclick", "onchange"].forEach(function (method) { // I don't feel like finding them all
        newE[method] = oldE[method];
    });
    newE.innerHTML = html;
    oldE.parentNode.replaceChild(newE, oldE);
};

function setPoke(e, p) {
    if ((typeof e === "string") || (e instanceof String)) {
        e = document.getElementById(e);
    }
    for (var i = 0; i < e.options.length; i++) {
        if (e.options[i].value.substr(0, p.length) === p) {
            e.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function setSelectByValue(e, value) {
    if ((typeof e === "string") || (e instanceof String)) {
        e = document.getElementById(e);
    }
    for (var i = 0; i < e.options.length; i++) {
        if (e.options[i].value === value) {
            e.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function setSelectByText(e, text) {
    if ((typeof e === "string") || (e instanceof String)) {
        e = document.getElementById(e);
    }
    for (var i = 0; i < e.options.length; i++) {
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
    for (var i = 0; i < toggleElements.length; i++) {
        originalDisplay[i] = toggleElements[i].style.display;
        toggleElements[i].style.display = "";
    }
    var speedElements = document.getElementsByClassName("M_SPEED"),
        speedDisplay = [];
    for (var i = 0; i < speedElements.length; i++) {
        speedDisplay[i] = speedElements[i].style.display;
        speedElements[i].style.display = "";
    }
    var healthElements = document.getElementsByClassName("M_HEALTH"),
        healthDisplay = [];
    for (var i = 0; i < healthElements.length; i++) {
        healthDisplay[i] = healthElements[i].style.display;
        healthElements[i].style.display = "";
    }
    var strs = ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"];
    for (var i = 0; i < strs.length; i++) {
        var e = document.getElementById("attacker" + strs[i] + "Stat");
        e.style.lineHeight = e.parentNode.offsetHeight + "px";
        e = document.getElementById("defender" + strs[i] + "Stat");
        e.style.lineHeight = e.parentNode.offsetHeight + "px";
    }
    
    var levelButtons = document.getElementsByClassName("levelButton");
    for (var i = 0; i < levelButtons.length; i++) {
        levelButtons[i].style.lineHeight = (levelButtons[i].parentNode.clientHeight - 6) + "px";
    }
    
    var statNames = document.getElementsByClassName("textLabel");
    for (var i = 0; i < statNames.length; i++) {
        statNames[i].style.lineHeight = statNames[i].parentNode.offsetHeight + "px";
    }
    
    var h = document.getElementsByClassName("textLabel");
    for (var i = 0; i < h.length; i++) {
        h[i].style.lineHeight = h[i].parentNode.offsetHeight + "px";
    }
    
    for (var i = 0; i < 6; i++) {
        document.getElementById("beatUpLevel" + i).style.display = (gen <= 4 ? "" : "none");
    }
    document.getElementById("beatUpLevelLabel").style.display = (gen <= 4 ? "" : "none");
    
    var w = Math.max(document.getElementById("attacker").offsetWidth, document.getElementById("defender").offsetWidth) * 2;
    document.getElementById("calculator").style.width = w + "px";
    document.getElementById("calculator").style.marginLeft = "auto";
    document.getElementById("calculator").style.marginRight = "auto";
    document.getElementById("calculator").style.cssFloat = "none";
    document.getElementById("hpDisplay").style.width = w + "px";
    document.getElementById("minDamageBar").style.width = "0";
    document.getElementById("maxDamageBar").style.width = "0";
    document.getElementById("blankBar").style.width = "0";
    document.getElementById("calc").style.width = w + "px";
    // possibly rehide
    for (var i = 0; i < toggleElements.length; i++) {
        toggleElements[i].style.display = originalDisplay[i];
    }
    for (var i = 0; i < speedElements.length; i++) {
        speedElements[i].style.display = speedDisplay[i];
    }
    for (var i = 0; i < healthElements.length; i++) {
        healthElements[i].style.display = healthDisplay[i];
    }
}

function changeGen(n) {
    gen = n;
    // reset form first
    setText("results", "");
    document.getElementById("attackerPoke").selectedIndex = 0;
    changeSprite("attackerSprite", "0:0");
    document.getElementById("attackerNature").selectedIndex = 0;
    document.getElementById("attackerAbility").selectedIndex = 0;
    document.getElementById("attackerItem").selectedIndex = 0;
    updateAttackerItemOptions();
    document.getElementById("attackerLevel").value = 100;
    document.getElementById("attackerHP").value = "";
    document.getElementById("attackerHPp").value = "";
    setText("attackerTotalHP", "???");
    document.getElementById("attackerStatus").selectedIndex = 0;
    document.getElementById("attackerType1").selectedIndex = 0;
    document.getElementById("attackerType2").selectedIndex = 0;
    document.getElementById("attackerTypeAdded").selectedIndex = 0;
    document.getElementById("attackerGrounded").checked = false;
    document.getElementById("attackerTailwind").checked = false;
    document.getElementById("attackerUnburden").checked = false;
    document.getElementById("attackerAutotomize").checked = false;
    document.getElementById("attackerFlowerGift").checked = false;
    document.getElementById("attackerPowerTrick").checked = false;
    document.getElementById("defenderPoke").selectedIndex = 0;
    changeSprite("defenderSprite", "0:0");
    document.getElementById("defenderNature").selectedIndex = 0;
    document.getElementById("defenderAbility").selectedIndex = 0;
    document.getElementById("defenderItem").selectedIndex = 0;
    document.getElementById("defenderLevel").value = 100;
    document.getElementById("defenderHP").value = "";
    document.getElementById("defenderHPp").value = "";
    setText("defenderTotalHP", "???");
    document.getElementById("defenderStatus").selectedIndex = 0;
    document.getElementById("defenderType1").selectedIndex = 0;
    document.getElementById("defenderType2").selectedIndex = 0;
    document.getElementById("defenderTypeAdded").selectedIndex = 0;
    document.getElementById("defenderGrounded").checked = false;
    document.getElementById("defenderTailwind").checked = false;
    document.getElementById("defenderUnburden").checked = false;
    document.getElementById("defenderAutotomize").checked = false;
    document.getElementById("defenderFlowerGift").checked = false;
    document.getElementById("defenderPowerTrick").checked = false;
    document.getElementById("screens").checked = false;
    document.getElementById("friendGuard").checked = false;
    document.getElementById("critical").checked = false;
    document.getElementById("helpingHand").checked = false;
    document.getElementById("charge").checked = false;
    document.getElementById("multiBattle").checked = false;
    document.getElementById("metronome").selectedIndex = 0;
    document.getElementById("minimize").checked = false;
    document.getElementById("dig").checked = false;
    document.getElementById("dive").checked = false;
    document.getElementById("moved").checked = false;
    document.getElementById("damaged").checked = false;
    document.getElementById("furyCutter").selectedIndex = 0;
    document.getElementById("echoedVoice").selectedIndex = 0;
    document.getElementById("trumpCardPP").selectedIndex = 0;
    document.getElementById("round").checked = false;
    document.getElementById("fly").checked = false;
    resetBeatUp();
    document.getElementById("stockpile").value = 0;
    document.getElementById("switchOut").checked = false;
    document.getElementById("present").selectedIndex = 0;
    document.getElementById("magnitude").selectedIndex = 0;
    document.getElementById("defenseCurl").checked = false;
    document.getElementById("rollout").selectedIndex = 0;
    document.getElementById("previouslyFainted").checked = false;
    document.getElementById("fusionBolt").checked = false;
    document.getElementById("fusionFlare").checked = false;
    document.getElementById("multiHits").selectedIndex = 0;
    document.getElementById("meFirst").checked = false;
    document.getElementById("waterSport").checked = false;
    document.getElementById("mudSport").checked = false;
    document.getElementById("grassyTerrain").checked = false;
    document.getElementById("mistyTerrain").checked = false;
    document.getElementById("fairyAura").checked = false;
    document.getElementById("darkAura").checked = false;
    document.getElementById("auraBreak").checked = false;
    document.getElementById("magicRoom").checked = false;
    document.getElementById("wonderRoom").checked = false;
    document.getElementById("electrify").checked = false;
    document.getElementById("ionDeluge").checked = false;
    document.getElementById("invertedBattle").checked = false;
    document.getElementById("weather").selectedIndex = 0;
    document.getElementById("move").selectedIndex = 0;
    updateMoveOptions();
    document.getElementById("pledge").checked = false;

    if (gen >= 3) {
        document.getElementById("attackerSdefIv").disabled = false;
        document.getElementById("attackerSdefEv").disabled = false;
        document.getElementById("attackerHpIv").disabled = false;
        document.getElementById("defenderSdefIv").disabled = false;
        document.getElementById("defenderSdefEv").disabled = false;
        document.getElementById("defenderHpIv").disabled = false;
        replaceHtml("hiddenPowerIvs", "<option value='0'>31-31-31-31-31-31</option>");
    } else if (gen === 2) {
        document.getElementById("attackerSdefIv").disabled = true;
        document.getElementById("attackerSdefEv").disabled = true;
        document.getElementById("attackerHpIv").disabled = true;
        document.getElementById("defenderSdefIv").disabled = true;
        document.getElementById("defenderSdefEv").disabled = true;
        document.getElementById("defenderHpIv").disabled = true;
        replaceHtml("hiddenPowerIvs", "<option value='0'>15-15-15-15-15-15</option>");
    } else {
        document.getElementById("attackerHpIv").disabled = true;
        document.getElementById("defenderHpIv").disabled = true;
    }
    setSelectByText(document.getElementById("hiddenPowerType"), "Dark");
    
    var ops = "";
    var end = gen < 5 ? 10 : 5;
    for (var i = 0; i <= end; i++) {
        ops += "<option value='" + i + "'>" + i;
        if (i === end) {
            ops += "+";
        }
        ops += " (1." + i + "x)</option>";
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
            document.getElementById(strs[0][i] + strs[1][j] + "Ev").value = gen > 2 ? 0 : 255;
            document.getElementById(strs[0][i] + strs[1][j] + "Iv").value = gen > 2 ? 31 : 15;
            setText(strs[0][i] + strs[1][j] + "Stat", "");
            if (strs[1][j] !== "Hp") {
                document.getElementById(strs[0][i] + strs[1][j] + "Boost").selectedIndex = 6;
            }
        }
    }
    
    var insertOpOrder = function (arr, a) {
        for (var i = 0; i < arr.length; i++) {
            if (a[1] < arr[i][1]) {
                arr.splice(i, 0, a);
                return arr;
            }
        }
        arr.splice(arr.length, 0, a);
        return arr;
    };
    
    var getOptions = function (ops) {
        var s = "";
        for (var i = 0; i < ops.length; i++) {
            s += "<option value='" + ops[i][0] + "'>" + ops[i][1] + "</option>";
        }
        return s;
    };
    
    var arr = [];
    var id = "";
    
    if (pokemons[gen] === null || cacheDisabled) {
        for (var a in db.releasedPokes(gen)) {
            id = db.releasedPokes(gen)[a];
            if (db.pokemons(id)) {
                if (db.pokemons(id) === "Missingno") {
                    continue;
                }
                arr = insertOpOrder(arr, [id, db.pokemons(id)]);
            } else if (db.pokemons(id + ":H")) {
                arr = insertOpOrder(arr, [id + ":H", db.pokemons(id + ":H")]);
            } else if (db.pokemons(id + ":M")) {
                arr = insertOpOrder(arr, [id + ":M", db.pokemons(id + ":M")]);
            } else if (db.pokemons(id + ":B")) {
                arr = insertOpOrder(arr, [id + ":B", db.pokemons(id + ":B")]);
            }
        }
        arr.splice(0, 0, ["0:0", "Missingno"]);
        pokemons[gen] = getOptions(arr);
        replaceHtml("attackerPoke", pokemons[gen]);
        replaceHtml("defenderPoke", pokemons[gen]);
    } else {
        replaceHtml("attackerPoke", pokemons[gen]);
        replaceHtml("defenderPoke", pokemons[gen]);
    }

    if (abilities[gen] === null || cacheDisabled) {
        arr = [];
        var genAbilityLists = [null, 0, 0, 76, 123, 164, 188];
        for (var i = 0; i < genAbilityLists[gen]; i++) {
            arr = insertOpOrder(arr, [i, db.abilities(i)]);
        }
        abilities[gen] = getOptions(arr);
        replaceHtml("attackerAbility", abilities[gen]);
        replaceHtml("defenderAbility", abilities[gen]);
    } else {
        replaceHtml("attackerAbility", abilities[gen]);
        replaceHtml("defenderAbility", abilities[gen]);
    }
    
    if (moves[gen] === null || cacheDisabled) {
        arr = [];
        for (var a in db.releasedMoves(gen)) {
            id = db.releasedMoves(gen)[a];
            arr = insertOpOrder(arr, [id, db.moves(id)]);
        }
        moves[gen] = getOptions(arr);
        replaceHtml("move", moves[gen]);
    } else {
        replaceHtml("move", moves[gen]);
    }
    
    if (items[gen] === null || cacheDisabled) {
        arr = [];
        for (var a in db.releasedItems(gen)) {
            id = db.releasedItems(gen)[a];
            arr = insertOpOrder(arr, [id, db.items(id)])
        }
        for (var a in db.releasedBerries(gen)) {
            id = db.releasedBerries(gen)[a];
            arr = insertOpOrder(arr, [parseInt(id, 10) + 8000, db.berries(id)])
        }
        items[gen] = getOptions(arr);
        replaceHtml("attackerItem", items[gen]);
        replaceHtml("defenderItem", items[gen]);
    } else {
        replaceHtml("attackerItem", items[gen]);
        replaceHtml("defenderItem", items[gen]);
    }
    
    var typeOps = "<option value='18'>---</option>";
    for (var i = 0; i < 18; i++) {
        if ((gen === 1 && (i === 8 || i === 16))
            || (gen < 6 && i === 17)) {
            continue;
        }
        typeOps += "<option value='" + i + "'>" + db.types(i) + "</option>";
    }
    typeLists = document.getElementsByClassName("typeList");
    for (var i = 0; i < typeLists.length; i++) {
        replaceHtml(typeLists[i], typeOps);
    }
    
    str = "<option value='0'>(No Weather)</option><option value='4'>Sun</option><option value='2'>Rain</option><option value='3'>Sand</option>";
    str += gen>=3?"<option value='1'>Hail</option>":"";
    replaceHtml("weather", str);
    
    for (var i = 1; i <= 6; i++) {
        document.getElementById("cgen" + i).className = (gen === i) ? "selectGen selectedGen" : "selectGen";
    }
    
    
    var g = document.getElementsByTagName("*");
    for (var i = 0; i < g.length; i++) {
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
    
    updateFormatting();
}

function sortOptions(id) {
    var e = document.getElementById(id).options;
    var a = [];
    var str = "";
    for (var i = 0; i < e.length; i++) {
        a[i] = [e[i].text, e[i].value];
    }
    a = a.sort(function (n, m) {
       return n < m ? -1 : 1; 
    });
    for (var i = 0; i < a.length; i++) {
        str += "<option value='" + a[i][1] + "'>" + a[i][0]
    }
    return str;
}

function sortSelect(selElem) {
        var tmpAry = new Array();
        for (var i=0;i<selElem.options.length;i++) {
            tmpAry[i] = new Array();
            tmpAry[i][0] = selElem.options[i].text;
            tmpAry[i][1] = selElem.options[i].value;
        }
        tmpAry.sort();
        while (selElem.options.length > 0) {
            selElem.options[0] = null;
        }
        for (var i=0;i<tmpAry.length;i++) {
            var op = new Option(tmpAry[i][0], tmpAry[i][1]);
            selElem.options[i] = op;
        }
        return;
    }

function pokeForm(id) {
    if (id.indexOf(":")!==id.lastIndexOf(":")) {
        return id.substring(id.indexOf(":") + 1, id.lastIndexOf(":"));
    }
    return id.substring(id.indexOf(":") + 1);
}

function pokeSpecies(id) {
    return id.substring(0, id.indexOf(":"));
}

function options(j) {
    var str="";
    for (var a in j) {
        str += "<option value='" + a + "'>" + j[a] + "</option>";
    }
    return str;
}

function options8000(j) {
    var str="";
    for (var a in j) {
        str += "<option value='" + (parseInt(a, 10)+8000) + "'>" + j[a] + "</option>";
    }
    return str;
}

function getEvs(p) {
    return [ parseInt(document.getElementById(p + "HpEv").value, 10),
             parseInt(document.getElementById(p + "AtkEv").value, 10),
             parseInt(document.getElementById(p + "DefEv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SatkEv").value, 10) : parseInt(document.getElementById(p + "SpcEv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SdefEv").value, 10) : parseInt(document.getElementById(p + "SpcEv").value, 10),
             parseInt(document.getElementById(p + "SpdEv").value, 10)];
}

function getIvs(p) {
    return [ parseInt(document.getElementById(p + "HpIv").value, 10),
             parseInt(document.getElementById(p + "AtkIv").value, 10),
             parseInt(document.getElementById(p + "DefIv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SatkIv").value, 10) : parseInt(document.getElementById(p + "SpcIv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SdefIv").value, 10) : parseInt(document.getElementById(p + "SpcIv").value, 10),
             parseInt(document.getElementById(p + "SpdIv").value, 10)];
}

function getBoosts(p) {
    return [ 0,
             parseInt(document.getElementById(p + "AtkBoost").value, 10),
             parseInt(document.getElementById(p + "DefBoost").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SatkBoost").value, 10) : parseInt(document.getElementById(p + "SpcBoost").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SdefBoost").value, 10) : parseInt(document.getElementById(p + "SpcBoost").value, 10),
             parseInt(document.getElementById(p + "SpdBoost").value, 10),
             0,
             0];
}
    
function setEvs(p, e) {
    document.getElementById(p + "HpEv").value = e[Sulcalc.Stats.HP];
    document.getElementById(p + "AtkEv").value = e[Sulcalc.Stats.ATK];
    document.getElementById(p + "DefEv").value = e[Sulcalc.Stats.DEF];
    document.getElementById(p + "SatkEv").value = gen > 2 ? e[Sulcalc.Stats.SATK] : e[Sulcalc.Stats.SPC];
    document.getElementById(p + "SdefEv").value = gen > 2 ? e[Sulcalc.Stats.SDEF] : e[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpcEv").value = e[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpdEv").value = e[Sulcalc.Stats.SPD];
}

function setIvs(p, i) {
    document.getElementById(p + "HpIv").value = (gen > 2) ? i[Sulcalc.Stats.HP] : (i[1] & 1) << 3 | (i[2] & 1) << 2 | (i[5] & 1) << 1 | (i[3] & 1);
    document.getElementById(p + "AtkIv").value = i[Sulcalc.Stats.ATK];
    document.getElementById(p + "DefIv").value = i[Sulcalc.Stats.DEF];
    document.getElementById(p + "SatkIv").value = i[Sulcalc.Stats.SATK];
    document.getElementById(p + "SdefIv").value = i[Sulcalc.Stats.SDEF];
    document.getElementById(p + "SpcIv").value = i[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpdIv").value = i[Sulcalc.Stats.SPD];
}

function setBoosts(p, b) {
    document.getElementById(p + "AtkBoost").value = b[Sulcalc.Stats.ATK];
    document.getElementById(p + "DefBoost").value = b[Sulcalc.Stats.DEF];
    document.getElementById(p + "SatkBoost").value = b[Sulcalc.Stats.SATK];
    document.getElementById(p + "SdefBoost").value = b[Sulcalc.Stats.SDEF];
    document.getElementById(p + "SpcBoost").value = b[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpdBoost").value = b[Sulcalc.Stats.SPD];
}

function updatePoke(p) {
    changeSprite(p + "Sprite", document.getElementById(p + "Poke").value);
    document.getElementById(p + "Nature").selectedIndex = 0;
    document.getElementById(p + "Item").selectedIndex = 0;
    document.getElementById(p + "Status").selectedIndex = 0;
    document.getElementById(p + "Level").value = 100;
    var poke = new Sulcalc.Pokemon();
    poke.id = document.getElementById(p + "Poke").value;
    var type1e = document.getElementById(p + "Type1");
    var type2e = document.getElementById(p + "Type2");
    setSelectByValue(type1e, poke.type1() + "");
    setSelectByValue(type2e, poke.type2() + "");
    var strs = ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"];
    for (var i = 0; i < strs.length; i++) {
        document.getElementById(p + strs[i] + "Ev").value = gen > 2 ? 0 : 255;
        document.getElementById(p + strs[i] + "Iv").value = gen > 2 ? 31 : 15;
        document.getElementById(p + strs[i] + "Boost").selectedIndex = 6;
    }
    var suggestions = "";
    if (poke.ability1() !== 0) {
        suggestions += "<option value='" + poke.ability1() + "'>" + db.abilities(poke.ability1()) + "</option>";
    }
    if (poke.ability2() !== 0) {
        suggestions += "<option value='" + poke.ability2() + "'>" + db.abilities(poke.ability2()) + "</option>";
    }
    if (poke.ability3() !== 0 && gen >= 5) {
        suggestions += "<option value='" + poke.ability3() + "'>" + db.abilities(poke.ability3()) + "</option>";
    }
    if (suggestions !== "") {
        suggestions += "<option value='divider' disabled>─────────────</option>";
    }
    eAbility = document.getElementById(p + "Ability");
    replaceHtml(eAbility, suggestions + abilities[gen]);
    eAbility.selectedIndex = 0;
    updateStats(p);
}

function updateHpPercent(p) {
    var poke = new Sulcalc.Pokemon();
    poke.level = parseInt(document.getElementById(p + "Level").value, 10);
    poke.evs = getEvs(p);
    poke.ivs = getIvs(p);
    poke.id = document.getElementById(p + "Poke").value;
    var total = poke.stat(Sulcalc.Stats.HP);
    var currentPoints = document.getElementById(p + "HP").value;
    if (currentPoints.match(/[^0-9]/g) !== null) {
        currentPoints = total;
    } else {
        currentPoints = parseInt(currentPoints, 10);
    }
    document.getElementById(p + "HPp").value = Math.max(1, Math.min(100, Math.floor(100 * currentPoints / total)));
    document.getElementById(p + "HP").value = Math.max(1, Math.min(total, currentPoints));
}
    
function updateHpPoints(p) {
    var poke = new Sulcalc.Pokemon();
    poke.level = parseInt(document.getElementById(p + "Level").value, 10);
    poke.evs = getEvs(p);
    poke.ivs = getIvs(p);
    poke.id = document.getElementById(p + "Poke").value;
    var total = poke.stat(Sulcalc.Stats.HP);
    var currentPercent = document.getElementById(p + "HPp").value;
    if (currentPercent.match(/[^0-9]/g) !== null) {
        currentPercent = total;
    } else {
        currentPercent = parseInt(currentPercent, 10);
    }
    document.getElementById(p + "HP").value = Math.max(1, Math.min(total, Math.floor(currentPercent * total / 100)));
    document.getElementById(p + "HPp").value = Math.max(1, Math.min(100, currentPercent));
}

function updateStats(p) {
    // ev and iv are unified in a "special" stat, but the base stats are different.
    // I recall reading it was because GSC and RBY used the same data structures.
    if (gen === 2) {
        document.getElementById(p + "SdefEv").value = document.getElementById(p + "SatkEv").value;
        document.getElementById(p + "SdefIv").value = document.getElementById(p + "SatkIv").value;
    }
    // there is no HP iv in gens 1 & 2, it is determined by other ivs
    if (gen <= 2) {
        document.getElementById(p + "HpIv").value = (parseInt(document.getElementById(p + "AtkIv").value, 10) & 1) << 3
                                                    | (parseInt(document.getElementById(p + "DefIv").value, 10) & 1) << 2
                                                    | (parseInt(document.getElementById(p + "SpdIv").value, 10) & 1) << 1
                                                    | (parseInt(document.getElementById(p + "SpcIv").value, 10) & 1);
    }
    // update the /??? for the HP and reset percentage to 100%
    var poke = new Sulcalc.Pokemon();
    poke.level = document.getElementById(p + "Level").value;
    if (poke.level.match(/[^0-9]/g) !== null) {
        poke.level = 100;
    } else {
        poke.level = Math.max(1, Math.min(100, parseInt(poke.level, 10)));
    }
    document.getElementById(p + "Level").value = poke.level;
    poke.evs = getEvs(p);
    poke.ivs = getIvs(p);
    for (var i = 0; i < 6; i++) {
        poke.evs[i] = Math.max(0, Math.min(255, isNaN(poke.evs[i]) ? (gen > 2 ? 0 : 255) : poke.evs[i]));
        if (!(gen <= 2 && poke.evs[i] === 255)) {
            poke.evs[i] = (poke.evs[i] >> 2) << 2;
        }
        poke.ivs[i] = Math.max(0, Math.min(gen > 2 ? 31 : 15, isNaN(poke.ivs[i]) ? (gen > 2 ? 31 : 15) : poke.ivs[i]));
    }
    // correct the EVs and IVs by setting them after doing the above checks.
    // Javascript won't enter infinite loops since it can't trigger user events.
    setEvs(p, poke.evs);
    setIvs(p, poke.ivs);
    poke.boosts = getBoosts(p);
    poke.nature = parseInt(document.getElementById(p + "Nature").value, 10);
    poke.id = document.getElementById(p + "Poke").value;
    setText(p + "TotalHP", poke.stat(Sulcalc.Stats.HP));
    document.getElementById(p + "HP").value = poke.stat(Sulcalc.Stats.HP);
    document.getElementById(p + "HPp").value = "100";
    var strs = [["Hp", 0], ["Atk", 1], ["Def", 2], ["Satk", 3], ["Spc", 3], ["Sdef", 4], ["Spd", 5]];
    for (var i = 0; i < strs.length; i++) {
        if (gen > 2) {
            setText(p + strs[i][0] + "Stat", poke.boostedStat(strs[i][1]));
        } else {
            setText(p + strs[i][0] + "Stat", Math.min(999, poke.boostedStat(strs[i][1])));
        }
    }
}

function updateHiddenPowerType() {
    var ivs = getIvs("attacker");
    var t;
    if (gen > 2) {
        t = Sulcalc.hiddenPowerT(ivs);
    } else {
        t = Sulcalc.hiddenPowerT2(ivs);
    }
    setSelectByValue(document.getElementById("hiddenPowerType"), t + "");
    updatePossibleHiddenPowers();
}

function updatePossibleHiddenPowers() {
    var p = [];
    var hpType = document.getElementById("hiddenPowerType").value;
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
        var temp = document.getElementById("beatUpStat" + i).value;
        s[i] = (temp === "") ? null : parseInt(temp, 10);
    }
    return s;
}

function getBeatUpLevels() {
    var l = [];
    for (var i = 0; i < 6; i++) {
        var temp = document.getElementById("beatUpLevel" + i).value;
        l[i] = (temp === "") ? null : parseInt(temp, 10);
    }
    return l;
}

function resetBeatUp() {
    for (var i = 0; i < 6; i++) {
        document.getElementById("beatUpLevel" + i).value = ""
        document.getElementById("beatUpStat" + i).value = ""
    }
}

function toggleOptions() {
    if (this.className) {
        this.className = this.className.indexOf("lock") > -1 ? "togglebox" : "lock togglebox";
        var toggleElements = document.getElementsByClassName("morePokeOptions");
        for (var i = 0; i < toggleElements.length; i++) {
            toggleElements[i].style.display = this.className.indexOf("lock") > -1 ? "" : "none";
        }
    } else {
        this.className = "lock togglebox";
    }
}

function swapPokemon() {
    var aSprite = document.getElementById("attackerSprite");
    var dSprite = document.getElementById("defenderSprite");
    var tempSrc = aSprite.src;
    aSprite.src = dSprite.src;
    dSprite.src = tempSrc;
    var swapIdx = ["Poke", "Nature", "Ability", "Item", "Status", "Type1", "Type2", "TypeAdded"];
    for (var i = 0; i < swapIdx.length; i++) {
        var a = document.getElementById("attacker" + swapIdx[i]);
        var d = document.getElementById("defender" + swapIdx[i]);
        var tempIdx = a.selectedIndex;
        a.selectedIndex = d.selectedIndex;
        d.selectedIndex = tempIdx;
    }
    var swapStats = ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"];
    for (var i = 0; i < swapStats.length; i++) {
        var a = [document.getElementById("attacker" + swapStats[i] + "Ev"),
                 document.getElementById("attacker" + swapStats[i] + "Iv"),
                 document.getElementById("attacker" + swapStats[i] + "Boost"),
                 document.getElementById("attacker" + swapStats[i] + "Stat")];
        var d = [document.getElementById("defender" + swapStats[i] + "Ev"),
                 document.getElementById("defender" + swapStats[i] + "Iv"),
                 document.getElementById("defender" + swapStats[i] + "Boost"),
                 document.getElementById("defender" + swapStats[i] + "Stat")];
        var temp = a[0].value;
        a[0].value = d[0].value;
        d[0].value = temp;
        temp = a[1].value;
        a[1].value = d[1].value;
        d[1].value = temp;
        temp = a[2].selectedIndex;
        a[2].selectedIndex = d[2].selectedIndex;
        d[2].selectedIndex = temp;
        temp = getText(a[3]);
        setText(a[3], getText(d[3]));
        setText(d[3], temp);
    }
    var swapCheckboxes = ["Grounded", "Tailwind", "Unburden", "Autotomize", "FlowerGift"];
    for (var i = 0; i < swapCheckboxes.length; i++) {
        var a = document.getElementById("attacker" + swapCheckboxes[i]);
        var d = document.getElementById("defender" + swapCheckboxes[i]);
        var tempBool = a.checked;
        a.checked = d.checked;
        d.checked = tempBool;
    }
    var swapVals = ["HP", "HPp"];
    for (var i = 0; i < swapVals.length; i++) {
        var a = document.getElementById("attacker" + swapVals[i]);
        var d = document.getElementById("defender" + swapVals[i]);
        var tempVal = a.value;
        a.value = d.value;
        d.value = tempVal;
    }
    var swapText = ["TotalHP"];
    for (var i = 0; i < swapText.length; i++) {
        var a = "attacker" + swapText[i];
        var d = "defender" + swapText[i];
        var tempText = getText(a);
        setText(a, getText(d));
        setText(d, tempText);
    }
    updateHiddenPowerType();
}

function updateAttackerItemOptions() {
    var e = document.getElementById("battleOptions").getElementsByTagName("div");
    var i = "";
    var item = db.items(this.value);
    for (var j = 0; j < e.length; j++) {
        if (e[j].className) {
            if (e[j].className.indexOf("I_") !== -1) {
                i = e[j].className.substring(e[j].className.indexOf("I_") + 2);
                if (i === "METRONOME" && item === "Metronome") {
                    e[j].style.display = "block";
                    document.getElementById("metronome").selectedIndex = 0;
                } else {
                    e[j].style.display = "none";
                }
            }
        }
    }
}


function autofillAttackerAbilityOptions() {
    var ability = db.abilities(this.value);
    if (ability === "Toxic Boost") {
        var aStatus = document.getElementById("attackerStatus");
        setSelectByText(aStatus, "Poisoned");
    } else if (ability === "Flare Boost" || ability === "Guts") {
        var aStatus = document.getElementById("attackerStatus");
        setSelectByText(aStatus, "Burned");
    }
}

function updateMoveOptions() {
    var a = document.getElementsByTagName("div");
    var m = "";
    var move = db.moves(this.value);
    for (var i = 0; i < a.length; i++) {
        if (a[i].className) {
            if (a[i].className.indexOf("M_") !== -1) {
                m = a[i].className.substring(a[i].className.indexOf("M_") + 2);
                if (m === "FURYCUTTER" && move === "Fury Cutter") {
                    a[i].style.display = "";
                } else if (m === "MINIMIZE"
                           && (move === "Stomp"
                               || move === "Steamroller"
                               || move === "Phantom Force"
                               || move === "Flying Press"
                               || (gen === 3 && (move === "Extrasensory"
                                                 || move === "Astonish"
                                                 || move === "Needle Arm")))
                           && gen !== 1) {
                    a[i].style.display = "";
                } else if (m === "DIG" && (move === "Earthquake" || move === "Magnitude") && gen > 1) {
                    a[i].style.display = "";
                } else if (m === "DIVE" && (move === "Surf" || move === "Whirlpool") && gen >= 3) {
                    a[i].style.display = "";
                } else if (m === "ECHOEDVOICE" && move === "Echoed Voice") {
                    a[i].style.display = "";
                } else if (m === "TRUMPCARD" && move === "Trump Card") {
                    a[i].style.display = "";
                } else if (m === "ROUND" && move === "Round") {
                    a[i].style.display = "";
                } else if (m === "FLY" && (move === "Twister" || move === "Gust") && gen > 1) {
                    a[i].style.display = "";
                } else if (m === "BEATUP" && move === "Beat Up") {
                    resetBeatUp();
                    a[i].style.display = "";
                    document.getElementById("beatUpStatLabel").style.width = document.getElementById("beatUpStat0").offsetWidth + "px";
                    document.getElementById("beatUpLevelLabel").style.width = document.getElementById("beatUpLevel0").offsetWidth + "px";
                    for (var n = 0; n < 6; n++) {
                        document.getElementById("beatUpLevel" + i).style.display = (gen <= 4 ? "" : "none");
                    }
                    document.getElementById("beatUpLevelLabel").style.display = (gen <= 4 ? "" : "none");
                } else if (m === "SPITUP" && move === "Spit Up") {
                    a[i].style.display = "";
                } else if (m === "PURSUIT" && move === "Pursuit") {
                    a[i].style.display = "";
                } else if (m === "PRESENT" && move === "Present") {
                    a[i].style.display = "";
                } else if (m === "MAGNITUDE" && move === "Magnitude") {
                    a[i].style.display = "";
                } else if (m === "ROLLOUT" && (move === "Rollout" || move === "Ice Ball")) {
                    a[i].style.display = "";
                } else if (m === "RETALIATE" && move === "Retaliate") {
                    a[i].style.display = "";
                } else if (m === "FUSIONFLARE" && move === "Fusion Flare") {
                    a[i].style.display = "";
                } else if (m === "FUSIONBOLT" && move === "Fusion Bolt") {
                    a[i].style.display = "";
                } else if (m === "MOVED" && move === "Payback") {
                    a[i].style.display = "";
                } else if (m === "DAMAGED" && (move === "Assurance" || move === "Revenge" || move === "Avalanche")) {
                    a[i].style.display = "";
                } else if (m === "MULTIHIT" && db.minMaxHits(gen, this.value) && db.minMaxHits(gen, this.value) > 1 && move !== "Beat Up") {
                    a[i].style.display = "";
                    var moveInfo = new Sulcalc.Move(),
                        multiOps = "";
                    moveInfo.id = this.value;
                    for (var h = moveInfo.minHits(); h <= moveInfo.maxHits(); h++) {
                        multiOps += "<option value='" + h + "'>" + h + " hits</option>";
                    }
                    var eMultiHits = document.getElementById("multiHits");
                    replaceHtml(eMultiHits, multiOps);
                    document.getElementById("multiHits").selectedIndex = 0;
                } else if (m === "PLEDGE" && (move === "Fire Pledge" || move === "Water Pledge" || move === "Grass Pledge")) {
                    a[i].style.display = "";
                } else if (m === "HAPPINESS" && move === "Return") {
                    a[i].style.display = "";
                    document.getElementById("happiness").value = 255;
                } else if (m === "HAPPINESS" && move === "Frustration") {
                    a[i].style.display = "";
                    document.getElementById("happiness").value = 0;
                } else if (m === "SPEED" && (move === "Gyro Ball" || move === "Electro Ball")) {
                    a[i].style.display = "";
                } else if (m === "HEALTH" && (move === "Eruption" || move === "Water Spout" || move === "Endeavor" || move === "Final Gambit")) {
                    a[i].style.display = "";
                } else if (m === "HIDDENPOWER" && move === "Hidden Power") {
                    a[i].style.display = "";
                } else {
                    a[i].style.display = "none";
                }
            }
        }
    }
}

function autofillPokeOptions(p) {
    var pokeId = document.getElementById(p + "Poke").value;
    var pokeToItem = {"649:1" : "Douse Drive", // Genesect-D
                      "649:2" : "Shock Drive", // Genesect-S
                      "649:3" : "Burn Drive", // Genesect-B
                      "649:4" : "Chill Drive", // Genesect-C
                      "487:1" : "Griseous Orb", // Giratina-O
                      "493:1" : "Fist Plate", // Arceus-Fighting
                      "493:2" : "Sky Plate", // Arceus-Flying
                      "493:3" : "Toxic Plate", // Arceus-Poison
                      "493:4" : "Earth Plate", // Arceus-Ground
                      "493:5" : "Stone Plate", // Arceus-Rock
                      "493:6" : "Insect Plate", // Arceus-Bug
                      "493:7" : "Spooky Plate", // Arceus-Ghost
                      "493:8" : "Iron Plate", // Arceus-Steel
                      "493:9" : "Flame Plate", // Arceus-Fire
                      "493:10" : "Splash Plate", // Arceus-Water
                      "493:11" : "Meadow Plate", // Arceus-Grass
                      "493:12" : "Zap Plate", // Arceus-Electric
                      "493:13" : "Mind Plate", // Arceus-Psychic
                      "493:14" : "Icicle Plate", // Arceus-Ice
                      "493:15" : "Draco Plate", // Arceus-Dragon
                      "493:16" : "Dread Plate", // Arceus-Dark
                      "493:17" : "Pixie Plate", // Arceus-Fairy
                      "460:1:M" : "Abomasite", // Mega Abomasnow
                      "359:1:M" : "Absolite", // Mega Absol
                      "142:1:M" : "Aerodactylite", // Mega Aerodactyl
                      "306:1:M" : "Aggronite", // Mega Aggron
                      "65:1:M" : "Alakazite", // Mega Alakazam
                      "181:1:M" : "Ampharosite", // Mega Ampharos
                      "354:1:M" : "Banettite", // Mega Banette
                      "9:1:M" : "Blastoisinite", // Mega Blastoise
                      "257:1:M" : "Blazikenite", // Mega Blaziken
                      "6:1:M" : "Charizardite X", // Mega Charizard X
                      "6:2:M" : "Charizardite Y", // Mega Charizard Y
                      "445:1:M" : "Garchompite", // Mega Garchomp
                      "282:1:M" : "Gardevoirite", // Mega Gardevoir
                      "94:1:M" : "Gengarite", // Mega Gengar
                      "130:1:M" : "Gyaradosite", // Mega Gyarados
                      "214:1:M" : "Heracronite", // Mega Heracross
                      "229:1:M" : "Houndoominite", // Mega Houndoom
                      "115:1:M" : "Kangaskhanite", // Mega Kangaskhan
                      "448:1:M" : "Lucarionite", // Mega Lucario
                      "310:1:M" : "Manectite", // Mega Manectric
                      "303:1:M" : "Mawilite", // Mega Mawile
                      "308:1:M" : "Medichamite", // Mega Medicham
                      "150:1:M" : "Mewtwonite X", // Mega Mewtwo X
                      "150:2:M" : "Mewtwonite Y", // Mega Mewtwo Y
                      "127:1:M" : "Pinsirite", // Mega Pinsir
                      "212:1:M" : "Scizorite", // Mega Scizor
                      "248:1:M" : "Tyranitarite", // Mega Tyranitar
                      "3:1:M" : "Venusaurite"}; // Mega Venusaur
    if (pokeId in pokeToItem) {
        setSelectByText(document.getElementById(p + "Item"), pokeToItem[pokeId]);
    }
}

function importableToPokemon(importText) {
    var poke = new Sulcalc.Pokemon();
    var lines = importText.split("\n");
    var speciesName = lines[0].substring(0, lines[0].indexOf(" "));
    var genderLetter = lines[0].indexOf(" ") === lines[0].indexOf(" @ ") ? "(N)"
                                                                         : lines[0].substring(lines[0].indexOf(" ") + 1,
                                                                                              lines[0].indexOf(" @ "));
    var itemName = lines[0].substring(lines[0].indexOf(" @ ") + 3);
    var abilityName = lines[1].substring(lines[1].indexOf(" ") + 1);
    var evStringList = lines[2].substring(lines[2].indexOf(" ") + 1).split(" / ");
    var stats = ["HP", "Atk", "Def", "SAtk", "SDef", "Spd"];
    for (var i = 0; i < evStringList.length; i++) {
        var n = parseInt(evStringList[i].substring(0, evStringList[i].indexOf(" ")), 10);
        var s = evStringList[i].substring(evStringList[i].indexOf(" ") + 1);
        poke.evs[stats.indexOf(s)] = isNaN(n) ? 0 : n;
    }
    var natureName = lines[3].substring(0, lines[3].indexOf(" "));
    
    poke.setName(speciesName);
    poke.gender = ["(N)", "(M)", "(F)"].indexOf(genderLetter);
    poke.item.setName(itemName);
    poke.ability.setName(abilityName);
    poke.setNatureName(natureName);
    return poke;
}

/*var p = importableToPokemon("Sylveon (M) @ Leftovers\nTrait: Pixilate\nEVs: 248 HP / 252 Def / 8 SDef\nBold Nature (+Def, -Atk)\n- Wish\n- Protect\n- Hyper Voice\n- Heal Bell");
alert(p.id);
alert(p.evs);
alert(p.nature);
alert(p.ability.id);
alert(p.item.id);*/

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

window.onload = function() {
    var natOps = natureOptions();
    replaceHtml("attackerNature", natOps);
    replaceHtml("defenderNature", natOps);
    
    for (var i = 1; i <= 6; i++) {
        document.getElementById("cgen" + i).onclick = (function (n) {
            return (function() {
                if (gen !== n) {
                    changeGen(n);
                }
            });
        }(i));
    };
    
    document.getElementById("attackerItem").onchange = updateAttackerItemOptions;
    document.getElementById("attackerAbility").onchange = autofillAttackerAbilityOptions;
    document.getElementById("move").onchange = updateMoveOptions;
    document.getElementById("attackerPoke").onchange = function() {
        updatePoke("attacker");
        autofillPokeOptions("attacker");
        updateHiddenPowerType();
    };
    document.getElementById("defenderPoke").onchange = function() {
        updatePoke("defender");
        autofillPokeOptions("defender");
    };
    document.getElementById("attackerHP").onchange = function() {updateHpPercent("attacker");};
    document.getElementById("attackerHPp").onchange = function() {updateHpPoints("attacker");};
    document.getElementById("defenderHP").onchange = function() {updateHpPercent("defender");};
    document.getElementById("defenderHPp").onchange = function() {updateHpPoints("defender");};
    document.getElementById("attackerNature").onchange = document.getElementById("attackerLevel").onchange = function() {updateStats("attacker");};
    document.getElementById("defenderNature").onchange = document.getElementById("defenderLevel").onchange = function() {updateStats("defender");};
    document.getElementById("moreOptions").onclick = toggleOptions;
    document.getElementById("swap").onclick = swapPokemon;
    document.getElementById("export").onclick = function() {
        var href = document.location.href;
        if (href.indexOf("?") != -1) {
            href = href.substr(0, href.indexOf("?"));
        }
        document.getElementById("exportText").value = href + "?" + calcToQueryString();
    };
    
    document.getElementById("happiness").onchange = function() {
        // "216":"Return"
        if (this.value.match(/[^0-9]/g) !== null) {
            this.value = document.getElementById("move").value === "216" ? 255 : 0;
        } else {
            this.value = Math.max(0, Math.min(255, parseInt(this.value)));
        }
    };
    
    var strs = [["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"], ["Ev", "Iv", "Boost"]];
    for (var i = 0; i < strs[0].length; i++) {
        for (var j = 0; j < strs[1].length; j++) {
            if (strs[1][j] === "Iv") {
                document.getElementById("attacker" + strs[0][i] + "Iv").onchange = function() {
                    updateStats("attacker");
                    updateHiddenPowerType();
                };
                document.getElementById("defender" + strs[0][i] + "Iv").onchange = function() {
                    updateStats("defender");
                };
            } else if (strs[0][i] !== "Hp" || strs[1][j] !== "Boost") {
                document.getElementById("attacker" + strs[0][i] + strs[1][j]).onchange = function() {
                    updateStats("attacker");
                };
                document.getElementById("defender" + strs[0][i] + strs[1][j]).onchange = function() {
                    updateStats("defender");
                };
            }
        }
    }
    
    var lvls = [5, 50, 100];
    for (var i = 0; i < lvls.length; i++) {
        document.getElementById("attackerLevel" + lvls[i]).onclick = (function (level) {
            return (function() {
                document.getElementById("attackerLevel").value = level;
                updateStats("attacker");
            });
        }(lvls[i]));
        document.getElementById("defenderLevel" + lvls[i]).onclick = (function (level) {
            return (function() {
                document.getElementById("defenderLevel").value = level;
                updateStats("defender");
            });
        }(lvls[i]));
    }
    
    for (var i = 0; i < 6; i++) {
        document.getElementById("beatUpLevel" + i).onchange = (function (n) {
            return (function() {
                if (this.value.match(/[^0-9]/g) !== null) {
                    this.value = "";
                } else {
                    var level = parseInt(this.value, 10);
                    this.value = (level === 0) ? "" : Math.max(1, Math.min(100, level));
                }
            });
        }(i));
        document.getElementById("beatUpStat" + i).onchange = (function (n) {
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
    
    document.getElementById("hiddenPowerType").onchange = function() {
        updatePossibleHiddenPowers();
        if (gen > 2) {
            setIvs("attacker", db.hiddenPowers(this.value)[hiddenPowerIvs.value]);
        } else {
            setIvs("attacker", db.hiddenPowersGen2(this.value)[hiddenPowerIvs.value]);
        }
        updateStats("attacker");
    }
    
    document.getElementById("hiddenPowerIvs").onchange = function() {
        var hiddenPowerType = document.getElementById("hiddenPowerType");
        if (gen > 2) {
            setIvs("attacker", db.hiddenPowers(hiddenPowerType.value)[parseInt(this.value, 10)]);
        } else {
            setIvs("attacker", db.hiddenPowersGen2(hiddenPowerType.value)[parseInt(this.value, 10)]);
        }
        updateStats("attacker");
    }

    var toggleElements = document.getElementsByClassName("morePokeOptions");
    for (var i = 0; i < toggleElements.length; i++) {
        toggleElements[i].style.display = "none";
    }
    
    document.getElementById("calc").onclick = function() {
        var c = new Sulcalc.Calculator();
        c.attacker.id = document.getElementById("attackerPoke").value;
        c.attacker.evs = getEvs("attacker");
        c.attacker.ivs = getIvs("attacker");
        c.attacker.boosts = getBoosts("attacker");
        c.attacker.nature = document.getElementById("attackerNature").value;
        c.attacker.ability.id = document.getElementById("attackerAbility").value;
        c.attacker.item.id = document.getElementById("attackerItem").value;
        c.attacker.status = parseInt(document.getElementById("attackerStatus").value, 10);
        c.attacker.currentHP = parseInt(document.getElementById("attackerHP").value, 10);
        if (c.attacker.currentHP === NaN) {
            c.attacker.currentHP = c.attacker.stat(Sulcalc.Stats.HP);
        }
        c.attacker.level = parseInt(document.getElementById("attackerLevel").value, 10);
        c.attacker.addedType = parseInt(document.getElementById("attackerTypeAdded").value, 10);
        c.attacker.override = true;
        c.attacker.overrideTypes = [parseInt(document.getElementById("attackerType1").value, 10),
                                    parseInt(document.getElementById("attackerType2").value, 10)];
        c.attacker.grounded = document.getElementById("attackerGrounded").checked;
        c.attacker.tailwind = document.getElementById("attackerTailwind").checked;
        c.attacker.unburden = document.getElementById("attackerUnburden").checked;
        c.attacker.autotomize = document.getElementById("attackerAutotomize").checked;
        c.attacker.flowerGift = document.getElementById("attackerFlowerGift").checked;
        c.attacker.powerTrick = document.getElementById("attackerPowerTrick").checked;
        c.attacker.happiness = parseInt(document.getElementById("happiness").value, 10);
        
        c.defender.id = document.getElementById("defenderPoke").value;
        c.defender.evs = getEvs("defender");
        c.defender.ivs = getIvs("defender");
        c.defender.boosts = getBoosts("defender");
        c.defender.nature = document.getElementById("defenderNature").value;
        c.defender.ability.id = document.getElementById("defenderAbility").value;
        c.defender.item.id = document.getElementById("defenderItem").value;
        c.defender.status = parseInt(document.getElementById("defenderStatus").value, 10);
        c.defender.currentHP = parseInt(document.getElementById("defenderHP").value, 10);
        if (c.defender.currentHP === NaN) {
            c.defender.currentHP = c.defender.stat(Sulcalc.Stats.HP);
        }
        c.defender.level = parseInt(document.getElementById("defenderLevel").value, 10);
        c.defender.addedType = parseInt(document.getElementById("defenderTypeAdded").value, 10);
        c.defender.override = true;
        c.defender.overrideTypes = [parseInt(document.getElementById("defenderType1").value, 10),
                                    parseInt(document.getElementById("defenderType2").value, 10)];
        c.defender.grounded = document.getElementById("defenderGrounded").checked;
        c.defender.tailwind = document.getElementById("defenderTailwind").checked;
        c.defender.unburden = document.getElementById("defenderUnburden").checked;
        c.defender.autotomize = document.getElementById("defenderAutotomize").checked;
        c.defender.flowerGift = document.getElementById("defenderFlowerGift").checked;
        c.defender.powerTrick = document.getElementById("defenderPowerTrick").checked;
        
        var g = document.getElementById("rivalryGenders").value;
        if (g === "same") {
            c.attacker.gender = Sulcalc.Genders.MALE;
            c.defender.gender = Sulcalc.Genders.MALE;
        } else {
            c.attacker.gender = Sulcalc.Genders.MALE;
            c.defender.gender = Sulcalc.Genders.FEMALE;
        }
        
        c.move.id = document.getElementById("move").value;

        c.field.lightScreen = document.getElementById("screens").checked;
        c.field.reflect = document.getElementById("screens").checked;
        c.field.friendGuard = document.getElementById("friendGuard").checked;
        c.field.critical = document.getElementById("critical").checked;
        c.field.flashFire = document.getElementById("attackerAbility").value === "Flash Fire";
        c.field.helpingHand = document.getElementById("helpingHand").checked;
        c.field.charge = document.getElementById("charge").checked;
        c.field.multiBattle = document.getElementById("multiBattle").checked;
        c.field.metronome = parseInt(document.getElementById("metronome").value, 10);
        c.field.minimize = document.getElementById("minimize").checked;
        c.field.dig = document.getElementById("dig").checked;
        c.field.dive = document.getElementById("dive").checked;
        c.field.targetMoved = document.getElementById("moved").checked;
        c.field.attackerDamaged = document.getElementById("damaged").checked;
        c.field.furyCutter = parseInt(document.getElementById("furyCutter").value, 10);
        c.field.echoedVoice = parseInt(document.getElementById("echoedVoice").value, 10);
        c.field.trumpPP = parseInt(document.getElementById("trumpCardPP").value, 10);
        c.field.roundBoost = document.getElementById("round").checked;
        c.field.fly = document.getElementById("fly").checked;
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
        c.field.stockpile = document.getElementById("stockpile").value;
        c.field.switchOut = document.getElementById("switchOut").checked;
        c.field.present = parseInt(document.getElementById("present").value, 10);
        c.field.magnitude = parseInt(document.getElementById("magnitude").value, 10);
        c.field.defenseCurl = document.getElementById("defenseCurl").checked;
        c.field.rollout = parseInt(document.getElementById("rollout").value, 10);
        c.field.previouslyFainted = document.getElementById("previouslyFainted").checked;
        c.field.fusionBolt = document.getElementById("fusionBolt").checked;
        c.field.fusionFlare = document.getElementById("fusionFlare").checked;
        c.field.multiHits = parseInt(document.getElementById("multiHits").value, 10);
        c.field.meFirst = document.getElementById("meFirst").checked;
        c.field.waterSport = document.getElementById("waterSport").checked;
        c.field.mudSport = document.getElementById("mudSport").checked;
        c.field.slowStart = document.getElementById("attackerAbility").value === "Slow Start";
        c.field.grassyTerrain = document.getElementById("grassyTerrain").checked;
        c.field.mistyTerrain = document.getElementById("mistyTerrain").checked;
        c.field.fairyAura = document.getElementById("fairyAura").checked;
        c.field.darkAura = document.getElementById("darkAura").checked;
        c.field.auraBreak = document.getElementById("auraBreak").checked;
        c.field.plus = document.getElementById("attackerAbility").value === "58";
        c.field.minus = document.getElementById("attackerAbility").value === "57";
        c.field.magicRoom = document.getElementById("magicRoom").checked;
        c.field.wonderRoom = document.getElementById("wonderRoom").checked;
        c.field.electrify = document.getElementById("electrify").checked;
        c.field.ionDeluge = document.getElementById("ionDeluge").checked;
        c.field.invertedBattle = document.getElementById("invertedBattle").checked;
        c.field.pledge = document.getElementById("pledge").checked;
        c.field.weather = parseInt(document.getElementById("weather").value, 10);
        
        dmg = [];
        if (c.move.name() === "Fury Cutter") {
            while (c.field.furyCutter <= 5) {
                dmg.push(c.calculate());
                c.field.furyCutter++;
            }
            dmg.push(1);
        } else if (c.move.name() === "Echoed Voice") {
            while (c.field.echoedVoice <= 4) {
                dmg.push(c.calculate());
                c.field.echoedVoice++;
            }
            dmg.push(1);
        } else if (c.move.name() === "Trump Card") {
            dmg.push(c.calculate());
            while (c.field.trumpPP > 0) {
                c.field.trumpPP -= c.defender.ability.name() === "Pressure" ? 2 : 1;
                dmg.push(c.calculate());
            }
            dmg.push(0);
        } else if (c.move.name() === "Explosion" || c.move.name() === "Self-Destruct") {
            dmg.push(c.calculate());
            dmg.push(0);
        } else if (c.move.name() === "Rollout" || c.move.name() === "Ice Ball") {
            while (c.field.rollout <= 4) {
                dmg.push(c.calculate());
                c.field.rollout++;
            }
            dmg.push(2);
        } else {
            var t1 = c.calculate();
            var t2 = c.calculate();
            if (t1.warray === t2.warray) {
                dmg.push(t1);
            } else {
                dmg.push(t1);
                dmg.push(t2);
            }
            dmg.push(1);
        }
        var minPercent = Math.round(dmg[0].warray[0][0] / c.defender.stat(Sulcalc.Stats.HP) * 1000) / 10;
        var maxPercent = Math.round(dmg[0].warray[dmg[0].warray.length-1][0] / c.defender.stat(Sulcalc.Stats.HP) * 1000) / 10;
        rpt = "";
        var dclass = 0;
        var type = c.move.type();
        var power = c.move.power();
        if (c.move.name() === "Hidden Power") {
            type = Sulcalc.hiddenPowerT(c.attacker.ivs);
            power = Sulcalc.hiddenPowerP(c.attacker.ivs);
        }
        if (gen <= 3) {
            dclass = db.typeDamageClass()[c.move.type()];
        } else {
            dclass = c.move.damageClass();
        }
        var a = dclass === Sulcalc.DamageClasses.SPECIAL ? Sulcalc.Stats.SATK : Sulcalc.Stats.ATK;
        var d = dclass === Sulcalc.DamageClasses.SPECIAL ? Sulcalc.Stats.SDEF : Sulcalc.Stats.DEF;
        if (c.move.name() === "Psyshock" || c.move.name() === "Psystrike" || c.move.name() === "Secret Sword") {
            a = Sulcalc.Stats.SATK;
            d = Sulcalc.Stats.DEF;
        }
        
        if (c.attacker.boosts[a] !== 0) {
            rpt += (c.attacker.boosts[a] > 0 ? "+" : "-") + Math.abs(c.attacker.boosts[a]) + " ";
        }
        if (gen > 2 || c.attacker.evs[a] < 252) {
            rpt += c.attacker.evs[a];
            if (c.attacker.natureMultiplier(a) === 1 && gen > 2) {
                rpt += "+";
            } else if (c.attacker.natureMultiplier(a) === -1 && gen > 2) {
                rpt += "-";
            }
            rpt += (a===Sulcalc.Stats.SATK ? " SpAtk" : " Atk");
        }
        var itemIgnoreList = {"649:1" : "Douse Drive", // Genesect-D
                              "649:2" : "Shock Drive", // Genesect-S
                              "649:3" : "Burn Drive", // Genesect-B
                              "649:4" : "Chill Drive", // Genesect-C
                              "460:1:M" : "Abomasite", // Mega Abomasnow
                              "359:1:M" : "Absolite", // Mega Absol
                              "142:1:M" : "Aerodactylite", // Mega Aerodactyl
                              "306:1:M" : "Aggronite", // Mega Aggron
                              "65:1:M" : "Alakazite", // Mega Alakazam
                              "181:1:M" : "Ampharosite", // Mega Ampharos
                              "354:1:M" : "Banettite", // Mega Banette
                              "9:1:M" : "Blastoisinite", // Mega Blastoise
                              "257:1:M" : "Blazikenite", // Mega Blaziken
                              "6:1:M" : "Charizardite X", // Mega Charizard X
                              "6:2:M" : "Charizardite Y", // Mega Charizard Y
                              "445:1:M" : "Garchompite", // Mega Garchomp
                              "282:1:M" : "Gardevoirite", // Mega Gardevoir
                              "94:1:M" : "Gengarite", // Mega Gengar
                              "130:1:M" : "Gyaradosite", // Mega Gyarados
                              "214:1:M" : "Heracronite", // Mega Heracross
                              "229:1:M" : "Houndoominite", // Mega Houndoom
                              "115:1:M" : "Kangaskhanite", // Mega Kangaskhan
                              "448:1:M" : "Lucarionite", // Mega Lucario
                              "310:1:M" : "Manectite", // Mega Manectric
                              "303:1:M" : "Mawilite", // Mega Mawile
                              "308:1:M" : "Medichamite", // Mega Medicham
                              "150:1:M" : "Mewtwonite X", // Mega Mewtwo X
                              "150:2:M" : "Mewtwonite Y", // Mega Mewtwo Y
                              "127:1:M" : "Pinsirite", // Mega Pinsir
                              "212:1:M" : "Scizorite", // Mega Scizor
                              "248:1:M" : "Tyranitarite", // Mega Tyranitar
                              "3:1:M" : "Venusaurite"}; // Mega Venusaur
        if (gen >= 2 && c.attacker.item.id !== "0" && itemIgnoreList[c.attacker.id] !== c.attacker.item.name()) {
            rpt += " " + c.attacker.item.name();
        }
        if (gen > 2 && c.attacker.ability.id !== "0") {
            rpt += " " + c.attacker.ability.name();
        }
        rpt += c.attacker.status === Sulcalc.Statuses.BURNED ? " Burned " : " ";
        rpt += c.attacker.name() + " " + c.move.name();
        // additional move info
        rpt += " vs. ";
        if (c.defender.boosts[d] !== 0) {
            rpt += (c.defender.boosts[d] > 0 ? "+" : "-") + Math.abs(c.defender.boosts[d]) + " ";
        }
        if (gen > 2 || c.defender.evs[d] < 252 || c.defender.evs[Sulcalc.Stats.HP] < 252) {
            rpt += c.defender.evs[Sulcalc.Stats.HP] + " HP/";
            rpt += c.defender.evs[d];
            if (c.defender.natureMultiplier(d) === 1 && gen > 2) {
                rpt += "+";
            } else if (c.defender.natureMultiplier(d) === -1 && gen > 2) {
                rpt += "-";
            }
            rpt += (d===Sulcalc.Stats.SDEF ? " SpDef" : " Def");
        }
        if (gen >= 2 && c.defender.item.id !== "0" && itemIgnoreList[c.defender.id] !== c.defender.item.name()) {
            rpt += " " + c.defender.item.name();
        }
        if (gen > 2 && c.defender.ability.id !== "0") {
            rpt += " " + c.defender.ability.name();
        }
        rpt += " " + c.defender.name();
        if (c.field.weather === Sulcalc.Weathers.RAIN) {
            rpt += " in Rain";
        } else if (c.field.weather === Sulcalc.Weathers.SUN) {
            rpt += " in Sun";
        } else if (c.field.weather === Sulcalc.Weathers.HAIL) {
            rpt += " in Hail";
        } else if (c.field.weather === Sulcalc.Weathers.SAND) {
            rpt += " in Sand";
        }
        if (c.field.critical) {
            rpt += " on a critical hit";
        }
        rpt += ": " + dmg[0].warray[0][0] + " - " + dmg[0].warray[dmg[0].warray.length-1][0] + " (" + minPercent + " - " + maxPercent + "%) -- ";
        
        var _chanceToKO = function (turns, damageRange, remainingHP, eff, t) {
            var totalChance = 0;
            if (remainingHP <= 0) {
                return 1;
            }
            for (var i = 0; i < eff.length && t !== 0; i++) {
                remainingHP += eff[i];
                if (remainingHP <= 0) {
                    return 1;
                }
            }
            if (turns === 0 || damageRange[t] === 0) {
                return 0;
            }
            if (damageRange[t] === 1) {
                t--;
            } else if (damageRange[t] === 2) {
                t %= (damageRange.length - 1);
            }
            for (var i = 0; i < damageRange[t].warray.length; i++) {
                totalChance += _chanceToKO(turns - 1, damageRange, remainingHP - damageRange[t].warray[i][0], eff, t+1) * damageRange[t].warray[i][1];
            }
            return totalChance / damageRange[t].total();
        }
        
        var chanceToKO = function (turns, damageRange, remainingHP, eff) {
            if (turns < 7 && (c.move.maxHits() === 1 || gen === 1)) {
                return _chanceToKO(turns, damageRange, remainingHP, eff, 0);
            }
            var maxDamage = 0, minDamage = 0;
            for (var i = 0, d = 0; i < turns && damageRange[d] !== 0; i++, d++) {
                if (damageRange[d] === 1) {
                    d--;
                } else if (damageRange[d] === 2) {
                    d %= (damageRange.length - 1);
                }
                maxDamage += damageRange[d].warray[damageRange[d].warray.length-1][0];
                minDamage += damageRange[d].warray[0][0];
                for (var j = 0; j < eff.length; j++) {
                    minDamage -= eff[j];
                    maxDamage -= eff[j];
                    if (minDamage >= remainingHP) {
                        return 1;
                    }
                }
            }
            return Math.min(1, (maxDamage - remainingHP + 1)/(maxDamage - minDamage + 1));
        }
        
        /*for (var i=0; i<dmg.length; i++) {
            r += dmg[i];
            if (i!==dmg.length-1) {
                r += ", ";
            }
        }*/
        var effects = [0];
        var effectMsgs = [""];
        if (gen === 2) { // gen 2 after effects
            if (c.defender.status === Sulcalc.Statuses.BURNED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Burn");
            } else if (c.defender.status === Sulcalc.Statuses.POISONED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Poison");
            } else if (c.defender.status === Sulcalc.Statuses.BADLYPOISONED) {
                // to-do
            }
            // leech seed
            // nightmare
            // curse
            if (c.field.weather === Sulcalc.Weathers.SAND && !(c.defender.type1() === Sulcalc.Types.GROUND
                                                               || c.defender.type2() === Sulcalc.Types.GROUND
                                                               || c.defender.type1() === Sulcalc.Types.ROCK
                                                               || c.defender.type2() === Sulcalc.Types.ROCK
                                                               || c.defender.type1() === Sulcalc.Types.STEEL
                                                               || c.defender.type2() === Sulcalc.Types.STEEL)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Sandstorm");
            }
            if (c.defender.item.name() === "Leftovers") {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Leftovers");
            }
        } else if (gen === 3) { // gen 3 after effects
            if (c.field.weather === Sulcalc.Weathers.SAND && !(c.defender.type1() === Sulcalc.Types.GROUND
                                                               || c.defender.type2() === Sulcalc.Types.GROUND
                                                               || c.defender.type1() === Sulcalc.Types.ROCK
                                                               || c.defender.type2() === Sulcalc.Types.ROCK
                                                               || c.defender.type1() === Sulcalc.Types.STEEL
                                                               || c.defender.type2() === Sulcalc.Types.STEEL)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Sandstorm");
            }
            if (c.field.weather === Sulcalc.Weathers.HAIL && !(c.defender.type1() === Sulcalc.Types.ICE || c.defender.type2() === Sulcalc.Types.ICE)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Hail");
            }
            // ingrain
            // rain dish
            if (c.defender.item.name() === "Leftovers") {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Leftovers");
            }
            // leech seed
            if (c.defender.status === Sulcalc.Statuses.BURNED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Burn");
            } else if (c.defender.status === Sulcalc.Statuses.POISONED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Poison");
            } else if (c.defender.status === Sulcalc.Statuses.BADLYPOISONED) {
                // to-do
            }
            // nightmare
            // curse
            // multi turns -- whirlpool, flame wheel, etc
        } else if (gen === 4) { // gen 4 after effects
            if (c.field.weather === Sulcalc.Weathers.SAND && !(c.defender.type1() === Sulcalc.Types.GROUND
                                                               || c.defender.type2() === Sulcalc.Types.GROUND
                                                               || c.defender.type1() === Sulcalc.Types.ROCK
                                                               || c.defender.type2() === Sulcalc.Types.ROCK
                                                               || c.defender.type1() === Sulcalc.Types.STEEL
                                                               || c.defender.type2() === Sulcalc.Types.STEEL)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Sandstorm");
            }
            if (c.field.weather === Sulcalc.Weathers.HAIL && !(c.defender.type1() === Sulcalc.Types.ICE || c.defender.type2() === Sulcalc.Types.ICE)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Hail");
            }
            if (c.defender.ability.name() === "Dry Skin") {
                if (c.field.weather === Sulcalc.Weathers.SUN) {
                    effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                    effectMsgs.push("Dry Skin");
                } else if (c.field.weather === Sulcalc.Weathers.RAIN) {
                    effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 3);
                    effectMsgs.push("Dry Skin");
                }
            }
            if (c.defender.ability.name() === "Rain Dish" && c.field.weather === Sulcalc.Weathers.RAIN) {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Rain Dish");
            }
            if (c.defender.ability.name() === "Ice Body" && c.field.weather === Sulcalc.Weathers.HAIL) {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Ice Body");
            }
            // ingrain
            // aqua ring
            if (c.defender.item.name() === "Leftovers") {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Leftovers");
            }
            // leech seed
            if (c.defender.status === Sulcalc.Statuses.BURNED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Burn");
            } else if (c.defender.status === Sulcalc.Statuses.POISONED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Poison");
            } else if (c.defender.status === Sulcalc.Statuses.BADLYPOISONED) {
                // to-do
            }
            // nightmare
            // curse
            // multi turns -- whirlpool, flame wheel, etc
            if (c.defender.status === Sulcalc.Statuses.ASLEEP && c.attacker.ability.name() === "Bad Dreams") {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Bad Dreams");
            }
            if (c.defender.item.name() === "Sticky Barb") {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Sticky Barb");
            }
        } else if (gen === 5) { // gen 5 after effects
            if (c.field.weather === Sulcalc.Weathers.SAND && !(c.defender.type1() === Sulcalc.Types.GROUND
                                                               || c.defender.type2() === Sulcalc.Types.GROUND
                                                               || c.defender.type1() === Sulcalc.Types.ROCK
                                                               || c.defender.type2() === Sulcalc.Types.ROCK
                                                               || c.defender.type1() === Sulcalc.Types.STEEL
                                                               || c.defender.type2() === Sulcalc.Types.STEEL)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Sandstorm");
            }
            if (c.field.weather === Sulcalc.Weathers.HAIL && !(c.defender.type1() === Sulcalc.Types.ICE || c.defender.type2() === Sulcalc.Types.ICE)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Hail");
            }
            if (c.defender.ability.name() === "Dry Skin") {
                if (c.field.weather === Sulcalc.Weathers.SUN) {
                    effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                    effectMsgs.push("Dry Skin");
                } else if (c.field.weather === Sulcalc.Weathers.RAIN) {
                    effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 3);
                    effectMsgs.push("Dry Skin");
                }
            }
            if (c.defender.ability.name() === "Rain Dish" && c.field.weather === Sulcalc.Weathers.RAIN) {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Rain Dish");
            }
            if (c.defender.ability.name() === "Ice Body" && c.field.weather === Sulcalc.Weathers.HAIL) {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Ice Body");
            }
            // fire pledge + grass pledge damage
            if (c.defender.item.name() === "Leftovers") {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Leftovers");
            }
            if (c.defender.item.name() === "Black Sludge") {
                if (c.defender.type1() === Sulcalc.Types.POISON || c.defender.type2() === Sulcalc.Types.POISON) {
                    effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                    effectMsgs.push("Black Sludge");
                } else {
                    effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                    effectMsgs.push("Black Sludge");
                }
            }
            // aqua ring
            // ingrain
            // leech seed
            if (c.defender.status === Sulcalc.Statuses.BURNED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Burn");
            } else if (c.defender.status === Sulcalc.Statuses.POISONED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Poison");
            } else if (c.defender.status === Sulcalc.Statuses.BADLYPOISONED) {
                // to-do
            }
            // nightmare
            // curse
            // multi turns -- whirlpool, flame wheel, etc
            if (c.defender.status === Sulcalc.Statuses.ASLEEP && c.attacker.ability.name() === "Bad Dreams") {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Bad Dreams");
            }
            if (c.defender.item.name() === "Sticky Barb") {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Sticky Barb");
            }
        } else if (gen === 6) { // gen 6 after effects
            if (c.field.weather === Sulcalc.Weathers.SAND && !(c.defender.type1() === Sulcalc.Types.GROUND
                                                               || c.defender.type2() === Sulcalc.Types.GROUND
                                                               || c.defender.type1() === Sulcalc.Types.ROCK
                                                               || c.defender.type2() === Sulcalc.Types.ROCK
                                                               || c.defender.type1() === Sulcalc.Types.STEEL
                                                               || c.defender.type2() === Sulcalc.Types.STEEL)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Sandstorm");
            }
            if (c.field.weather === Sulcalc.Weathers.HAIL && !(c.defender.type1() === Sulcalc.Types.ICE || c.defender.type2() === Sulcalc.Types.ICE)) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                effectMsgs.push("Hail");
            }
            if (c.defender.ability.name() === "Dry Skin") {
                if (c.field.weather === Sulcalc.Weathers.SUN) {
                    effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                    effectMsgs.push("Dry Skin");
                } else if (c.field.weather === Sulcalc.Weathers.RAIN) {
                    effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 3);
                    effectMsgs.push("Dry Skin");
                }
            }
            if (c.defender.ability.name() === "Rain Dish" && c.field.weather === Sulcalc.Weathers.RAIN) {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Rain Dish");
            }
            if (c.defender.ability.name() === "Ice Body" && c.field.weather === Sulcalc.Weathers.HAIL) {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Ice Body");
            }
            // fire pledge + grass pledge damage
            if (c.defender.item.name() === "Leftovers") {
                effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                effectMsgs.push("Leftovers");
            }
            if (c.defender.item.name() === "Black Sludge") {
                if (c.defender.type1() === Sulcalc.Types.POISON || c.defender.type2() === Sulcalc.Types.POISON) {
                    effects.push(c.defender.stat(Sulcalc.Stats.HP) >> 4);
                    effectMsgs.push("Black Sludge");
                } else {
                    effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 4));
                    effectMsgs.push("Black Sludge");
                }
            }
            // aqua ring
            // ingrain
            // leech seed
            if (c.defender.status === Sulcalc.Statuses.BURNED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Burn");
            } else if (c.defender.status === Sulcalc.Statuses.POISONED) {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Poison");
            } else if (c.defender.status === Sulcalc.Statuses.BADLYPOISONED) {
                // to-do
            }
            // nightmare
            // curse
            // multi turns -- whirlpool, flame wheel, etc
            if (c.defender.status === Sulcalc.Statuses.ASLEEP && c.attacker.ability.name() === "Bad Dreams") {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Bad Dreams");
            }
            if (c.defender.item.name() === "Sticky Barb") {
                effects.push(-(c.defender.stat(Sulcalc.Stats.HP) >> 3));
                effectMsgs.push("Sticky Barb");
            }
        }
        
        for (var i = 1, cko = 0, hasPrevious = false; cko < 1; i++) {
            cko = chanceToKO(i, dmg, c.defender.currentHP, effects);
            if (dmg[dmg.length - 1] === 0 && i !== 1) {
                break;
            } else if (i === 20 || dmg[0][dmg[0].length-1] === 0) {
                rpt += "That's probably not going to KO...";
                break;
            } else if (cko >= 1) {
                break;
            }
            var decimalPlaces = 1;
            if (cko > 0) {
                if (hasPrevious) {
                    rpt += ", "
                }
                rpt += Math.floor(cko * Math.pow(10, decimalPlaces + 2)) / Math.pow(10, decimalPlaces) + "% chance to ";
                rpt += (i === 1 ? "O" : i) + "HKO";
                hasPrevious = true;
            }
        }
        if (effectMsgs.length > 1) {
            rpt += " after ";
        } 
        for (var i = 1; i < effectMsgs.length; i++) {
            rpt += effectMsgs[i];
            if (effectMsgs.length === i + 2) {
                rpt += effectMsgs.length === 3 ? "" : ",";
                rpt += " and "
            } else if (effectMsgs.length !== i + 1) {
                rpt += ", "
            }
        }
        setText("results", rpt);
        var totalWidth = document.getElementById("hpDisplay").clientWidth;
        var minWidth = Math.round(totalWidth * dmg[0].warray[0][0] / c.defender.stat(Sulcalc.Stats.HP));
        minWidth = Math.min(totalWidth, minWidth);
        var maxWidth = Math.round(totalWidth * dmg[0].warray[dmg[0].warray.length-1][0]/c.defender.stat(Sulcalc.Stats.HP))
                       - minWidth;
        maxWidth = Math.min(totalWidth-minWidth, maxWidth);
        document.getElementById("minDamageBar").style.width = minWidth + "px";
        document.getElementById("maxDamageBar").style.width = maxWidth + "px";
        document.getElementById("blankBar").style.width = (totalWidth - minWidth - maxWidth) + "px";
        var maxPercent = Math.round(dmg[0].warray[dmg[0].warray.length-1][0]/c.defender.stat(Sulcalc.Stats.HP)*1000)/10;
    };
    
    var q = document.location.href;
    if (q.indexOf("?") >= 0) {
        loadQueryString(q.substr(q.indexOf("?") + 1));
    } else {
        changeGen(6);
    }
};
