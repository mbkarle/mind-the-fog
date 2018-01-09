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

        if(sourceID === "gold"){
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

        else {
            //First check capacity of target!
            if(target_inv.size() >= target_inv.capacity){
                openAlert("No space in inventory!")
                return -1;
            }

            //Its an indx in this.inv
            if(isNaN(parseInt(sourceID))){
                var item = this.remove(sourceID)
            }
            else{
                var item = this.remove(parseInt(sourceID))
            }
            target_inv.add(item)
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

    generateHTML(mod_ids, mod_cbs) {
        // A function to generate an HTML series of elements with
        // appropriate buttons and click functions

        // distinguish between equipInv and Inv
        if(!Array.isArray(this.inv)){
            var items = Object.values(this.inv)
            // filter null
            items = items.filter(x => x)
        }
        else{ var items = this.inv }

        // Build the item inner html -------------------------
        var invhtml = "" //the string to return
        var itemInfos = [] //the hover infos

        // some shortcuts for legibility
        var unqID = mod_ids["uniqueID"]
        var itemBoxID = unqID + "_invItemBox"
        var cbBtnID = unqID + "_cbBtn"

        for(var i = 0; i < items.length; i++){
            // First store all of the item infos for the hover module
            itemInfos.push(items[i].genHoverInfoHTML())

            //build the html to print to the textBox
            invhtml += "<div class='" + itemBoxID + "' id='" + itemBoxID + i + "'>" +
                items[i].name +
                "<div id='" + cbBtnID + i + "' class='interact'> " + mod_cbs["actiontxt"] + " </div></div>";

        }

        //handle gold and torches seperately
        if(this.gold > 0 && typeof mod_cbs["goldcb"] !== 'undefined'){
            invhtml += "<div class='" + itemBoxID + "' id='" + itemBoxID + i + "'>" +
                "Gold: " + this.gold +
                "<div id='" + unqID + "_GOLDBtn' class='interact'> " + mod_cbs["actiontxt"] + " </div></div>";
            i++;
        }
        if(this.torches > 0 && typeof mod_cbs["torchcb"] !== 'undefined'){
            invhtml += "<div class='" + itemBoxID + "' id='" + itemBoxID + i + "'>" +
                "Torches: " + this.torches +
                "<div id='" + unqID + "_TORCHESBtn' class='interact'> " + mod_cbs["actiontxt"] + " </div></div>";
        }

        // Mouse Listeners--------------------------------------------
        //(need mouse listeners after itemMessage printed)
        var self = this;
        var clickFunc = function(){
            // Deal with the non-gold/torch items first
            for(var i = 0; i < items.length; i++){
                // Set the hover info to print item info
                var item_to_print =  (' ' + itemInfos[i]).slice(1)
                var thisItemBoxID = '#' + itemBoxID + i
                $(thisItemBoxID).attr('item_to_print', item_to_print)
                $(thisItemBoxID).mouseenter(function(){
                    $(mod_ids["hoverID"]).html( $(this).attr('item_to_print') );
                    $(mod_ids["hoverID"]).show();
                })
                $(thisItemBoxID).mouseleave(function(){
                    $(mod_ids["hoverID"]).hide();
                })

                //handle the action buttons
                var thisCbBtnID = '#' + cbBtnID + i;
                if(self.idx_by_type){ // equipInv is idx by type
                    $(thisCbBtnID).attr('item_id', items[i].type)
                }
                else{ $(thisCbBtnID).attr('item_id', i) }

                $(thisCbBtnID).click(
                    function() {
                        //action on this item
                        mod_cbs["actioncb"]($(this).attr('item_id'))
                        //hide hover
                        $(mod_ids["hoverID"]).hide()
                        //redisplay the inventory
                        mod_cbs["refresh"]()
                    });
            }

            // Handle gold + torches seperately
            $("#" + unqID + "_GOLDBtn").click( function() {
                mod_cbs["goldcb"]()
                mod_cbs["refresh"]()
            });
            $("#" + unqID + "_TORCHESBtn").click( function() {
                mod_cbs["torchcb"]()
                mod_cbs["refresh"]()
            });
        }

        return {"innerhtml": invhtml, "setClicks": clickFunc};
    }
}

class EquippedInventory extends Inventory {
    // An inventory that consists of items equipped.
    // Must have multiple capacities and enforce them
    // Key feature: a linked "carried" inventory that feeds this inv
    constructor(owner, carr_inv){
        // The inventory itself, if we ever use for more than hero,
        // may want to take the slots in in constructor

        super([], 3)
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

        // needed for the generateHTML
        this.idx_by_type = true

        //TODO: diff capacities for each slot?
    }

    size() {
        // convert to array
        var arr = Object.values(this.inv)
        // remove null + return size
        return arr.filter(x => x).length
    }

    add() { alert("Add not implemented for EquipInventory, use supporting inv.") }

    remove(slot) {
        // Used for delete function / drop button
        var item = this.inv[slot]
        this.inv[slot] = null
        return item
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
