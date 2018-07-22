/*
 * This file is for any location that asks for a decision and acts on the hero.
 * Currently this is:
 *   1. Fountain
 *   2. Altar
 */

class Fountain extends Location {
  constructor (rowID, colID) {
    super(rowID, colID, 'Fountain', 'fountain', 'f', 'A beautiful fountain, flowing with divine grace.', false, true)
    this.used = false
  }
  heroInteract () {
    if (!this.used) {
      var fountain = this

      // Set up interaction function
      var func = function () {
        fountain.used = true
        if (Math.random() <= 0.5) {
          hero.maxVitality += 5
          hero.vitality = hero.maxVitality
          refreshOpenMods()
          return 'The gods have smiled upon you. Your vitality is improved.'
        } else {
          return 'The gods do not hear your prayers. Nothing happens.'
        }
      }

      // set up the string of messages to parse
      var txtmodmsg = {
        'msgs': [
          ['dec', this.message, 'Use', 'Leave'],
          ['fin', func]
        ]}

      // show messages using textmod
      txtmd.parseTxtMdJSON(txtmodmsg)
    }
  }
}

class Altar extends Location {
  constructor (rowID, colID) {
    super(rowID, colID, 'Altar', 'altar', 'a', 'A blood-stained altar. Sacrifice here might make the gods of death smile upon you.', false, true)
    this.used = false
  }
  heroInteract () {
    if (!this.used) {
      var altar = this

      var func = function () {
        altar.used = true
        hero.maxVitality -= 5
        hero.vitality -= 5
        if (hero.vitality <= 0) {
          hero.vitality = 1
        }
        var statToImprove = Math.random()
        if (statToImprove <= 0.5) {
          hero.strength += Math.ceil(Math.random() * 2)
          statToImprove = 'strength'
        } else {
          hero.dexterity += Math.ceil(Math.random() * 2)
          statToImprove = 'dexterity'
        }
        refreshOpenMods()
        return 'The gods of death accept your blood sacrifice. Your ' +
                    statToImprove + ' has improved.'
      }

      var txtmodmsg = {
        'msgs': [
          ['dec', this.message, 'Use', 'Leave'],
          ['fin', func]
        ]}

      txtmd.parseTxtMdJSON(txtmodmsg)
    }
  }
}
