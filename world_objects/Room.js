//This is the class for a room, designed to fix #35 and #31.
/*A room should have:
* A list of enemies associated (enemies that could be encountered)
* The number of enemy encounters before the boss
* The special locations for the room
* The boss, if applicable
*/
class Room {
    constructor(name, room_type, tier, floor, roomCleared, boss, fightChance, maxLocs) {
        this.name = name;
        this.maxLocs = maxLocs;
        if(typeof this.maxLocs === "undefined"){
            this.locations = tier_to_locations(tier);

        }
        else{
            this.locations = tier_to_locations(tier, this.maxLocs);

        }
        this.itemList = tier_to_items(tier);
        this.room_type = room_type;
        this.roomCleared = roomCleared;
        this.enemy_list = tier_to_enemies(tier);
        this.num_enemies = tier_to_num_enemies(tier);
        this.boss = boss;
        this.fightChance = fightChance;
        this.floor = floor;
        this.tier = tier;


        this.room_map = this.buildRoom(room_type, this.locations, this.itemList, this.tier)

        this.room_width = this.room_map[0].length;
        this.room_height = this.room_map.length;
        this.room_entry = [Math.floor(this.room_height/ (1 + Math.ceil(Math.random() * 7))), Math.floor(this.room_width/(1 + Math.ceil(Math.random()* 7)))];
        this.room_exit = [Math.floor(this.room_height/ (1 + Math.ceil(Math.random() * 7))), this.room_width - 1]
        this.yoff = Math.floor((30 - this.room_height)/2)
        this.xoff = Math.floor((40 - this.room_width)/2)

        center_map(this.room_map, this.yoff, this.xoff)
    }

    buildRoom(type, locations, itemList, tier){
        var map;
        var width;
        var height;
        switch (type) {
            case 'tutRoom':
                width = 30;
                height = 20;

                map = buildRoomOfSize(height, width);

                var tutorialDialogue = new CharDialogue(3, 5, "instructor");
                map[tutorialDialogue.rowID][tutorialDialogue.colID] = tutorialDialogue;

                clearAllFog(map);
                break;

            case 'MidNorm':
                width = 30;
                height = 30;
                map = makeNormalRoom(height, width, map, locations, itemList, tier);
                break;

            case 'HorizHallNorm':
                width = 40;
                height = 12;
                map = makeNormalRoom(height, width, map, locations, itemList, tier);
                break;

            case 'VertHallNorm':
                width = 12;
                height = 40;
                map = makeNormalRoom(height, width, map, locations, itemList, tier);
                break;

            case 'SmallNorm':
                width = 20;
                height = 20;
                map = makeNormalRoom(height, width, map, locations, itemList, tier);
                break;

            case 'Exit':
                width = 20;
                height = 20;
                map = buildRoomOfSize(height, width);
                var exit = new Trapdoor(5, 5);
                map[exit.rowID][exit.colID] = exit;
                clearAllFog(map);
                break;

            case 'GreatHall':
                width = 40;
                height = 12;

                map = buildRoomOfSize(height,width);

                var entrance = new DungeonEntrance(6,35)
                map[entrance.rowID][entrance.colID] = entrance;

                var gateKeeper = new CharDialogue(9, 30, "gatekeeper");
                map[gateKeeper.rowID][gateKeeper.colID] = gateKeeper;



                //after creating all special locations, turn fog off!
                clearAllFog(map);
                break;


            default:
                width = 40;
                height = 30;
            map = makeNormalRoom(height, width, map, locations, itemList, tier);
                //end switch on room type
        }
        return map;
    }

