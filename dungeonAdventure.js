class Location {
    constructor(name, message, objid, symbol, rowID, colID){
        this.name = name;
        this.message = message;
        this.objid = objid;
        this.symbol = symbol;
        this.hero_present = false;
        this.xCoord = colID * 15;
        this.yCoord = rowID * 15;
        this.rowID = rowID;
        this.colID = colID;
    }

    setHero(bool){
        this.hero_present = bool;
        return 1;
    }


};


// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//TODO: two separate problems with the chests after the first:
// lastMessage becomes undefined
// equip button equips multiple items on top of what is listed
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
var Hero = new Character("The Hero", 5, 3, 20, "hero");
var Troglodyte = new Character("Troglodyte", 3, 2, 30, "enemy");
var DireRat = new Character("Dire Rat", 1, 15, 20, "enemy");
var DireRat2 = new Character("Dire Rat", 1.5, 15, 20, "enemy");
var Ogre = new Character("Ogre", 9, 1, 60, "enemy");
var Sorcerer = new Character("Sorcerer", 6, 4, 20, "enemy");
var avatarX = 20;
var avatarY = 15;
var messageCount = 0;
var fogTop = 170;
var fogBottom = 20;
var fogLeft = 230;
var fogRight = 20;
var fightChance = Math.random();
var canMove = true;
var TreasureChest = new Location("Treasure Chest","A wooden chest. It's locked, but no wood can withstand your blade.","treasure","v", Math.floor(30*Math.random()), Math.floor(40*Math.random()));
var TreasureChest2 = new Location("Treasure Chest","A wooden chest. It's locked, but no wood can withstand your blade.","treasure","v", Math.floor(30*Math.random()), Math.floor(40*Math.random()));
var TreasureChest3 = new Location("Treasure Chest","A wooden chest. It's locked, but no wood can withstand your blade.","treasure","v", Math.floor(30*Math.random()), Math.floor(40*Math.random()));
var treasures = [TreasureChest, TreasureChest2, TreasureChest3];
// var treasuresXs = [TreasureChest.colID, TreasureChest2.colID, TreasureChest3.colID];
// var treasuresYs = [TreasureChest.rowID, TreasureChest2.rowID, TreasureChest3.rowID]; //TODO: chests could be stacked!!
var itemList = [];
var HeroShield = new Item("the shield", null, null, 20, false, "defend");
var MasterSword = new Item("the master sword", 25, 17, 30, false, null);
var IronHelm = new Item("iron helm", null, -1, 10, true, null);
var katana = new Item("katana", 1, 1, null, true, null);
var ritDagger = new Item("ritual dagger", -2, 2, 5, true, null);
var thornArmor = new Item("armor of thorns", 1, -1, 5, true, null);
var protected = false;
var ready = true;
var shielded;
var floorCleared = false;
//var hit;
var startOver;
var enemyAttack;
var globalEnemies = [Troglodyte, DireRat, DireRat2, Sorcerer, Ogre];
var messageArray = [];
window.addEventListener("keydown", move, false);
combat(Hero, globalEnemies);


/*BIG LOCATION UPDATE:
* Locations are now a 2D array...

*/
var world_map = new Array(30)
for (var i = 0; i < 30; i++) {
  world_map[i] = new Array(40);
  for(var j = 0; j < 40; j++){
      world_map[i][j] = new Location("Tile","","tile",".",i,j);
  }
};
//
world_map[TreasureChest.rowID][TreasureChest.colID] = TreasureChest;
world_map[TreasureChest2.rowID][TreasureChest2.colID] = TreasureChest2;
world_map[TreasureChest3.rowID][TreasureChest3.colID] = TreasureChest3;

world_map[avatarY][avatarX].hero_present = true;


//----------------------------------------------------------------
//                      HELPER FUNCTIONS
//----------------------------------------------------------------



function Character(name, strength, dexterity, vitality, objid) {
    this.name = name;
    this.strength = strength;
    this.dexterity = dexterity;
    this.vitality = vitality;
    this.ogVit = vitality;
    this.objid = objid;
}

function Item(name, strength, dexterity, vitality, toList, objid) {
    this.name = name;
    this.strength = strength;
    this.dexterity = dexterity;
    this.vitality = vitality;
    this.ogVit = vitality;
    this.toList = toList;
    this.objid = objid;
    this.list = function() {
        if (this.toList == true) {
            itemList.push(this)
        }
    }
    this.list();
}


