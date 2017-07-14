class Location {
    constructor(rowID, colID){
        //DECIDED ALL THESE SHOULD BE FILE SPECIFIC!
        // this.name = name; //name of the Location
        // this.message = message; //message displayed on print()
        // this.objid = objid; //object id
        // this.symbol = symbol; //symbol to display on map
        this.hero_present = false; //whether or not the hero is on this Location
        this.xCoord = colID * 15; //pixel coords
        this.yCoord = rowID * 15;
        this.rowID = rowID; //row index in world_map
        this.colID = colID; //col index in world_map
        this.fog = true; //whether or not fog is present
    }
};

class Chest extends Location {
    constructor(rowID, colID){
        super(rowID, colID);
        this.name = 'Treasure Chest'; //name of the Location
        this.message = "A wooden chest. It's locked, but no wood can withstand your blade."; //message displayed on print()
        this.objid = 'treasure'; //object id
        this.symbol = 'v'; //symbol to display on map
        this.emptied_chest = false; //has the chest been emptied?
        this.treasureID = -1; //id of treasure Item inside in itemList
    }
}

class Trapdoor extends Location {
    constructor(rowID, colID){
        super(rowID, colID);
        this.name = 'Trapdoor';
        this.message = 'A gaping black hole stares at you from the floor of the dungeon... you wonder what is on the other side';
        this.objid = 'trapdoor'
        this.symbol = 'ø'
    }
}

class Tile extends Location {
    constructor(rowID, colID){
        super(rowID, colID)
        this.name = "Tile"
        this.message = ""
        this.objid = "tile"
        this.symbol = '.' //style preference? '·' instead??
    }
}
