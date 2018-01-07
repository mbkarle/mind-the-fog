/*
 * This file is for the Inventory object, a wrapper around
 * any grouping of items in the world.
 *
 * See #119 for a detailed overview of this classes creation.
 */

class Inventory {
    constructor(items){
        // An inventory object is at its barebones just an array
        this.inv = []
        this.gold = 0
        this.torches = 0
    }

    add(item){ this.inv.push(item) }

    remove(itemIdx){ this.inv.splice(itemIdx, 1) }

    transfer_item(target_inv, sourceID){
        // Given index of element in this inv, transfer to target

        if(typeof sourceID === "number"){
            //Its an indx in this.inv
            this.remove(sourceID)
            target_inv.add(item)
        }

        else if(sourceID === "gold"){
            target_inv.gold += this.gold
            this.gold = 0
        }

        else if(sourceID === "torches"){
            target_inv.torches += this.torches
            this.torches = 0
        }
    }

    generate(itemList, capacity, maxGold, maxTorches){
        // Given list of items, generates inventory
        // TODO: maybe make fancier than random? switch-case?

        // First push random items until capacity
        for(var i = 0; i < capacity; i++){
            this.add(Math.floor(itemList.length * Math.random()))
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
}

class WornInventory extends Inventory {
    // Special subclass that has checks for what can be worn

}