// function Dex(Character){
//   return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
// }
function move(e) {
    if (canMove == true) {
        fightChance = Math.random();
        if (e.keyCode == "87" && avatarY > 0) { //up; bound = 3.5
            world_map[avatarY][avatarX].hero_present = false;
            avatarY --;
            world_map[avatarY][avatarX].hero_present = true;
            // if ((avatarY - fogTop) < 40) {
            //     fogTop -= 20;
            //     fogBottom += 20;
            // }
        } else if (e.keyCode == "83" && avatarY < 29) { //down; bound = 360
            world_map[avatarY][avatarX].hero_present = false;
            avatarY ++;
            world_map[avatarY][avatarX].hero_present = true;
            // if (fogTop + fogBottom - avatarY < 39) {
            //     fogBottom += 20;
            // }
        } else if (e.keyCode == "65" && avatarX > 0) { //left; bound = 15.75
            world_map[avatarY][avatarX].hero_present = false;
            avatarX --;
            world_map[avatarY][avatarX].hero_present = true;
            // if (avatarX - fogLeft < 40) {
            //     fogLeft -= 20;
            //     fogRight += 20;
            // }
        } else if (e.keyCode == "68" && avatarX < 39) { //right; bound = 430.5
            world_map[avatarY][avatarX].hero_present = false;
            avatarX ++;
            world_map[avatarY][avatarX].hero_present = true;
            // if (fogLeft + fogRight - avatarX < 40) {
            //     fogRight += 20;
            // }
        } else if (e.keyCode == "66") {
            console.log("dev tools activated");
            buildMap(world_map);
            equip(Hero, MasterSword);
            $(".fog").css({
                "display": "none"
            });
        }
        // $(".fog").css({
        //     "top": fogTop + "px",
        //     "padding-bottom": fogBottom + "px",
        //     "left": fogLeft + "px",
        //     "padding-right": fogRight + "px"
        // });
        $("#avatar").css({
            "top": avatarY + "px",
            "left": avatarX + "px"
        });
        buildMap(world_map);


        //chance to enter combat
        if (fightChance > 10.95 && !floorCleared) {
            $("#text-module").show();
            canMove = false;
        } else {
            canMove = true;
        }

        //check if on a chest

        if(world_map[avatarY][avatarX].objid === "treasure"){ //if both coords of same chest and its a match
            $("#text-module").show();
            $("#enter").hide();
            $("#open").show();
            canMove = false;
            msg = print("message", world_map[avatarY][avatarX].message);
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
    protected = true;
}

function readyUp() {
    ready = true;
    return ready;
}

function openChest(stage) {

    $("#open").click(

        function() {
            if (stage) {
                var chestContent = Math.floor(Math.random() * itemList.length);
                print("item", itemList[chestContent]);
                $("#equip").show();
                console.log(itemList[chestContent]);
                $("#equip").click(
                    function() {
                        equip(Hero, itemList[chestContent]);
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
    //console.log(messageArray.toString());
    // console.log(messageCount);
    return messageArray[messageCount-1];
}

function buildMap(array) {
    var worldContents = "";
    for (var i = 0; i < array.length; i++) {
        for(var j = 0; j < array[0].length; j++){
            symbol = array[i][j].symbol;
            if(array[i][j].hero_present){
                symbol = 'x';
            }
            worldContents += "<div id='" + array[i][j].objid + "' style='top:" + array[i][j].yCoord + "px; left:" + array[i][j].xCoord + "px; position: absolute;'>" + symbol + "</div>";

        }
        // if (array[a + 1] !== undefined && array[a].xCoord == array[a + 1].xCoord) {
        //     array[a].xCoord = 15.75 + 19.75 * Math.floor(Math.random() * 25);
        // }
        // if (array[a + 1] !== undefined && array[a].yCoord == array[a + 1].yCoord) {
        //     array[a].yCoord = 3.5 + 11.5 * Math.floor(Math.random() * 25);
        // }
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

function combat(hero, enemyListArg) { //take in enemy list
    // for(enemy_index = 0; enemy_index < enemyListArg.length; enemy_index++){
    window.onload = function() {
        combat_helper(hero, enemyListArg, 0);
        buildMap(world_map);
    };

}


function combat_helper(hero, enemyList, idx) { //TODO GLOBAL VARIABLES
    Hero.vitality = Hero.ogVit;
    HeroShield.vitality = HeroShield.ogVit;
    if (Hero.vitality <= 0) {
        return;
    }
    print("enemy-message", "A fearsome " + enemyList[idx].name + " emerges from the shadows!")
    document.getElementById("enter").onclick = function() {
        $("#text-module").animate({
            top: '350px',
            left: '20px'
        }, 500);
        $("#combat-module").show(500);
        $("#enter").hide();
        $("#worldMap").hide();
        enemyAttack = setInterval(function() {
            print("combat start", "The enemy strikes!");
            if (protected == true) {
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
                protected = false;
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
            }, 10000 / Hero.dexterity, function() {
                $("#attackSlider").hide();
                $("#attackSlider").animate({
                    width: '87px'
                }, 1);
            });
        }
    };

    if (protected == false && HeroShield.vitality > 0) {
        document.getElementById("defend").onclick = function() {
            shielded = setInterval(function() {
                Shield()
            }, 4000);

        }
    }

    // var enemyAttack = setInterval(function() {print("combat start", "The enemy strikes!"); if(protected == true){Damage(enemyList[idx], HeroShield)} else{Damage(enemyList[idx], Hero)}}, 10000 / enemyList[idx].dexterity);
    window.onclick = function() {
        if (protected == true || HeroShield.vitality <= 0) {
            window.clearInterval(shielded);
            protected = false;
            //jquery animation:
            $("#defendSlider").hide('fast');
        }
        if (enemyList[idx].vitality <= 0) {
            enemyList[idx].vitality = 0;
            window.clearInterval(enemyAttack);
            $("#combat-module").hide(1000);
            $("#text-module").animate({
                top: "100px",
                left: "20px"
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
