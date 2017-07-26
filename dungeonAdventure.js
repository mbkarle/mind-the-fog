//------------------------------------------------------------------------------------------------
// This script should be the game runner. Other classes should live in the
// ./world_objects/ folder,although this script can have helper methods and global variables.
//------------------------------------------------------------------------------------------------

//------------------------------------------------------
//              Spinning up your world...
//------------------------------------------------------
//world dimensions
// var floorCleared = true;
// var world_width = 40;
// var world_height = 30;
var num_floors = 3;
// var num_rooms = 3;

//the game board itself!
// var world_map = new Array(world_height)
//
// for (var i = 0; i < world_height; i++) {
//   world_map[i] = new Array(world_width);
//   for(var j = 0; j < world_width; j++){
//       //populate it with Tile locations
//       world_map[i][j] = new Array(world_depth)
//       for(var f = 0; f < world_depth; f++){
//           //boundaries should be walls... aesthetic thing
//           if(i === 0 || j === 0 || i === world_height-1 || j === world_width - 1){
//               world_map[i][j][f] = new Wall(i,j);
//           }
//           else{
//               world_map[i][j][f] = new Tile(i,j);
//           }
//       }
//   }
// }


//------------------------------------------------------
//          Some magical game variables...
//------------------------------------------------------
//variables to track printed messages
var messageArray = [];
var messageCount = 0;

//variables of hero status
var canMove = true;
var hero_protected = false;
var ready = true;
var shielded;
var shieldReadyup;
var magicReady = true;

//------------------------------------------------------
//              Initialize Buffs and Debuffs
//------------------------------------------------------

var adrenaline = new Buff("adrenaline", null, 5000, ["strength", "dexterity"], [1, 1]);
var indestructible = new Buff("indestructibility", null, 10000, ["vitality", "maxVitality"], [20, 20]);
var fire = new damageDebuff("fire", null, 16000, 4000, 3);
var ice = new Debuff("frozen", null, 10000, ["dexterity"], [2]);


//------------------------------------------------------
//              Initialize Items
//------------------------------------------------------
itemList = [];
mobDrops = [];
//pass the itemList pointer to the [] to each Item class
//and if toList is true, it will be pushed to itemList
var heroShield = new Shields("the shield", "shield", null, null, 50, 2, false, "defendText", [itemList]);
var MasterSword = new Item("the master sword", "weapon", 25, 17, 30, false, null, [itemList]);
var startWeapon = new Item("rusty sword", "weapon", 0, 0, 0, false, null,[itemList]);
var IronHelm = new Item("iron helm", "headgear", null, -1, 10, true, null, [itemList]);
var katana = new Item("katana", "weapon", 1, 1, null, true, null, [itemList, mobDrops]);
var ritDagger = new effectItem("ritual dagger", "weapon", -2, 2, 5, [indestructible], [.2], [], [], true, null, [itemList]);
var thornArmor = new Item("armor of thorns", "armor", 1, -1, 5, true, null, [itemList]);
var chainMail = new Item("light chainmail", "armor", null, null, 5, true, null, [itemList, mobDrops]);
var GreatSword = new Item("greatsword", "weapon", 3, null, null, true, null, [[]]);
var vikHelm = new effectItem("viking helmet", "headgear", 1, -1, null, [adrenaline], [.3], [], [], true, null, [itemList, mobDrops]);
var cloakMor = new Item("cloak of Moranos", "armor", null, 2, -5, true, null, [mobDrops]);
var WarAxe =  new effectItem("war axe", "weapon", 1, 1, -5, [adrenaline], [.4], [], [], true, null, [mobDrops]);
var fireSword = new effectItem("blazing sword", "weapon", 2, 1, null, [], [], [fire], [.4], true, null, [[]]);
var hoodofOmar = new Item("leather hood", "headgear", null, 1, 3, true, null, [itemList, mobDrops]);
var ironMail = new Item("iron chainmail", "armor", null, -1, 15, true, null, [mobDrops]);
var enchantedSword = new effectItem("enchanted sword", "weapon", null, null, null, [adrenaline, indestructible], [.1, .1], [fire, ice], [.1, .1], true, null, [itemList, mobDrops]);
var mace = new Item("mace", "weapon", 2, -1, null, true, null, [itemList]);
var iceStaff = new effectItem("ice staff", "weapon", 1, null, null, [indestructible], [.1], [ice], [.3], true, null, [mobDrops]);

var gold = new Currency("gold", 1, null);

//------------------------------------------------------
//              Initialize Characters
//------------------------------------------------------
var hero = new Hero("The Hero", 5, 3, 20, "hero");
var Troglodyte = new Enemy("Troglodyte", 3, 2, 30, "enemy");
var DireRat = new Enemy("Dire Rat", 1, 15, 20, "enemy");
var DireRat2 = new Enemy("Dire Rat", 1.5, 15, 20, "enemy");
var Ogre = new Enemy("Ogre", 9, 1, 60, "enemy");
var Sorcerer = new Enemy("Sorcerer", 6, 4, 20, "enemy");
var Vagrant = new Enemy("Wandering Vagrant", 4, 4, 35, "enemy");
var HellHound = new Boss("Hell Hound", 4, 6, 45, "enemy", fireSword.items[0]);
var Golem = new Boss("Golem", 7, 3, 50, "enemy", GreatSword.items[0]);