    buildRoomHTML(avatarX, avatarY, torchlight) {
        var worldContents = "";
        this.removeFog(avatarX, avatarY, torchlight);
        for (var i = 0; i < this.room_map.length; i++) {
            for (var j = 0; j < this.room_map[0].length; j++) {
                var symbol = this.room_map[i][j].symbol;
                if (this.room_map[i][j].fog) {
                    symbol = '';
                }
                if (this.room_map[i][j].hero_present) {
                    symbol = 'x';
                }
                worldContents += "<div id='" + String(i) + 'x' + String(j) + "' style='top:" + this.room_map[i][j].yCoord + "px; left:" + this.room_map[i][j].xCoord + "px; position: absolute;'>" + symbol + "</div>";
            }
        }
        document.getElementById("worldContent").innerHTML = worldContents;
    }

    addFogWhenTorchBurnsOut(avX, avY){
        self = this;
        setTimeout(function(){
            var torch_coords = self.getValidCoords(avX, avY, true);
            var no_torch_coords = self.getValidCoords(avX,avY,false);

            var coords_to_update = []
            var haystack = JSON.stringify(no_torch_coords);
            for(var i = 0; i < torch_coords.length; i++){
                var coord = torch_coords[i];
                if(haystack.indexOf(JSON.stringify(coord)) === -1){
                    coords_to_update.push(coord);
                }

            }

            var coords_to_updateIDs = coords_to_update.map(function(coord) {
                return String('#' + coord[1]) + 'x' + String(coord[0])
            })
            for(var i = 0; i < coords_to_update.length; i++){
                $(coords_to_updateIDs[i]).html('');
                self.room_map[coords_to_update[i][1]][coords_to_update[i][0]].fog = true;
                // console.log(this.room_map[coords_to_update[i][1]][coords_to_update[i][0]]);
            }
        }, 10000/(this.tier+1))


    }

    updateRoomHTML(oldPos, newPos, torchlight) { //in [x,y] format
        //these are the only spots that need updating, as their fog is being removed!
        var all_coords = this.getNeighborsToUpdate(oldPos, newPos, torchlight,false)
        // console.log(all_coords)
        var coords_to_update = all_coords[0]
        var out_of_date_coords = all_coords[1]
        var coords_to_updateIDs = coords_to_update.map(function(coord) {
            return String('#' + coord[0]) + 'x' + String(coord[1])
        })

        //So we need to update all coords_to_updateIDs, because they are in view of the character
        for (var i = 0; i < coords_to_update.length; i++) {
            var cy = coords_to_update[i][0]
            var cx = coords_to_update[i][1]
            var symbol = this.room_map[cy][cx].symbol;
            this.room_map[cy][cx].fog = false;
            if (this.room_map[cy][cx].hero_present) {
                symbol = 'x';
            }
            $(coords_to_updateIDs[i]).html(symbol);
        }
        // console.log('updated ' + coords_to_update.length + ' locations')

        //for all out of date coords (from high tier fog regeneration), turn
        //fog back on and set html to ''
        //only do if !roomCleared (deals w SafeRoom)
        if(!this.roomCleared){
            self = this;
            setTimeout(function(){fogTimeout(out_of_date_coords, self.room_map)},10000/(this.tier+1))
        }

        function fogTimeout(coord, map){
            console.log('timeout')
            for(var i = 0; i < out_of_date_coords.length; i++){
                var coord = out_of_date_coords[i];
                map[coord[0]][coord[1]].fog = true;
                var coordID = String('#' + coord[0]) + 'x' + String(coord[1]);
                $(coordID).html('')
            }

        }
    }



    removeFog(avX, avY, torchlight){
        var neigh = this.getNeighborsToUpdate([avX,avY],[avX,avY],torchlight,true);
        for(var i = 0; i < neigh.length; i++){
            neigh[i].fog = false;
        }
    }

