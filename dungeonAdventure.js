//------------------------------------------------------------------------------------------------
// This script should be the game runner. Other classes should live in the
// ./world_objects/ folder,although this script can have helper methods and global variables.
//------------------------------------------------------------------------------------------------

Array.prototype.move = function(old_index, new_index){
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this;
}
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
var enemyAttack;
var torchlight = false;

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
itemList1 = [];
itemList2 = [];
itemList3 = [];
mobDrops = [];
//pass the itemList pointer to the [] to each Item class
//and if toList is true, it will be pushed to itemList
var heroShield = new Shields("the shield", "shield", null, null, 50, 2, false, "defendText", [itemList1]);
var MasterSword = new Item("the master sword", "weapon", 25, 17, 30, false, null, [itemList1]);
var startWeapon = new Item("rusty sword", "weapon", 0, 0, 0, false, null,[itemList1]);
var IronHelm = new Item("iron helm", "headgear", null, -1, 10, true, null, [itemList1]);
var katana = new Item("katana", "weapon", 1, 1, null, true, null, [itemList1, mobDrops]);
var ritDagger = new effectItem("ritual dagger", "weapon", -2, 2, 5, [indestructible], [.2], [], [], true, null, [itemList1]);
var thornArmor = new Item("armor of thorns", "armor", 1, -1, 5, true, null, [itemList1]);
var chainMail = new Item("light chainmail", "armor", null, null, 5, true, null, [itemList1, mobDrops]);
var GreatSword = new Item("greatsword", "weapon", 3, null, null, true, null, [[]]);
var vikHelm = new effectItem("viking helmet", "headgear", 1, -1, null, [adrenaline], [.3], [], [], true, null, [itemList1, mobDrops]);
var cloakMor = new Item("cloak of Moranos", "armor", null, 2, -5, true, null, [itemList2, mobDrops]);
var WarAxe =  new effectItem("war axe", "weapon", 1, 1, -5, [adrenaline], [.4], [], [], true, null, [mobDrops]);
var fireSword = new effectItem("blazing sword", "weapon", 2, 1, null, [], [], [fire], [.4], true, null, [[], itemList2]);
var hoodofOmar = new Item("leather hood", "headgear", null, 1, 3, true, null, [itemList1, mobDrops]);
var ironMail = new Item("iron chainmail", "armor", null, -1, 15, true, null, [itemList2, mobDrops]);
var enchantedSword = new effectItem("enchanted sword", "weapon", null, null, null, [adrenaline, indestructible], [.1, .1], [fire, ice], [.1, .1], true, null, [itemList1, itemList2, mobDrops]);
var mace = new Item("mace", "weapon", 2, -1, null, true, null, [itemList1]);
var iceStaff = new effectItem("ice staff", "weapon", 1, null, null, [indestructible], [.1], [ice], [.3], true, null, [mobDrops]);
var assBlade = new Item("assassin's blade", "weapon", -1, 3, 5, true, null, [itemList2]);
var machete = new Item("machete", "weapon", 3, 1, null, true, null, [itemList2]);
var cutlass = new Item("cutlass", "weapon", 2, 2, 5, true, null, [itemList2, itemList3]);
var fireStaff = new effectItem("fire staff", "weapon", 3, 1, null, [], [], [fire], [.4], true, null, [itemList2, itemList3]);
var hellPlate = new effectItem("Hell Knights' breastplate", "armor", null, 1, 10, [], [], [fire], [.3], true, null, [itemList2]);
var icyShell = new effectItem("icy shell", "armor", 2, -1, 10, [indestructible], [.3], [ice], [.3], true, null, [[], itemList2]);
var shadowCloak = new Item("shadow cloak", "armor", 1, 3, 5, true, null, [itemList2]);
var steelHelm = new Item("steel helm", "headgear", 1, 1, 10, true, null, [itemList2]);
var enchantedCrown = new effectItem("enchanted crown", "headgear", null, null, 20, [indestructible], [.3], [], [], true, null, [itemList2]);
var cultMask = new effectItem("cultist's mask", "headgear", 1, 1, 10, [adrenaline], [.2], [fire], [.2], true, null, [itemList2]);
var goldChakram = new effectItem("golden chakram", 'weapon', 4, 2, 5, [],[],[fire],[.3], true, null, [itemList3]);
var steelBlade = new Item("steel sword", 'weapon', 5, 2, null, true, null, [itemList3]);
var hoodMor = new Item("hood of Moranos", 'headgear', 2, 5, -10, true, null, [itemList3]);
var execAxe = new Item("executioner's axe", 'weapon', 9, 1, 10, true, null, [itemList3]);
var unbreakMail = new effectItem("unbreakable chainmail", 'armor', 5, 2, 30, [indestructible], [.3], [],[], true, null, [itemList3]);
var legionHelm = new Item("legionairre's helmet", 'headgear', 4, 3, 20, true, null, [itemList3]);



