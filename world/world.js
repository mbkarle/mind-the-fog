/*
 * This file holds all functions for world interaction
 * (movement, descent)
 */


function update_loc_facing(key_press){
    switch (key_press) {
        case 'w':
            loc_facing = [avatarX, avatarY-1];
            if(dir_facing !== 'N'){
                dir_facing = 'N'
                $("#compassascii").html(ASCII_COMPASS_N)
            }
            break;
        case 's':
            loc_facing = [avatarX, avatarY+1];
            if(dir_facing !== 'S'){
                dir_facing = 'S'
                $("#compassascii").html(ASCII_COMPASS_S)
            }
            break;
        case 'a':
            loc_facing = [avatarX-1, avatarY];
            if(dir_facing !== 'W'){
                dir_facing = 'W'
                $("#compassascii").html(ASCII_COMPASS_W)
            }
            break;

        case 'd':
            loc_facing = [avatarX+1, avatarY];
            if(dir_facing !== 'E'){
                dir_facing = 'E'
                $("#compassascii").html(ASCII_COMPASS_E)
            }
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
        var room = room_list[curr_floor][curr_room]
        var map = room.room_map
        if (e.keyCode == "87" && avatarY > 0) { //up
            last_key_press = 'w';
            if(map[avatarY-1][avatarX].passable){
                map[avatarY][avatarX].hero_present = false;
                avatarY --;
                map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "83" && avatarY < room.room_height-1) { //down
            last_key_press = 's';
            if(map[avatarY+1][avatarX].passable){
                map[avatarY][avatarX].hero_present = false;
                avatarY ++;
                map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "65" && avatarX > 0) { //left
            last_key_press = 'a';
            if(map[avatarY][avatarX-1].passable){
                map[avatarY][avatarX].hero_present = false;
                avatarX --;
                map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "68" && avatarX < room.room_width-1) { //right
            last_key_press = 'd';
            if(map[avatarY][avatarX+1].passable){
                map[avatarY][avatarX].hero_present = false;
                avatarX ++;
                map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "84"){ //t for torch
            if(!torchlight && hero.inv.useTorch()){
                console.log("Activating torch")
                activatedTorch = true;
                refreshOpenMods();
                torchlight = true;
                setTimeout(function(){
                    torchlight = false;
                    // if(!room_list[curr_floor][curr_room].roomCleared){
                    var room = room_list[curr_floor][curr_room]
                    if(!room.fog_free_room){
                        room.addFogWhenTorchBurnsOut(avatarX,avatarY,fog_radius);
                        var newPos = [avatarX,avatarY];
                        room.updateRoomHTML(newPos,newPos,torchlight,fog_radius);
                    }
                    console.log("Your torch fades to nothing."
                )}, 10000)
            }
        }
        else if(e.keyCode == '69'){
            //e for interact (#81 issues)
            //do a checkLocation with the loc_facing
            checkLocation(loc_facing[0], loc_facing[1])
        }
        update_loc_facing(last_key_press);

        if(didMove){
            doge.hero_move_update_dog(last_key_press,avatarX, avatarY, map);
        }

        // Check dist btw dog & hero and activate doginvmd if needed!
        if(room_list[curr_floor][curr_room].room_map[loc_facing[1]][loc_facing[0]].dog_present){
            doginvmd.activateMod()
        }
        else{ doginvmd.deactivateMod() }

        if(didMove || activatedTorch){
            var newPos = [avatarX,avatarY];
            room.updateRoomHTML(oldPos,newPos,torchlight,fog_radius);
        }

        //chance to enter combat
        if (Math.random() < room.fightChance  && !room.roomCleared && didMove) {
            enter_combat(room)
        }

        // heal from moving
        if(hero.vitality + 2 <= hero.maxVitality && didMove) {
            hero.vitality += 2;
            refreshOpenMods();
        } else if(hero.vitality + 1 <= hero.maxVitality && didMove){
            hero.vitality += 1;
            refreshOpenMods();
        }

        // passable loc interactions happen when stepped on!
        if(didMove){
            checkLocation(avatarX, avatarY);
        }
    }

    //keypresses outside of canMove
    if (e.keyCode == 73){ // i for inventory
        invmd.toggleMod()
        doginvmd.hideMod(); // there can only be one!
        refreshOpenMods();
    }
    else if(doginvmd.avail && e.keyCode == 70) { // f for friend (dog)
        doginvmd.toggleMod()
        invmd.hideMod()
        refreshOpenMods();
    }
    else if(e.keyCode == 77){
        splmd.toggleMod()
        refreshOpenMods();
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

function refreshOpenMods() {
    //inventory
    if(invmd.open){ invmd.refreshMod() }

    //spell tree:
    if(splmd.open){ splmd.refreshMod() }

    //dog inventory
    if(doginvmd.open){ doginvmd.refreshDogInv() }

    //vendor module
    if(vndmd.open){ vndmd.refreshFunc() }

    //txtmd if showing inv
    if(txtmd.openAndChanging){ txtmd.refreshFunc() }
}
