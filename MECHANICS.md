# Mechanics References
A list of sources used for the calculator.

## Gen 1
- [Crystal_'s Research](http://www.smogon.com/forums/threads/past-gens-research-thread.3506992/#post-5878612)

## Gen 2
- **A combination of UPokeCenter and Crystal_**
    - The following data was obtained through UPC with various inaccuracies
      corrected by Crystal_ and some mechanics testing done by myself.
    - If there's a crit, use the boosted stats only if the appropriate attack
      stat has more boosts than the appropriate defense stat, otherwise use the
      unboosted stats from both pokes. Use the boosted stats if there's no crit.
    - If boosts were not ignored in the previous step, halve attack for burn.
    - Cap the stats at 999.
    - If screens are active then multiply the defenses by 2, unless stat boosts
      were ignored.
    - Multiply Special Attack by 2 for Light Ball.
    - Multiply Attack by 2 for Thick Club.
    - Divide Defense by 2 for Explosion/Self-Destruct and then floor.
    - Multiply the defenses by 1.5 and round down for untransformed
      Ditto + Metal Powder
    - If either of the appropriate attack and defense stats exceed 255, then
      divide by 4, floor, and apply bitwise-and 0xFF (discard all but the least
      significant byte).
    - Make sure both the chosen attack and defense stat are at least 1.
    - `damage = (2*5/level+2)*attack*base_power/defense/50`
      Note that we are flooring after every division.
    - Multiply damage by 1.1 and round down for Mystical Water, Miracle Seed,
      Charcoal, etc.
    - Multiply by 2 for a critical hit.
    - Cap damage at 997 and then add 2.
    - If a Water-type move is used in Sunny weather, a Fire-type move is used
      in Rainy weather, or if Solar Beam is used in Rainy weather, then divide
      damage by 2 and round down. If a Fire-type move is used in Sunny weather
      or if a Water-type move is used in Rainy Weather, then multiply damage
      by 1.5 and round down.
    - Multiply damage by 1.5 and round down for STAB.
    - Multiply for type effectiveness and round down.
    - Apply damage variation 217/255 through 255/255 rounded down. Reversal and
      Flail do not have damage variation applied to them.
    - Multiply damage by 2 for switching out of Pursuit.

## Gen 3

## Gen 4
- [Smogon DP Damage Formula](http://www.smogon.com/dp/articles/damage_formula)

## Gen 5
- [Smogon BW Damage Formula](http://www.smogon.com/bw/articles/bw_complete_damage_formula)

## Gen 6

## Gen 7
- [Smogon SM Mechanics Research](http://www.smogon.com/forums/threads/pokemon-sun-moon-battle-mechanics-research.3586701/)
