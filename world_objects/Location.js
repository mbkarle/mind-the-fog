class Location {
    constructor(rowID, colID, name, objid, symbol, message,passable, interactable){
        this.name = name; //name of the Location
        this.message = message; //message displayed on print()
        this.objid = objid; //object id
        this.symbol = symbol; //symbol to display on map
        this.hero_present = false; //whether or not the hero is on this Location
        this.dog_present = false; //whether the dog is on this spot
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
        if(typeof interactable != 'undefined'){
            this.is_interactive = interactable;
        }
        else{
            this.is_interactive = false;
        }
    }

    getSymbol(){
        if(this.fog){
            return '';
        }
        else if(this.hero_present){
            return 'x';
        }
        else if(this.dog_present){
            return 'd';
        }
        else{
            return this.symbol;
        }
    }

    refreshInnerHTML(){
        var symbol = this.getSymbol();
        $(this.htmlID).html(symbol);
    }

//Originally implemented for the original dog implementation, not currently used.
//Possibly useful if moving locations ever become a thing. (They shouldn't, its hell)
/*    updateRowColIDsAndDerivedProperties(newColID, newRowID, room){
        //if room is passed in, then the room has changed (due to a spawn). In this case
        //we know the yoff and xoff and can use that offset.
        if(typeof room != 'undefined'){
            //update row/colIDs
            this.rowID = newRowID;
            this.colID = newColID;

            this.computeCoordsWithOffset(room.yoff, room.xoff)
        }

        else{
            //if its not passed in, we can simply increment / decrement the appropriate coords by delta(id)
            var oldRowID = this.rowID;
            var oldColID = this.colID;

            //update row/colIDs
            this.rowID = newRowID;
            this.colID = newColID;

            var deltaRowID = oldRowID - newRowID;
            var deltaColID = oldColID - newColID;

            //use deltas to update the xCoord and yCoord properties
            //the offset hasn't changed since last room build SO,
            //simply use the deltas to modify the current coords
            this.xCoord = this.xCoord - deltaColID * 15;
            this.yCoord = this.yCoord - deltaRowID * 15;
        }

        //A function to call for moving Locations (currently only dog)
        this.htmlID = '#' + String(this.rowID) + 'x' + String(this.colID);
    }
    */

    addFogBackAfterTimeout(tier){
        this.fog = false;
        var symbol = this.getSymbol();
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
        var symbol = this.getSymbol();
        clearTimeout(this.fogTimeout)
        $(this.htmlID).html(symbol);
    }
};

