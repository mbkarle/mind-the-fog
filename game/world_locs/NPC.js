/*
 * This file contains all NPC related locations.
 * Currently this is:
 *   1. Pit (where you find the NPC)
 *   2. NPC (interacting with one)
 *   3. CharDialogue (like NPC-lite, just a dialogue)
 */

class Pit extends Location {
  constructor (rowID, colID, charID, charDisplay) {
    super(rowID, colID, 'Pit', 'pit', 'p', 'A pitfall, once covered with crumbled stone. Someone appears trapped within.', false, true)
    this.charID = charID
    this.charDisplay = charDisplay
    this.used = false
  }

  hero_interact () {
    if (!this.used) {
      var self = this

      // Chance to get hurt, occurs if decide to not leave
      var rescueFunc = function () {
        self.used = true
        if (Math.random() < 0.4) {
          return 'You descend carefully and reach the bottom unscathed.'
        } else {
          hero.vitality -= 10
          refreshOpenMods()
          return 'You make it to the bottom, slightly worse for wear.'
        }
      }

      // After the rescue chance of hurt, start dialog
      var dialogFunc = function () {
        // Push the start message
        DIALOGUES[self.charID]['rescue'].push(
          'Together you climb out. The gatekeeper will take care of ' +
                        self.charDisplay + ' from here.')

        // Activate the NPC to be in GreatHall
        NPCS[self.charID]['active'] = true

        // Start the dialog
        txtmd.startDialog(self.charID, 'rescue', self.charDisplay)
      }

      var txtmodmsg = { 'msgs': [
        ['dec', this.message, 'Rescue', 'Leave'],
        ['finfunc', rescueFunc, '-->', dialogFunc]
      ]}

      txtmd.parseTxtMdJSON(txtmodmsg)
    }
  }
}

class CharDialogue extends Location {
  constructor (rowID, colID, charId, charDisplay, dialogId) {
    super(rowID, colID, 'Character Dialogue', 'charDialogue', 'C', '', false, true)
    this.charId = charId
    this.charDisplay = charDisplay
    this.dialogId = dialogId
  }

  hero_interact () {
    txtmd.startDialog(this.charId, this.dialogId, this.charDisplay)
  }
}

class NPC extends Location {
  constructor (rowID, colID, name) {
    super(rowID, colID, name, 'npc', NPCS[name]['symbol'], NPCS[name]['description'], false, true)

    // Load the merch into a inventory wrapper for use w visualizing/transfers/etc
    this.inv = new PrebuiltInventory(Object.values(NPCS[name]['merchandise']))
  }

  hero_interact () {
    if (this.inv.size() > 0) {
      var npc = this
      // load buyFunc and buyBtnTxt for vendor mod
      var buyFunc = NPCS[this.name]['buyFunc']
      var buyBtnTxt = NPCS[this.name]['buyBtnTxt']

      // set up the opening of the vendor mod
      var shopFunc = function () {
        txtmd.revertTxtMd()
        vndmd.openModForInvTransfer(hero.inv, npc.inv, false, buyFunc, buyBtnTxt, NPCS[npc.name]['buyFrac'])
      }

      // use text module to decide to display vendor mod (shopfunc)
      txtmd.parseTxtMdJSON({'msgs': [['dec', this.message, 'Shop', 'Leave', shopFunc]]})
    }
  }
}