//------------------------------------------------------
//        Initialize Treasures + other Locations
//------------------------------------------------------
// build_floor(curr_floor, null) //this will initialize the treasures and other locations

//inventory!!!!
var inventory = {
    weapon: startWeapon,
    headgear: null,
    armor: null,
    carried: [startWeapon]
}

startWeapon.equipped = true;
//------------------------------------------------------
//                  And we're off!!
//------------------------------------------------------

var room_list = []

//have an array of rooms per floor
for(var i = 0; i < num_floors; i++){
    room_list.push([])
}

room_list[0][0] = new SafeRoom('Great Hall', 'GreatHall', 0, 0)
room_list[1][0] = new FightRoom('First Floor', 'norm', 1, 1)
room_list[2][0] = new FightRoom('Second Floor', 'norm', 2, 2)

var curr_room = 0;
var curr_floor = 0;

//MOAR magic game variables
//variables to track the current position of hero
var avatarX = Math.floor(room_list[curr_floor][curr_room].room_width/8);
var avatarY = Math.floor(room_list[curr_floor][curr_room].room_height/2);


//get ready to start...
room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true; //place the hero in his starting position
// removeFog(avatarX,avatarY, world_map); //remove the fog around the hero

//LetsiGO!
window.addEventListener("keydown", move, false);
combat(hero, "default");



//================================================================
//                      HELPER FUNCTIONS
//================================================================

/*
function build_floor(floor_num, roomId){
    if(floor_num == 0){ //special first floor...
        //special locations
        //dungeon entrance!!

        //code for room switches
        // if(typeof roomId != "object"){
        //     if(roomId == "hall"){
        //         console.log('in the hall');
        //     }
        //     else if(roomId == "roomA"){
        //         console.log("in room A")
        //     }
        // }
        entranceLoc = [Math.floor(world_height/2), Math.floor(world_width*(7/8))]//rollLocation([[avatarY,avatarX]])

        var entrance = new DungeonEntrance(entranceLoc[0],entranceLoc[1])
        world_map[entrance.rowID][entrance.colID][floor_num] = entrance;

        gateKeepLoc = [Math.floor(world_height/2) + 3, Math.floor(world_width * (3/4))]

        var gateKeeper = new CharDialogue(gateKeepLoc[0], gateKeepLoc[1], "the gatekeeper");
        world_map[gateKeeper.rowID][gateKeeper.colID][floor_num] = gateKeeper;

        //after creating all special locations, turn fog off!
        //insert empty tiles and walls
        for(var i = 0; i < world_height; i++){
            for(var j = 0; j < world_width; j++){

                if(i === Math.floor(world_height/3) || i === Math.floor(world_height*(2/3))){
                    world_map[i][j][0] = new Wall(i,j);
                }

                else if(i <= Math.floor(world_height/3) || i >= Math.floor(world_height*(2/3))){
                    world_map[i][j][0] = new EmptyTile(i,j);
                }

                world_map[i][j][0].fog = false;

            }
        }

        //Doors
        // roomAdoorLoc = [Math.floor(world_height/3), Math.floor(world_width/4)];
        // var roomAdoor = new Door(roomAdoorLoc[0], roomAdoorLoc[1], "hall", "roomA");
        // world_map[roomAdoor.rowID][roomAdoor.colID][floor_num] = roomAdoor;
        // world_map[roomAdoor.rowID][roomAdoor.colID][floor_num].fog = false;

    }
    else{
        //treasures must go after the Items because we need to set an ID for the treasure inside!
        tChest1Loc = rollLocation([[avatarY,avatarX]])
        tChest2Loc = rollLocation([[avatarY,avatarX],tChest1Loc]);
        tChest3Loc = rollLocation([[avatarY,avatarX],tChest1Loc, tChest2Loc]);
        trapdoorLoc = rollLocation([[avatarY,avatarX],tChest1Loc, tChest2Loc, tChest3Loc]);
        StatueLoc = rollLocation([[avatarY,avatarX], tChest1Loc, tChest2Loc, tChest3Loc]);

        var TreasureChest = new Chest(tChest1Loc[0], tChest1Loc[1]);
        var TreasureChest2 = new Chest(tChest2Loc[0], tChest2Loc[1]);
        var TreasureChest3 = new Chest(tChest3Loc[0], tChest3Loc[1]);
        var treasures = [TreasureChest, TreasureChest2, TreasureChest3];

        TreasureChest.fillChest();
        TreasureChest2.fillChest();
        TreasureChest3.fillChest();


        //add your treasures!
        for(var i = 0; i < treasures.length; i++){
            world_map[treasures[i].rowID][treasures[i].colID][floor_num] = treasures[i];
        }

        //trapdoor!!
        var trapdoor = new Trapdoor(trapdoorLoc[0],trapdoorLoc[1])
        world_map[trapdoor.rowID][trapdoor.colID][floor_num] = trapdoor;

        //Golem Statue!!!
        var GolemStatue = new Statue(StatueLoc[0],StatueLoc[1]);
        world_map[GolemStatue.rowID][GolemStatue.colID][floor_num] = GolemStatue;

    }
}
*/