var gold = new Currency("gold", 1, null);

var torch = new Torch(1)

//------------------------------------------------------
//              Initialize Characters
//------------------------------------------------------
var hero = new Hero("The Hero", 5, 3, 20, "hero");
var tutorial = new Enemy("tutorial", 1, 5, 15);
var Troglodyte = new Enemy("Troglodyte", 3, 2, 30);
var DireRat = new Enemy("Dire Rat", 1, 15, 20);
var DireRat2 = new Enemy("Dire Rat", 1.5, 15, 20);
var Ogre = new Enemy("Ogre", 9, 1, 60);
var Sorcerer = new Enemy("Sorcerer", 6, 4, 20);
var Vagrant = new Enemy("Wandering Vagrant", 5, 4, 35);
var HellHound = new Boss("Hell Hound", 5, 6, 50, fireSword.items[0]);
var Golem = new Boss("Golem", 7, 3, 50, GreatSword.items[0]);
var Werewolf = new Enemy("werewolf", 6, 4, 40);
var slime = new Enemy("slime", 8, 2, 50);
var frostGiant = new Boss("frost giant", 8, 5, 100, icyShell.items[0]);
var ferBeast = new Enemy("feral beast", 9, 3, 20);
var smallWyrm = new Enemy("young wyrm", 10, 4, 300);
var pillager = new Enemy("pillager", 6, 6, 80);
var Bandit = new Enemy("Bandit", 3, 5, 40);
var DarkSquire = new Enemy("Dark Squire", 5, 3, 35);
var Cultist = new Enemy("Cultist", 2, 5, 30);
var CultMaster = new Enemy("Cult Master", 4, 5, 40);
var DarkKnight = new Enemy("Dark Knight", 7, 7, 100);
var CrimsonRider = new Enemy("Crimson Rider", 9, 5, 250);
var DisOfMoranos = new Enemy("Disciple of Moranos", 11, 3, 200);



//------------------------------------------------------
//        Initialize Inventory
//------------------------------------------------------
//inventory!!!!
var inventory = {
    weapon: startWeapon,
    headgear: null,
    armor: null,
    carried: [startWeapon]
}

startWeapon.equipped = true;

//------------------------------------------------------
//              Spinning up your world...
//------------------------------------------------------
var num_floors = 6;

var room_list = []

//have an array of rooms per floor
for(var i = 0; i < num_floors; i++){
    room_list.push([])
}
var GreatHall = new SafeRoom('Great Hall', 'GreatHall', 0, 0);
var TutRoom = new SafeRoom('TutRoom', 'tutRoom', 0, 0);

var Floor0 = new Floor(0, 2, [0], [GreatHall, TutRoom]);
var Floor1 = new Floor(1, 4, [1], null);
var Floor2 = new Floor(2, 4, [1, 2], null);
var Floor3 = new Floor(3, 6, [2], null);
var Floor4 = new Floor(4, 5, [2, 3], null);
var Floor5 = new Floor(5, 4, [3], null);

room_list[0] = Floor0.build_floor();
room_list[1] = Floor1.build_floor();
room_list[2] = Floor2.build_floor();
room_list[3] = Floor3.build_floor();
room_list[4] = Floor4.build_floor();
room_list[5] = Floor5.build_floor();
// room_list[1][0] = new SafeRoom('Great Hall', 'GreatHall', 0, 0)
// room_list[1][1] = new SafeRoom('TutRoom', 'tutRoom', 0, 0);
// room_list[2][0] = new FightRoom('First Floor', 'norm', 1, 1)
// room_list[3][0] = new FightRoom('Second Floor', 'norm', 2, 2);
// room_list[4][0] = new FightRoom('Third Floor', 'norm', 2, 3);
// room_list[5][0] = new FightRoom('Fourth Floor', 'norm', 3, 4);
// room_list[6][0] = new FightRoom('Fifth Floor', 'norm', 3, 5);

