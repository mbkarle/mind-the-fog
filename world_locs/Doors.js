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

                    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                    doge.spawn_dog(avatarX, avatarY, old_map, room_list[curr_floor][curr_room])
                    room_list[curr_floor][curr_room].buildRoomHTML(avatarX, avatarY,torchlight, fog_radius);

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
        super(rowID, colID, "Locked Door", 'lockedDoor', '□', "It appears to be the way out of here, but it's locked. If only you had a key...", false, true);
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

