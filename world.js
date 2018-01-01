/* 
 * This file holds all functions for world interaction
 * (movement, descent)
 */


function update_loc_facing(key_press){
    switch (key_press) {
        case 'w':
            loc_facing = [avatarX, avatarY-1];
            break;
        case 's':
            loc_facing = [avatarX, avatarY+1];
            break;
        case 'a':
            loc_facing = [avatarX-1, avatarY];
            break;

        case 'd':
            loc_facing = [avatarX+1, avatarY];
            break;

        default:
            console.log('unknown update_loc_facing');

    }
}

function move(e) {
    if (canMove == true) {
        var didMove = false;
        var activatedTorch = false;
        var oldPos = [avatarX,avatarY]
        if (e.keyCode == "87" && avatarY > 0) { //up
            last_key_press = 'w';
            if(room_list[curr_floor][curr_room].room_map[avatarY-1][avatarX].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarY --;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "83" && avatarY < room_list[curr_floor][curr_room].room_height-1) { //down
            last_key_press = 's';
            if(room_list[curr_floor][curr_room].room_map[avatarY+1][avatarX].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarY ++;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "65" && avatarX > 0) { //left
            last_key_press = 'a';
            if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX-1].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarX --;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "68" && avatarX < room_list[curr_floor][curr_room].room_width-1) { //right
            last_key_press = 'd';
            if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX+1].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarX ++;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "66") {
            console.log("Dev tools activated");
            console.log("So...., you're either a developer, or a cheater, or just lazy...")
            equip(hero, MasterSword); //give absurd weapons
            take_item(MasterSword)
            hero.vitality = 100000; //set absurd health stats
            hero.maxVitality = 100000;

            clearAllFog(room_list[curr_floor][curr_room].room_map)
            room_list[curr_floor][curr_room].clearAllFogTimeouts();
            room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight,fog_radius);
        } else if (e.keyCode == "84"){ //t for torch
            if(hero.num_torches > 0){
                if(!torchlight){
                    console.log("Activating torch")
                    hero.num_torches--;
                    activatedTorch = true;
                    refreshInfo();
                    torchlight = true;
                    setTimeout(function(){
                        torchlight = false;
                        // if(!room_list[curr_floor][curr_room].roomCleared){
                        if(!room_list[curr_floor][curr_room].fog_free_room){
                            room_list[curr_floor][curr_room].addFogWhenTorchBurnsOut(avatarX,avatarY,fog_radius);
                            var newPos = [avatarX,avatarY];
                            room_list[curr_floor][curr_room].updateRoomHTML(newPos,newPos,torchlight,fog_radius);
                        }
                        console.log("Your torch fades to nothing."
                    )}, 10000)
                }
                else{
                    console.log("You can't turn off a torch, silly!")
                }
            }
            else{
                console.log("No torches to use!")
            }
        } else if(e.keyCode == '189'){
            //'-' removes monsters!
            //for debugging only
            openAlert("****removing monsters from the game!****")
            for(var i = 0; i < room_list.length; i++){
                for(var j = 0; j < room_list[i].length; j++){
                    room_list[i][j].fightChance = 0;
                }
            }

        }
        else if(e.keyCode == '187'){
            //'-' removes monsters!
            //for debugging only
            openAlert("****clearing floor!****")
            room_list[curr_floor][curr_room].roomCleared = true;
            var newPos = [avatarX,avatarY];
            room_list[curr_floor][curr_room].updateRoomHTML(newPos,newPos,torchlight,fog_radius);

        }
        else if(e.keyCode == '69'){
            //e for interact (#81 issues)
            //do a checkLocation with the loc_facing
            checkLocation(loc_facing[0], loc_facing[1])
        }
        update_loc_facing(last_key_press);

        if(didMove){
            doge.hero_move_update_dog(last_key_press,avatarX, avatarY, room_list[curr_floor][curr_room].room_map);
        }

        if(didMove || activatedTorch){
            var newPos = [avatarX,avatarY];
            room_list[curr_floor][curr_room].updateRoomHTML(oldPos,newPos,torchlight,fog_radius);
        }

        //chance to enter combat
        if (Math.random() < room_list[curr_floor][curr_room].fightChance  && !room_list[curr_floor][curr_room].roomCleared && didMove) {
            enter_combat(room_list[curr_floor][curr_room])

        }

        if(hero.vitality + 2 <= hero.maxVitality && didMove) {
            hero.vitality += 2;
            refreshInfo();
        } else if(hero.vitality + 1 <= hero.maxVitality && didMove){
          hero.vitality += 1;
          refreshInfo();
        }

        if(didMove){
            checkLocation(avatarX, avatarY);
        }
    }
    //keypresses outside of canMove
    if (e.keyCode == 73){
        $("#info-module").toggle(100);
        refreshInfo();
    }
    else if(e.keyCode == 77){
        $("#tree-module").toggle(100);
        refreshInfo();
    }
    if(fog_radius == 1 && fogDeath == -1){
      fogDeath = setInterval(function(){
         if(fog_radius == 1 && hero.vitality > 0){
             Damage({strength: 5}, hero);
         }
         else if(hero.vitality <= 0){
             clearInterval(fogDeath);
             fogDeath = -1;
         }
         else{
             clearInterval(fogDeath);
             fogDeath = -1;
         }
         }, 1000);
    }
}

