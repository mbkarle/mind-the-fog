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

    //spell tree:
    refreshSpellTreeHTML(hero)

    //refresh for combat-module:
    var healthFraction = hero.vitality/hero.maxVitality;
    $("#heroHealthBar").html(
        hero.vitality + " / " + hero.maxVitality +
        "<div id='heroHealthSlider' class='statusSlider' style='width: " + healthFraction * 100 + "%'></div>"
    );
    $("#defendText").html( "Shield: " + heroShield.vitality );

}