    getNeighborsToUpdate(oldPos, newPos, torchlight, simpleNeighbors){
        var map = this.room_map;

        //Theres two reasons to call this function, the first is just to remove the
        //fog around the current position. In this case we just want to return the Location's
        //around the player, so as to access their fog properties.
        if(simpleNeighbors){
            var neigh = [];
            var possCoords = this.getValidCoords(oldPos[0], oldPos[1], torchlight);
            for(var i = 0; i < possCoords.length; i++){
                var cx = possCoords[i][0];
                var cy = possCoords[i][1];
                neigh.push(map[cy][cx]);
            }
            return neigh;
        }

        //The second reason to call this is to decide which parts of the html to update.
        //In this case, we care about the new position, the old position, and the difference
        //between them.
        else{
            var validCoords_newPos = this.getValidCoords(newPos[0], newPos[1], torchlight);

            //coords_needing_update[0] are the positions that need to be updated. We start with the
            //avatar's start pos and curr pos, because they guaranteed need an update
            //to move the x.
            //coords_needing_update[1] are the positions that are no longer visible to character,
            //which need fog readded on a high tier.
            var coords_needing_update = new Array(2);
            coords_needing_update[0] = [[oldPos[1],oldPos[0]], [newPos[1],newPos[0]]]; //coords for inc_update
            coords_needing_update[1] = [];

            //The smartest solution here is the following:
            //If you are on a tier which has fog of war (early tiers):
            // - Don't worry about old coords, they stay as they are
            // - Only update possCoords around the newPos that have fog!
            for(var i = 0; i < validCoords_newPos.length; i++){
                var cx = validCoords_newPos[i][0];
                var cy = validCoords_newPos[i][1];
                if(map[cy][cx].fog){ //only need to update if fog present
                    coords_needing_update[0].push([cy,cx])
                }
            }

            //If you are on a higher tier which fog regenerates:
            //Now, we need to find all old_coords that were NOT in new_coords,
            //because these are no longer visible to the player...
            //If we find one, add it to a list to return so that updateRoomHTML can
            //set its fog to true and html to ''
            // if(this.tier > 1){
                var possCoords_oldPos = this.getValidCoords(oldPos[0], oldPos[1], torchlight);

                var old_coords = possCoords_oldPos.map(function(x){return x.reverse()}) //put in [y,x] order...
                var new_coords = validCoords_newPos.map(function(x){return x.reverse()})

                var out_of_date_coords = []

                var haystack = JSON.stringify(new_coords);
                for(var i = 0; i < old_coords.length; i++){
                    var coord = old_coords[i];
                    if(haystack.indexOf(JSON.stringify(coord)) === -1){
                        out_of_date_coords.push(coord);
                    }

                }
                coords_needing_update[1] = out_of_date_coords;
            // }
            return coords_needing_update;
        }
    }

    getValidCoords(avX,avY, torchlight){
        var possCoords = []
        possCoords.push([avX+1,avY+1]);
        possCoords.push([avX+1,avY]);
        possCoords.push([avX+1,avY-1]);
        possCoords.push([avX,avY+1]);
        possCoords.push([avX,avY]);
        possCoords.push([avX,avY-1]);
        possCoords.push([avX-1,avY+1]);
        possCoords.push([avX-1,avY]);
        possCoords.push([avX-1,avY-1]);

        if(torchlight){ //radius increases...
            //5 on right
            possCoords.push([avX+2,avY+2]);
            possCoords.push([avX+2,avY+1]);
            possCoords.push([avX+2,avY]);
            possCoords.push([avX+2,avY-1]);
            possCoords.push([avX+2,avY-2]);

            //5 on left
            possCoords.push([avX-2,avY+2]);
            possCoords.push([avX-2,avY+1]);
            possCoords.push([avX-2,avY]);
            possCoords.push([avX-2,avY-1]);
            possCoords.push([avX-2,avY-2]);

            //missing 3 up top
            possCoords.push([avX-1,avY+2]);
            possCoords.push([avX,avY+2]);
            possCoords.push([avX+1,avY+2]);

            //missing 3 on bottom
            possCoords.push([avX-1,avY-2]);
            possCoords.push([avX,avY-2]);
            possCoords.push([avX+1,avY-2]);

            //5x5 square complete... fill to be 6x6 with corners missing
            //3 on right
            possCoords.push([avX+3,avY+1]);
            possCoords.push([avX+3,avY]);
            possCoords.push([avX+3,avY-1]);

            //3 on left
            possCoords.push([avX-3,avY+1]);
            possCoords.push([avX-3,avY]);
            possCoords.push([avX-3,avY-1]);

            //3 on top
            possCoords.push([avX-1,avY+3]);
            possCoords.push([avX,avY+3]);
            possCoords.push([avX+1,avY+3]);

            //3 on bottom
            possCoords.push([avX-1,avY-3]);
            possCoords.push([avX,avY-3]);
            possCoords.push([avX+1,avY-3]);
        }
        var realCoords = []
        for(var i = 0; i < possCoords.length; i++){
            if(this.isValidCoord(possCoords[i][0], possCoords[i][1])){
                realCoords.push(possCoords[i])
            }
        }
        return realCoords;


    }