function checkLocation(avX, avY){
    //If whatever you try to interact with is interactive, call its interact function
    if(room_list[curr_floor][curr_room].room_map[avY][avX].is_interactive){
        room_list[curr_floor][curr_room].room_map[avY][avX].hero_interact();
    }

}

function descend(descend){
    if(descend){
        $("#descend").off("click")
        $("#stay").off("click")
        $("#stay").hide();
        $("#enter").hide();
        $("#enter").show();
        $("#text-module").hide();
        $("#descend").hide();
        canMove = true;
        print("lastMessage", "enemy-message");

        //rebuild the floor and make the new map!
        if(curr_floor < num_floors - 1){

            if(curr_floor > 0){
            for(i = 0; i < room_list[curr_floor][curr_room].enemy_list.length; i++){ //scale recurring enemies
                room_list[curr_floor][curr_room].enemy_list[i].maxVitality += 5;
                room_list[curr_floor][curr_room].enemy_list[i].vitality = room_list[curr_floor][curr_room].enemy_list[i].maxVitality;
                room_list[curr_floor][curr_room].enemy_list[i].strength += 1;

            }}
            room_list[curr_floor][curr_room].clearAllFogTimeouts();
            oldmap = room_list[curr_floor][curr_room].room_map;
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
            curr_floor++;
            curr_room = 0;
            avatarY = room_list[curr_floor][curr_room].room_entry[0];
            avatarX = room_list[curr_floor][curr_room].room_entry[1];
            update_loc_facing(last_key_press);
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;

            /*var gatekeep = new CharDialogue(room_list[curr_floor][curr_room].room_entry[0], room_list[curr_floor][curr_room].room_entry[1], 'gatekeeper' + curr_floor, 'the gatekeeper');
            room_list[curr_floor][curr_room].room_map[gatekeep.rowID][gatekeep.colID] = gatekeep;
            room_list[curr_floor][curr_room].room_map[gatekeep.rowID][gatekeep.colID].computeCoordsWithOffset(room_list[curr_floor][curr_room].yoff, room_list[curr_floor][curr_room].xoff);
            checkLocation(); */

            room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight, fog_radius);
            doge.spawn_dog(avatarX, avatarY, oldmap, room_list[curr_floor][curr_room])


            // combat(hero, "default");
            heroShield.vitality = heroShield.maxVitality;
            refreshInfo();
        }
    }
    else{
        $("#descend").off("click")
        $("#stay").off("click")
        $("#stay").hide();
        $("#enter").hide();
        $("#enter").show();
        $("#text-module").hide();
        $("#descend").hide();
        canMove = true;
        print("lastMessage", "enemy-message");
    }
}

function refillChests(){ 
    //rebuilds floors so that chests can be filled with newly introduced materials
    //used after interaction w certain npcs
    console.log('Old room 1: ')
    console.log(room_list[1][0]);
    for(var i = 1; i < room_list.length; i++){
        room_list[i] = room_list[i][0].origin_floor.build_floor();
    }
    console.log('new room 1: ')
    console.log(room_list[1][0]);
}

