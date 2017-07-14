//------------------------------------------------------------------------------------------------
// This script should be the game runner. Other classes should live in the
// ./world_objects/ folder,although this script can have helper methods and global variables.
//------------------------------------------------------------------------------------------------

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
var HeroShield = new Item("the shield", null, null, 20, false, "defend", itemList);
var MasterSword = new Item("the master sword", 25, 17, 30, false, null, itemList);
var IronHelm = new Item("iron helm", null, -1, 10, true, null, itemList);
var katana = new Item("katana", 1, 1, null, true, null, itemList);
var ritDagger = new Item("ritual dagger", -2, 2, 5, true, null, itemList);
var thornArmor = new Item("armor of thorns", 1, -1, 5, true, null, itemList);

//------------------------------------------------------
//        Initialize Treasures + other Locations
//------------------------------------------------------
//treasures must go after the Items because we need to set an ID for the treasure inside!
tChest1Loc = [Math.floor(30*Math.random()), Math.floor(40*Math.random())]
tChest2Loc = rollLocation([tChest1Loc]);
tChest3Loc = rollLocation([tChest1Loc, tChest2Loc]);

var TreasureChest = new Location("Treasure Chest","A wooden chest. It's locked, but no wood can withstand your blade.","treasure","v", tChest1Loc[0], tChest1Loc[1]);
var TreasureChest2 = new Location("Treasure Chest","A wooden chest. It's locked, but no wood can withstand your blade.","treasure","v", tChest2Loc[0], tChest2Loc[1]);
var TreasureChest3 = new Location("Treasure Chest","A wooden chest. It's locked, but no wood can withstand your blade.","treasure","v", tChest3Loc[0], tChest3Loc[1]);
var treasures = [TreasureChest, TreasureChest2, TreasureChest3];

TreasureChest.treasureID = Math.floor(itemList.length * Math.random());
TreasureChest2.treasureID = Math.floor(itemList.length * Math.random());
TreasureChest3.treasureID = Math.floor(itemList.length * Math.random());

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
var world_width = 30;
var world_height = 40;

//the game board itself!
var world_map = new Array(world_width)

//populate it with Tile locations
for (var i = 0; i < world_width; i++) {
  world_map[i] = new Array(world_height);
  for(var j = 0; j < world_height; j++){
      world_map[i][j] = new Location("Tile","","tile",".",i,j);
  }
};

//add your treasures! //TODO for loop!
world_map[TreasureChest.rowID][TreasureChest.colID] = TreasureChest;
world_map[TreasureChest2.rowID][TreasureChest2.colID] = TreasureChest2;
world_map[TreasureChest3.rowID][TreasureChest3.colID] = TreasureChest3;

//get ready to start...
world_map[avatarY][avatarX].hero_present = true; //place the hero in his starting position
removeFog(avatarX,avatarY, world_map); //remove the fog around the hero

//LetsiGO!
window.addEventListener("keydown", move, false);
combat(Hero);



//----------------------------------------------------------------
//                      HELPER FUNCTIONS
//----------------------------------------------------------------

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
        loc = [Math.floor(30*Math.random()), Math.floor(40*Math.random())] //new random location
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
    if(avX < 39){neigh.push(map[avY][avX+1]);} //right
    if(avY > 0){neigh.push(map[avY-1][avX]);} //up
    if(avY < 29){neigh.push(map[avY+1][avX]);} //down
    if(avX > 0 && avY > 0){neigh.push(map[avY-1][avX-1]);} //top left corner
    if(avX > 0 && avY < 29){neigh.push(map[avY+1][avX-1]);} //bot left corner
    if(avX < 39 && avY > 0){neigh.push(map[avY-1][avX+1]);} //top right corner
    if(avX < 39 && avY < 29){neigh.push(map[avY+1][avX+1]);} //bot right corner

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
    return (avX >= 0 && avY >= 0 && avX < 40 && avY < 30);
}

// function Dex(Character){
//   return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
// }
function move(e) {
    if (canMove == true) {
        var fightChance = Math.random();
        if (e.keyCode == "87" && avatarY > 0) { //up
            world_map[avatarY][avatarX].hero_present = false;
            avatarY --;
            world_map[avatarY][avatarX].hero_present = true;

        } else if (e.keyCode == "83" && avatarY < 29) { //down
            world_map[avatarY][avatarX].hero_present = false;
            avatarY ++;
            world_map[avatarY][avatarX].hero_present = true;

        } else if (e.keyCode == "65" && avatarX > 0) { //left
            world_map[avatarY][avatarX].hero_present = false;
            avatarX --;
            world_map[avatarY][avatarX].hero_present = true;

        } else if (e.keyCode == "68" && avatarX < 39) { //right
            world_map[avatarY][avatarX].hero_present = false;
            avatarX ++;
            world_map[avatarY][avatarX].hero_present = true;

        } else if (e.keyCode == "66") {
            console.log("Dev tools activated");
            console.log("So...., you're either a developer, or a cheater, or just lazy...")
            equip(Hero, MasterSword); //give absurd weapons

            Hero.vitality = 100000; //set absurd health stats
            Hero.ogVit = 100000;

            //remove fog
            for(var i = 0; i < 30; i ++){
                for(var j = 0; j < 40; j++){
                    world_map[i][j].fog = false;
                }
            }
        }
        buildMap(world_map);


        //chance to enter combat
        if (fightChance > .95 && !floorCleared) {
            $("#text-module").show();
            canMove = false;
        } else {
            canMove = true;
        }

        //check if on a chest
        if(world_map[avatarY][avatarX].objid === "treasure" && !world_map[avatarY][avatarX].opened_chest){ //if both coords of same chest and its a match
            $("#text-module").show();
            $("#enter").hide();
            $("#open").show();
            canMove = false;
            msg = print("message", world_map[avatarY][avatarX].message);
            world_map[avatarY][avatarX].message = "the chest lays smashed by your blade, its treasures still there."
            openChest(true);
        };
    }


}

function Damage(source_character, target_character) {
    hit = Math.floor(Math.random() * source_character.strength + source_character.strength);
    target_character.vitality -= hit;
    document.getElementById(source_character.objid).innerHTML = source_character.vitality;
    document.getElementById(target_character.objid).innerHTML = target_character.vitality /*+ target_character.name */ ;
    document.getElementById("hero").innerHTML = Hero.vitality;
    document.getElementById("defend").innerHTML = "Shield: " + HeroShield.vitality; //TODO
    return hit;
}

function Shield() { //TODO fix during recursion
    Hero.vitality += 2;
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
                        world_map[avatarY][avatarX].opened_chest = true;
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
    var attribute;
    for (attribute in equipment) {
        if (typeof equipment[attribute] == "number") {
            target[attribute] += equipment[attribute];
        }
    }
}



function combat_helper(hero, enemyList, idx) { //TODO GLOBAL VARIABLES
    var enemyAttack; //not used outside this function = NOT GLOBAL, SIR!
    Hero.vitality = Hero.ogVit;
    HeroShield.vitality = HeroShield.ogVit;
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
            print("combat start", "The enemy strikes!");
            if (hero_protected == true) {
                Damage(enemyList[idx], HeroShield)
            } else {
                Damage(enemyList[idx], Hero)
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
    document.getElementById("defend").innerHTML = "Shield: " + HeroShield.vitality;

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