// room_list[0][0] = new SafeRoom('Great Hall', 'GreatHall', 0, 0)
// room_list[0][1] = new SafeRoom('TutRoom', 'tutRoom', 0, 0);
// room_list[1][0] = new FightRoom('First Floor', 'norm', 1, 1)
// room_list[2][0] = new FightRoom('Second Floor', 'norm', 2, 2);
// room_list[3][0] = new FightRoom('Third Floor', 'norm', 2, 3);
// room_list[4][0] = new FightRoom('Fourth Floor', 'norm', 3, 4);
// room_list[5][0] = new FightRoom('Fifth Floor', 'norm', 3, 5);

var curr_room = 0;
var curr_floor = 0;

//MOAR magic game variables
//variables to track the current position of hero
var avatarX = Math.floor(room_list[curr_floor][curr_room].room_width/8);
var avatarY = Math.floor(room_list[curr_floor][curr_room].room_height/2);


//get ready to start...
room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true; //place the hero in his starting position

//LetsiGO!
window.addEventListener("keydown", move, false);
window.onload = function(){
    room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight);
    document.getElementById("InvOpen").onclick = function() {
            $("#info-module").toggle(100);
            refreshInfo();
        }
}


//================================================================
//                      HELPER FUNCTIONS
//================================================================

//Takes in @room, which has a number of enemies left, and a list of enemies to fight
function enter_combat(room, custom_enemy) {
    console.log('entered combat')
    $("#text-module").show();
    canMove = false;

    if (typeof custom_enemy === "undefined") {
        customCombat = false;
        //Its a normal combat, choose randomly from the en_list of the room
        enemy = room.enemy_list[Math.floor(Math.random() * room.enemy_list.length)]; //TODO: make random from floor list
        print("enemy-message", "A fearsome " + enemy.name + " emerges from the shadows!")
        enemy.lootId = Math.floor(Math.random() * mobDrops.length);
        room.num_enemies--;
    } else {
        //its a custom combat, fight @custom_enemy
        console.log("custom")
        enemy = custom_enemy;
        customCombat = true;
    }

    enemy.vitality = enemy.maxVitality; //bc we use same objects across mult. fights

    document.getElementById("enter").onclick = function() {
        $("#text-module").animate({
            top: '300px'
        }, 500);
        $("#combat-module").show(500);
        $("#enter").hide();
        $("#worldMap").hide();
        enemyAttack = setInterval(function() {
            if (hero_protected == true) {
                Damage(enemy, heroShield)
            } else {
                Damage(enemy, hero)
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
        }, 10000 / enemy.dexterity);
    }

    document.getElementById("hero").innerHTML = hero.vitality;
    document.getElementById("enemy").innerHTML = enemy.vitality;
    document.getElementById("defendText").innerHTML = "Shield: " + heroShield.vitality;
    refreshInfo();

    document.getElementById("attack").onclick = function() {
        if (ready) {
            ready = false;
            window.setTimeout(readyUp, 10000 / hero.dexterity);
            if (inventory.weapon.constructorName == 'effectItem') {
                console.log("buffing up")
                inventory.weapon.buffUp(hero);
                inventory.weapon.debuffUp(enemy);
            }
            if (inventory.armor != null) {
                if (inventory.armor.constructorName == 'effectItem') {
                    inventory.armor.buffUp(hero);
                    inventory.armor.debuffUp(enemy);
                }
            }
            if (inventory.headgear != null) {
                if (inventory.headgear.constructorName == 'effectItem') {
                    inventory.headgear.buffUp(hero);
                    inventory.headgear.debuffUp(enemy);
                }
            }
            hitprint = Damage(hero, enemy);
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
            shieldReadyup = setTimeout(function() {
                heroShield.shield_ready = false;
            }, 4000);
            //    console.log("shield clicked")
            if (heroShield.shield_ready) {
                heroShield.shield_ready = false;
                shielded = setInterval(function() {
                    // console.log("shielding");
                    Shield()
                }, 4000);
            }
        }
    }

    document.getElementById('combat-module').onclick = function() {
        console.log('combat-module clicked')
        if (heroShield.shield_ready == false && hero_protected == true || heroShield.vitality <= 0) {
            window.clearInterval(shielded);
            heroShield.shieldReady();
            hero_protected = false;
            //jquery animation:
            $("#defendSlider").hide('fast');
        }
    }
}

function exit_combat(room, customCombat) {
    console.log('exiting combat')
    if (room.num_enemies > 0 || customCombat == true ) {
        // $("#open").show()
        // $("#open").click(function() {
            canMove = true;
            $("#open").hide();
            $("#enter").show();
            $("#text-module").hide();
            $("#worldMap").show();
            $("#open").off("click");
        // })
    } else {
        console.log("floor cleared!")
        refreshInfo();
        print("message", "The fog clears, and looking around there seemed to be no more monsters... A hole in the floor seems to be the only way out of this hellish place.");
        room.roomCleared = true;
        $("#open").show()
        $("#open").click(
            function() {
                canMove = true;
                document.getElementById("enter").innerHTML = "Engage";
                $("#open").hide();
                $("#enter").show();
                $("#text-module").hide();
                $("#worldMap").show();
                $("#open").off("click");
            })

        clearAllFog(room_list[curr_floor][curr_room].room_map);
        room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight);
    }
}