function take_item(item, chest_to_take_from){
    if(item.constructorName == 'Currency'){
        item.walletCheck();
        equip(hero, item);
        item.wallet = null;
    }
    else if(item.constructorName == "Torch"){
        hero.num_torches += item.torch_count;
        if(hero.num_torches > 10){
            hero.num_torches = 10;
        }
    }
    else{
        hero.inventory.carried.push(item)
    }
    refreshInfo();

    // if taking from a chest (not prompt/monster)
    if(typeof chest_to_take_from != 'undefined'){
        var indexToRemove = chest_to_take_from.treasureIDs.indexOf(item.ogIdx);
        chest_to_take_from.treasureIDs.splice(indexToRemove, 1); //removes item from treasureIDs so that it will not appear on next visit of chest
    }

}


function revertTextModule(){
    $("#descend").off("click")
    $("#stay").off("click")
    $("#stay").hide();
    $("#enter").hide();
    $("#enter").show();
    $("#text-module").hide();
    $("#descend").hide();
    canMove = true;
    print("lastMessage", "enemy-message");

    //in case innerHTMl was changed; resets to default
    $('#descend').html("Descend")
    $('#stay').html("Stay")
}

function refreshInfo() {
    //inventory
    refreshInventoryHTML(hero, heroShield)

    //magic tree:
    $("#tree-module").html('')
    for(var spell in Object.getOwnPropertyNames(spellTree)){
        if(typeof Object.getOwnPropertyNames(spellTree)[spell] != 'function'){
        var spellBox;
        var this_spell = Object.getOwnPropertyNames(spellTree)[spell];
        var objid = '#' + spellTree[this_spell]['objid']
        var top = 60 * (spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['level'] - 2);
        var left;
        if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == 1){
            left = 5 + '%';
        }
        else if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == -1){
            left = 64 + '%';
        }
        else{
            left = 35 + '%';
        }
        var toDisplay;
        if(hero.level < spellTree[this_spell]['level']){
          toDisplay = "?";
        }
        else{
          toDisplay = Object.getOwnPropertyNames(spellTree)[spell];
        }
        $("#tree-module").append("<div id='" + spellTree[this_spell]['objid'] + "' class='treeBox' style='left:" + left + ";top:" + top + "px;'>" + toDisplay + "</div>")
        if(spellTree[this_spell]['learned']){
            $(objid).css({'background-color': 'white', 'color': 'black'});
        }
        $(objid).attr('this_spell', this_spell);
        $(objid).click(function(){
            console.log($(this).attr('this_spell'))
            console.log(spellTree[$(this).attr('this_spell')])
            $("#tree-module").html("<div style='text-align:center;font-size:12px;font-family:cursive;'>" +
            $(this).attr('this_spell') + "<br><br>" +
            spellTree[$(this).attr('this_spell')]['description'] + "<br><br> Required Level: " +
            spellTree[$(this).attr('this_spell')]['level'] + "<div id='closeWindow' class='interact'>Close</div></div>");
            $("#tree-module").append("<div id='learn" + spell + "' class='interact' style='left:0; width:40px;display:none;'>Learn</div>");

            var learnID = '#learn' + spell;
            $(learnID).attr('this_spell', $(this).attr('this_spell'));
            $("#closeWindow").click(function(){
                refreshInfo();
            })
            if(!spellTree[$(this).attr('this_spell')]['learned'] && hero.level >= spellTree[$(this).attr('this_spell')]['level'] &&
            ((spellTree[$(this).attr('this_spell')]['karma'] >= 0 && hero.karma >= spellTree[$(this).attr('this_spell')]['level'] - 3) ||
            (spellTree[$(this).attr('this_spell')]['karma'] <= 0 && hero.karma <= spellTree[$(this).attr('this_spell')]['level'] * -1 + 3))){
                $(learnID).show();
                $(learnID).click(function(){
                    spellTree[$(this).attr('this_spell')]['learned'] = true;
                    hero.karma += spellTree[$(this).attr('this_spell')]['karma'];
                    if(typeof spellTree[$(this).attr('this_spell')]['active spell'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['active spell'].createButton();
                    }
                    else if(typeof spellTree[$(this).attr('this_spell')]['upgrade'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['upgrade'].upgrade();
                    }
                    refreshInfo();

                })
            }
        })
    }}


    //refresh for combat-module:
    var healthFraction = hero.vitality/hero.maxVitality;
    $("#heroHealthBar").html(
        hero.vitality + " / " + hero.maxVitality +
        "<div id='heroHealthSlider' class='statusSlider' style='width: " + healthFraction * 100 + "%'></div>"
    );
    $("#defendText").html( "Shield: " + heroShield.vitality );

}

