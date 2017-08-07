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
        this.fogTimeout;
        this.htmlID = '#' + String(this.rowID) + 'x' + String(this.colID)

        this.computeCoordsWithOffset = function(yoff,xoff){
            this.xCoord = (this.colID * 15) + xoff * 15;
            this.yCoord = (this.rowID * 15) + yoff * 15;
        }
    }

    addFogBackAfterTimeout(tier){
        this.fog = false;
        var symbol = this.symbol;
        if(this.hero_present){
            symbol = 'x';
        }
        $(this.htmlID).html(symbol);

        clearTimeout(this.fogTimeout);
        var self = this;
        this.fogTimeout = setTimeout(function(){
            self.fog = true;
            $(self.htmlID).html('');
        }, 20000/(2*(tier+1)))

    }


    removeFogBecauseHeroPresent(){
        this.fog = false;
        var symbol = this.symbol;
        if(this.hero_present){
            symbol = 'x';
        }
        clearTimeout(this.fogTimeout)
        $(this.htmlID).html(symbol);
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
            if(Math.random() > .2){
                this.treasureIDs.push(torch)
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
        super(rowID, colID, 'Door', 'door', '□', 'Leave room?', true);
        this.roomID = roomID;
        this.nextRoomID = nextRoomID;
        var self = this;

        this.nextRoom = function() {
            print("message", self.message);
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();
            document.getElementById('descend').innerHTML = "Leave";
            $("#descend").click(
                function(){
                    revertTextModule();
                    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                    room_list[curr_floor][curr_room].clearAllFogTimeouts();
                    curr_room = self.nextRoomID;
                    // var oldRoomID = self.roomID;
                    // self.roomID = self.nextRoomID;
                    // self.nextRoomID = oldRoomID;
                    if(avatarX == 0){
                        avatarX = room_list[curr_floor][curr_room].room_width - 1;
                        avatarY = room_list[curr_floor][curr_room].room_exit[0];
                    }
                    else{
                        avatarX = 1;
                        avatarY = room_list[curr_floor][curr_room].room_entry[0];
                    }

                    console.log(room_list[curr_floor][curr_room].room_map[avatarY][avatarX]);
                    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                    room_list[curr_floor][curr_room].buildRoomHTML(avatarX, avatarY,fog_radius);
                    canMove = true;
                }
            )
            $("#stay").click(
                function(){
                    revertTextModule();
                }
            )

        }
    }
}

