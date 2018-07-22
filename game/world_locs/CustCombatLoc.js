/*
 * This file is for locations that trigger custom combat
 * Currently this is:
 *   1. Statue
 *   2. Cave
 */

class Statue extends Location {
  constructor (rowID, colID) {
    super(rowID, colID, 'Statue', 'statue', 's', 'A mysterious statue stands impassively in front of you. It clutches a steel blade in its stony fingers which glimmers with a menacing edge.', false, true)
    this.destroyedStatue = false
  }

  heroInteract () {
    if (!this.destroyedStatue) {
      var statue = this
      var enterFightFunc = function () {
        statue.destroyedStatue = true
        txtmd.revertTxtMd()
        fightEnemy(hero, Golem)
      }
      var txtmodmsg = { 'msgs': [
        ['dec', this.message, 'Take Sword', 'Leave'],
        ['finfunc', "The statue springs to life and raises its sword. There's no escape!",
          'Engage', enterFightFunc]
      ]}

      txtmd.parseTxtMdJSON(txtmodmsg)
    }
  }
}

class Cave extends Location {
  constructor (rowID, colID) {
    super(rowID, colID, 'Cave', 'cave', 'o', "A small hole in the ground. It's dark inside but it's clear that danger lurks within.", true, true)
    this.empty = false
  }

  heroInteract () {
    if (!this.empty) {
      var cave = this
      var enterFightFunc = function () {
        cave.empty = true
        txtmd.revertTxtMd()
        fightEnemy(hero, frostGiant)
      }
      var txtmodmsg = { 'msgs': [
        ['dec', this.message, 'Enter', 'Leave'],
        ['finfunc', 'The occupant of the cave awakes. A massive frost giant looms before you!',
          'Engage', enterFightFunc]
      ]}

      txtmd.parseTxtMdJSON(txtmodmsg)
    }
  }
}
