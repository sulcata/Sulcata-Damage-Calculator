/** to-do
 * make calculations less slow (timeouts?)
 * proper beat up input
 * after turn effects
 */

db = new Database();

var pokemons = [null, null, null, null, null, null, null];
var abilities = [null, null, null, null, null, null, null];
var items = [null, null, null, null, null, null, null];
var moves = [null, null, null, null, null, null, null];
var cacheDisabled = true;

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
    if (typeof(e) === "string" || (e instanceof String)) {
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

function setSelectByValue(e, value) {
    for (var i = 0; i < e.options.length; i++) {
        if (e.options[i].value === value) {
            e.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function setSelectByText(e, text) {
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
    document.getElementById("pledge").checked = false;

    if (gen >= 3) {
        document.getElementById("attackerSdefIv").disabled = false;
        document.getElementById("attackerSdefEv").disabled = false;
        document.getElementById("attackerHpIv").disabled = false;
        document.getElementById("defenderSdefIv").disabled = false;
        document.getElementById("defenderSdefEv").disabled = false;
        document.getElementById("defenderHpIv").disabled = false;
    } else if (gen === 2) {
        document.getElementById("attackerSdefIv").disabled = true;
        document.getElementById("attackerSdefEv").disabled = true;
        document.getElementById("attackerHpIv").disabled = true;
        document.getElementById("defenderSdefIv").disabled = true;
        document.getElementById("defenderSdefEv").disabled = true;
        document.getElementById("defenderHpIv").disabled = true;
    } else {
        document.getElementById("attackerHpIv").disabled = true;
        document.getElementById("defenderHpIv").disabled = true;
    }


    var ops = "";
    var end = gen < 5 ? 10 : 5;
    for (var i = 0; i <= end; i++) {
        ops += "<option value='" + i + "'>" + i;
        if (i === end) {
            ops += "+";
        }
        ops += " (1." + i + "x)</option>";
    }
    document.getElementById("metronome").innerHTML = ops;
    
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
    document.getElementById("furyCutter").innerHTML = ops;
    
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
    var a = document.getElementsByTagName("*");
    for (var i=0; i<a.length; i++) {
        if (a[i].className) {
            if (a[i].className.indexOf("G_") !== -1) {
                if (a[i].className.substr(a[i].className.indexOf("G_")).indexOf(gen + "") === -1) {
                    a[i].style.display = "none";
                } else {
                    a[i].style.display = "";
                }
            } else if (a[i].className.indexOf("M_") !== -1 || a[i].className.indexOf("I_") !== -1) {
                a[i].style.display = "none";
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
        for (var a in db.releasedPokes[gen]) {
            id = db.releasedPokes[gen][a];
            if (id in db.pokemons) {
                if (db.pokemons[id] === "Missingno") {
                    continue;
                }
                arr = insertOpOrder(arr, [id, db.pokemons[id]]);
            } else if ((id + ":H") in db.pokemons) {
                arr = insertOpOrder(arr, [id + ":H", db.pokemons[id + ":H"]]);
            } else if ((id + ":M") in db.pokemons) {
                arr = insertOpOrder(arr, [id + ":M", db.pokemons[id + ":M"]]);
            } else if ((id + ":B") in db.pokemons) {
                arr = insertOpOrder(arr, [id + ":B", db.pokemons[id + ":B"]]);
            }
        }
        arr.splice(0, 0, ["0:0", "Missingno"]);
        pokemons[gen] = document.getElementById("attackerPoke").innerHTML = document.getElementById("defenderPoke").innerHTML = getOptions(arr);
    } else {
        document.getElementById("attackerPoke").innerHTML = document.getElementById("defenderPoke").innerHTML = pokemons[gen];
    }

    if (abilities[gen] === null || cacheDisabled) {
        arr = [];
        var genAbilityLists = [null, 0, 0, 76, 123, 164, 188];
        for (var i = 0; i < genAbilityLists[gen]; i++) {
            arr = insertOpOrder(arr, [i, db.abilities[i]]);
        }
        abilities[gen] = document.getElementById("attackerAbility").innerHTML = document.getElementById("defenderAbility").innerHTML = getOptions(arr);
    } else {
        document.getElementById("attackerAbility").innerHTML = document.getElementById("defenderAbility").innerHTML = abilities[gen];
    }
    
    if (moves[gen] === null || cacheDisabled) {
        arr = [];
        for (var a in db.releasedMoves[gen]) {
            id = db.releasedMoves[gen][a];
            arr = insertOpOrder(arr, [id, db.moves[id]]);
        }
        moves[gen] = document.getElementById("move").innerHTML = getOptions(arr);
    } else {
        document.getElementById("move").innerHTML = moves[gen];
    }
    
    if (items[gen] === null || cacheDisabled) {
        arr = [];
        for (var a in db.releasedItems[gen]) {
            id = db.releasedItems[gen][a];
            arr = insertOpOrder(arr, [id, db.items[id]])
        }
        for (var a in db.releasedBerries[gen]) {
            id = db.releasedBerries[gen][a];
            arr = insertOpOrder(arr, [parseInt(id, 10) + 8000, db.berries[id]])
        }
        items[gen] = document.getElementById("attackerItem").innerHTML = document.getElementById("defenderItem").innerHTML = getOptions(arr);
    } else {
        document.getElementById("attackerItem").innerHTML = document.getElementById("defenderItem").innerHTML = items[gen];
    }
    
    var typeOps = "<option value='18'>---</option>";
    for (var i = 0; i < 18; i++) {
        if ((gen === 1 && (i === 8 || i === 16))
            || (gen < 6 && i === 17)) {
            continue;
        }
        typeOps += "<option value='" + i + "'>" + db.types[i] + "</option>";
    }
    typeLists = document.getElementsByClassName("typeList");
    for (var i = 0; i < typeLists.length; i++) {
        typeLists[i].innerHTML = typeOps;
    }
    
    str = "<option value='0'>(No Weather)</option><option value='4'>Sun</option><option value='2'>Rain</option><option value='3'>Sand</option>";
    str += gen>=3?"<option value='1'>Hail</option>":"";
    document.getElementById("weather").innerHTML = str;
    
    document.getElementById("attackerGender").innerHTML = document.getElementById("defenderGender").innerHTML = "<option value='0'>Neutral</option>";
    
    for (var i = 1; i <= 6; i++) {
        document.getElementById("cgen" + i).className = (gen === i) ? "selectGen selectedGen" : "selectGen";
    }
    
    updateFormatting();
}

function sortOptions (id) {
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

function pokeForm (id) {
    if (id.indexOf(":")!==id.lastIndexOf(":")) {
        return id.substring(id.indexOf(":") + 1, id.lastIndexOf(":"));
    }
    return id.substring(id.indexOf(":") + 1);
}

function pokeSpecies (id) {
    return id.substring(0, id.indexOf(":"));
}

function options (j) {
    var str="";
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
    return [ parseInt(document.getElementById(p + "HpEv").value, 10),
             parseInt(document.getElementById(p + "AtkEv").value, 10),
             parseInt(document.getElementById(p + "DefEv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SatkEv").value, 10) : parseInt(document.getElementById(p + "SpcEv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SdefEv").value, 10) : parseInt(document.getElementById(p + "SpcEv").value, 10),
             parseInt(document.getElementById(p + "SpdEv").value, 10)
           ];
}

function getIvs (p) {
    return [ parseInt(document.getElementById(p + "HpIv").value, 10),
             parseInt(document.getElementById(p + "AtkIv").value, 10),
             parseInt(document.getElementById(p + "DefIv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SatkIv").value, 10) : parseInt(document.getElementById(p + "SpcIv").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SdefIv").value, 10) : parseInt(document.getElementById(p + "SpcIv").value, 10),
             parseInt(document.getElementById(p + "SpdIv").value, 10)
           ];
}

function getBoosts (p) {
    return [ 0,
             parseInt(document.getElementById(p + "AtkBoost").value, 10),
             parseInt(document.getElementById(p + "DefBoost").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SatkBoost").value, 10) : parseInt(document.getElementById(p + "SpcBoost").value, 10),
             gen > 1 ? parseInt(document.getElementById(p + "SdefBoost").value, 10) : parseInt(document.getElementById(p + "SpcBoost").value, 10),
             parseInt(document.getElementById(p + "SpdBoost").value, 10),
             0,
             0
           ];
}
    
function setEvs (p, e) {
    document.getElementById(p + "HpEv").value = e[Sulcalc.Stats.HP];
    document.getElementById(p + "AtkEv").value = e[Sulcalc.Stats.ATK];
    document.getElementById(p + "DefEv").value = e[Sulcalc.Stats.DEF];
    document.getElementById(p + "SatkEv").value = gen > 2 ? e[Sulcalc.Stats.SATK] : e[Sulcalc.Stats.SPC];
    document.getElementById(p + "SdefEv").value = gen > 2 ? e[Sulcalc.Stats.SDEF] : e[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpcEv").value = e[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpdEv").value = e[Sulcalc.Stats.SPD];
}

function setIvs (p, i) {
    document.getElementById(p + "HpIv").value = (gen > 2) ? i[Sulcalc.Stats.HP] : (i[1] & 1) << 3 | (i[2] & 1) << 2 | (i[3] & 1) << 1 | (i[5] & 1);
    document.getElementById(p + "AtkIv").value = i[Sulcalc.Stats.ATK];
    document.getElementById(p + "DefIv").value = i[Sulcalc.Stats.DEF];
    document.getElementById(p + "SatkIv").value = i[Sulcalc.Stats.SATK];
    document.getElementById(p + "SdefIv").value = i[Sulcalc.Stats.SDEF];
    document.getElementById(p + "SpcIv").value = i[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpdIv").value = i[Sulcalc.Stats.SPD];
}

function setBoosts (p, b) {
    document.getElementById(p + "AtkBoost").value = b[Sulcalc.Stats.ATK];
    document.getElementById(p + "DefBoost").value = b[Sulcalc.Stats.DEF];
    document.getElementById(p + "SatkBoost").value = b[Sulcalc.Stats.SATK];
    document.getElementById(p + "SdefBoost").value = b[Sulcalc.Stats.SDEF];
    document.getElementById(p + "SpcBoost").value = b[Sulcalc.Stats.SPC];
    document.getElementById(p + "SpdBoost").value = b[Sulcalc.Stats.SPD];
}

function updatePoke (p) {
    changeSprite(p + "Sprite", document.getElementById(p + "Poke").value);
    document.getElementById(p + "Nature").selectedIndex = 0;
    document.getElementById(p + "Ability").selectedIndex = 0;
    document.getElementById(p + "Item").selectedIndex = 0;
    document.getElementById(p + "Status").selectedIndex = 0;
    document.getElementById(p + "Level").value = 100;
    var poke = new Sulcalc.Pokemon();
    poke.id = document.getElementById(p + "Poke").value;
    var type1e = document.getElementById(p + "Type1");
    var type2e = document.getElementById(p + "Type2");
    setSelectByValue(type1e, poke.type1() + "");
    setSelectByValue(type2e, poke.type2() + "");
    var gender = poke.gender();
    var h = "";
    if ((gender & 1) === 1) {
        h = "<option value='1'>Male</option>";
    }
    if ((gender & 2) === 2) {
        h += "<option value='2'>Female</option>";
    }
    if (gender === 0) {
        h += "<option value='0'>Neutral</option>"
    }
    document.getElementById(p + "Gender").innerHTML = h;
    var strs = ["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"];
    for (var i = 0; i < strs.length; i++) {
        document.getElementById(p + strs[i] + "Ev").value = gen > 2 ? 0 : 255;
        document.getElementById(p + strs[i] + "Iv").value = gen > 2 ? 31 : 15;
        document.getElementById(p + strs[i] + "Boost").selectedIndex = 6;
    }
    updateStats(p);
}

function updateHpPercent (p) {
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
    
function updateHpPoints (p) {
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

function updateStats (p) {
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
                                                    | (parseInt(document.getElementById(p + "SpcIv").value, 10) & 1) << 1
                                                    | (parseInt(document.getElementById(p + "SpdIv").value, 10) & 1);
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
        setText(p + strs[i][0] + "Stat", poke.boostedStat(strs[i][1]));
    }
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
    var aGender = document.getElementById("attackerGender");
    var dGender = document.getElementById("defenderGender");
    var tempGender = [aGender.innerHTML, aGender.selectedIndex];
    aGender.innerHTML = dGender.innerHTML;
    aGender.selectedIndex = dGender.selectedIndex;
    dGender.innerHTML = tempGender[0];
    dGender.selectedIndex = tempGender[1];
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
}

window.onload = function() {    
    var str = options(db.natures);
    document.getElementById("attackerNature").innerHTML = str;
    document.getElementById("defenderNature").innerHTML = str;
    
    for (var i = 1; i <= 6; i++) {
        document.getElementById("cgen" + i).onclick = (function (n) {
            return (function () {
                if (gen !== n) {
                    changeGen(n);
                }
            });
        }(i));
    };
    
    document.getElementById("attackerItem").onchange = function() {
        var e = document.getElementById("battleOptions").getElementsByTagName("div");
        var i = "";
        var item = db.items[this.value];
        for (var j = 0; j < e.length; j++) {
            if (e[j].className) {
                if (e[j].className.indexOf("I_") !== -1) {
                    i = e[j].className.substr(e[j].className.indexOf("I_") + 2);
                    if (i === "METRONOME" && item === "Metronome") {
                        e[j].style.display = "block";
                        document.getElementById("metronome").selectedIndex = 0;
                    } else {
                        e[j].style.display = "none";
                    }
                }
            }
        }
    };
    
    document.getElementById("attackerAbility").onchange = function() {
        var ability = db.abilities[this.value];
        if (ability === "Toxic Boost") {
            var aStatus = document.getElementById("attackerStatus");
            setSelectByText(aStatus, "Poisoned");
        } else if (ability === "Flare Boost" || ability === "Guts") {
            var aStatus = document.getElementById("attackerStatus");
            setSelectByText(aStatus, "Burned");
        }
    };
    
    document.getElementById("move").onchange = function() {
        var a = document.getElementById("battleOptions").getElementsByTagName("div");
        var m = "";
        var move = db.moves[this.value];
        for (var i = 0; i < a.length; i++) {
            if (a[i].className) {
                if (a[i].className.indexOf("M_") !== -1) {
                    m = a[i].className.substr(a[i].className.indexOf("M_") + 2);
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
                    } else if (m === "MULTIHIT" && (this.value in db.minMaxHits[gen]) && move !== "(No Move)" && move !== "Beat Up") {
                        a[i].style.display = "";
                        var moveInfo = new Sulcalc.Move(),
                            multiOps = "";
                        moveInfo.id = this.value;
                        for (var h = moveInfo.minHits(); h <= moveInfo.maxHits(); h++) {
                            multiOps += "<option value='" + h + "'>" + h + " hits</option>";
                        }
                        document.getElementById("multiHits").innerHTML = multiOps;
                        document.getElementById("multiHits").selectedIndex = 0;
                    } else if (m === "PLEDGE" && (move === "Fire Pledge" || move === "Water Pledge" || move === "Grass Pledge")) {
                        a[i].style.display = "";
                    } else if (m === "HAPPINESS" && move === "Return") {
                        a[i].style.display = "";
                        document.getElementById("happiness").value = 255;
                    } else if (m === "HAPPINESS" && move === "Frustration") {
                        a[i].style.display = "";
                        document.getElementById("happiness").value = 0;
                    } else {
                        a[i].style.display = "none";
                    }
                }
            }
        }
    };
    
    document.getElementById("happiness").onchange = function() {
        // "216":"Return"
        if (this.value.match(/[^0-9]/g) !== null) {
            this.value = document.getElementById("move").value === "216" ? 255 : 0;
        } else {
            this.value = Math.max(0, Math.min(255, parseInt(this.value)));
        }
    };
    
    document.getElementById("attackerPoke").onchange = function() {updatePoke("attacker");};

    document.getElementById("defenderPoke").onchange = function() {updatePoke("defender");};

    document.getElementById("attackerHP").onchange = function() {updateHpPercent("attacker");};
    document.getElementById("attackerHPp").onchange = function() {updateHpPoints("attacker");};
    document.getElementById("defenderHP").onchange = function() {updateHpPercent("defender");};
    document.getElementById("defenderHPp").onchange = function() {updateHpPoints("defender");};
    document.getElementById("attackerNature").onchange = document.getElementById("attackerLevel").onchange = function() {updateStats("attacker");};
    document.getElementById("defenderNature").onchange = document.getElementById("defenderLevel").onchange = function() {updateStats("defender");};
    
    var strs = [["Hp", "Atk", "Def", "Satk", "Sdef", "Spc", "Spd"], ["Ev", "Iv", "Boost"]];
    for (var i = 0; i < strs[0].length; i++) {
        for (var j = 0; j < strs[1].length; j++) {
            if (strs[0][i] !== "Hp" || strs[1][j] !== "Boost") {
                document.getElementById("attacker" + strs[0][i] + strs[1][j]).onchange = function() {updateStats("attacker");};
                document.getElementById("defender" + strs[0][i] + strs[1][j]).onchange = function() {updateStats("defender");};
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
    
    document.getElementById("moreOptions").onclick = toggleOptions;
    document.getElementById("swap").onclick = swapPokemon;
    
    changeGen(6);
    
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
        c.attacker.gender = parseInt(document.getElementById("attackerGender").value, 10);
        c.attacker.status = parseInt(document.getElementById("attackerStatus").value, 10);
        c.attacker.currentHP = parseInt(document.getElementById("attackerHP").value, 10);
        if (c.attacker.currentHP === NaN) {
            c.attacker.currentHP = c.attacker.stat(Sulcalc.Stats.HP);
        }
        c.attacker.level = parseInt(document.getElementById("attackerLevel").value, 10);
        c.attacker.gender = parseInt(document.getElementById("attackerGender").value, 10);
        c.attacker.addedType = parseInt(document.getElementById("attackerTypeAdded").value, 10);
        c.attacker.override = true;
        c.attacker.overrideTypes = [parseInt(document.getElementById("attackerType1").value, 10),
                                    parseInt(document.getElementById("attackerType2").value, 10)];
        c.attacker.grounded = document.getElementById("attackerGrounded").checked;
        c.attacker.tailwind = document.getElementById("attackerTailwind").checked;
        c.attacker.unburden = document.getElementById("attackerUnburden").checked;
        c.attacker.autotomize = document.getElementById("attackerAutotomize").checked;
        c.attacker.flowerGift = document.getElementById("attackerFlowerGift").checked;
        
        c.defender.id = document.getElementById("defenderPoke").value;
        c.defender.evs = getEvs("defender");
        c.defender.ivs = getIvs("defender");
        c.defender.boosts = getBoosts("defender");
        c.defender.nature = document.getElementById("defenderNature").value;
        c.defender.ability.id = document.getElementById("defenderAbility").value;
        c.defender.item.id = document.getElementById("defenderItem").value;
        c.defender.gender = parseInt(document.getElementById("defenderGender").value, 10);
        c.defender.status = parseInt(document.getElementById("defenderStatus").value, 10);
        c.defender.currentHP = parseInt(document.getElementById("defenderHP").value, 10);
        if (c.defender.currentHP === NaN) {
            c.defender.currentHP = c.defender.stat(Sulcalc.Stats.HP);
        }
        c.defender.level = parseInt(document.getElementById("defenderLevel").value, 10);
        c.defender.gender = parseInt(document.getElementById("defenderGender").value, 10);
        c.defender.addedType = parseInt(document.getElementById("defenderTypeAdded").value, 10);
        c.defender.override = true;
        c.defender.overrideTypes = [parseInt(document.getElementById("defenderType1").value, 10),
                                    parseInt(document.getElementById("defenderType2").value, 10)];
        c.defender.grounded = document.getElementById("defenderGrounded").checked;
        c.defender.tailwind = document.getElementById("defenderTailwind").checked;
        c.defender.unburden = document.getElementById("defenderUnburden").checked;
        c.defender.autotomize = document.getElementById("defenderAutotomize").checked;
        c.defender.flowerGift = document.getElementById("defenderFlowerGift").checked;
        
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
        
        dmg = c.calculate();
        var minPercent = Math.round(dmg.warray[0][0]/c.defender.stat(Sulcalc.Stats.HP)*1000)/10;
        var maxPercent = Math.round(dmg.warray[dmg.warray.length-1][0]/c.defender.stat(Sulcalc.Stats.HP)*1000)/10;
        rpt = "";
        var dclass = 0;
        var type = c.move.type();
        var power = c.move.power();
        if (c.move.name() === "Hidden Power") {
            type = c.hiddenPowerT(c.attacker.ivs);
            power = c.hiddenPowerP(c.attacker.ivs);
        }
        if (gen <= 3) {
            dclass = db.typeDamageClass[c.move.type()];
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
        if (gen >= 2 && c.attacker.item.id !== "0") {
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
        if (gen >= 2 && c.defender.item.id !== "0") {
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
        rpt += ": " + dmg.warray[0][0] + " - " + dmg.warray[dmg.warray.length-1][0] + " (" + minPercent + " - " + maxPercent + "%) -- ";
        
        var _chanceToKO = function (turns, damageRange, remainingHP, total, eff, firstCall) {
            var totalChance = 0;
            if (remainingHP <= 0) {
                return 1;
            }
            for (var i = 0; i < eff.length && !firstCall; i++) {
                remainingHP += eff[i];
                if (remainingHP <= 0) {
                    return 1;
                }
            }
            if (turns === 0) {
                return 0;
            }
            for (var i = 0; i < damageRange.warray.length; i++) {
                totalChance += _chanceToKO(turns - 1, damageRange, remainingHP - damageRange.warray[i][0], total, eff, false) * damageRange.warray[i][1];
            }
            return totalChance / total;
        }
        
        var chanceToKO = function (turns, damageRange, remainingHP, eff) {
            if (turns < 7) {
                return _chanceToKO(turns, damageRange, remainingHP, damageRange.total(), eff, true);
            }
            var maxDamage = 0, minDamage = 0;
            for (var i = 0; i < turns; i++) {
                maxDamage += damageRange.warray[damageRange.warray.length-1][0];
                minDamage += damageRange.warray[0][0];
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
        
        for (var i = 1, cko = 0, hasPrevious = false; cko!==1; i++) {
            if (i === 20 || dmg[dmg.length-1] === 0) {
                rpt += "That's probably not going to KO...";
                break;
            }
            cko = chanceToKO(i, dmg, c.defender.currentHP, effects);
            var decimalPlaces = 1;
            if (cko > 0) {
                if (hasPrevious) {
                    rpt += ", "
                }
                if (cko === 1) {
                    rpt += "guaranteed "
                } else {
                    rpt += Math.floor(cko * Math.pow(10, decimalPlaces + 2)) / Math.pow(10, decimalPlaces) + "% chance to ";
                }
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
        var minWidth = Math.round(totalWidth * dmg.warray[0][0] / c.defender.stat(Sulcalc.Stats.HP));
        minWidth = Math.min(totalWidth, minWidth);
        var maxWidth = Math.round(totalWidth * dmg.warray[dmg.warray.length-1][0]/c.defender.stat(Sulcalc.Stats.HP))
                       - minWidth;
        maxWidth = Math.min(totalWidth-minWidth, maxWidth);
        document.getElementById("minDamageBar").style.width = minWidth + "px";
        document.getElementById("maxDamageBar").style.width = maxWidth + "px";
        document.getElementById("blankBar").style.width = (totalWidth - minWidth - maxWidth) + "px";
        var maxPercent = Math.round(dmg.warray[dmg.warray.length-1][0]/c.defender.stat(Sulcalc.Stats.HP)*1000)/10;
    };
};