    isValidCoord(avX, avY){
        return (avX >= 0 && avY >= 0 && avX < this.room_width && avY < this.room_height);
    }

}

function makeNormalRoom(height, width, map, locations, itemList, tier){
    map = buildRoomOfSize(height,width);


    var locs = rollLocations(locations.length, height, width) //locs of locations

    for(var i = 0; i < locations.length; i++){
        switch (locations[i]) {
            case 'chest':
                map[locs[i][0]][locs[i][1]] = new Chest(locs[i][0],locs[i][1], itemList)
                map[locs[i][0]][locs[i][1]].fillChest();
                break;

            case 'trapdoor':
                map[locs[i][0]][locs[i][1]] = new Trapdoor(locs[i][0],locs[i][1])
                break;
            case 'statue':
                map[locs[i][0]][locs[i][1]] = new Statue(locs[i][0],locs[i][1])
                break;
            case 'fountain':
                map[locs[i][0]][locs[i][1]] = new Fountain(locs[i][0],locs[i][1])
                break;

            case 'altar':
                map[locs[i][0]][locs[i][1]] = new Altar(locs[i][0],locs[i][1]);
                break;

            case 'cave':
                map[locs[i][0]][locs[i][1]] = new Cave(locs[i][0],locs[i][1]);
                break;

            case 'merchant':
                map[locs[i][0]][locs[i][1]] = new Merchant(locs[i][0], locs[i][1], itemList);
                map[locs[i][0]][locs[i][1]].pickItems();
                break;


            default:
                alert('UNKNOWN LOCATION TYPE!')
        }
    }
    return map;
}

class SafeRoom extends Room {
    constructor(name, room_type, tier, floor, maxLocs) {
        super(name, room_type, tier, floor, true, null, 0, maxLocs)
    }
}

class FightRoom extends Room {
    constructor(name, room_type, tier, floor, maxLocs) {
        super(name, room_type, tier, floor, false, tier_to_boss(tier), tier_to_fightChance(tier), maxLocs)
    }

}



function clearAllFog(room_map){
    for(var i = 0; i < room_map.length; i++){
        for(var j = 0; j < room_map[0].length; j++){
            room_map[i][j].fog = false;
        }
    }
}

function buildRoomOfSize(height, width){
    var map = new Array(height)

    for (var i = 0; i < height; i++) {
      map[i] = new Array(width);
      for(var j = 0; j < width; j++){
          //populate it with Tile locations
          //boundaries should be walls... aesthetic thing
          if(i === 0 || j === 0 || i === height-1 || j === width - 1){
              map[i][j] = new Wall(i,j);
          }
          else{
              map[i][j] = new Tile(i,j);
          }
      }
    }
    return map;
}

//TODO: doesn't scale w small maps / high num_locs due to random sampling w few spaces per 8 rooks
function rollLocations(num_locs, height, width){
    //locs is a 2D array of locations not to be placed on...
    //locs[0] is a 2 element array (row / col)
    locs = []
    for(var n = 0; n < num_locs; n++){
        var loc = [-1,-1];
        found = false;
        while(!found){
            loc = [Math.floor((height-2)*Math.random())+1, Math.floor((width-2)*Math.random())+1] //new random location
            passed = true;
            for(var i = 0; i < locs.length; i++){ //check it really is unique as per 8 rooks problem
                if(locs[i].indexOf(loc[0]) >= 0 || locs[i].indexOf(loc[1]) >= 0){ //if row or col not unique...
                    passed = false;
                    break;
                }
            }
            if(passed){
                found = true;
                locs.push(loc)
            }
        }
    }

    return locs;
}