class Chest extends Location {
    constructor(rowID, colID, itemList){
        super(rowID, colID,'Treasure Chest', 'treasure', 'v', "A wooden chest. It's locked, but no wood can withstand your blade.",false, true);
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
    hero_interact(){
        if(!this.emptied_chest){
            $("#text-module").show();
            $("#enter").hide();
            $("#open").show();
            canMove = false;
            print("message", this.message);
            this.message = "the chest lays smashed by your blade, its treasures still there."
            this.openChest(true);
        }
    }

    openChest(stage) {
        var treasureIDs = this.treasureIDs;
        var chest = this;
        $("#open").click(

            function() {
                gold.amount = Math.floor(Math.random() * 50) * 10;
                torch.torch_count = Math.ceil(Math.random() * 3);

                // console.log(this.treasureIDs)
                if (stage) {
                    var items_in_chest = []
                    for(var i = 0; i < treasureIDs.length; i++){
                        if(typeof treasureIDs[i] == 'number'){
                        items_in_chest.push(room_list[curr_floor][curr_room].itemList[treasureIDs[i]])
                    } else {
                        items_in_chest.push(treasureIDs[i]);
                    }
                    }

                    print('item', items_in_chest) //handles HTML
                    chest.chest_drop_items(items_in_chest) //handles take clicks, etc
                    stage = !stage;

                } else {
                    for(var i = 0; i < treasureIDs.length; i++){
                        var takeID = "#take"+i
                        $(takeID).hide();
                        $(takeID).off("click")
                    }
                    $("#open").hide();
                    $("#open").off("click")
                    $("#enter").show();
                    $("#text-module").hide();
                    canMove = true;
                    print("lastMessage", "enemy-message");
                    return;
                }
            });
    }


    chest_drop_items(items){
        // console.log(items)
        // console.log(items.length)
        var itemsTaken = 0;
        var chest = this;
        for(var i = 0; i < items.length; i++){
            var takeID = '#take'+i;
            var item = $().extend({}, items[i])
            $(takeID).attr('item_id', i)
            $(takeID).click(
                function() {
                    if(inventory['carried'].length < 10 || items[$(this).attr('item_id')].constructorName == "Currency" || items[$(this).attr('item_id')].constructorName == "Torch"){
                        itemsTaken ++;
                        if(itemsTaken == items.length){
                            chest.emptied_chest = true;
                        }
                        var item_to_take = items[$(this).attr('item_id')];
                        // equip(hero, item_to_take);
                        if(item_to_take.constructorName != 'Consumable'){
                            take_item($().extend({},item_to_take), chest)
                        }
                        else{
                          var temp = new Consumable(item_to_take.name, 'lul');
                          take_item(temp, chest);
                        }

                        $(this).hide();
                    }
                    else {
                        openAlert("Your inventory is full");
                    }
                }
            )
        }
    }
}

class Trapdoor extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Trapdoor', 'trapdoor','ø',  'A gaping black hole stares at you from the floor of the dungeon... you wonder what is on the other side',true, true);
    }
    hero_interact(){
        $("#text-module").show();
        $("#enter").hide();
        $("#stay").show();

        canMove = false;
        print("message", this.message);

        $("#descend").show();
        $("#descend").click(
            function() {
                console.log("Enter new floor")
                descend(true)
            }
        );
        $("#stay").click(
            function() {
                console.log("Stay on this floor")
                descend(false)
            }
        )
    }
}

class Tile extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Tile', "tile", '.', '',true, true)//style preference? '·' instead??
    }
    hero_interact(){
        //You can interact with a tile if the dog is present!
        //Note that this should be the only way to interact with the dog--dog should
        //only move on tiles
        if(this.dog_present){
            doge.hero_interact()
        }
    }
}

class Statue extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Statue', 'statue', 's', 'A mysterious statue stands impassively in front of you. It clutches a steel blade in its stony fingers which glimmers with a menacing edge.',false, true);
        this.destroyed_statue = false;
    }
    hero_interact(){
        if(!this.destroyed_statue){
            $("#text-module").show();
            $("#enter").hide();
            //using descend buttons for position and convenience
            $("#descend").show();
            $("#stay").show();

            canMove = false;
            var msg = print("message", this.message);
            $("#descend").html('Take Sword');
            $("#stay").html("Leave");
            var statue = this;
            $("#descend").click(
                function() {
                    revertTextModule();
                    canMove = false;
                    print("message", "The statue springs to life and raises its sword. There's no escape!");
                    $("#text-module").show();
                    enter_combat(room_list[curr_floor][curr_room], Golem);
                    statue.destroyed_statue = true;
                }
            )
            $("#stay").click(
                function() {
                    revertTextModule();
                }
            )
        }
    }
}

