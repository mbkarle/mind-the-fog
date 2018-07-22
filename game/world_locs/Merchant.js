/*
 * This file should be for the Merchat location
 *
 * Most of the buy/sell logic happens in module/vendormod.js
 */
class Merchant extends Location {
  constructor (rowID, colID, itemList) {
    super(rowID, colID, 'Merchant', 'merchant', 'm', 'Another wanderer has set up shop here, vending his wares – for a price.', false, true)
    this.itemList = itemList

    // Generate an inventory for the merchant
    // See #125 for "The Poor Merchant" description
    this.inv = new Inventory(itemList, 10, 3, 1000) // items, maxItems, minItems, maxGoldSpawn
  }

  heroInteract () {
    var merch = this
    var shopFunc = function () {
      txtmd.revertTxtMd()
      var actioncb = function (id, buyerInv, sellerInv, frac) {
        sellerInv.transferForGold(buyerInv, id, undefined, frac)
      }
      var actiontxt = function (item, frac) {
        return Math.floor(frac * item.value) + ' gold'
      }

      vndmd.openModForInvTransfer(hero.inv, merch.inv, true, actioncb, actiontxt) // true means can sell
    }
    txtmd.parseTxtMdJSON({'msgs': [['dec', merch.message, 'Shop', 'Leave', shopFunc]]})
  }
}