// function Dex(Character){
//   return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
// }

function move(e) {
    if (canMove == true) {
        var didMove = false;
        var activatedTorch = false;
        var oldPos = [avatarX,avatarY]
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

            clearAllFog(room_list[curr_floor][curr_room].room_map)
            room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight);
        } else if (e.keyCode == "84"){ //t for torch
            if(hero.num_torches > 0){
                if(!torchlight){
                    console.log("Activating torch")
                    hero.num_torches--;
                    activatedTorch = true;
                    refreshInfo();
                    torchlight = true;
                    setTimeout(function(){torchlight = false; console.log("Your torch fades to nothing.")}, 10000)
                }
                else{
                    console.log("You can't turn off a torch, silly!")
                }
            }
            else{
                console.log("No torches to use!")
            }
        }

        if(didMove || activatedTorch){
            var newPos = [avatarX,avatarY];
            room_list[curr_floor][curr_room].updateRoomHTML(oldPos,newPos,torchlight);
        }

        //chance to enter combat
        if (Math.random() < room_list[curr_floor][curr_room].fightChance  && !room_list[curr_floor][curr_room].roomCleared && didMove) {
            enter_combat(room_list[curr_floor][curr_room])

        }

        if(hero.vitality + 2 <= hero.maxVitality && didMove) {
            hero.vitality += 2;
            document.getElementById("hero").innerHTML = hero.vitality;
            refreshInfo();
        } else if(hero.vitality + 1 <= hero.maxVitality && didMove){
          hero.vitality += 1;
          refreshInfo();
        }

        if(didMove){
            checkLocation();
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

function checkLocation(){
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
                revertTextModule();
                canMove = false;
                print("message", "The statue springs to life and raises its sword. There's no escape!");
                $("#text-module").show();
                enter_combat(room_list[curr_floor][curr_room], Golem);
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].destroyed_statue = true;
            }
        )
        $("#stay").click(
            function() {
                revertTextModule();
            }
        )
    }

    if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid == 'cave' && !room_list[curr_floor][curr_room].room_map[avatarY][avatarX].empty){
        canMove = false;
        $("#text-module").show();
        $("#enter").hide();
        $("#descend").show();
        $("#stay").show();

        msg = print("message", room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message);
        document.getElementById("descend").innerHTML = "Enter";

        $("#descend").click(
            function(){
                revertTextModule();
                canMove = false;
                print("message", "The occupant of the cave awakes. A massive frost giant looms before you!");
                $("#text-module").show();
                enter_combat(room_list[curr_floor][curr_room], frostGiant);
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].empty = true;
            }
        )
        $("#stay").click(
            function(){
                revertTextModule();
            }
        )
    }
    if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'fountain' && !room_list[curr_floor][curr_room].room_map[avatarY][avatarX].used){
        canMove = false;
        $("#text-module").show();
        $("#enter").hide();
        $("#descend").show();
        $("#stay").show();

        msg = print("message", room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message);
        document.getElementById("descend").innerHTML = "Use";
        document.getElementById("stay").innerHTML = "Leave";

        $("#descend").click(
            function(){
                revertTextModule();
                if(Math.random() <= .5){
                    hero.maxVitality += 5;
                    hero.vitality = hero.maxVitality;
                    refreshInfo();
                    print("message", "The gods have smiled upon you. Your vitality is improved.");
                    $("#text-module").show();
                    $("#enter").hide();
                    $("#open").show().click(function(){
                        $("#open").off('click');
                        $("#open").hide();
                        revertTextModule();
                    })
                }
                else{
                    print("message", "The gods do not hear your prayers. Nothing happens.");
                    $("#text-module").show();
                    $("#enter").hide();
                    $("#open").show().click(function(){
                        $("#open").off('click').hide();

                        revertTextModule();
                    })
                }
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].used = true;
            }
        )
    $("#stay").click(function(){
        revertTextModule();
    })
    }

    if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'altar' && !room_list[curr_floor][curr_room].room_map[avatarY][avatarX].used){
        canMove = false;
        $("#text-module").show();
        $("#enter").hide();
        $("#descend").show();
        $("#stay").show();

        msg = print("message", room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message);
        document.getElementById("descend").innerHTML = "Use";
        document.getElementById("stay").innerHTML = "Leave";

        $("#descend").click(
            function(){
                revertTextModule();
                hero.maxVitality -= 5;
                hero.vitality -= 5;
                if(hero.vitality <= 0){
                    hero.vitality = 1;
                }
                statToImprove = Math.random();
                if(statToImprove <= .5){
                    hero.strength += Math.ceil(Math.random() * 2);
                    statToImprove = "strength";
                }
                else{
                    hero.dexterity += Math.ceil(Math.random() * 2);
                    statToImprove = "dexterity";
                }
                print("message", "The gods of death accept your blood sacrifice. Your " + statToImprove + " has improved.");
                refreshInfo();
                $("#text-module").show();
                $("#enter").hide();
                $("#open").show().click(function(){
                    $("#open").off('click');
                    $("#open").hide();
                    revertTextModule();
                    })

            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].used = true;
            }
        )

    $("#stay").click(function(){
        revertTextModule();
    })
    }

    if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'charDialogue'){
        canMove = false;

        room_list[curr_floor][curr_room].room_map[avatarY][avatarX].dialogue(dialogues[room_list[curr_floor][curr_room].room_map[avatarY][avatarX].charId], 0);


    }
    if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'door'){
            canMove = false;
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].nextRoom();


    }
    if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX].objid === 'merchant'){
        canMove = false;
        $("#text-module").show();
        $("#enter").hide();
        $("#descend").show();
        $("#stay").show();

        msg = print("message", room_list[curr_floor][curr_room].room_map[avatarY][avatarX].message);
        document.getElementById("descend").innerHTML = "Shop";
        document.getElementById("stay").innerHTML = "Leave";

        $("#descend").click(function(){
            revertTextModule();
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].openModule(true);
        })
        $("#stay").click(function(){
            revertTextModule();
        })
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

            if(curr_floor > 0){
            for(i = 0; i < room_list[curr_floor][curr_room].enemy_list.length; i++){ //scale recurring enemies
                room_list[curr_floor][curr_room].enemy_list[i].maxVitality += 5;
                room_list[curr_floor][curr_room].enemy_list[i].vitality = room_list[curr_floor][curr_room].enemy_list[i].maxVitality;
                room_list[curr_floor][curr_room].enemy_list[i].strength += 1;

            }}

            curr_floor++;
            curr_room = 0;
            avatarY = room_list[curr_floor][curr_room].room_entry[0];
            avatarX = room_list[curr_floor][curr_room].room_entry[1];
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
            room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight);

            // combat(hero, "default");
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