function combat(hero, opponents) { //opponents is either string "default" or enemy object
    if(typeof opponents != "string"){ //combat call is custom combat outside of default list
        enemy = [opponents]
        combat_helper(hero, enemy, 0, true);
    }
    if(curr_floor <= 1){
    enemies = [Troglodyte, DireRat, DireRat2, Sorcerer, Ogre];
}
    else if(curr_floor == 2){
        enemies = [Sorcerer, DireRat2, Vagrant, HellHound, Troglodyte];
    }
    if(opponents == "return"){
        for(i = 0; i < enemies.length; i++){
        if(!enemies[i].vitality <= 0){
            console.log(i);
        combat_helper(hero, enemies, i, false);
        break;
            }
        }
    }
    if(opponents == "default" && curr_floor > 1){
        for(i = 0; i < enemies.length; i++){ //scale enemies
            enemies[i].maxVitality += 5;
            enemies[i].vitality = enemies[i].maxVitality;
            enemies[i].strength += 1;
        }
        combat_helper(hero, enemies, 0, false);
    }
    window.onload = function() {
        combat_helper(hero, enemies, 0, false);
        buildMap(room_list[curr_floor][curr_room].room_map);

        //Inventory can now be opened either by clicking InvOpen button or pressing I
        //not sure where else to initialize this
        document.getElementById("InvOpen").onclick = function() {
            $("#info-module").toggle(100);
            refreshInfo();
        }

    };
}

/*
function rollLocation(locs){
    //locs is a 2D array of locations not to be placed on...
    //locs[0] is a 2 element array (row / col)
    var loc = [-1,-1];
    found = false;
    while(!found){
        loc = [Math.floor((world_height-2)*Math.random())+1, Math.floor((world_width-2)*Math.random())+1] //new random location
        passed = true;
        for(var i = 0; i < locs.length; i++){ //check it really is unique as per 8 rooks problem
            if(locs[i].indexOf(loc[0]) >= 0 || locs[i].indexOf(loc[1]) >= 0){ //if row or col not unique...
                passed = false;
                break;
            }
        }
        if(passed){
            found = true;
        }
    }
    return loc;
} */

function removeFog(avX, avY, map){
    neigh = getValidNeighbors(avX,avY,map,1);
    for(var i = 0; i < neigh.length; i++){
        neigh[i].fog = false;
    }
}

function getValidNeighbors(avX, avY, map, flashlight){
    neigh = [];
    if(avX > 0){neigh.push(map[avY][avX-1]);} //left
    if(avX < room_list[curr_floor][curr_room].room_width-1){neigh.push(map[avY][avX+1]);} //right
    if(avY > 0){neigh.push(map[avY-1][avX]);} //up
    if(avY < room_list[curr_floor][curr_room].room_height-1){neigh.push(map[avY+1][avX]);} //down
    if(avX > 0 && avY > 0){neigh.push(map[avY-1][avX-1]);} //top left corner
    if(avX > 0 && avY < room_list[curr_floor][curr_room].room_height-1){neigh.push(map[avY+1][avX-1]);} //bot left corner
    if(avX < room_list[curr_floor][curr_room].room_width-1 && avY > 0){neigh.push(map[avY-1][avX+1]);} //top right corner
    if(avX < room_list[curr_floor][curr_room].room_width-1 && avY < room_list[curr_floor][curr_room].room_height-1){neigh.push(map[avY+1][avX+1]);} //bot right corner

    if(flashlight > 0){ //radius increases...
        possCoords = []
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
        //5 on right
        // possCoords.push([avX+3,avY+2]);
        possCoords.push([avX+3,avY+1]);
        possCoords.push([avX+3,avY]);
        possCoords.push([avX+3,avY-1]);
        // possCoords.push([avX+3,avY-2]);

        //5 on left
        // possCoords.push([avX-3,avY+2]);
        possCoords.push([avX-3,avY+1]);
        possCoords.push([avX-3,avY]);
        possCoords.push([avX-3,avY-1]);
        // possCoords.push([avX-3,avY-2]);

        //5 on top
        // possCoords.push([avX-2,avY+3]);
        possCoords.push([avX-1,avY+3]);
        possCoords.push([avX,avY+3]);
        possCoords.push([avX+1,avY+3]);
        // possCoords.push([avX+2,avY+3]);

        //5 on bottom
        // possCoords.push([avX-2,avY-3]);
        possCoords.push([avX-1,avY-3]);
        possCoords.push([avX,avY-3]);
        possCoords.push([avX+1,avY-3]);
        // possCoords.push([avX+2,avY-3]);

        for(var i = 0; i < possCoords.length; i++){
            cx = possCoords[i][0];
            cy = possCoords[i][1];
            if(isValidCoord(cx,cy)){
                neigh.push(map[cy][cx]);
            }
        }
    }
    return neigh;
}

function isValidCoord(avX, avY){
    return (avX >= 0 && avY >= 0 && avX < room_list[curr_floor][curr_room].room_width && avY < room_list[curr_floor][curr_room].room_height);
}