class Cave extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Cave', 'cave', 'o', "A small hole in the ground. It's dark inside but it's clear that danger lurks within.", true, true);
        this.empty = false;
    }
    hero_interact(){
        if(!this.empty){
            canMove = false;
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();

            var msg = print("message", this.message);
            $("#descend").html("Enter");
            var cave = this;
            $("#descend").click(
                function(){
                    revertTextModule();
                    canMove = false;
                    print("message", "The occupant of the cave awakes. A massive frost giant looms before you!");
                    $("#text-module").show();
                    enter_combat(room_list[curr_floor][curr_room], frostGiant);
                    cave.empty = true;
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

class Fountain extends Location {
    constructor(rowID, colID){
        super(rowID, colID, "Fountain", 'fountain', 'f', "A beautiful fountain, flowing with divine grace.", false, true);
        this.used = false;
    }
    hero_interact(){
        if(!this.used){
            canMove = false;
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();

            var msg = print("message", this.message);
            $("#descend").html("Use");
            $("#stay").html("Leave");
            var fountain = this;
            $("#descend").click(
                function(){
                    revertTextModule();
                    if(Math.random() <= .5){
                        hero.maxVitality += 5;
                        hero.vitality = hero.maxVitality;
                        refreshInfo();
                        print("message", "The gods have smiled upon you. Your vitality is improved.");
                        $("#text-module").show();
                        $("#enter").hide();
                        $("#open").show().click(function(){
                            $("#open").off('click');
                            $("#open").hide();
                            revertTextModule();
                        })
                    }
                    else{
                        print("message", "The gods do not hear your prayers. Nothing happens.");
                        $("#text-module").show();
                        $("#enter").hide();
                        $("#open").show().click(function(){
                            $("#open").off('click').hide();

                            revertTextModule();
                        })
                    }
                fountain.used = true;
                }
            )
        $("#stay").click(function(){
            revertTextModule();
        })
        }
    }
}

class Altar extends Location {
    constructor(rowID, colID){
        super(rowID, colID, "Altar", 'altar', 'a', "A blood-stained altar. Sacrifice here might make the gods of death smile upon you.", false, true);
        this.used = false;
    }
    hero_interact(){
        if(!this.used){
            canMove = false;
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();

            var msg = print("message", this.message);
            $("#descend").html('Use');
            $("#stay").html('Leave');
            var altar = this;
            $("#descend").click(
                function(){
                    revertTextModule();
                    hero.maxVitality -= 5;
                    hero.vitality -= 5;
                    if(hero.vitality <= 0){
                        hero.vitality = 1;
                    }
                    var statToImprove = Math.random();
                    if(statToImprove <= .5){
                        hero.strength += Math.ceil(Math.random() * 2);
                        statToImprove = "strength";
                    }
                    else{
                        hero.dexterity += Math.ceil(Math.random() * 2);
                        statToImprove = "dexterity";
                    }
                    print("message", "The gods of death accept your blood sacrifice. Your " + statToImprove + " has improved.");
                    refreshInfo();
                    $("#text-module").show();
                    $("#enter").hide();
                    $("#open").show().click(function(){
                        $("#open").off('click');
                        $("#open").hide();
                        revertTextModule();
                        })

                altar.used = true;
                }
            )

        $("#stay").click(function(){
            revertTextModule();
        })
        }
    }
}

class DungeonEntrance extends Location{
    constructor(rowID,colID){
        super(rowID, colID, 'Dungeon Entrance', 'entrance', 'D', 'The entrance to the dungeon stands, forboding and dark.',false, true);
    }
    hero_interact(){
        $("#text-module").show();
        $("#enter").hide();
        $("#stay").show();

        canMove = false;
        print("message", this.message);

        $("#descend").show();
        $("#descend").click(
            function() {
                console.log("Enter new floor")
                descend(true)
            }
        );
        $("#stay").click(
            function() {
                console.log("Stay on this floor")
                descend(false)
            }
        )
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
    constructor(rowID, colID, charId, charDisplay){
        super(rowID, colID, 'Character Dialogue', 'charDialogue', 'C', "", false, true);
        this.charId = charId;
        this.charDisplay = charDisplay;
        var self = this;

        this.dialogue = function(stringArray, thisMessage){
        print("message", "<div style='font-size:12px;position:absolute;top:0;left:10px;'>" + this.charDisplay + "</div>" + stringArray[thisMessage]);
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
        }
    }
    hero_interact(){
        canMove = false;
        this.dialogue(dialogues[this.charId], 0);
    }

}

class Pit extends Location{
    constructor(rowID, colID, charID, charDisplay){
        super(rowID, colID, "Pit", 'pit', 'p', 'A pitfall, once covered with crumbled stone. Someone appears trapped within.', true, true)
        this.charID = charID;
        this.charDisplay = charDisplay;
        this.empty = false;
        var self = this;
        this.encounter = function(){
            print('message', this.message);
            canMove = false;
            $("#text-module").show();
            $("#enter").hide();
            $("#stay").show().html('Leave').click(function(){
                revertTextModule();
            })
            $("#descend").show().html('Rescue').click(function(){
                if(Math.random() < .4){
                    self.message = 'You descend carefully and reach the bottom unscathed.';
                }
                else{
                    self.message = 'You make it to the bottom, slightly worse for wear.';
                    hero.vitality -= 10;
                    refreshInfo();
                }
                print('message', self.message);
                $("#descend").off('click').hide();
                $("#stay").off('click').hide();
                $("#open").show().click(function(){
                    $("#open").off('click').hide();
                    self.used = true;
                    dialogues['trapped'][self.charID].push("Together you climb out. The gatekeeper will take care of " +  self.charDisplay + " from here.");
                    self.interact(self, dialogues['trapped'][self.charID], 0);
                })
            })
        }
    }
    hero_interact(){
        if(!this.used){
            this.encounter();
        }
    }
    interact(self, stringArray, thisMessage){
        if(thisMessage == 0 || thisMessage == stringArray.length - 1){
            print('message', stringArray[thisMessage]);
        }
        else{
        print("message", "<div style='font-size:12px;position:absolute;top:0;left:10px;'>" + self.charDisplay + "</div>" + stringArray[thisMessage]);
    }
      NPCList[self.charID]['active'] = true;
        $("#open").show();
        $("#open").click(
            function() {
                $("#open").off('click');
                if(thisMessage + 1 < stringArray.length){
                    console.log("next panel");
                    thisMessage++;
                    self.interact(self, stringArray, thisMessage);
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
    }
}

class NPC extends Location {
    constructor(rowID, colID, name){
        super(rowID, colID, name, 'npc', NPCList[name]['symbol'], NPCList[name]['description'], false, true);
        this.onSale = NPCList[name]['merchandise'];
        var self = this;
        this.interact = function(){
          canMove = false;
          print('message', this.message);
          $('#text-module').show();
          $('#enter').hide();
          $('#open').show().click(function(){
            self.openNPCModule(self);
            $('#open').hide().off('click');
            $('#text-module').animate({
              top: '175px'
            })
          })
        }
    }
    hero_interact(){
        if(this.onSale.length > 0){
            this.interact();
        }
    }
    openNPCModule(self){
      $('#worldMap').hide();
      $("#vendor-module").show();
      $("#tab").hide();
      var itemMessage = "On sale: <br>";
      var itemInfos = [];
      for(var i = 0; i < self.onSale.length; i++){
        itemInfos.push((self.onSale[i].name + "<br>"))
        for (attribute in self.onSale[i]) {
            if (typeof self.onSale[i][attribute] == "number" && attribute != 'value') {
                if(self.onSale[i].constructorName != 'ShieldUpgrade'){
                    if(self.onSale[i][attribute] >= 0){
                        itemInfos[i] += attribute + ": +" + self.onSale[i][attribute] + "<br>";
                    }
                    else{ //issue #49
                        itemInfos[i] += attribute + ": " + self.onSale[i][attribute] + "<br>";
                    }
                }
                else{
                    itemInfos[i] += attribute + ": " + self.onSale[i][attribute] + "<br>";
                }
            }
        }
        if(self.onSale[i].constructorName == 'effectItem'){

            for(var j = 0; j < self.onSale[i].buffArray.length; j++){

                itemInfos[i] += "buffs: " + self.onSale[i].buffArray[j].name + "<br>";
            }
            for(var k = 0; k < self.onSale[i].debuffArray.length; k++){
                itemInfos[i] += "debuffs: " + self.onSale[i].debuffArray[k].name + "<br>";
            }
        }
        if(self.onSale[i].constructorName == 'Consumable'){

            for(var j = 0; j < self.onSale[i].buffArray.length; j++){

                itemInfos[i] += "buffs: " + self.onSale[i].buffArray[j]['buff'].name + "<br>";
            }
            for(var k = 0; k < self.onSale[i].debuffArray.length; k++){
                itemInfos[i] += "debuffs: " + self.onSale[i].debuffArray[k]['debuff'].name + "<br>";
            }
        }

        itemMessage += "<div class='itemInfo' id='onSale" + i + "' style='border-width:2px;'>" + self.onSale[i].name + "<div id='buy" + i + "' class='interact'>" +  "</div></div>";
      }
      $('#vendor-contents').html(itemMessage);
      self.onSale[0].drop_onSale(self);

      for(var i = 0; i < self.onSale.length; i++){
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
      $("#close").click(function(){
          self.closeModule();
      })
    }

    closeModule(){
        $("#tab").show();
        canMove = true;
        $("#worldMap").show();
        $("#vendor-module").hide();
        revertTextModule();
        refreshInfo();
        $("#close").off('click');
    }
}

class Door extends Location{ //highly experimental content at hand here
    constructor(rowID, colID, roomID, nextRoomID){
        super(rowID, colID, 'Door', 'door', '□', 'Leave room?', true, true);
        this.roomID = roomID;
        this.nextRoomID = nextRoomID;
        var self = this;

        this.nextRoom = function() {
            print("message", self.message);
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();
            $('#descend').html("Leave");
            $("#descend").click(
                function(){
                    revertTextModule();
                    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                    room_list[curr_floor][curr_room].clearAllFogTimeouts();
                    var old_map = room_list[curr_floor][curr_room].room_map;
                    curr_room = self.nextRoomID;
                    // var oldRoomID = self.roomID;
                    // self.roomID = self.nextRoomID;
                    // self.nextRoomID = oldRoomID;
                    if(avatarX == 0){
                        avatarX = room_list[curr_floor][curr_room].room_width - 2;
                        avatarY = room_list[curr_floor][curr_room].room_exit[0];
                        update_loc_facing(last_key_press);
                    }
                    else{
                        avatarX = 2;
                        avatarY = room_list[curr_floor][curr_room].room_entry[0];
                        update_loc_facing(last_key_press);
                    }

                    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                    room_list[curr_floor][curr_room].buildRoomHTML(avatarX, avatarY,torchlight, fog_radius);
                    doge.spawn_dog(avatarX, avatarY, old_map, room_list[curr_floor][curr_room])

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
    hero_interact(){
        canMove = false;
        this.nextRoom();
    }
}

class LockedDoor extends Location{
    constructor(rowID, colID){
        super(rowID, colID, "Locked Door", 'lockedDoor', '□', "It appears to be the way out of here, but it's locked. If only you had a key...", true, true);
        this.interact = function(){
            print('message', this.message);
            $("#text-module").show();
            $("#enter").hide();
            $("#open").show().click(function(){
                revertTextModule();
                $("#open").hide().off('click');
            })
        }
    }
    hero_interact(){
        canMove = false;
        this.interact();
    }
}

class Merchant extends Location{ // problems with selling: page needs to refresh when items are equipped in the inventory (equipped items shouldn't be sold)
    constructor(rowID, colID, itemList){
        super(rowID, colID, "Merchant", "merchant", "m", "Another wanderer has set up shop here, vending his wares – for a price.", false, true);
        this.itemList = itemList;
        this.onSale = [];
        this.excludedItems = 0;
        this.pickItems = function(){
            this.num_items = 3 + Math.floor(Math.random() * 6);
            for(var i = 0; i < this.num_items; i++){
                var thisItem = Math.floor(Math.random() * this.itemList.length);
                var itemListfor_idx = this.itemList[thisItem].items[0];
                this.itemList[thisItem].value = Math.floor(Math.random() * 10 * (itemListMeta.indexOf(itemListfor_idx) + 1)) * 10;
            //    console.log(itemListMeta.indexOf[this.itemList[thisItem].items[0]]);
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


                        itemMessage += "<div class='itemInfo' id='forSale" + n + "' style='border-width:2px;'>" + inventoryForSale[n].name + "<div id = 'sell" + n + "' class='interact'>" + Math.floor(inventoryForSale[n].value / 4) + "gold </div></div>";

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
    hero_interact(){
        canMove = false;
        $("#text-module").show();
        $("#enter").hide();
        $("#descend").show();
        $("#stay").show();

        var msg = print("message", this.message);
        $("#descend").html("Shop");
        $("#stay").html('Leave');
        var merch = this;
        $("#descend").click(function(){
            revertTextModule();
            merch.openModule(true);
        })
        $("#stay").click(function(){
            revertTextModule();
        })
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
            openAlert("Your inventory is full");
        }
        else if(hero.wallet < item.value){
            openAlert("You can't afford this item");
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
                hero.wallet += Math.floor(inventory['carried'][$(this).attr('sell_id')].value / 4);
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
                itemList[i].value = Math.floor(Math.random() * 10 * itemListMeta.indexOf(itemList[i].items[0])) * 10;
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
