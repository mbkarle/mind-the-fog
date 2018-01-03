/*
 * This file is for the Chest location.
 */

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
        //console.log(items);
        // console.log(items.length)
        var itemsTaken = 0;
        var chest = this;
        for(var i = 0; i < items.length; i++){
            var takeID = '#take'+i;
            var item = $().extend({}, items[i]);
            $(takeID).attr('item_id', i)
            $(takeID).click(
                function() {
                    if(hero.inventory['carried'].length < 10 || items[$(this).attr('item_id')].constructorName == "Currency" || items[$(this).attr('item_id')].constructorName == "Torch"){
                        itemsTaken ++;
                        if(itemsTaken == items.length){
                            chest.emptied_chest = true;
                        }
                        var item_to_take = items[$(this).attr('item_id')];
                        item_to_take.ogIdx = items[$(this).attr('item_id')].getOgIdx(room_list[curr_floor][curr_room]);
                        // equip(hero, item_to_take);
                        if(item_to_take.constructorName != 'Consumable'){
                            take_item($().extend({},item_to_take), chest)
                        }
                        else{
                          var temp = new Consumable(item_to_take.name, 'lul');
                          temp.ogIdx = item_to_take.ogIdx;
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

