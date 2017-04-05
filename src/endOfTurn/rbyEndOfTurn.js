import {Stats} from "../utilities";

const {max, trunc} = Math;

export default function rbyEndOfTurn(attacker, defender) {
    const values = [];
    const messages = [];
    const hp = defender.stat(Stats.HP);
    if (defender.burned) {
        values.push(-max(1, trunc(hp / 16)));
        messages.push("Burn");
    } else if (defender.poisoned) {
        values.push(-max(1, trunc(hp / 16)));
        messages.push("Poison");
    } else if (defender.badlyPoisoned) {
        values.push("toxic");
        messages.push("Toxic");
    }

    return {
        values,
        messages
    };
}