class Merchant extends Location{ // problems with selling: page needs to refresh when items are equipped in the inventory (equipped items shouldn't be sold)
    constructor(rowID, colID, itemList){
        super(rowID, colID, "Merchant", "merchant", "m", "Another wanderer has set up shop here, vending his wares – for a price.", true);
        this.itemList = itemList;
        this.onSale = [];
        this.excludedItems = 0;
        this.pickItems = function(){
            this.num_items = 3 + Math.floor(Math.random() * 6);
            for(var i = 0; i < this.num_items; i++){
                var thisItem = Math.floor(Math.random() * this.itemList.length);
                this.itemList[thisItem].value = Math.floor(Math.random() * 50) * 10;
                this.onSale.push(this.itemList[thisItem])
            }
        }
        this.openModule = function(buying){
            canMove = false;
            var self = this;
            $("#worldMap").hide();
            $("#vendor-module").show();

            if(buying){
                self.excludedItems = 0;
                var itemMessage = "On sale: <br>"
                var itemInfos = []
                for(var i = 0; i < this.onSale.length; i++){
                    itemInfos.push((this.onSale[i].name + "<br>"))
                    for (attribute in this.onSale[i]) {
                        if (typeof this.onSale[i][attribute] == "number") {
                            if(this.onSale[i][attribute] >= 0){
                                itemInfos[i] += attribute + ": +" + this.onSale[i][attribute] + "<br>";
                            }
                            else{ //issue #49
                                itemInfos[i] += attribute + ": " + this.onSale[i][attribute] + "<br>";
                            }
                        }
                    }
                    if(this.onSale[i].constructorName == 'effectItem'){

                        for(var j = 0; j < this.onSale[i].buffArray.length; j++){

                            itemInfos[i] += "buffs: " + this.onSale[i].buffArray[j].name + "<br>";
                        }
                        for(var k = 0; k < this.onSale[i].debuffArray.length; k++){
                            itemInfos[i] += "debuffs: " + this.onSale[i].debuffArray[k].name + "<br>";
                        }
                    }
                    //build the html to print to the textBox

                    itemMessage += "<div class='itemInfo' id='onSale" + i + "' style='border-width:2px;'>" + this.onSale[i].name + "<div id='buy" + i + "' class='interact'>" + this.onSale[i].value + "gold </div></div>";
                }
                document.getElementById("vendor-contents").innerHTML = itemMessage;
                document.getElementById("tab").innerHTML = "Sell";
                this.drop_onSale(self);

                for(var i = 0; i < this.onSale.length; i++){
                    var item_to_print =  (' ' + itemInfos[i]).slice(1)
                    var id = '#onSale'+i;
                    $(id).attr('item_to_print', item_to_print)
                    $(id).mouseenter(function(){
                        document.getElementById("vendor-hover").innerHTML = $(this).attr('item_to_print');
                        $("#vendor-hover").show();
                    })
                    $(id).mouseleave(function(){
                        $("#vendor-hover").hide();
                    })

                }

                $("#tab").click(function(){
                    $("#tab").off('click');
                    self.openModule(false);
                })
            }
            else{
                self.excludedItems = 0;
                var itemMessage = "";
                var itemInfos = [];
                var inventoryForSale = [];

                self.getValueForList(inventory['carried']);
            //    var items_to_print = [];
                for(var i = 0; i < inventory['carried'].length; i++){
                    if(!inventory['carried'][i].equipped){
                        inventoryForSale.push(inventory['carried'][i]);
                    }
                    else{
                        console.log(inventory['carried'][i]);
                        self.excludedItems ++;
                        console.log(self.excludedItems);
                    }
                }
                for(var n = 0; n < inventoryForSale.length; n++){
                        //store all the item infos to be displayed upon hover...
                        itemInfos.push((inventoryForSale[n].name + "<br>"))
                        for (attribute in inventoryForSale[n]) {
                            if (typeof inventoryForSale[n][attribute] == "number") {

                                if(inventoryForSale[n][attribute] >= 0){
                                    itemInfos[n] += attribute + ": +" + inventoryForSale[n][attribute] + "<br>";
                                }
                                else{ // issue #49
                                    itemInfos[n] += attribute + ": " + inventoryForSale[n][attribute] + "<br>";
                                }
                            }
                        }
                        if(inventoryForSale[n].constructorName == 'effectItem'){

                            for(var j = 0; j < inventoryForSale[n].buffArray.length; j++){

                                itemInfos[n] += "buffs: " + inventoryForSale[n].buffArray[j].name + "<br>";
                            }
                            for(var k = 0; k < inventoryForSale[n].debuffArray.length; k++){
                                itemInfos[n] += "debuffs: " + inventoryForSale[n].debuffArray[k].name + "<br>";
                            }
                        }


                        itemMessage += "<div class='itemInfo' id='forSale" + n + "' style='border-width:2px;'>" + inventoryForSale[n].name + "<div id = 'sell" + n + "' class='interact'>" + inventoryForSale[n].value + "gold </div></div>";

                    }

                document.getElementById('vendor-contents').innerHTML = itemMessage;
                document.getElementById('tab').innerHTML = "Buy";
                this.drop_forSale(self);

                for(var i = 0; i < inventoryForSale.length; i++){
                    var item_to_print =  (' ' + itemInfos[i]).slice(1)
                    var id = '#forSale'+i;
                    $(id).attr('item_to_print', item_to_print)
                    $(id).mouseenter(function(){
                        document.getElementById("vendor-hover").innerHTML = $(this).attr('item_to_print');
                        $("#vendor-hover").show();
                    })
                    $(id).mouseleave(function(){
                        $("#vendor-hover").hide();
                    })

                }

                $("#tab").click(function(){
                    $("#tab").off('click');
                    self.openModule(true);
                })
            }
            $("#close").click(function(){
                self.closeModule();
            })
        }

    }
    buyItem(item){
        var successful_transaction = false;
        if(inventory['carried'].length < 10 && hero.wallet >= item.value){
            take_item(item);
            hero.wallet -= item.value;
            successful_transaction = true;
            refreshInfo();
        }
        else if(inventory['carried'].length >= 10){
            alert("Your inventory is full");
        }
        else if(hero.wallet < item.value){
            alert("You can't afford this item");
        }
        return successful_transaction;
    }
    drop_onSale(self){
        for(var i = 0; i < self.onSale.length; i++){
            var buyID = "#buy" + i;
            $(buyID).attr("buy_id", i)
            $(buyID).click(function(){
                console.log('buying item');
                if(self.buyItem(self.onSale[$(this).attr('buy_id')])){
                $(this).hide().off('click');
                self.onSale.splice($(this).attr('buy_id'), 1);
                self.openModule(true); //updates window
            }
            })
        }
    }
    drop_forSale(self){
        for(var i = 0; i < inventory['carried'].length; i++){
            var sellID = "#sell" + i;

            $(sellID).attr("sell_id", (i + self.excludedItems));
            $(sellID).click(function(){
                console.log('selling item');
                hero.wallet += inventory['carried'][$(this).attr('sell_id')].value;
                inventory['carried'].splice($(this).attr('sell_id'), 1);
                $(this).hide().off('click');
                refreshInfo();
                self.openModule(false); //updates window
            })
        }
    }
    closeModule(){
        canMove = true;
        $("#worldMap").show();
        $("#vendor-module").hide();
        revertTextModule();
        refreshInfo();
        $("#close").off('click');
    }
    getValueForList(itemList){
        for(var i = 0; i < itemList.length; i++){
            if(itemList[i].value == null){
                itemList[i].value = Math.floor(Math.random() * 50) * 10;
            }
        }
    }
}
/* in order to improve replayability we need more locations! see list below for ideas:
    various merchants/vendors
    wanderers with specific trades (armor for a weapon)
    encampment (chance of combat, chance of recovery and trades)
    loot hoard (lots of loot + chance of combat)
    upgrade station (improve stats on one item)
    etc.
*/
