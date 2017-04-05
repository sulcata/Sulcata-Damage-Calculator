import {Stats, Types} from "../utilities";

const {max, trunc} = Math;

export default function hgssEndOfTurn(attacker, defender, field) {
    const values = [];
    const messages = [];
    const hp = defender.stat(Stats.HP);

    if (field.sand && defender.hurtBySandstorm()) {
        values.push(-max(1, trunc(hp / 16)));
        messages.push("Sandstorm");
    } else if (field.hail && defender.hurtByHail()) {
        values.push(-max(1, trunc(hp / 16)));
        messages.push("Hail");
    }

    if (defender.ability.name === "Dry Skin") {
        if (field.sun) {
            values.push(-max(1, trunc(hp / 8)));
            messages.push("Dry Skin");
        } else if (field.rain) {
            values.push(max(1, trunc(hp / 8)));
            messages.push("Dry Skin");
        }
    } else if (field.rain && defender.ability.name === "Rain Dish") {
        values.push(max(1, trunc(hp / 16)));
        messages.push("Rain Dish");
    } else if (field.hail && defender.ability.name === "Ice Body") {
        values.push(max(1, trunc(hp / 16)));
        messages.push("Ice Body");
    }
    // ingrain
    // aqua ring
    if (defender.item.name === "Leftovers") {
        values.push(max(1, trunc(hp / 16)));
        messages.push("Leftovers");
    } else if (defender.item.name === "Black Sludge") {
        if (defender.stab(Types.POISON)) {
            values.push(max(1, trunc(hp / 16)));
        } else {
            values.push(-max(1, trunc(hp / 16)));
        }
        messages.push("Black Sludge");
    }
    // leech seed
    if (defender.burned) {
        values.push(-max(1, trunc(hp / 8)));
        messages.push("Burn");
    } else if (defender.poisoned) {
        values.push(-max(1, trunc(hp / 8)));
        messages.push("Poison");
    } else if (defender.badlyPoisoned) {
        values.push("toxic");
        messages.push("Toxic");
    }
    // nightmare
    // curse
    // multi turns -- whirlpool, flame wheel, etc
    if (defender.asleep && attacker.ability.name === "Bad Dreams") {
        values.push(-max(1, trunc(hp / 8)));
        messages.push("Bad Dreams");
    }

    if (defender.item.name === "Sticky Barb") {
        values.push(-max(1, trunc(hp / 8)));
        messages.push("Sticky Barb");
    }

    if (defender.ability.name === "Magic Guard") {
        for (let i = 1; i < values.length; i++) {
            if (values[i] < 0) {
                values.splice(i, 1);
                messages.splice(i, 1);
            }
        }
    }

    return {
        values,
        messages
    };
}