function revertTextModule(){
    $("#descend").off("click")
    $("#stay").off("click")
    $("#stay").hide();
    $("#enter").hide();
    $("#enter").show();
    $("#text-module").hide();
    $("#descend").hide();
    canMove = true;
    print("lastMessage", "enemy-message");

    //in case innerHTMl was changed; resets to default
    $('#descend').html("Descend")
    $('#stay').html("Stay")
}

function refreshInfo() {
    //inventory
    refreshInventoryHTML(hero, heroShield)

    //magic tree:
    $("#tree-module").html('')
    for(var spell in Object.getOwnPropertyNames(spellTree)){
        if(typeof Object.getOwnPropertyNames(spellTree)[spell] != 'function'){
        var spellBox;
        var this_spell = Object.getOwnPropertyNames(spellTree)[spell];
        var objid = '#' + spellTree[this_spell]['objid']
        var top = 60 * (spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['level'] - 2);
        var left;
        if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == 1){
            left = 5 + '%';
        }
        else if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == -1){
            left = 64 + '%';
        }
        else{
            left = 35 + '%';
        }
        var toDisplay;
        if(hero.level < spellTree[this_spell]['level']){
          toDisplay = "?";
        }
        else{
          toDisplay = Object.getOwnPropertyNames(spellTree)[spell];
        }
        $("#tree-module").append("<div id='" + spellTree[this_spell]['objid'] + "' class='treeBox' style='left:" + left + ";top:" + top + "px;'>" + toDisplay + "</div>")
        if(spellTree[this_spell]['learned']){
            $(objid).css({'background-color': 'white', 'color': 'black'});
        }
        $(objid).attr('this_spell', this_spell);
        $(objid).click(function(){
            console.log($(this).attr('this_spell'))
            console.log(spellTree[$(this).attr('this_spell')])
            $("#tree-module").html("<div style='text-align:center;font-size:12px;font-family:cursive;'>" +
            $(this).attr('this_spell') + "<br><br>" +
            spellTree[$(this).attr('this_spell')]['description'] + "<br><br> Required Level: " +
            spellTree[$(this).attr('this_spell')]['level'] + "<div id='closeWindow' class='interact'>Close</div></div>");
            $("#tree-module").append("<div id='learn" + spell + "' class='interact' style='left:0; width:40px;display:none;'>Learn</div>");

            var learnID = '#learn' + spell;
            $(learnID).attr('this_spell', $(this).attr('this_spell'));
            $("#closeWindow").click(function(){
                refreshInfo();
            })
            if(!spellTree[$(this).attr('this_spell')]['learned'] && hero.level >= spellTree[$(this).attr('this_spell')]['level'] &&
            ((spellTree[$(this).attr('this_spell')]['karma'] >= 0 && hero.karma >= spellTree[$(this).attr('this_spell')]['level'] - 3) ||
            (spellTree[$(this).attr('this_spell')]['karma'] <= 0 && hero.karma <= spellTree[$(this).attr('this_spell')]['level'] * -1 + 3))){
                $(learnID).show();
                $(learnID).click(function(){
                    spellTree[$(this).attr('this_spell')]['learned'] = true;
                    hero.karma += spellTree[$(this).attr('this_spell')]['karma'];
                    if(typeof spellTree[$(this).attr('this_spell')]['active spell'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['active spell'].createButton();
                    }
                    else if(typeof spellTree[$(this).attr('this_spell')]['upgrade'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['upgrade'].upgrade();
                    }
                    refreshInfo();

                })
            }
        })
    }}


    //refresh for combat-module:
    var healthFraction = hero.vitality/hero.maxVitality;
    $("#heroHealthBar").html(
        hero.vitality + " / " + hero.maxVitality +
        "<div id='heroHealthSlider' class='statusSlider' style='width: " + healthFraction * 100 + "%'></div>"
    );
    $("#defendText").html( "Shield: " + heroShield.vitality );

}

