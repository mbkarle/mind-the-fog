class VendorModule {
  constructor () {
    this.modID = '#vendor-module'
    this.hoverID = '#vendor-hover'
    this.textBox = '#vendor-contents'
    this.exitBtnID = '#vendor-close'
    this.tabID = '#vendor-tab'
    this.buying = true // default start w buy items
    this.refreshFunc = null // used to manually update (ie unequip in inv = avail for sale)
    this.open = false
  }

  openModForInvTransfer (buyerInv, sellerInv, sellAvail, buyFunc, buyBtnTxt, buyFrac = 1, sellFrac = 0.8) {
    // buyerInv === the person doing the buying
    // sellerInv === the person doing the selling
    // sellAvail === show tab or not
    // buyFunc === func to execute on buy
    // buyBtnTxt === button text on the item buttons
    // buyFrac === buy things full price
    // sellFrac === sell at discount

    canMove = false

    // Show mod
    $(this.modID).show()
    this.open = true
    $('#worldMap').hide()
    $(this.exitBtnID).show()
    $(this.exitBtnID).off().click(() => this.revertVendorMd())

    if (this.buying) {
      var header = "For Purchase: <br> You've got " + buyerInv.gold + ' gold <br>'
      var frac = buyFrac
      var tabTxt = 'Sell'
    } else {
      var header = "What would you like to sell? <br> I'm willing to spend " + buyerInv.gold + ' gold <br>'
      var frac = sellFrac
      var tabTxt = 'Buy'
    }

    // setup the modIds and cb's for displaying the inv
    var modIds = {'hoverID': this.hoverID, 'uniqueID': 'vdr'}
    var buyCbs = {
      'actioncb': (id) => buyFunc(id, buyerInv, sellerInv, frac),
      'actiontxt': (item) => buyBtnTxt(item, frac)
    }

    this.refreshFunc = function () {
      this.openModForInvTransfer(buyerInv, sellerInv, sellAvail, buyFunc, buyBtnTxt, buyFrac, sellFrac)
    }

    // generate and set html
    var sellObj = sellerInv.generateHTML(modIds, buyCbs)
    this.setTextBox(header + sellObj['innerhtml']) // set html
    sellObj['setClicks']() // set click listeners

    // if sellAvail set tab to reverse roles!
    if (sellAvail) {
      var self = this
      var tabFunc = function () {
        self.buying = !self.buying
        self.openModForInvTransfer(sellerInv, buyerInv, sellAvail, buyFunc, buyBtnTxt, buyFrac, sellFrac)
      }

      $(this.tabID).html(tabTxt)
      $(this.tabID).show()
      $(this.tabID).off().click(tabFunc)
    }
  }

  revertVendorMd () {
    canMove = true

    // hide everything
    $(this.modID).hide()
    $(this.tabID).hide()
    txtmd.revertTxtMd()

    // display world map
    $('#worldMap').show()

    // hero can move
    canMove = true

    // defaults
    this.buying = true
    this.refreshFrunc = null
    this.open = false
  }

  setTextBox (text) { $(this.textBox).html(text) }
}
