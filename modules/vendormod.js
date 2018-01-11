class VendorModule {
    constructor() {
        this.modID = "#vendor-module"
        this.hoverID = "#vendor-hover"
        this.textBox = "#vendor-contents"
        this.exitBtnID = "#vendor-close"
        this.tabID = "#vendor-tab"
        this.buying = true //default start w buy items
        this.refreshFunc = null //used to manually update (ie unequip in inv = avail for sale)
    }

    openModForInvTransfer(buyerInv, sellerInv, sellAvail, buyFunc, buyBtnTxt, buyFrac=1, sellFrac=.8) {
        // buyerInv == the person doing the buying
        // sellerInv == the person doing the selling
        // sellAvail == show tab or not
        // buyFunc == func to execute on buy
        // buyBtnTxt == button text on the item buttons
        // buyFrac == buy things full price
        // sellFrac == sell at discount

        // Show mod
        $(this.modID).show()
        $("#worldMap").hide()
        $(this.exitBtnID).show()
        $(this.exitBtnID).off().click(() => this.revertVendorMd())

        if(this.buying){
            var header = "For Purchase: <br> You've got " + buyerInv.gold + " gold <br>"
            var frac = buyFrac
            var tabTxt = "Sell"
        }
        else{
            var header = "What would you like to sell? <br> I'm willing to spend " + buyerInv.gold + " gold <br>"
            var frac = sellFrac;
            var tabTxt = "Buy"
        }

        // setup the mod_ids and cb's for displaying the inv
        var mod_ids = {"hoverID": this.hoverID, "uniqueID": "vdr"}
        var buy_cbs = {
            "refresh": () => this.openModForInvTransfer(buyerInv, sellerInv, sellAvail, buyFunc, buyBtnTxt, buyFrac, sellFrac),
            "actioncb": (id) => buyFunc(id, buyerInv, sellerInv, frac),
            "actiontxt": (item) => buyBtnTxt(item, frac)
        }

        this.refreshFunc = buy_cbs["refresh"]

        // generate and set html
        var sellObj = sellerInv.generateHTML(mod_ids, buy_cbs)
        this.setTextBox(header + sellObj["innerhtml"]) //set html
        sellObj["setClicks"]() //set click listeners

        // if sellAvail set tab to reverse roles!
        if(sellAvail){
            var self = this
            var tabFunc = function() {
                self.buying = !self.buying
                self.openModForInvTransfer(sellerInv, buyerInv, sellAvail, buyFunc, buyBtnTxt, buyFrac, sellFrac)
            }

            $(this.tabID).html(tabTxt)
            $(this.tabID).show()
            $(this.tabID).off().click(tabFunc)
        }
    }


    revertVendorMd() {
        // hide everything
        $(this.modID).hide()
        $(this.tabID).hide()
        txtmd.revertTxtMd()

        // display world map
        $("#worldMap").show()

        // hero can move
        canMove = true

        // defaults
        this.buying = true
        this.refreshFrunc = null
    }

    setTextBox(text) { $(this.textBox).html(text) }

}