// function Dex(Character){
//   return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
// }

function move(e) {
    if (canMove == true) {
        var didMove = false;
        if (e.keyCode == "87" && avatarY > 0) { //up
            if(room_list[curr_floor][curr_room].room_map[avatarY-1][avatarX].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarY --;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }

        } else if (e.keyCode == "83" && avatarY < room_list[curr_floor][curr_room].room_height-1) { //down
            if(room_list[curr_floor][curr_room].room_map[avatarY+1][avatarX].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarY ++;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "65" && avatarX > 0) { //left
            if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX-1].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarX --;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "68" && avatarX < room_list[curr_floor][curr_room].room_width-1) { //right
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

            //remove fog
            for(var i = 0; i < room_list[curr_floor][curr_room].room_height; i ++){
                for(var j = 0; j < room_list[curr_floor][curr_room].room_width; j++){
                    room_list[curr_floor][curr_room].room_map[i][j].fog = false;
                }
            }
        }
        buildMap(room_list[curr_floor][curr_room].room_map);


        //chance to enter combat
        if (Math.random() < room_list[curr_floor][curr_room].fightChance  && !room_list[curr_floor][curr_room].roomCleared && didMove) {
            $("#text-module").show();
            canMove = false;
        } else {
            canMove = true;
        }
        if(hero.vitality + 2 <= hero.maxVitality && didMove) {
            hero.vitality += 2;
            document.getElementById("hero").innerHTML = hero.vitality;
            refreshInfo();
        } else if(hero.vitality + 1 <= hero.maxVitality && didMove){
          hero.vitality += 1;
          refreshInfo();
        }

        //check if on a chest
        if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === "treasure" && !room_list[curr_floor][curr_room].room_map[avatarY][avatarX].emptied_chest){ //if both coords of same chest and its a match
            $("#text-module").show();
            $("#enter").hide();
            $("#open").show();
            canMove = false;
            msg = print("message", room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message);
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message = "the chest lays smashed by your blade, its treasures still there."
            openChest(true);
        };

        //check if on the trapdoor
        if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'trapdoor' || room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'entrance'){
            $("#text-module").show();
            $("#enter").hide();
            $("#stay").show();

            canMove = false;
            msg = print("message", room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message);

            if(room_list[curr_floor][curr_room].roomCleared){
                $("#descend").show();
                $("#descend").click(
                    function() {
                        console.log("Enter new floor")
                        descend(true)
                    }
                )
            }

            $("#stay").click(
                function() {
                    console.log("Stay on this floor")
                    descend(false)
                }
            )
        }

        //check if on statue
        if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'statue' && !room_list[curr_floor][curr_room].room_map[avatarY][avatarX].destroyed_statue){
            $("#text-module").show();
            $("#enter").hide();
            //using descend buttons for position and convenience
            $("#descend").show();
            $("#stay").show();

            canMove = false;
            msg = print("message", room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message);
            document.getElementById("descend").innerHTML = "Take Sword";
            document.getElementById("stay").innerHTML = "Leave";

            $("#descend").click(
                function() {
                    statue_fight(false);
                    canMove = false;
                    print("message", "The statue springs to life and raises its sword. There's no escape!");
                    $("#text-module").show();
                    combat(hero, Golem);
                    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].destroyed_statue = true;
                }
            )
            $("#stay").click(
                function() {
                    statue_fight(false);
                }
            )
        }
        if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'charDialogue'){
            if(didMove){
            canMove = false}
            //character dialogue arrays
            var gateKeeperDialogue = ["Greetings, wanderer.",
            "Before you lies the dungeon. It is rife with danger but filled with opportunity.",
            "You may find great fortune within, but be careful. While your blade will provide the means to smite your enemies, " +
            "it may be necessary to take shelter behind your shield to recover when you suffer their reprisals.",
            "Good fortune to you, adventurer."
        ]
            if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].charId === "the gatekeeper" && didMove){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].dialogue(gateKeeperDialogue, 0);
            }

        }
        if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'door'){
            if(didMove){
                canMove = false;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].nextRoom();
            }

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
            curr_floor++; //TODO can leave the last floor....
            // curr_room++;
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
            buildMap(room_list[curr_floor][curr_room].room_map);
            combat(hero, "default");
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

function statue_fight(fight){
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
    document.getElementById("descend").innerHTML = "Descend"
    document.getElementById("stay").innerHTML = "Stay"
}

