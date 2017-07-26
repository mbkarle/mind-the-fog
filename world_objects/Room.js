//This is the class for a room, designed to fix #35 and #31.
/*A room should have:
* A list of enemies associated (enemies that could be encountered)
* The number of enemy encounters before the boss
* The special locations for the room
* The boss, if applicable
*/
class Room {
    constructor(name, room_type, tier, roomCleared, boss, fightChance) {
        this.name = name;
        this.locations = tier_to_locations(tier);
        this.itemList = tier_to_items(tier);
        this.room_type = room_type;
        this.roomCleared = roomCleared;
        this.enemy_list = tier_to_enemies(tier);
        this.num_enemies = tier_to_num_enemies(tier);
        this.boss = boss;
        this.fightChance = fightChance;

        //must set before entering the room--position for avatar to spawn on,
        //must be in bounds.
        this.room_entry = [-1,-1]

        this.room_map = this.buildRoom(room_type, this.locations)

        this.room_width = this.room_map[0].length;
        this.room_height = this.room_map.length;


    }

    buildRoom(type, locations){
        var map;
        var width;
        var height;
        switch (type) {
            // case 'Big':
            //
            //     break;
            //
            // case 'HorizHall':
            //
            //     break;

            case 'GreatHall':
                width = 40;
                height = 12;

                map = buildRoomOfSize(height,width);

                var entrance = new DungeonEntrance(6,35)
                map[entrance.rowID][entrance.colID] = entrance;

                var gateKeeper = new CharDialogue(9, 30, "the gatekeeper");
                map[gateKeeper.rowID][gateKeeper.colID] = gateKeeper;

                //after creating all special locations, turn fog off!
                clearAllFog(map);
                break;


            default:
                width = 40;
                height = 30;
                map = buildRoomOfSize(height,width);

                locs = rollLocations(locations.length, height, width) //locs of locations

                for(var i = 0; i < locations.length; i++){
                    switch (locations[i]) {
                        case 'chest':
                            map[locs[i][0]][locs[i][1]] = new Chest(locs[i][0],locs[i][1])
                            break;

                        case 'trapdoor':
                            map[locs[i][0]][locs[i][1]] = new Trapdoor(locs[i][0],locs[i][1])
                            break;
                        case 'statue':
                            map[locs[i][0]][locs[i][1]] = new Statue(locs[i][0],locs[i][1])
                            break;

                        default:
                            alert('UNKNOWN LOCATION TYPE!')
                    }
                }
                //end switch on room type
        }
        return map;
    }
}

class SafeRoom extends Room {
    constructor(name, room_type, tier) {
        super(name, room_type, tier, true, null, 0)
    }
}

class FightRoom extends Room {
    constructor(name, room_type, tier, boss) {
        super(name, room_type, tier, false, boss, tier_to_fightChance(tier))
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
            console.log('loop')
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

function tier_to_items(tier){
    //TODO: create mapping
    return [IronHelm, katana, chainMail]
}

function tier_to_enemies(tier){
    //TODO: create mapping
    if( tier == 1 ){
        return [Troglodyte];
    }
    else {
        return [DireRat];
    }

}

function tier_to_locations(tier){
    //TODO: create mapping
    return ['chest', 'statue', 'chest', 'trapdoor']
}

function tier_to_fightChance(tier){
    //TODO: create mapping
    return .05;
}
