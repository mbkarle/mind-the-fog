class DogInvModule {
  constructor () {
    this.modID = '#dog-info-module'
    this.textBoxID = '#dog-inventory'
    this.hoverID = '#doginv_hoverInfo'
    this.btnID = '#DogInvOpen'
    this.dogascii = '#doginvascii'
    this.avail = false // use to tell if keylisteners on
    this.open = false // use for whether or not to refresh in refreshInfo
  }

  activateMod () {
    // If dog isn't following we shouldnt have the module!
    // This activates the mod

    this.avail = true

    // set click listener
    var self = this
    $(this.btnID).off().click(function () {
      self.toggleMod()
      invmd.hideMod()
      refreshOpenMods()
    })

    // show button
    $(this.btnID).show()
  }

  deactivateMod () {
    // If leave dog range, can't open! Deactivate + hide button

    // First close the mod
    this.hideMod()

    // hide the button
    $(this.btnID).hide()

    // Publish not available
    this.avail = false
  }

  toggleMod () {
    // Use own open/close instead of $().toggle for consistency with this.open
    if (!this.open) { this.openMod() } else { this.hideMod() }
  }

  openMod () { $(this.modID).show(100); this.open = true }

  hideMod () { $(this.modID).hide(100); this.open = false }

  refreshDogInv () {
    // All the setup goes here, as the toggle / hide is
    // handled by key listeners in move()

    // First load the ascii dog (for cuteness :) )
    $(this.dogascii).html(ASCII_DOG)

    // Next Start the html to display
    var innerhtml = 'Dog Inventory: <br><small>(' + doge.inv.size() +
            '/' + doge.inv.capacity + ')</small><br><br>'

    // Show the dog inventory
    var dog_ids = { 'hoverID': this.hoverID, 'uniqueID': 'doginv' }

    // Should account for being able to tell dog to drop items
    // (without transfer), and a transfer could affect an
    // ongoing sale
    var dog_cbs = {
      'actioncb': (id) => doge.inv.transfer_item(hero.inv, id),
      'actiontxt': () => 'Take',
      'goldcb': () => doge.inv.transfer_item(hero.inv, 'gold'),
      'dropcb': (id) => doge.inv.remove(id)
    }

    var dogInvHTMLObj = doge.inv.generateHTML(dog_ids, dog_cbs)
    innerhtml += dogInvHTMLObj['innerhtml']

    // Show the hero inventory
    innerhtml += "<br><hr style='width: 80%'><br>"
    innerhtml += 'Hero Inventory: <br><small>(' + hero.inv.size() +
            '/' + hero.inv.capacity + ')</small><br><br>'

    var hero_ids = {'hoverID': this.hoverID, 'uniqueID': 'heroToDogInv'}
    var hero_cbs = {
      'actioncb': (id) => hero.inv.transfer_item(doge.inv, id),
      'actiontxt': () => 'Give',
      'dropcb': (id) => hero.inv.remove(id)
    }

    var heroInvHTMLObj = hero.inv.generateHTML(hero_ids, hero_cbs)
    innerhtml += heroInvHTMLObj['innerhtml']

    $(this.textBoxID).html(innerhtml)

    // Mouse listeners -- MUST BE SET AFTER ABOVE HTML
    dogInvHTMLObj['setClicks']()
    heroInvHTMLObj['setClicks']()
  }
}