function refreshInfo() {
    // updates info box
    var healthFraction = hero.vitality/hero.maxVitality;
    var shieldHealthFraction = heroShield.vitality/heroShield.maxVitality;
    hero.levelCheck();
    var xpFraction = (hero.xp - hero.level * 1000) / 1000

    document.getElementById("characterInfo").innerHTML = "Health: <br><div id='healthBar' class='statusBar'>" +
    hero.vitality + " / " + hero.maxVitality +
    "<div id='healthSlider' class='statusSlider'></div></div><br><br><hr style='width: 80%'><br>" +
    "Shield Health: <br><div id='shieldHealthBar' class='statusBar'>" +
    heroShield.vitality + " / " + heroShield.maxVitality +
    "<div id='shieldHealthSlider' class='statusSlider'></div></div><br>";

    document.getElementById('xp').innerHTML = "<div id='xpBar' class='statusBar' style='width: 60px'>Level: " +
    hero.level + "<div id='xpSlider' class='statusSlider'></div></div>"

    document.getElementById('gold').innerHTML = hero.wallet + " gold"

    document.getElementById("healthSlider").style.width = 180 * healthFraction + "px";
    document.getElementById("shieldHealthSlider").style.width = 180 * shieldHealthFraction + "px";
    document.getElementById("xpSlider").style.width = 60 * xpFraction + "px";

    var inventoryMessage = "Equipped: <br><br>"
    for(attribute in inventory){
        if(inventory[attribute] != null && attribute !== 'carried'){
            inventoryMessage += attribute + ": " + inventory[attribute].name + "<br><br>";
        }
    }
    inventoryMessage += "<hr style='width: 80%'> Carried: <br><br>"
    items_carried = inventory['carried'];
    for(var i = 0; i < items_carried.length; i++){
        if (items_carried[i].equipped){
            inventoryMessage += "<div class='invCarry' id='invInfo" + i + "'>" + items_carried[i].name + "<div id='carried" + i + "' class='interact' style='display:none;'> Equip </div></div> <br><br>"; //style='top: " + (25 + takeID*25) + "px;'>
        }
        else{
            inventoryMessage += "<div class='invCarry' id='invInfo" + i + "'>" + items_carried[i].name +
            "<div id='carried" + i + "' class='interact'> Equip </div><div id='invDrop" + i + "' class='interact small'>x</div></div> <br><br>"; //style='top: " + (25 + takeID*25) + "px;'>
        }
    }
    document.getElementById("inventory").innerHTML = inventoryMessage;

    itemInfos = []
    for(var i = 0; i < items_carried.length; i++){
        //store all the item infos to be displayed upon hover...
        itemInfos.push((items_carried[i].name + "<br>"))
        for (attribute in items_carried[i]) {
            if (typeof items_carried[i][attribute] == "number") {
                itemInfos[i] += attribute + ": +" + items_carried[i][attribute] + "<br>";
            }
        }
        if(items_carried[i].constructor.name == 'effectItem'){

            for(var j = 0; j < items_carried[i].buffArray.length; j++){

                itemInfos[i] += "buffs: " + items_carried[i].buffArray[j].name + "<br>";
            }
            for(var k = 0; k < items_carried[i].debuffArray.length; k++){
                itemInfos[i] += "debuffs: " + items_carried[i].debuffArray[k].name + "<br>";
            }
        }
    }

    //set equip listeners to inventory
    for(var i = 0; i < items_carried.length; i++){
        carriedID = '#carried' + i;
        invCarID = '#invInfo' + i;
        dropID = "#invDrop" + i;
        var item_to_print =  (' ' + itemInfos[i]).slice(1)
        $(dropID).off('click');
        $(carriedID).off('click') //turn old click listeners off
        $(carriedID).attr('inv_idx', i)
        $(dropID).attr('drop_idx', i);
        $(invCarID).attr('item_to_print', item_to_print)
        $(carriedID).click(function(){
            equip(hero,items_carried[$(this).attr('inv_idx')])
            refreshInfo()
        })
        $(dropID).click(function(){
          console.log($(this).attr('drop_idx'));
          items_carried.splice($(this).attr('drop_idx'), 1);
          refreshInfo();
        })
        $(invCarID).mouseenter(function(){
            document.getElementById("inv_hoverInfo").innerHTML = $(this).attr('item_to_print');
            $("#inv_hoverInfo").show();
        })
        $(invCarID).mouseleave(function(){
            $("#inv_hoverInfo").hide();
        })
    }
    //magic tree:
    document.getElementById("tree-module").innerHTML = "insert skill tree here"

    //refresh for combat-module:
    document.getElementById("hero").innerHTML = hero.vitality;
    document.getElementById("defendText").innerHTML = "Shield: " + heroShield.vitality;
}

function Damage(source_character, target_character) {
    hit = Math.floor(Math.random() * source_character.strength + source_character.strength);
    target_character.vitality -= hit;
    //document.getElementById(source_character.objid).innerHTML = source_character.vitality;
    document.getElementById(target_character.objid).innerHTML = target_character.vitality /*+ target_character.name */ ;
    document.getElementById("hero").innerHTML = hero.vitality;
    document.getElementById("defendText").innerHTML = "Shield: " + heroShield.vitality;
    refreshInfo();
    if(target_character.vitality <= 0){
    $("#combat-module").trigger('click');
}
    return hit;
}

function Shield() {
    if(hero.vitality + heroShield.healthBoost <= hero.maxVitality){
    hero.vitality += heroShield.healthBoost;
}
    else if(hero.vitality + heroShield.healthBoost > hero.maxVitality && hero.vitality < hero.maxVitality){
      hero.vitality = hero.maxVitality;
    }
    refreshInfo();
    document.getElementById("hero").innerHTML = hero.vitality;
    hero_protected = true;
}