function tier_to_num_enemies(tier){
    //TODO: create mapping
    return 3+2*tier;
}

//copy me down
function tier_to_items(tier){
    if(tier == 1){
        return itemList1;
    }
    else if(tier == 2){
        return itemList2;
    }
    else if(tier == 3){
        return itemList3;
    }
}

function tier_to_enemies(tier){
    //TODO: randomize using larger lists and num_enemies
    var enemies = [];
    if( tier == 1){
     enemies = [Troglodyte, DireRat, DireRat2, Sorcerer, Ogre, Cultist, Bandit, DarkSquire];

    }
    else if(tier == 2) {
     enemies = [Sorcerer, DireRat2, Ogre, Vagrant, HellHound, Werewolf, slime, ferBeast, pillager];
    }
    else if(tier == 3){
        enemies = [HellHound, Werewolf, frostGiant, smallWyrm, DisOfMoranos, DarkKnight, CrimsonRider]
    }
    else {
        enemies = [Troglodyte, DireRat, DireRat2, Sorcerer, Ogre, Vagrant, HellHound, Werewolf, slime, frostGiant, ferBeast, smallWyrm, pillager];

    }


    return enemies;
}

function tier_to_locations(tier, maxLocs){
    // TODO: more locations!!! this code sets the framework for full randomization but it's meaningless with such small poss_addedLocs lists
    var poss_addedLocs;
    var added_locs = [];
    if(typeof maxLocs == "undefined"){
    var locationList = ['chest', 'trapdoor', 'chest'];

}
    else if(maxLocs == 1){
        var locationList = ['trapdoor'];
        console.log(locationList);

    }
    else if(maxLocs == 2 || maxLocs == 3){
        var locationList = ['chest'];
        console.log(locationList);
    }

    if(tier == 1){
        poss_addedLocs = ['chest', 'statue', 'fountain', 'merchant', 'trapdoor' ];
    }
    else if(tier == 2){
        poss_addedLocs = ['chest', 'cave', 'fountain', 'altar', 'merchant', 'trapdoor'];
    }
    else if(tier == 3){
        poss_addedLocs = ['chest', 'cave', 'altar', 'merchant', 'trapdoor'];
    }
    else {
        poss_addedLocs = [];
    }
    if(typeof maxLocs == 'undefined'){
        var num_added_locs = Math.ceil(Math.random() * 3);
    }
    else{
    var num_added_locs = Math.ceil(Math.random() * maxLocs);
}
    if(tier > 0){

    console.log("# of additional locations: " + num_added_locs);
    for(var i = 0; i < num_added_locs; i++){
        locToAdd = Math.floor(Math.random() * poss_addedLocs.length);
        added_locs.push(poss_addedLocs[locToAdd]);

        for(var j = 0; j < i; j++){ //no repeats in added_locs !
            if(added_locs[i] == added_locs[j]){
                added_locs.splice(i, 1);
                i--;
            }
        }
    }
//    if(added_locs.length == num_added_locs){
        for(var n = 0; n < added_locs.length; n++){
            locationList.push(added_locs[n]);
        }
        //return locationList;
   }
 //  }
return locationList
}

function tier_to_fightChance(tier){

    return .02 + tier / 100;

}

function tier_to_boss(tier){
    //TODO: create mapping
    return HellHound;
}

function center_map(map, yoff, xoff){
    for(var i = 0; i < map.length; i++){
        for(var j = 0; j < map[0].length; j++){
            map[i][j].computeCoordsWithOffset(yoff,xoff)
        }
    }
}
