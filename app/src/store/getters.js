import {info} from "sulcalc";

export const sets = state => {
    const setdexList = [];
    for (const [name, setdex] of Object.entries(state.sets)) {
        if (state.enabledSets[name]) {
            setdexList.push(setdex[state.gen]);
        }
    }

    const groups = [];
    for (const pokemonId of info.releasedPokes(state.gen)) {
        const sets = [];
        for (const {[pokemonId]: setList = {}} of setdexList) {
            for (const [setName, set] of Object.entries(setList)) {
                sets.push({
                    pokemonId,
                    setName,
                    set
                });
            }
        }
        sets.push({
            pokemonId,
            setName: "Blank Set",
            set: {}
        });
        groups.push({sets, pokemonId});
    }

    return groups;
};
