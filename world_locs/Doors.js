/*
 * This file is for any location that causes a change in room.
 * Currently this is limited to:
 *  1. Door
 *  2. Trapdoor
 *  3. Locked Door (not a change, but fits name)
 *  4. Dungeon Entrance
 */

class Door extends Location{ //highly experimental content at hand here
    constructor(rowID, colID, roomID, nextRoomID){
        super(rowID, colID, 'Door', 'door', '□', 'Leave room?', false, true);
        this.roomID = roomID;
        this.nextRoomID = nextRoomID;
    }

    hero_interact(){
        var self = this;
        var nextRoomFunc = function() {
            // remove hero from old room + clear fog
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
            room_list[curr_floor][curr_room].clearAllFogTimeouts();
            var old_map = room_list[curr_floor][curr_room].room_map;

            //change curr_room + update hero position coords
            curr_room = self.nextRoomID;
            if(avatarX == 1){
                avatarX = room_list[curr_floor][curr_room].room_width - 2;
                avatarY = room_list[curr_floor][curr_room].room_exit[0];
                update_loc_facing(last_key_press);
            }
            else{
                avatarX = 2;
                avatarY = room_list[curr_floor][curr_room].room_entry[0];
                update_loc_facing(last_key_press);
            }

            // update room to have hero + spawn dog
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
            doge.spawn_dog(avatarX, avatarY, old_map, room_list[curr_floor][curr_room])
            room_list[curr_floor][curr_room].buildRoomHTML(avatarX, avatarY,torchlight, fog_radius);

            txtmd.revertTxtMd();
        }

        var txtmodmsg = {
            "msgs": [
                ["dec", this.message, "Leave", "Stay", nextRoomFunc]
            ]}

        txtmd.parseTxtMdJSON(txtmodmsg)
    }
}

class LockedDoor extends Location{
    constructor(rowID, colID){
        super(rowID, colID, "Locked Door", 'lockedDoor', '□', "It appears to be the way out of here, but it's locked. If only you had a key...", false, true);
    }

    hero_interact(){
        txtmd.parseTxtMdJSON({ "msgs": [ ["fin", this.message] ] });
    }
}

class Trapdoor extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Trapdoor', 'trapdoor','ø',  'A gaping black hole stares at you from the floor of the dungeon... you wonder what is on the other side',false, true);

        this.keeperSpawned = false
    }

    hero_interact(){
        var descendFunc = function(){
            //TODO: shouldnt have to check this... just dont build trapdoors on last floornew map!
            if(curr_floor < num_floors - 1){
                if(curr_floor > 0){
                    for(var i = 0; i < room_list[curr_floor][curr_room].enemy_list.length; i++){ //scale recurring enemies
                        // make enemies stronger and revive them
                        room_list[curr_floor][curr_room].enemy_list[i].maxVitality += 5;
                        room_list[curr_floor][curr_room].enemy_list[i].vitality = room_list[curr_floor][curr_room].enemy_list[i].maxVitality;
                        room_list[curr_floor][curr_room].enemy_list[i].strength += 1;
                    }
                }

                //clear fog
                room_list[curr_floor][curr_room].clearAllFogTimeouts();

                //remove hero
                var oldmap = room_list[curr_floor][curr_room].room_map;
                oldmap[avatarY][avatarX].hero_present = false;

                //spawn hero next floor
                curr_floor++;
                curr_room = 0;
                avatarY = room_list[curr_floor][curr_room].room_entry[0];
                avatarX = room_list[curr_floor][curr_room].room_entry[1];
                update_loc_facing(last_key_press);
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;

                //build room then spawn dog
                room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight, fog_radius);
                doge.spawn_dog(avatarX, avatarY, oldmap, room_list[curr_floor][curr_room])

                // refresh shield upon descent
                heroShield.vitality = heroShield.maxVitality;
                refreshOpenMods();

                // revert textmod
                txtmd.revertTxtMd()
            }
        }

        var self = this
        var gatekeepWarning = function() {
            txtmd.revertTxtMd()
            canMove = false
            self.symbol = 'C'
            self.keeperSpawned = true
            self.refreshInnerHTML()
            $(self.htmlID).fadeOut(1).fadeIn(3000, function(){
                txtmd.startDialog('gatekeeper', 'Floor'+curr_floor, 'gatekeeper', function(){
                        txtmd.parseTxtMdJSON({ "speaker": 'gatekeeper',
                            "msgs": [["dec", "Are you sure you want to descend? If you do, remember, mind the fog!",
                            "Descend", "Stay", descendFunc]] })
                    }
                )
            })
        }

        if(!this.keeperSpawned){
            txtmd.parseTxtMdJSON({ "msgs": [ ["dec", this.message, "Descend", "Stay", gatekeepWarning] ] });
        }
        else{
            txtmd.parseTxtMdJSON({"speaker": 'gatekeeper',
                "msgs": [["dec", "Are you sure you want to descend? If you do, remember, mind the fog!", "Descend", "Stay", descendFunc]] })
        }
    }
}

class DungeonEntrance extends Trapdoor{
    constructor(rowID,colID){
        super(rowID, colID)

        //These are the properties diff from Trapdoor
        this.name = "Dungeon Entrance"
        this.objid = "Entrance"
        this.symbol = "D"
        this.message = "The entrance to the dungeon stands, forboding and dark."
        this.passable = false;
    }
}