function readyUp() {
    ready = true;
    return ready;
}

function openChest(stage) {
    $("#open").click(
        function() {
            treasureIDs = room_list[curr_floor][curr_room].room_map[avatarY][avatarX].treasureIDs;
            gold.amount = Math.floor(Math.random() * 50) * 10;
            // console.log(treasureIDs)
            if (stage) {
                items_in_chest = []
                for(var i = 0; i < treasureIDs.length; i++){
                    if(typeof treasureIDs[i] == 'number'){
                    items_in_chest.push(itemList[treasureIDs[i]])
                } else {
                    items_in_chest.push(treasureIDs[i]);
                }
                }

                print('item', items_in_chest) //handles HTML
                drop_items(items_in_chest) //handles take clicks, etc
                stage = !stage;

            } else {
                // $("#equip").hide();
                // $("#equip").off("click");
                for(var i = 0; i < treasureIDs.length; i++){
                    takeID = "#take"+i
                    $(takeID).hide();
                    $(takeID).off("click")
                }
                $("#open").hide();
                $("#open").off("click")
                $("#enter").show();
                $("#text-module").hide();
                canMove = true;
                print("lastMessage", "enemy-message");
                return;
            }
        });
}


function take_item(item){
    if(item.constructor.name == 'Currency'){
        item.walletCheck();
        equip(hero, item);
        item.wallet = null;
    }
    else{
    inventory.carried.push(item)
}
    refreshInfo();
    if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === "treasure"){ //not applicable for mobdrops
        var indexToRemove = room_list[curr_floor][curr_room].room_map[avatarY][avatarX].treasureIDs.indexOf(item);
        room_list[curr_floor][curr_room].room_map[avatarY][avatarX].treasureIDs.splice(indexToRemove, 1); //removes item from treasureIDs so that it will not appear on next visit of chest
    }
}


function drop_items(items){
    console.log(items)
    console.log(items.length)
    var itemsTaken = 0;
    for(var i = 0; i < items.length; i++){
        takeID = '#take'+i
        item = $().extend(true, {}, items[i])
        $(takeID).attr('item_id', i)
        $(takeID).click(
            function() {
                if(inventory['carried'].length < 10){
                itemsTaken ++;
                if(itemsTaken == items.length){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].emptied_chest = true;
            }
                item_to_take = items[$(this).attr('item_id')];
                // equip(hero, item_to_take);
                take_item(item_to_take)
                $(this).hide();
            } else {
                alert("Your inventory is full");
            }

          }
        )
    }
}

/*message is either:
* a number for damage
* a key for messageArray
* an item object
* a string thats actually a message
* TODO: clean this up... functions within classes?
*/
function print(messageType, message) { //TODO: change so that multiple items can appear in chests: sub-divs inside textbox, etc.
    $(".itemInfo").off('mouseenter').off('mouseleave');
    if (messageType == "damageDealt") {
        document.getElementById("textBox").innerHTML = "You strike for " + message + " damage!"
        messageArray.push([messageType, "You strike for " + message + " damage!"])
    }
    else if (messageType == "lastMessage") {
        //guide: to use lastMessage, pass the desired messageType as your message
        var prevMessage = "";
        for(i = messageArray.length - 1; i >= 0; i--){
            if(messageArray[i][0] == message){
                prevMessage += messageArray[i][1];
                break;
            }
        }
        document.getElementById("textBox").innerHTML = prevMessage;
        messageArray.push([message, prevMessage]); //was messageType, prevMessage-- want to push that its an enemy-message, not a 'lastMessage', right?
    }
    else if (messageType == "item") {
        //ASSUMED: passed an array of items
        items = message;
        var itemMessage = "You find: <br>"
        var itemInfos = []
        for(var i = 0; i < items.length; i++){
            //store all the item infos to be displayed upon hover...
            itemInfos.push((items[i].name + "<br>"))
            for (attribute in items[i]) {
                if (typeof items[i][attribute] == "number") {
                    itemInfos[i] += attribute + ": +" + items[i][attribute] + "<br>";
                }
            }
            if(items[i].constructor.name == 'effectItem'){

                for(var j = 0; j < items[i].buffArray.length; j++){

                    itemInfos[i] += "buffs: " + items[i].buffArray[j].name + "<br>";
                }
                for(var k = 0; k < items[i].debuffArray.length; k++){
                    itemInfos[i] += "debuffs: " + items[i].debuffArray[k].name + "<br>";
                }
            }
            //build the html to print to the textBox
            itemMessage += "<div class='itemInfo' id='itemInfo" + i + "'>" + items[i].name + "<div id='take" + i + "' class='interact'> Take </div></div>"; //style='top: " + (25 + takeID*25) + "px;'>

        }
        console.log(itemInfos)
        document.getElementById("textBox").innerHTML = itemMessage;

        //need mouse listeners after itemMessage printed...
        for(var i = 0; i < items.length; i++){
            var item_to_print =  (' ' + itemInfos[i]).slice(1)
            var id = '#itemInfo'+i;
            $(id).attr('item_to_print', item_to_print)
            $(id).mouseenter(function(){
                document.getElementById("hoverInfo").innerHTML = $(this).attr('item_to_print');
                $("#hoverInfo").show();
            })
            $(id).mouseleave(function(){
                $("#hoverInfo").hide();
            })

        }

        messageCount--; //NEED TO DECREMENT BC ITEM NOT PUSHED
    }
    else {
        document.getElementById("textBox").innerHTML = message;
        messageArray.push([messageType, message]);
    }
    messageCount++
    //console.log(messageArray.toString());
    return messageArray[messageCount-1][1];
}

