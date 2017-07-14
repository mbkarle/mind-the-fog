class Location {
    constructor(name, message, objid, symbol, rowID, colID){
        this.name = name;
        this.message = message;
        this.objid = objid;
        this.symbol = symbol;
        this.hero_present = false;
        this.xCoord = colID * 15;
        this.yCoord = rowID * 15;
        this.rowID = rowID;
        this.colID = colID;
        this.fog = true;
        this.opened_chest = false;
        this.treasureID = -1;
    }
    setHero(bool){
        this.hero_present = bool;
        return 1;
    }
};
