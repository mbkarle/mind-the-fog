class Location {
    constructor(rowID, colID, name, objid, symbol, message){
        this.name = name; //name of the Location
        this.message = message; //message displayed on print()
        this.objid = objid; //object id
        this.symbol = symbol; //symbol to display on map
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
        super(rowID, colID,'Treasure Chest', 'treasure', 'v', "A wooden chest. It's locked, but no wood can withstand your blade.");
        this.emptied_chest = false; //has the chest been emptied?
        this.treasureID = -1; //id of treasure Item inside in itemList
    }
}

class Trapdoor extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Trapdoor', 'trapdoor','ø',  'A gaping black hole stares at you from the floor of the dungeon... you wonder what is on the other side');
    }
}

class Tile extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Tile', "tile", '.', '')//style preference? '·' instead??
    }
}

class Statue extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Statue', 'statue', 's', 'A mysterious statue stands impassively in front of you. It clutches a steel blade in its stony fingers which glimmers with a menacing edge.');
        this.destroyed_statue = false;
    }
}

class DungeonEntrance extends Location{
    constructor(rowID,colID){
        super(rowID, colID, 'Dungeon Entrance', 'entrance', 'D', 'The entrance to the dungeon stands, forboding and dark.');
    }
}
