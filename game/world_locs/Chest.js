/*
 * This file is for the Chest location.
 */

class Chest extends Location {
  constructor (rowID, colID, itemList) {
    super(rowID, colID, 'Treasure Chest', 'treasure', 'v', "A wooden chest. It's locked, but no wood can withstand your blade.", false, true)
    this.emptied = false // has the chest been emptied?
    this.size = Math.ceil(Math.random() * 3)

    // All of the items in the chest are in an Inventory
    var maxTorches = 3
    var maxGold = 500
    this.inv = new Inventory(itemList, this.size, 1, maxGold, maxTorches)
  }

  heroInteract () {
    if (!this.emptied) {
      var self = this
      var txtmodmsg = {'msgs': [
        ['dec', this.message, 'Smash', 'Leave'],
        ['finfunc', 'the chest lays smashed by your blade, its treasures still there.',
          'Loot', function () { self.emptied = true; txtmd.showInventory(self.inv) }]]}

      txtmd.parseTxtMdJSON(txtmodmsg)
    }
  }
}