function buildMap(array) {
    var worldContents = "";
    removeFog(avatarX,avatarY,room_list[curr_floor][curr_room].room_map);
    for (var i = 0; i < array.length; i++) {
        for(var j = 0; j < array[0].length; j++){
            symbol = array[i][j].symbol;
            if(array[i][j].fog){
                symbol = '';
            }
            if(array[i][j].hero_present){
                symbol = 'x';
            }
            worldContents += "<div id='" + array[i][j].objid + "' style='top:" + array[i][j].yCoord + "px; left:" + array[i][j].xCoord + "px; position: absolute;'>" + symbol + "</div>";

        }
    }
    document.getElementById("worldContent").innerHTML = worldContents;
}

function equip(target, equipment) {
    // console.log(target.name + " equipped " + equipment.name);
    equipment.equipped = true;
    if(inventory[equipment.type] != null && equipment.constructor.name != "Currency"){
        temp_item = inventory[equipment.type];
        Unequip(hero, temp_item);
    }
    if(equipment.constructor.name != "Currency"){
    inventory[equipment.type] = equipment;
}

    //go through and update stats
    var attribute;
    for (attribute in equipment) {
        if (typeof equipment[attribute] == "number") {
            target[attribute] += equipment[attribute];
        }
    }
    if(target.dexterity <= 0){ //no dividing by 0 !!
        target.dexterity = 0.5;
    }
    refreshInfo();
}
function Unequip(target, equipment) {
    // console.log(target.name + " unequipped " + equipment.name) // finish inventory

    //go through and update stats
    equipment.equipped = false;
    var attribute;
    for (attribute in equipment) {
        if (typeof equipment[attribute] == "number") {
            target[attribute] -= equipment[attribute];
        }
    }
}



