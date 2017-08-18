class Dog {
    constructor(dogX, dogY){
        this.name = 'dog'; //name of the Location
        this.message = 'what a puppaluppagus'; //message displayed on print()
        this.objid = 'dog'; //object id
        this.symbol = 'd'; //symbol to display on map
        this.dogX = dogX; //row index in world_map
        this.dogY = dogY; //col index in world_map

        this.following = false;
        this.dog_radius = -1; //should be set each time fog changes to fog_radius
        this.dog_item = null; //TODO: dog carries over an item?
        this.path_to_hero = [];
        this.move_interval = -1;
        this.dog_speed = 100;
    }

    hero_interact(){
        this.following = !this.following;
        console.log('following = ' + this.following);
        // console.log('woof!')
        // $('#text-module').show();
        // print('message', 'Give Dog an Item?')
    }

    compute_path_to_hero(avX,avY, map){
        //Takes in the hero's pos and updates the path_to_hero variable to be
        //an array of locations needed to travel to reach the hero.

        //First, lets get the x and y positions needed to travel
        var x_pos = [];
        if(avX > this.dogX){
            for(var i = 0; i < Math.abs(avX - this.dogX); i++){
                x_pos.push(this.dogX+i)
            }
        }
        else if(avX < this.dogX){
            for(var i = 0; i < Math.abs(avX - this.dogX); i++){
                x_pos.push(this.dogX-i)
            }
        }

        var y_pos = [];
        if(avY > this.dogY){
            for(var i = 0; i < Math.abs(avY - this.dogY); i++){
                y_pos.push(this.dogY+i)
            }
        }
        else if(avY < this.dogY){
            for(var i = 0; i < Math.abs(avY - this.dogY); i++){
                y_pos.push(this.dogY-i)
            }
        }

        //Alright, so BASICALLY, btw x_pos and y_pos one array has to be greater
        // than or equal to the other in length
        //Soooo... we find which one is bigger, and we establish a ratio.
        //If we have that there is twice as much in x dir than y, then we interleave the

        this.path_to_hero = [];
        var manhattan_dist = this.manhat_dist_from_hero(avX, avY)
        for(var i = 0; i < manhattan_dist -1; i++){
            var curX;
            var curY;

            if(i % 2 === 0){
                curX = x_pos.shift();
                if(typeof curX === 'undefined'){ //nothing left in x list
                    curX = avX;
                    curY = y_pos.shift(); //note this should have something left...
                }
                else{
                    curY = y_pos[0];
                    if(typeof curY === 'undefined'){curY = avY}
                }
            }
            else{
                curY = y_pos.shift();
                if(typeof curY === 'undefined'){ //nothing left in y list
                    curY = avY;
                    curX = x_pos.shift();
                }
                else{
                    curX = x_pos[0];
                    if(typeof curX === 'undefined'){curX = avX}
                }
            }


            if(typeof curY === 'undefined'){curY = avY}

            this.path_to_hero.push([curX, curY])
        }


        // console.log(this.path_to_hero.toString())
    }
    spawn_dog(avX, avY, oldmap, room){
        var newmap = room.room_map;
        //Upon changing a room / descending, the dog should:
        //1) spawn on the character
        //2) move one to the left/right, etc
        //3) all move intervals should be reset...

        this.path_to_hero = [];
        this.clearMoveInterval();

        // oldmap[this.dogY][this.dogX] = this.loc_sitting_on; //restore old map
        // $(this.htmlID).html(this.loc_sitting_on.symbol);

        //Remove the dog from the old map...
        oldmap[this.dogY][this.dogX].dog_present = false;
        oldmap[this.dogY][this.dogX].refreshInnerHTML();

        //Spawn the dog in the new map
        this.dogX = avX;
        this.dogY = avY;
        newmap[this.dogY][this.dogX].dog_present = true;
        // newmap[this.dogY][this.dogX].refreshInnerHTML();

        //just find any position available thats not the hero's loc then move the dog!
        var newloc = this.get_avail_dog_loc('w', avX, avY, newmap);
        this.move_dog_restore_map(newloc, newmap)

        //redraw hero since we spawned dog on top
        // newmap[avY][avX].refreshInnerHTML();
    }

    move_dog_restore_map(newloc, map){
        //Remove the dog from its current tile and refresh its html
        map[this.dogY][this.dogX].dog_present = false;
        map[this.dogY][this.dogX].refreshInnerHTML();

        //Move the dog to the new loc
        this.dogX = newloc[0];
        this.dogY = newloc[1];
        map[this.dogY][this.dogX].dog_present = true;
        map[this.dogY][this.dogX].refreshInnerHTML();
    }

    move_along_path(map){
        // console.log(this.path_to_hero.toString())
        if(this.path_to_hero.length > 0){
            //The new location to move to is the first on path_to_hero
            var newloc = this.path_to_hero.shift();
            this.move_dog_restore_map(newloc, map)
        }
        else{
            this.clearMoveInterval();
        }
    }

    hero_move_update_dog(hero_move_dir, avX, avY, map){
        if(2 <= this.manhat_dist_from_hero(avX, avY) && this.following){
            //You moved: recompute path_to_hero
            this.compute_path_to_hero(avX, avY, map)

            //Now, if you arent in motion already, start hoppin along
            //that path!
            if(this.move_interval === -1){
                // console.log('starting move_interval')
                var self = this;
                this.move_interval = setInterval(function(){
                    self.move_along_path(map)
                }, this.dog_speed)
            }
        }

        if(this.dogX === avX && this.dogY === avY){
            var newloc = this.get_avail_dog_loc(hero_move_dir,avX, avY, map)
            this.move_dog_restore_map(newloc, map)
            this.clearMoveInterval();
            map[avY][avX].hero_present = true;
            this.hero_present = false;
        }
    }

    clearMoveInterval(){
        clearInterval(this.move_interval)
        this.move_interval = -1;
    }

    get_avail_dog_loc(hero_move_dir, x, y, map){
        var poss_locs;
        switch (hero_move_dir) {
            case 'w':
                poss_locs = [[x+1, y], [x-1,y], [x,y-1]]
                break;
            case 's':
                poss_locs = [[x+1, y], [x-1,y], [x,y+1]]
                break;
            case 'a':
                poss_locs = [[x, y-1], [x-1,y], [x,y+1]]
                break;
            case 'd':
                poss_locs = [[x, y-1], [x+1,y], [x,y+1]]
                break;

            default:
                console.log('unknown hero_move_dir, Dog location get_avail_dog_loc');
        }

        var loc_to_return;
        for(var i = 0; i < poss_locs.length; i++){
            loc_to_return = poss_locs[i];
            if(map[loc_to_return[1]][loc_to_return[0]].passable){
                // console.log(loc_to_return)
                return loc_to_return;
            }
        }
    }

    manhat_dist_from_hero(avX, avY){
        return Math.abs(avY - this.dogY) + Math.abs(avX - this.dogX);
    }
}
