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
        this.xp = tier_to_xp(tier);
        this.boss = boss;
        this.fightChance = fightChance;
        this.floor = floor;
        this.tier = tier;
        this.darkness = tier_to_darkness(tier);
        this.fog_free_room = (tier == 0);


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
            case 'exitRoom':
                width = 20;
                height = 15;

                map = buildRoomOfSize(height, width);

                var exitDoor = new LockedDoor(7, 0);
                map[exitDoor.rowID][exitDoor.colID] = exitDoor;
                clearAllFog(map);
                break;

            case 'tutRoom':
                width = 30;
                height = 20;

                map = buildRoomOfSize(height, width);

                var tutorialDialogue = new CharDialogue(3, 5, "instructor", "instructor");
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
                // clearAllFog(map);
                break;

            case 'GreatHall':
                width = 40;
                height = 12;

                map = buildRoomOfSize(height,width);

                var entrance = new DungeonEntrance(6,35)
                map[entrance.rowID][entrance.colID] = entrance;

                var gateKeeper = new CharDialogue(9, 30, "gatekeeper", 'the gatekeeper');
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


    clearAllFogTimeouts(){
        for(var i = 0; i < this.room_map.length; i++){
            for(var j = 0; j < this.room_map[0].length; j++){
                clearInterval(this.room_map[i][j].fogTimeout)
            }
        }
    }

    buildRoomHTML(avatarX, avatarY, torchlight, fog_rad) {
        var worldContents = "";

        //add fog to whole map (in case room has been seen before)
        if(!this.fog_free_room){
            for(var i = 0; i < this.room_map.length; i++){
                for(var j = 0; j < this.room_map[0].length; j++){
                    this.room_map[i][j].fog = true;
                }
            }
        }

        var hero_sight = fog_rad;
        if(this.roomCleared){
            hero_sight = this.darkness;
        }

        //Remove the fog around the hero
        var neigh = this.getNeighborLocations([avatarX,avatarY],torchlight, hero_sight);
        for(var i = 0; i < neigh.length; i++){
            neigh[i].fog = false;
        }

        //Build the worldContents HTML string
        for (var i = 0; i < this.room_map.length; i++) {
            for (var j = 0; j < this.room_map[0].length; j++) {
                var symbol = this.room_map[i][j].symbol;
                if (this.room_map[i][j].fog) {
                    symbol = '';
                }
                if (this.room_map[i][j].hero_present) {
                    symbol = 'x';
                }
                worldContents += "<div id='" + this.room_map[i][j].htmlID.substring(1) + "' style='top:" + this.room_map[i][j].yCoord + "px; left:" + this.room_map[i][j].xCoord + "px; position: absolute;'>" + symbol + "</div>";
            }
        }
        document.getElementById("worldContent").innerHTML = worldContents;
    }

    addFogWhenTorchBurnsOut(avX, avY, fog_rad){
        //Since the addition of "addFogBackAfterTimeout", all we need to do here
        //is find the coords that used to be in the radius of the torch and add
        //their fog back after a timeout!
        if(!this.fog_free_room){
            var hero_sight = fog_rad;
            if(this.roomCleared){
                hero_sight = this.darkness;
            }
            var torch_coords = this.getValidCoords(avX, avY, true, hero_sight);
            var no_torch_coords = this.getValidCoords(avX,avY,false, hero_sight);

            var coords_to_update = []
            var haystack = JSON.stringify(no_torch_coords);
            for(var i = 0; i < torch_coords.length; i++){
                var coord = torch_coords[i];
                if(haystack.indexOf(JSON.stringify(coord)) === -1){
                    coords_to_update.push(coord);
                }
            }

            for(var i = 0; i < coords_to_update.length; i++){
                var cx = coords_to_update[i][0];
                var cy = coords_to_update[i][1];
                this.room_map[cy][cx].addFogBackAfterTimeout(this.tier);
            }
        }
    }

    addFogWhenFogRadiusChanges(avX, avY, torchlight, old_rad, new_rad){
        var old_rad_coords = this.getValidCoords(avX, avY, torchlight, old_rad);
        var new_rad_coords = this.getValidCoords(avX,avY, torchlight, new_rad);

        var coords_to_update = []
        var haystack = JSON.stringify(new_rad_coords);
        for(var i = 0; i < old_rad_coords.length; i++){
            var coord = old_rad_coords[i];
            if(haystack.indexOf(JSON.stringify(coord)) === -1){
                coords_to_update.push(coord);
            }
        }

        for(var i = 0; i < coords_to_update.length; i++){
            var cx = coords_to_update[i][0];
            var cy = coords_to_update[i][1];
            this.room_map[cy][cx].addFogBackAfterTimeout(this.tier);
        }
    }

    updateRoomHTML(oldPos, newPos, torchlight, fog_rad) { //in [x,y] format
        //If you cleared the room (or are in a safe room), you REALLY only need
        //to update the character position (no fog updates necessary!)
        if(this.fog_free_room){
            var oldX = oldPos[0];
            var oldY = oldPos[1];
            $(this.room_map[oldY][oldX].htmlID).html(this.room_map[oldY][oldX].symbol);

            var newX = newPos[0];
            var newY = newPos[1];
            $(this.room_map[newY][newX].htmlID).html('x');
        }
        else{ //Else, theres fog work to be done
            //hero_visible_locs need their fog timeouts cleared.
            var hero_sight = fog_rad;
            if(this.roomCleared){
                hero_sight = this.darkness;
            }
            var hero_visible_locs = this.getNeighborLocations(newPos,torchlight, hero_sight)
            for (var i = 0; i < hero_visible_locs.length; i++) {
                hero_visible_locs[i].removeFogBecauseHeroPresent();
            }

            //out_of_date_coords are coords no longer visible to the player that need
            //their fog regenerated.
            var out_of_date_coords = this.getOutOfDateCoords(oldPos, newPos, torchlight, hero_sight)
            for(var i = 0; i < out_of_date_coords.length; i++){
                var cx = out_of_date_coords[i][0]
                var cy = out_of_date_coords[i][1]
                this.room_map[cy][cx].addFogBackAfterTimeout(this.tier);
            }
        }
    }

    //Returns the actual Location objects of the visible places around a position
    getNeighborLocations(position, torchlight, fog_rad){
        var neigh = [];
        var validCoords = this.getValidCoords(position[0], position[1], torchlight, fog_rad);
        for(var i = 0; i < validCoords.length; i++){
            var cx = validCoords[i][0];
            var cy = validCoords[i][1];
            neigh.push(this.room_map[cy][cx]);
        }
        return neigh;
    }

    getOutOfDateCoords(oldPos, newPos, torchlight, fog_rad) {
        //The reason to call this is to decide which parts of the html to update.
        //In this case, we care about the new position, the old position, and the difference
        //between them.

        //NOTE: Prior to 900abac, this function was smarter about the coords that needed updating.
        //In fact, it returned a list of all "out of date" coords (which need fog added bc they
        //are no longer visible) as well as the coords that needed their position updated.
        //
        //The idea was that in a SafeRoom, you really only need to update the Location of the character.
        //Now this function should be called just for out of date coords, as all coords in view
        //of the hero need their fog timeout cleared.
        var map = this.room_map;

        //If you are on a higher tier which fog regenerates:
        //Now, we need to find all old_coords that were NOT in new_coords,
        //because these are no longer visible to the player...
        var validCoords_newPos = this.getValidCoords(newPos[0], newPos[1], torchlight, fog_rad);
        var validCoords_oldPos = this.getValidCoords(oldPos[0], oldPos[1], torchlight, fog_rad);

        var out_of_date_coords = []

        var haystack = JSON.stringify(validCoords_newPos);
        for (var i = 0; i < validCoords_oldPos.length; i++) {
            var coord = validCoords_oldPos[i];
            if (haystack.indexOf(JSON.stringify(coord)) === -1) {
                out_of_date_coords.push(coord);
            }
        }

        return out_of_date_coords;
    }

    getValidCoords(avX,avY, torchlight, fog_rad){
        //getValidCoords is a function which will return all visible coordinates
        // IN [X,Y] ORDERING around a [x,y] position.
        var possCoords = []
        if(torchlight){
            fog_rad += 3;
        }

        for(var y = avY - fog_rad; y <= avY + fog_rad; y++){
            for(var x = avX - fog_rad; x <= avX + fog_rad; x++){
                var dist_from_hero = Math.sqrt((x-avX)**2 + (y-avY)**2)
                if(dist_from_hero < fog_rad){
                    possCoords.push([x,y])
                }
            }
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
        //Simple function to tell if a coord is a valid coord. Used with the getValidCoords function
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

            case 'pit':
                var thisNPC = NPCList[Object.keys(NPCList)[Math.floor(Math.random() * Object.keys(NPCList).length)]];
                map[locs[i][0]][locs[i][1]] = new Pit(locs[i][0], locs[i][1], thisNPC['charID'], thisNPC['charDisplay']);
                break;


            default:
                openAlert('UNKNOWN LOCATION TYPE!')
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
    else if(tier == 4){
      return itemList4;
    }
}
function tier_to_xp(tier){
    return 75 + tier * 25;
}
function tier_to_xp(tier){
    return 75 + tier * 25;
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
        enemies = [pillager, frostGiant, smallWyrm, DisOfMoranos, DarkKnight, CrimsonRider]
    }
    else if(tier == 4){
      enemies = [AncientWyrm, Moranos, Reaper, DreadPirate, DarkLord, smallWyrm, CrimsonRider];
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


    }
    else if(maxLocs == 2 || maxLocs == 3){
        var locationList = ['chest', 'pit'];

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
    if(Math.random() < .2 - activeNPCs.length/50 && !pitActive){
        poss_addedLocs.push('pit');
    }
    if(typeof maxLocs == 'undefined'){
        var num_added_locs = Math.ceil(Math.random() * 3);
    }
    else{
    var num_added_locs = Math.ceil(Math.random() * maxLocs);
}
    if(tier > 0){

    for(var i = 0; i < num_added_locs; i++){
        locToAdd = Math.floor(Math.random() * poss_addedLocs.length);
        added_locs.push(poss_addedLocs[locToAdd]);
        if(poss_addedLocs[locToAdd] == 'pit'){
          pitActive = true;
          console.log("pit is present");
        }
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

function tier_to_darkness(tier){
    return Math.floor(8 - (1.5*tier))
}
