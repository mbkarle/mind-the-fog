class VendorMod {
    constructor() {
        this.modID = "#vendor-module"
        this.hoverID = "#vendor-hover"
        this.textBox = "#vendor-contents"
        this.exitBtnID = "#close"
        this.tabID = "#tab"
        this.buying = true //default start w buy items

        // currently the click listeners are set
        $(this.exitBtnID).click(() => this.revertVendorMd())
    }

    openModForInvTransfer(buyerInv, sellerInv, sellAvail, buyFrac=1, sellFrac=.8) {
        // buyerInv == the person doing the buying
        // sellerInv == the person doing the selling
        // sellAvail == show tab or not
        // buyFrac == buy things full price
        // sellFrac == sell at discount

        // Show mod
        $(this.modID).show()
        $("#worldMap").hide()

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
            "refresh": () => this.openModForInvTransfer(buyerInv, sellerInv),
            "actioncb": (id) => {sellerInv.transfer_for_gold(buyerInv, id, undefined, frac);
                    refreshInventoryHTML(hero, heroShield)},
            "actiontxt": (item) => Math.floor(frac * item.value) + " gold"
        }

        // generate and set html
        var sellObj = sellerInv.generateHTML(mod_ids, buy_cbs)
        this.setTextBox(header + sellObj["innerhtml"]) //set html
        sellObj["setClicks"]() //set click listeners

        // if sellAvail set tab to reverse roles!
        if(sellAvail){
            var self = this
            var tabFunc = function() {
                self.buying = !self.buying
                self.openModForInvTransfer(sellerInv, buyerInv, sellAvail, buyFrac, sellFrac)
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
    }

    setTextBox(text) { $(this.textBox).html(text) }

}
