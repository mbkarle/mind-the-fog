//------------------------------------------------------------------------------------------------
// This script should be the game runner. Other classes should live in the
// ./world_objects/ folder,although this script can have helper methods and global variables.
//------------------------------------------------------------------------------------------------

//------------------------------------------------------
//          Some magical game variables...
//------------------------------------------------------
//variables to track the current position of hero
var avatarX = 20; //TODO rename!
var avatarY = 15;

//variables to track printed messages
var messageArray = [];
var messageCount = 0;

//variables of hero status
var canMove = true;
var hero_protected = false;
var ready = true;
var shielded;

//------------------------------------------------------
//              Spinning up your world...
//------------------------------------------------------
//world dimensions
var floorCleared = false;
var world_width = 40;
var world_height = 30;

//the game board itself!
var world_map = new Array(world_height)

//populate it with Tile locations
for (var i = 0; i < world_height; i++) {
  world_map[i] = new Array(world_width);
  for(var j = 0; j < world_width; j++){
      world_map[i][j] = new Tile(i,j);
  }
};

//------------------------------------------------------
//              Initialize Characters
//------------------------------------------------------
var Hero = new Character("The Hero", 5, 3, 20, "hero");
var Troglodyte = new Character("Troglodyte", 3, 2, 30, "enemy");
var DireRat = new Character("Dire Rat", 1, 15, 20, "enemy");
var DireRat2 = new Character("Dire Rat", 1.5, 15, 20, "enemy");
var Ogre = new Character("Ogre", 9, 1, 60, "enemy");
var Sorcerer = new Character("Sorcerer", 6, 4, 20, "enemy");

//------------------------------------------------------
//              Initialize Items
//------------------------------------------------------
itemList = []
//pass the itemList pointer to the [] to each Item class
//and if toList is true, it will be pushed to itemList
var HeroShield = new Item("the shield", "shield", null, null, 20, false, "defendText", itemList);
var MasterSword = new Item("the master sword", "weapon", 25, 17, 30, false, null, itemList);
var startWeapon = new Item("rusty sword", "weapon", 0, 0, 0, false, null, itemList);
var IronHelm = new Item("iron helm", "headgear", null, -1, 10, true, null, itemList);
var katana = new Item("katana", "weapon", 1, 1, null, true, null, itemList);
var ritDagger = new Item("ritual dagger", "weapon", -2, 2, 5, true, null, itemList);
var thornArmor = new Item("armor of thorns", "armor", 1, -1, 5, true, null, itemList);

//------------------------------------------------------
//        Initialize Treasures + other Locations
//------------------------------------------------------
//treasures must go after the Items because we need to set an ID for the treasure inside!
tChest1Loc = rollLocation([[avatarY,avatarX]])
tChest2Loc = rollLocation([[avatarY,avatarX],tChest1Loc]);
tChest3Loc = rollLocation([[avatarY,avatarX],tChest1Loc, tChest2Loc]);
trapdoorLoc = rollLocation([[avatarY,avatarX],tChest1Loc, tChest2Loc, tChest3Loc]);

var TreasureChest = new Chest(tChest1Loc[0], tChest1Loc[1]);
var TreasureChest2 = new Chest(tChest2Loc[0], tChest2Loc[1]);
var TreasureChest3 = new Chest(tChest3Loc[0], tChest3Loc[1]);
var treasures = [TreasureChest, TreasureChest2, TreasureChest3];

TreasureChest.treasureID = Math.floor(itemList.length * Math.random());
TreasureChest2.treasureID = Math.floor(itemList.length * Math.random());
TreasureChest3.treasureID = Math.floor(itemList.length * Math.random());

//add your treasures!
for(var i = 0; i < treasures.length; i++){
    world_map[treasures[i].rowID][treasures[i].colID] = treasures[i];
}

//trapdoor!!
var trapdoor = new Trapdoor(trapdoorLoc[0],trapdoorLoc[1])
world_map[trapdoor.rowID][trapdoor.colID] = trapdoor;

var inventory = {
    weapon: startWeapon,
    headgear: null,
    armor: null
}
//------------------------------------------------------
//                  And we're off!!
//------------------------------------------------------
//get ready to start...
world_map[avatarY][avatarX].hero_present = true; //place the hero in his starting position
removeFog(avatarX,avatarY, world_map); //remove the fog around the hero

//LetsiGO!
window.addEventListener("keydown", move, false);
combat(Hero);




//================================================================
//                      HELPER FUNCTIONS
//================================================================

