/*
 * This file is for locations that trigger custom combat
 * Currently this is:
 *   1. Statue
 *   2. Cave
 */

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