function combat_helper(hero, enemyList, idx, customCombat) { //TODO GLOBAL VARIABLES
    var enemyAttack; //not used outside this function = NOT GLOBAL, SIR!
    //heroShield.vitality = heroShield.maxVitality;
    if (hero.vitality <= 0) {
        return;
    }
    if(customCombat == false){
    print("enemy-message", "A fearsome " + enemyList[idx].name + " emerges from the shadows!")
    enemyList[idx].lootId = Math.floor(Math.random() * mobDrops.length);
}
    document.getElementById("enter").onclick = function() {
        $("#text-module").animate({
            top: '300px'
        }, 500);
        $("#combat-module").show(500);
        $("#enter").hide();
        $("#worldMap").hide();
        enemyAttack = setInterval(function() {
            if (hero_protected == true) {
                Damage(enemyList[idx], heroShield)
            } else {
                Damage(enemyList[idx], hero)
                print("combat start", "The enemy strikes!");
            }
            if (hero.vitality <= 0) {
                print("message", "You died!");
                hero.vitality = 0;
                refreshInfo();
                $("#combat-module").hide(1000);
                window.clearInterval(enemyAttack);
            }
            if (heroShield.vitality <= 0) {
                window.clearInterval(shielded);
                hero_protected = false;
                heroShield.shieldReady();
                //jquery animation:
                $("#defendSlider").hide('fast');
            }
        }, 10000 / enemyList[idx].dexterity);
    }

    document.getElementById("hero").innerHTML = hero.vitality;
    document.getElementById("enemy").innerHTML = enemyList[idx].vitality;
    document.getElementById("defendText").innerHTML = "Shield: " + heroShield.vitality;
    refreshInfo();

    document.getElementById("attack").onclick = function() {
        if (ready) {
            ready = false;
            window.setTimeout(readyUp, 10000 / hero.dexterity);
            if(inventory.weapon.constructor.name == 'effectItem'){
                console.log("buffing up")
                inventory.weapon.buffUp(hero);
                inventory.weapon.debuffUp(enemyList[idx]);
            }
            if(inventory.armor != null){
                if(inventory.armor.constructor.name == 'effectItem'){
                inventory.armor.buffUp(hero);
                inventory.armor.debuffUp(enemyList[idx]);
            }}
            if(inventory.headgear != null){
            if(inventory.headgear.constructor.name == 'effectItem'){
                inventory.headgear.buffUp(hero);
                inventory.headgear.debuffUp(enemyList[idx]);
            }}
            hitprint = Damage(hero, enemyList[idx]);
            print("damageDealt", hitprint);
            //jquery animations:
            $("#attackSlider").show();
            $("#attackSlider").animate({
                width: '0px'
            }, 8000 / hero.dexterity, function() {
                $("#attackSlider").hide();
                $("#attackSlider").animate({
                    width: '110px'
                }, 1);
            });
        }
    };


        document.getElementById("defend").onclick = function() {
          if (hero_protected == false && heroShield.vitality > 0) {
        //  $("#defend").off('click');
          $("#defendSlider").show(4000);
            shieldReadyup = setTimeout(function(){
              heroShield.shield_ready = false;}, 4000);
            //    console.log("shield clicked")
                if(heroShield.shield_ready){
                  heroShield.shield_ready = false;
            shielded = setInterval(function() {
             // console.log("shielding");
                Shield()
            }, 4000);}


        }
    }


    // var enemyAttack = setInterval(function() {print("combat start", "The enemy strikes!"); if(protected == true){Damage(enemyList[idx], heroShield)} else{Damage(enemyList[idx], hero)}}, 10000 / enemyList[idx].dexterity);
    document.getElementById('combat-module').onclick = function() {
    //    console.log("hero_protected: " + hero_protected);
    //    console.log("heroShield.shield_ready: " + heroShield.shield_ready);
        if (heroShield.shield_ready == false && hero_protected == true || heroShield.vitality <= 0) {
        //    console.log("turning off shield");
            window.clearInterval(shielded);
            heroShield.shieldReady();
            hero_protected = false;
            //jquery animation:
            $("#defendSlider").hide('fast');
        }
        if (enemyList[idx].vitality <= 0) {
            enemyList[idx].vitality = 0;
            hero.xp += 100;
            window.clearInterval(enemyAttack);

            // issue 5 stated that shield was giving health after combat. I am having a hard time encountering this problem but this redundancy will hopefully guarantee that it will not occur
            window.clearInterval(shielded);
            hero_protected = false;
            heroShield.shieldReady();
        //    console.log("hero_protected should now be false and heroShield.shield_ready true");
    //        console.log("hero_protected: " + hero_protected);
        //    console.log("heroShield.shield_ready: " + heroShield.shield_ready);
                        $("#defendSlider").hide('fast');

            $("#combat-module").hide(1000);
            $("#text-module").animate({
                top: "100px"
                // left: "20px"
            }, 1000);
            print("message", "You've defeated the beast!");
            $("#combat-module").off('click');
            var dropChance = Math.random();
            if(!customCombat && dropChance > 0.75){
                console.log(dropChance);
                $("#open").show();
                $("#open").click(
                    function() {
                        // console.log("clicked open")
                        print("item", [mobDrops[enemyList[idx].lootId]]);
                        drop_items([mobDrops[enemyList[idx].lootId]])
                        // console.log(mobDrops[enemyList[idx].lootId]);
                        $("#open").hide();
                        // $("#equip").show();
                        // $("#equip").click(
                        //     function(){
                        //         equip(hero, mobDrops[enemyList[idx].lootId]);
                        //         $("#equip").hide().off('click');
                        //     })
                        $("#open").off('click');
                    }
            );}
            else if(customCombat || enemyList[idx].constructor.name == "Boss"){
            hero.xp += 100;
              $("#open").show();
              $("#open").click(
                function(){
                  console.log(enemyList[idx]);
                  print("item", [enemyList[idx].loot]);
                  $("#open").hide();
                //   $("#equip").show();
                //   $("#equip").click(
                //     function(){
                //       equip(hero, enemyList[idx].loot);
                //       $("#equip").hide().off('click');
                //     }
                //   )
                drop_items([enemyList[idx].loot])
                $("#open").off('click');
              }
              )
            }
            if (idx < enemyList.length - 1 || customCombat == true) {
                console.log("moving on");
                document.getElementById("enter").innerHTML = "––>";
                $("#enter").show();
                document.getElementById("enter").onclick = function() {
            //        console.log("hero_protected: " + hero_protected);
            //        console.log("heroShield.shield_ready: " + heroShield.shield_ready);
                    canMove = true;
                    // $("#combat-module").hide(500);
                    // $("#text-module").animate({
                    //   top: "100px",
                    //   left: "20px"
                    // }, 500).hide();
                    $("#equip").hide();
                    $("#text-module").hide();
                    $("#worldMap").show();
                    document.getElementById("enter").innerHTML = "Engage";
                    if(customCombat == false){
                    idx++;
                    combat_helper(hero, enemyList, idx, false);}
                    else{
                        combat(hero, "return");
                        return;
                    }
                }}

                else {
                    console.log("floor cleared!")
                    refreshInfo();
                    print("message", "The fog clears, and looking around there seemed to be no more monsters... A hole in the floor seems to be the only way out of this hellish place.");
                    room_list[curr_floor][curr_room].roomCleared = true;
                    $("#open").show()
                    $("#open").click(
                        function(){
                            canMove = true;
                            document.getElementById("enter").innerHTML = "Engage";
                            $("#open").hide();
                            $("#text-module").hide();
                            $("#worldMap").show();
                            $("#open").off("click");
                        })
                        for(var i = 0; i < room_list[curr_floor][curr_room].room_height; i ++){
                            for(var j = 0; j < room_list[curr_floor][curr_room].room_width; j++){
                                room_list[curr_floor][curr_room].room_map[i][j].fog = false;
                            }
                        }
                        buildMap(room_list[curr_floor][curr_room].room_map);
                }
            }
        }

}