function combat(hero) { //take in enemy list
    enemies = [Troglodyte, DireRat, DireRat2, Sorcerer, Ogre]; //was previously "globalEnemies"
    window.onload = function() {
        combat_helper(hero, enemies, 0);
        buildMap(world_map);
    };
}

function rollLocation(locs){
    //locs is a 2D array of locations not to be placed on...
    //locs[0] is a 2 element array (row / col)
    var loc = [-1,-1];
    found = false;
    while(!found){
        loc = [Math.floor(world_height*Math.random()), Math.floor(world_width*Math.random())] //new random location
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
}

function removeFog(avX, avY, map){
    neigh = getValidNeighbors(avX,avY,map,1);
    for(var i = 0; i < neigh.length; i++){
        neigh[i].fog = false;
    };

}

function getValidNeighbors(avX, avY, map, flashlight){
    neigh = [];
    if(avX > 0){neigh.push(map[avY][avX-1]);} //left
    if(avX < world_width-1){neigh.push(map[avY][avX+1]);} //right
    if(avY > 0){neigh.push(map[avY-1][avX]);} //up
    if(avY < world_height-1){neigh.push(map[avY+1][avX]);} //down
    if(avX > 0 && avY > 0){neigh.push(map[avY-1][avX-1]);} //top left corner
    if(avX > 0 && avY < world_height-1){neigh.push(map[avY+1][avX-1]);} //bot left corner
    if(avX < world_width-1 && avY > 0){neigh.push(map[avY-1][avX+1]);} //top right corner
    if(avX < world_width-1 && avY < world_height-1){neigh.push(map[avY+1][avX+1]);} //bot right corner

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
    return (avX >= 0 && avY >= 0 && avX < world_width && avY < world_height);
}

// function Dex(Character){
//   return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
// }

function move(e) {
    if (canMove == true) {
        var didMove = false;
        var fightChance = Math.random();
        if (e.keyCode == "87" && avatarY > 0) { //up
            world_map[avatarY][avatarX].hero_present = false;
            avatarY --;
            world_map[avatarY][avatarX].hero_present = true;
            didMove = true;

        } else if (e.keyCode == "83" && avatarY < world_height-1) { //down
            world_map[avatarY][avatarX].hero_present = false;
            avatarY ++;
            world_map[avatarY][avatarX].hero_present = true;
            didMove = true;

        } else if (e.keyCode == "65" && avatarX > 0) { //left
            world_map[avatarY][avatarX].hero_present = false;
            avatarX --;
            world_map[avatarY][avatarX].hero_present = true;
            didMove = true;

        } else if (e.keyCode == "68" && avatarX < world_width-1) { //right
            world_map[avatarY][avatarX].hero_present = false;
            avatarX ++;
            world_map[avatarY][avatarX].hero_present = true;
            didMove = true;

        } else if (e.keyCode == "66") {
            console.log("Dev tools activated");
            console.log("So...., you're either a developer, or a cheater, or just lazy...")
            equip(Hero, MasterSword); //give absurd weapons

            Hero.vitality = 100000; //set absurd health stats
            Hero.maxVitality = 100000;

            //remove fog
            for(var i = 0; i < world_height; i ++){
                for(var j = 0; j < world_width; j++){
                    world_map[i][j].fog = false;
                }
            }
        }
        else if (e.keyCode == 73){
            $("#info-module").toggle(100);
            refreshInfo();
        }
        buildMap(world_map);


        //chance to enter combat
        if (fightChance > .95 && !floorCleared && didMove) {
            $("#text-module").show();
            canMove = false;
        } else {
            canMove = true;
        }
        if(Hero.vitality + 2 <= Hero.maxVitality && didMove) {
            Hero.vitality += 2;
            document.getElementById("hero").innerHTML = Hero.vitality;
            refreshInfo();
        }

        //check if on a chest
        if(world_map[avatarY][avatarX].objid === "treasure" && !world_map[avatarY][avatarX].emptied_chest){ //if both coords of same chest and its a match
            $("#text-module").show();
            $("#enter").hide();
            $("#open").show();
            canMove = false;
            msg = print("message", world_map[avatarY][avatarX].message);
            world_map[avatarY][avatarX].message = "the chest lays smashed by your blade, its treasures still there."
            openChest(true);
        };

        //check if on the trapdoor
        if(world_map[avatarY][avatarX].objid === 'trapdoor'){
            //only if floor cleared....
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();

            canMove = false;
            msg = print("message", world_map[avatarY][avatarX].message);

            $("#descend").click(
                function() {
                    console.log("Enter new floor")
                    descend(true)
                }
            )
            $("#stay").click(
                function() {
                    console.log("Stay on this floor")
                    descend(false)
                }
            )
        }
    }
}

function descend(descend){
    $("#descend").off("click")
    $("#stay").off("click")
    $("#stay").hide();
    $("#enter").hide();
    $("#enter").show();
    $("#text-module").hide();
    $("#descend").hide();
    canMove = true;
    print("lastMessage", 2);
}

function refreshInfo() { // updates info box
    document.getElementById("characterInfo").innerHTML = "Health: <br>" + Hero.vitality + " / " + Hero.maxVitality + "<br>";
    var inventoryMessage = "Equipped: <br><br>"
    for(attribute in inventory){
        if(inventory[attribute] != null){
            inventoryMessage += attribute + ": " + inventory[attribute].name + "<br><br>";
        }
    }
    document.getElementById("inventory").innerHTML = inventoryMessage;
}

function Damage(source_character, target_character) {
    hit = Math.floor(Math.random() * source_character.strength + source_character.strength);
    target_character.vitality -= hit;
    document.getElementById(source_character.objid).innerHTML = source_character.vitality;
    document.getElementById(target_character.objid).innerHTML = target_character.vitality /*+ target_character.name */ ;
    document.getElementById("hero").innerHTML = Hero.vitality;
    document.getElementById("defendText").innerHTML = "Shield: " + HeroShield.vitality;
    refreshInfo();
    return hit;
}

function Shield() { //TODO fix
    if(Hero.vitality + 2 <= Hero.maxVitality){
    Hero.vitality += 2;
    refreshInfo();
}
    document.getElementById("hero").innerHTML = Hero.vitality;
    hero_protected = true;
}

function readyUp() {
    ready = true;
    return ready;
}

function openChest(stage) {
    $("#open").click(
        function() {
            if (stage) {
                print("item", itemList[world_map[avatarY][avatarX].treasureID]);
                $("#equip").show();
                console.log(itemList[world_map[avatarY][avatarX].treasureID]);
                $("#equip").click(
                    function() {
                        world_map[avatarY][avatarX].emptied_chest = true;
                        equip(Hero, itemList[world_map[avatarY][avatarX].treasureID]);
                        $("#equip").hide();
                    })
                stage = !stage;

            } else {
                $("#equip").hide();
                $("#equip").off("click");
                $("#open").hide();
                $("#open").off("click")
                $("#enter").show();
                $("#text-module").hide();
                canMove = true;
                print("lastMessage", 2);
                return;
            }
        });
}

/*message is either:
* a number for damage
* an index for messageArray
* an item object
* a string thats actually a message
* TODO: clean this up... functions within classes?
*/
function print(messageType, message) {
    if (messageType == "damageDealt") {
        document.getElementById("textBox").innerHTML = "You strike for " + message + " damage!"
        messageArray.push("You strike for " + message + " damage!")
    } else if (messageType == "lastMessage") {
        document.getElementById("textBox").innerHTML = messageArray[messageCount - message];
        messageArray.push(messageArray[messageCount - message])
    } else if (messageType == "item") {
        var itemMessage = "The chest contains: " + message.name + "<br>"
        for (attribute in message) {
            if (typeof message[attribute] == "number") {
                itemMessage += attribute + ": +" + message[attribute] + "<br>";
            }
        }
        document.getElementById("textBox").innerHTML = itemMessage;
        messageCount--; //NEED TO DECREMENT BC ITEM NOT PUSHED
    } else {
        document.getElementById("textBox").innerHTML = message;
        messageArray.push(message);
    }
    messageCount++
    return messageArray[messageCount-1];
}

function buildMap(array) {
    var worldContents = "";
    removeFog(avatarX,avatarY,world_map);
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
    console.log(target.name + " equipped " + equipment.name);
    if(inventory[equipment.type] != null){
        Unequip(Hero, inventory[equipment.type]);

    }
    inventory[equipment.type] = equipment;
    refreshInfo();
    var attribute;
    for (attribute in equipment) {
        if (typeof equipment[attribute] == "number") {
            target[attribute] += equipment[attribute];
        }
    }
}
function Unequip(target, equipment) {
    console.log(target.name + " unequipped " + equipment.name) // finish inventory
    var attribute;
    for (attribute in equipment) {
        if (typeof equipment[attribute] == "number") {
            target[attribute] -= equipment[attribute];
        }
    }
}



function combat_helper(hero, enemyList, idx) { //TODO GLOBAL VARIABLES
    var enemyAttack; //not used outside this function = NOT GLOBAL, SIR!
    HeroShield.vitality = HeroShield.maxVitality;
    if (Hero.vitality <= 0) {
        return;
    }
    print("enemy-message", "A fearsome " + enemyList[idx].name + " emerges from the shadows!")
    document.getElementById("enter").onclick = function() {
        $("#text-module").animate({
            top: '300px'
        }, 500);
        $("#combat-module").show(500);
        $("#enter").hide();
        $("#worldMap").hide();
        enemyAttack = setInterval(function() {
            if (hero_protected == true) {
                Damage(enemyList[idx], HeroShield)
            } else {
                Damage(enemyList[idx], Hero)
                print("combat start", "The enemy strikes!");
            }
            if (Hero.vitality <= 0) {
                print("lul", "You died!");
                $("#combat-module").hide(1000);
            }
            if (HeroShield.vitality <= 0) {
                window.clearInterval(shielded);
                hero_protected = false;
                //jquery animation:
                $("#defendSlider").hide('fast');
            }
        }, 10000 / enemyList[idx].dexterity);
    }

    document.getElementById("hero").innerHTML = Hero.vitality;
    document.getElementById("enemy").innerHTML = enemyList[idx].vitality;
    document.getElementById("defendText").innerHTML = "Shield: " + HeroShield.vitality;
    refreshInfo();

    document.getElementById("attack").onclick = function() {
        if (ready) {
            ready = false;
            window.setTimeout(readyUp, 10000 / Hero.dexterity);
            hitprint = Damage(Hero, enemyList[idx]);
            print("damageDealt", hitprint);
            //jquery animations:
            $("#attackSlider").show();
            $("#attackSlider").animate({
                width: '0px'
            }, 8000 / Hero.dexterity, function() {
                $("#attackSlider").hide();
                $("#attackSlider").animate({
                    width: '110px'
                }, 1);
            });
        }
    };

    if (hero_protected == false && HeroShield.vitality > 0) {
        document.getElementById("defend").onclick = function() {
            window.setTimeout(function(){
                if(Hero.vitality > 0){
                print("message", "You manage to raise your shield and deflect the blows. Behind it you begin to recover.")}}, 4000);

            shielded = setInterval(function() {
                Shield()
            }, 4000);

        }
    }

    // var enemyAttack = setInterval(function() {print("combat start", "The enemy strikes!"); if(protected == true){Damage(enemyList[idx], HeroShield)} else{Damage(enemyList[idx], Hero)}}, 10000 / enemyList[idx].dexterity);
    window.onclick = function() {
        if (hero_protected == true || HeroShield.vitality <= 0) {
            window.clearInterval(shielded);
            hero_protected = false;
            //jquery animation:
            $("#defendSlider").hide('fast');
        }
        if (enemyList[idx].vitality <= 0) {
            enemyList[idx].vitality = 0;
            window.clearInterval(enemyAttack);

            // issue 5 stated that shield was giving health after combat. I am having a hard time encountering this problem but this redundancy will hopefully guarantee that it will not occur
            window.clearInterval(shielded);
            hero_protected = false;
            $("#defendSlider").hide('fast');

            $("#combat-module").hide(1000);
            $("#text-module").animate({
                top: "100px"
                // left: "20px"
            }, 1000);
            print("message", "You've defeated the beast!");
            if (idx < enemyList.length - 1) {
                idx++;
                document.getElementById("enter").innerHTML = "––>";
                $("#enter").show();
                document.getElementById("enter").onclick = function() {
                    canMove = true;
                    // $("#combat-module").hide(500);
                    // $("#text-module").animate({
                    //   top: "100px",
                    //   left: "20px"
                    // }, 500).hide();
                    $("#text-module").hide();
                    $("#worldMap").show();
                    document.getElementById("enter").innerHTML = "Engage";
                    combat_helper(hero, enemyList, idx);
                }

            } //success
            else {
                print("message", "The fog clears, and looking around there seemed to be no more monsters... A hole in the floor seems to be the only way out of this hellish place.");
                floorCleared = true;
                $("#open").show().click(
                    function(){
                        canMove = true;
                        document.getElementById("enter").innerHTML = "Engage";
                        $("#open").hide();
                        $("#text-module").hide();
                        $("#worldMap").show();
                        $("#open").off("click");
                    })
            }
        };
    };
    //jquery animation:
    $("#defend").click(function() {
        $("#defendSlider").show(4000);
    })

}
