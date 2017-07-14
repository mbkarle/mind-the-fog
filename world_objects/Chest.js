class Chest extends Location {
    constructor(name, message, objid, symbol, rowID, colID){
        super(name, message, objid, symbol, rowID, colID)
        this.emptied_chest = false; //has the chest been emptied?
        this.treasureID = -1; //id of treasure Item inside in itemList
    }


}