function revertTextModule(){
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

    var torchtext = '';
    if(hero.num_torches > 0){
        torchtext = 't'
        for(var i = 0; i < hero.num_torches-1; i++){
            torchtext += "    t"
        }
    }
    $('#torchcount').html(torchtext)

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
                if(items_carried[i][attribute] >= 0){
                    itemInfos[i] += attribute + ": +" + items_carried[i][attribute] + "<br>";
                }
                else{ // issue #49
                    itemInfos[i] += attribute + ": " + items_carried[i][attribute] + "<br>";
                }
            }
        }
        if(items_carried[i].constructorName == 'effectItem'){

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

function Damage(source, target) {
    customCombat = false;
    if(target.constructorName == 'Boss'){
        customCombat = true;
    }
    room = room_list[curr_floor][curr_room];
    hit = Math.floor(Math.random() * source.strength + source.strength);
    target.vitality -= hit;

    document.getElementById(target.objid).innerHTML = target.vitality /*+ target.name */ ;
    document.getElementById("hero").innerHTML = hero.vitality;
    document.getElementById("defendText").innerHTML = "Shield: " + heroShield.vitality;
    refreshInfo();

    //if the source was a hero (check based on if target is enemy or boss), and target dead
    if ((target.constructorName == 'Enemy' || customCombat) && target.vitality <= 0) {
        target.vitality = 0;
        hero.xp += 100; //TODO: scale
        window.clearInterval(enemyAttack);

        window.clearInterval(shielded);
        hero_protected = false;
        heroShield.shieldReady();

        $("#defendSlider").hide('fast');
        $("#combat-module").hide(1000);
        $("#text-module").animate({
            top: "100px"
        }, 1000);
        print("message", "You've defeated the beast!");
        $("#combat-module").off('click');
        var dropChance = Math.random();
        if (!customCombat && dropChance > 0.75) {
            console.log(dropChance);
            $("#open").show();
            $("#open").click(
                function(e) {
                    e.stopPropagation();
                    print("item", [mobDrops[target.lootId]]);
                    drop_items([mobDrops[target.lootId]])
                    // $("#open").off('click');
                    $("#open").click(function(){exit_combat(room, customCombat); $("#open").off('click')})
                }
            );
        } else if (customCombat) {
            console.log("cc")
            hero.xp += 100; //TODO: scale
            $("#open").show();
            $("#open").click(
                function(e) {
                    console.log(enemy);
                    e.stopPropagation();
                    print("item", [target.loot]);
                    drop_items([target.loot])
                    // $("#open").off('click');
                    $("#open").click(function(){exit_combat(room, customCombat)})
                }
            )
        }
        else {
            console.log('case 3--no drops, and random monster')
            $("#open").show();
            $("#open").click(
                function() {
                    $("#open").off('click');
                    exit_combat(room, customCombat);
                }
            )
        }
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
            torch.torch_count = Math.ceil(Math.random() * 3);
            // console.log(treasureIDs)
            if (stage) {
                items_in_chest = []
                for(var i = 0; i < treasureIDs.length; i++){
                    if(typeof treasureIDs[i] == 'number'){
                    items_in_chest.push(room_list[curr_floor][curr_room].itemList[treasureIDs[i]])
                } else {
                    items_in_chest.push(treasureIDs[i]);
                }
                }

                print('item', items_in_chest) //handles HTML
                drop_items(items_in_chest) //handles take clicks, etc
                stage = !stage;

            } else {
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
    if(item.constructorName == 'Currency'){
        item.walletCheck();
        equip(hero, item);
        item.wallet = null;
    }
    else if(item.constructorName == "Torch"){
        hero.num_torches += item.torch_count;
        if(hero.num_torches > 10){
            hero.num_torches = 10;
        }
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
        item = $().extend({}, items[i])
        $(takeID).attr('item_id', i)
        $(takeID).click(
            function() {
                if(inventory['carried'].length < 10 || items[$(this).attr('item_id')].constructorName == "Currency"){
                    itemsTaken ++;
                    if(itemsTaken == items.length){
                        room_list[curr_floor][curr_room].room_map[avatarY][avatarX].emptied_chest = true;
                    }
                    item_to_take = items[$(this).attr('item_id')];
                    // equip(hero, item_to_take);
                    take_item($().extend({},item_to_take))
                    $(this).hide();
                }
                else {
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
                    if(items[i][attribute] >= 0){
                        itemInfos[i] += attribute + ": +" + items[i][attribute] + "<br>";
                    }
                    else{ //issue #49
                        itemInfos[i] += attribute + ": " + items[i][attribute] + "<br>";
                    }
                }
            }
            if(items[i].constructorName == 'effectItem'){

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

function equip(target, equipment) {

    // console.log(target.name + " equipped " + equipment.name);
    equipment.equipped = true;
    if(inventory[equipment.type] != null && equipment.constructorName != "Currency"){
        temp_item = inventory[equipment.type];
        Unequip(hero, temp_item);
    }
    if(equipment.constructorName != "Currency"){
        inventory[equipment.type] = equipment;
    }

    //move around within array
    for(var i = 0; i < inventory['carried'].length; i++){
        if(!inventory['carried'][i].equipped){
            console.log(inventory['carried'].indexOf(equipment) + " to " + i);
            inventory['carried'].move(inventory['carried'].indexOf(equipment), i);
            break;
        }
    }
    for(var i = 1; i < inventory['carried'].length; i++){
        if(inventory['carried'][i].equipped && !inventory['carried'][i - 1].equipped){
            inventory['carried'].move(i, (i-1));
        }
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
