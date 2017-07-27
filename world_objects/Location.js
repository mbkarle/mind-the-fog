class Location {
    constructor(rowID, colID, name, objid, symbol, message,passable){
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
        this.passable = passable;

        this.computeCoordsWithOffset = function(yoff,xoff){
            this.xCoord = (this.colID * 15) + xoff * 15;
            this.yCoord = (this.rowID * 15) + yoff * 15;
        }
    }
};

class Chest extends Location {
    constructor(rowID, colID, itemList){
        super(rowID, colID,'Treasure Chest', 'treasure', 'v', "A wooden chest. It's locked, but no wood can withstand your blade.",true);
        this.emptied_chest = false; //has the chest been emptied?
        this.treasureIDs = []; //id of treasure Item inside in itemList
        this.size = Math.ceil(Math.random() * 3)
        this.fillChest = function() {
            this.size = Math.ceil(Math.random() * 3)
            for(var i = 0; i < this.size; i++){
                this.treasureIDs.push(Math.floor(itemList.length * Math.random()));
            }
            if(Math.random() > 0.3){
                this.treasureIDs.push(gold);
            }
        }
    }
}

class Trapdoor extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Trapdoor', 'trapdoor','ø',  'A gaping black hole stares at you from the floor of the dungeon... you wonder what is on the other side',true);
    }
}

class Tile extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Tile', "tile", '.', '',true)//style preference? '·' instead??
    }
}

class Statue extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Statue', 'statue', 's', 'A mysterious statue stands impassively in front of you. It clutches a steel blade in its stony fingers which glimmers with a menacing edge.',true);
        this.destroyed_statue = false;
    }
}

class Cave extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Cave', 'cave', 'o', "A small hole in the ground. It's dark inside but it's clear that danger lurks within.", true);
        this.empty = false;
    }
}

class Fountain extends Location {
    constructor(rowID, colID){
        super(rowID, colID, "Fountain", 'fountain', 'f', "A beautiful fountain, flowing with divine grace.", true);
        this.used = false;
    }
}

class Altar extends Location {
    constructor(rowID, colID){
        super(rowID, colID, "Altar", 'altar', 'a', "A blood-stained altar. Sacrifice here might make the gods of death smile upon you.", true);
        this.used = false;
    }
}

class DungeonEntrance extends Location{
    constructor(rowID,colID){
        super(rowID, colID, 'Dungeon Entrance', 'entrance', 'D', 'The entrance to the dungeon stands, forboding and dark.',true);
    }
}

class Wall extends Location{
    constructor(rowID,colID){
        super(rowID,colID, 'Wall', 'wall', '■', 'none shall pass',false)
    }
}

class EmptyTile extends Location{
    constructor(rowID, colID){
        super(rowID, colID, 'Empty Tile', 'empty', '', 'you shouldnt be here...',false)
    }
}

class CharDialogue extends Location{
    constructor(rowID, colID, charId){
        super(rowID, colID, 'Character Dialogue', 'charDialogue', 'C', "", true);
        this.charId = charId;
        var self = this;

        this.dialogue = function(stringArray, thisMessage){
        print("message", "<div style='font-size:12px;position:absolute;top:0;left:10px;'>" + this.charId + "</div>" + stringArray[thisMessage]);
        $("#text-module").show();
        $("#enter").hide();
        $("#open").show();
        $("#open").click(
            function() {
                $("#open").off('click');
                if(thisMessage + 1 < stringArray.length){
                    console.log("next panel");
                    thisMessage++;
                    self.dialogue(stringArray, thisMessage);
                }
                else{
                    console.log("dialogue over");
                    $("#open").hide();
                    $("#enter").show();
                    $("#text-module").hide();
                    print("lastMessage", "enemy-message");
                    canMove = true;
                }
            }
        )
    }}
}

class Door extends Location{ //highly experimental content at hand here
    constructor(rowID, colID, roomID, nextRoomID){
        super(rowID, colID, 'Door', 'door', '–', 'Leave room? Door system is a work in progress', true);
        this.roomID = roomID;
        this.nextRoomID = nextRoomID;
        var self = this;

        this.nextRoom = function() {
            print("message", self.message);
            $("#text-module").show();
            $("#enter").hide();
            $("#open").show();
            $("#open").click(
                function(){
                    $("#open").off('click');
                    $("#open").hide();
                    $("#enter").show();
                    $("#text-module").hide();
                    print("lastMessage", "enemy-message");

                    self.oldRoomID = self.roomID;
                    self.roomID = self.nextRoomID;
                    self.nextRoomID = self.oldRoomID;
                    build_floor(curr_floor, self.roomID);
                    canMove = true;
                }
            )

        }
    }
}

/* in order to improve replayability we need more locations! see list below for ideas:
    merchants/vendors
    wanderers with specific trades (armor for a weapon)
    encampment (chance of combat, chance of recovery and trades)
    loot hoard (lots of loot + chance of combat)
    upgrade station (improve stats on one item)
    etc.
*/
