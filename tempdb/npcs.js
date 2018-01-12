var NPCS = {
    "alchemist": {
        "charID": "alchemist",
        "charDisplay": "the alchemist",
        "active": false,
        "roomIdx": 1,
        "coords": [3, 15],
        "symbol": "A",
        "description": "A pungent smell wafts towards you from where the alchemist sits, peddling his wares.",
        "merchandise": [],
        "buyFunc": function(id, buyerInv, sellerInv, frac) {
            // Try to buy and transfer (but keepOrig=true)
            if(sellerInv.transfer_for_gold(buyerInv, id, undefined, frac, true)){
                // Consumables are prototyped the first time and
                // thus added to the chests in the dungeon
                var item = sellerInv.get(id)
                if(!item.prototyped){
                    item.prototyped = true;
                    for(var i = 0; i < CONSUMABLES[item.name]["itemlists"].length; i++){
                        itemListMeta[CONSUMABLES[item.name]["itemlists"][i]].push(item);
                    }
                    refillChests();
                }
            }
        },
        "buyBtnTxt": function(item, frac){ return Math.floor(frac * item.value) + " gold" }
    },

    "shieldMaker":{
        "charID": "shieldMaker",
        "charDisplay": "the shield maker",
        "active": false,
        "roomIdx": 1,
        "coords": [3, 6],
        "symbol": "S",
        "description": "The shield maker can improve your shield, for a price.",
        "merchandise": [],
        "buyFunc": function(id, buyerInv, sellerInv, frac) {
            var item = sellerInv.get(id)

            // if already purchased, either equip/unequip ShieldUpgrade
            if(item.purchased){
                if(!item.isEquipped()){ item.equipShield() }
                else{ item.unequipShield() }
            }
            else{
                // if not purchased...
                // pay if you can
                if( buyerInv.pay(sellerInv, Math.floor(frac * item.value), "You can't afford this item!") ){
                    item.purchased = true
                    // if success, equip shield
                    item.equipShield()
                }
            }
        },
        "buyBtnTxt": function(item, frac) {
            if(item.purchased){
                if(item.isEquipped()){ return "Unequip" }
                else{ return "Equip" }
            }
            else { return Math.floor(frac * item.value) + " gold" }
        }
    },

    "dogTrainer":{
        "charID": "dogTrainer",
        "charDisplay": "the dog trainer",
        "active": false,
        "roomIdx": 1,
        "coords": [9, 15],
        "symbol": "T",
        "description": "The dog's plenty loyal. The trainer will put it to work.",
        "merchandise": []
    },

    "blacksmith":{
        "charID": "blacksmith",
        "charDisplay": "the blacksmith",
        "roomIdx": 1,
        "coords": [9, 25],
        "symbol": "B",
        "description": "The blacksmith will fill the dungeon with his finest crafts.",
        "merchandise": [],
        "buyFunc": function(id, buyerInv, sellerInv, frac) {
            var item = sellerInv.get(id)

            // if not unlocked, unlock if u can pay
            if(!item.unlocked ){
                if( buyerInv.pay(sellerInv, Math.floor(frac * item.value), "You can't afford this item!") ){
                    // Add item to all of its protoLists so it will be findable
                    for(var i = 0; i < item.protoLists.length; i++){
                        item.protoLists[i].push(item);
                    }
                    // unlock + refill chests for finding on this run
                    item.unlocked = true
                    refillChests();
                }
            }
        },
        "buyBtnTxt": function(item, frac) {
            if(item.unlocked){ return "Unlocked" }
            else { return Math.floor(frac * item.value) + " gold" }
        }
    },

    "winston":{
        "charID": "winston",
        "charDisplay": "Winston",
        "active": false,
        "roomIdx": 1,
        "coords": [3, 25],
        "symbol": "W",
        "description": "Winston will lend you his powers, for a price.",
        "merchandise": []
    }
}
