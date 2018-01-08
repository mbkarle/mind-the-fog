/*
 * This file is for the Inventory object, a wrapper around
 * any grouping of items in the world.
 *
 * See #119 for a detailed overview of this classes creation.
 */

class Inventory {
    constructor(items, capacity, minGenItems, maxGenGold, maxGenTorches){
        // An inventory object is at its barebones just an array
        this.inv = []
        this.gold = 0
        this.torches = 0
        this.torchCapacity = 10
        this.capacity = capacity

        // Generate the inventory upon init.
        if(items.length > 0){
            this.generate(items, minGenItems, maxGenGold, maxGenTorches)
        }
    }

    add(item){ this.inv.push(item) }

    remove(itemIdx){ return this.inv.splice(itemIdx, 1)[0] }

    size() { return this.inv.length }

    transfer_item(target_inv, sourceID){
        // Given index of element in this inv, transfer to target

        if(typeof sourceID === "number"){
            //First check capacity of target!
            if(target_inv.size() >= target_inv.capacity){
                openAlert("No space in inventory!")
                return -1;
            }

            //Its an indx in this.inv
            var item = this.remove(sourceID)
            target_inv.add(item)
        }

        else if(sourceID === "gold"){
            target_inv.gold += this.gold
            this.gold = 0
        }

        else if(sourceID === "torches"){
            target_inv.torches += this.torches
            this.torches = 0

            // Set to capacity if too large
            if(target_inv.torches > target_inv.torchCapacity){
                target_inv.torches = target_inv.torchCapacity
            }
        }
    }

    generate(itemList, minItems, maxGold, maxTorches){
        // Given list of items, generates inventory
        // TODO: maybe make fancier than random? switch-case?

        // First push random items until some fraction of capacity
        var num_items = Math.floor(Math.random() * (this.capacity-minItems+1)) + minItems
        for(var i = 0; i < num_items; i++){
            this.add(itemList[Math.floor(itemList.length * Math.random())])
        }

        // Then, if should have gold, add gold
        if(typeof maxGold === "number"){
            // TODO: make fancier than random for scaling purposes
            this.gold +=  Math.floor(Math.random() * maxGold)
        }

        // If should have torches, add torches
        if(typeof maxTorches === "number"){
            this.torches += Math.floor(Math.random() * maxTorches)
        }
    }

    generateHTML(target_inv, takeID, take_txt) {
        // A function to generate an HTML series of elements with
        // appropriate buttons and click functions
        // @target_inv is the inv the buttons transfer to!

        if(typeof take_txt === "undefined"){
            var take_txt = "Take"
        }

        // Build the item inner html -------------------------
        var items = this.inv
        var header = "You find: <br>"
        var invhtml = header
        var itemInfos = []
        for(var i = 0; i < items.length; i++){
            // First store all of the item infos for the hover module
            itemInfos.push((items[i].name + "<br>"))
            for (attribute in items[i]) {
                if (typeof items[i][attribute] == "number" && attribute != 'value') {
                    if(items[i][attribute] >= 0){
                        itemInfos[i] += attribute + ": +" + items[i][attribute] + "<br>";
                    }
                    else{ //issue #49
                        itemInfos[i] += attribute + ": " + items[i][attribute] + "<br>";
                    }
                }
            }

            // Add aditional info for effect items and consumables
            if(items[i].constructorName == 'effectItem' || items[i].constructorName == 'Consumable'){
                for(var j = 0; j < items[i].buffArray.length; j++){
                    itemInfos[i] += "buffs: " + items[i].buffArray[j].name + "<br>";
                }
                for(var k = 0; k < items[i].debuffArray.length; k++){
                    itemInfos[i] += "debuffs: " + items[i].debuffArray[k].name + "<br>";
                }
            }

            //build the html to print to the textBox
            invhtml += "<div class='itemInfo' id='itemInfo" + i + "'>" +
                items[i].name + "<div id='take" + i + "' class='interact'> " + take_txt + " </div></div>";

        }

        //handle gold and torches seperately
        if(this.gold > 0){
            invhtml += "<div class='itemInfo' id='itemInfo" + i + "'> Gold: " + this.gold +
                "<div id='takeGOLD' class='interact'> " + take_txt + " </div></div>";
        }
        if(this.torches > 0){
            i++;
            invhtml += "<div class='itemInfo' id='itemInfo" + i + "'> Torches: " + this.torches +
                "<div id='takeTORCHES' class='interact'> " + take_txt + " </div></div>";
        }

        // if nothing ever added, add message
        if(invhtml === header){
            invhtml += "Nothing left to take"
        }
        return {"innerhtml": invhtml, "infos": itemInfos};
    }
}

class EquippedInventory {
    // An inventory that consists of items equipped.
    // Must have multiple capacities and enforce them
    // Key feature: a linked "carried" inventory that feeds this inv
    constructor(owner, carr_inv){
        // The inventory itself, if we ever use for more than hero,
        // may want to take the slots in in constructor
        this.inv = {
            "weapon": null,
            "headgear": null,
            "armor": null
        }

        // need to update owners stats in some cases
        this.owner = owner;

        // carry_inv is the linked inventory that feeds this
        // inv. No items should be directly transfered to this.
        this.carry_inv = carr_inv

        //TODO: diff capacities for each slot?
    }

    equip(carr_idx){
        // equips the item at index @carr_idx from supporting carry_inv
        // unequips what is there if null

        // remove and save item
        var item = this.carry_inv.remove(carr_idx)

        // check appropriate slot
        var slot = item.type
        if(this.inv[slot]){
            // if something equipped, unequip
            this.unequip(slot)
        }

        // equip item
        this.inv[slot] = item

        //go through and update owner's stats
        var attribute;
        for (attribute in item) {
            if (typeof item[attribute] == "number") {
                this.owner[attribute] += item[attribute];
            }
        }
        if(this.owner.dexterity <= 0){ //no dividing by 0 !!
            this.owner.dexterity = 0.5;
        }
    }

    unequip(slot){
        // unequips the item at slot @slot and transfers to carry_inv

        // remove and save item
        var item = this.inv[slot]
        this.inv[slot] = null

        //go through and update stats
        var attribute;
        for (attribute in item) {
            if (typeof item[attribute] == "number") {
                this.owner[attribute] -= item[attribute];
            }
        }
        if(this.owner.vitality <= 0){
            this.owner.vitality = 1;
        }

        // add the item to the supporting carry_inv
        this.carry_inv.add(item)
    }
}
