/*
 * This file should include the initialziation script for the game,
 * including global variables called throughout
 */


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
var game_duration = 1800000; //how long before the fog closes in totally

// Modules -- #120
var txtmd = new TextModule()
var vndmd = new VendorModule()
var doginvmd = new DogInvModule()
var cmbmd = new CombatModule()
var invmd = new InventoryModule()

//variables of hero status
var canMove;
var hero_protected;
var last_key_press;
var loc_facing;
var ready;
var shielded;
var shieldUp;
var shieldReadyup;
var magicReady;
var enemyAttack;
var torchlight;
var initial_fog_radius;
var fog_radius;
var fogDeath = -1;

//dog related variables! mans best friend :)
//NOTE: these are initialized here bc the dog should NOT be created from scratch
//every time game is restarted! In fact, Dog's properties should be persistant
//(such as if its carrying a weapon).
var doge = new Dog(6,8);

var channelDivSpell;// new ActiveSpell("channel divinity", 'channelDivS', hero, null, null, 20000, 3);
var fireball;// new ActiveSpell('fireball', 'fireball', hero, null, 2, 5000, 1);
var lightningStrike;// new ActiveSpell('lightning strike', 'lightningS', hero, null, 30, 15000, 2);
var mindDom;// new ActiveSpell('mind domination', 'mindDomS', hero, null, null, 20000, 3);
var forcefieldSpell;// new ActiveSpell('forcefield', 'forcefieldS', hero, null, null, 8000, 2);
var learnCast = new Upgrade('learned caster');
var powerWill = new Upgrade('power of will');
var mindBody = new Upgrade('mind over body');
var dirtyMagic = new Upgrade('dirty magic');
var bloodDisciple = new Upgrade('blood disciple', bloodDisFoo);
var bloodMag = new Upgrade('blood magic', bloodMagFoo);

//------------------------------------------------------
//              Initialize Items
//------------------------------------------------------
var itemList1 = [];
var itemList2 = [];
var itemList3 = [];
var mobDrops = [];
var mobDrops2 = [];
var itemList4 = [];
var itemListMeta = new Array(mobDrops, itemList1, itemList2, itemList3, itemList4)
//pass the itemList pointer to the [] to each Item class
//and if toList is true, it will be pushed to itemList
var heroShield = new Shields("the shield", "shield", null, null, 30, 1, 3, 4, false, "defendText", [itemList1]);
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
var HammerWrath = new Item("Hammer of Wrath", 'weapon', 15, 2, 20, true, null, [itemList4, mobDrops2]);
var scythe = new Item("Reaper's Scythe", 'weapon', 12, 6, 15, true, null, [[]]);
var bladeMor = new Item("Blade of Moranos", 'weapon', 5, 15, -10, true, null, [[]]);
var belia = new Item("Belia", 'weapon', 10, 10, 10, true, null, [itemList4]);
var CourDeath = new Item("Courier of Death", 'weapon', 13, 8, null, true, null, [itemList4]);
var invisCloak = new effectItem("Invisibility Cloak", 'armor', null, 5, 40, [], [], [suppressed], [.3], true, null, [itemList4]);
var MasterArmor = new effectItem("Master Armor", 'armor', 5, 3, 80, [indestructible], [.5], [], [], true, null, [itemList4]);
var ImpenetrableArm = new Item("Impenetrable Armor", 'armor', 6, -5, 200, true, null, [itemList4]);
var MasterHelm = new Item("Master's Helmet", 'headgear', 4, 4, 40, true, null, [itemList4]);
var enchantedHelm = new effectItem("enchanted helmet", 'headgear', 2, 2, 20, [adrenaline, indestructible], [.4, .4], [fire, ice], [.4, .4], true, null, [itemList4]);
var unbreakHelm = new Item("Unbreakable helmet", 'headgear', 5, -3, 100, true, null, [itemList4]);
var ironSword = new exoticItem("iron sword", 'weapon', 1, 2, 10, 30, [itemList1, itemList2]);
var tungstenSword = new exoticItem("tungsten sword", "weapon", 3, 2, null, 50, [itemList2]);
var tungstenMail = new exoticItem("tungsten chainmail", "armor", 2, null, 20, 80, [itemList2]);
var tungstenHelm = new exoticItem("tungsten helmet", "headgear", 1, 1, 10, 70, [itemList2]);
var titanSword = new exoticItem("titanium sword", "weapon", 5, 2, 10, 100, [itemList3]);
var titanMail = new exoticItem("titanium chainmail", "armor", 2, 1, 50, 120, [itemList3]);
var titanHelm = new exoticItem("titanium helmet", "headgear", null, null, 40, 100,  [itemList3]);
var Leeroy = new exoticItem("Leeroy", "weapon", 30, null, null, 200, [itemList3, itemList4]);
var Gloria = new exoticItem("Gloria", 'weapon', 20, 10, null, 250, [itemList4]);


//------------------------------------------------------
//              Initialize Characters
//------------------------------------------------------
//As of start_game's introduction, initialization happens in start_game;
var hero;
var tutorial;
var Troglodyte;
var DireRat;
var DireRat2;
var Ogre;
var Sorcerer;
var Vagrant;
var HellHound;
var Golem;
var Werewolf;
var slime;
var frostGiant;
var ferBeast;
var smallWyrm;
var pillager;
var Bandit;
var DarkSquire;
var Cultist;
var CultMaster;
var DarkKnight;
var CrimsonRider;
var DisOfMoranos;
var DreadPirate;
var AncientWyrm;
var Moranos;
var DarkLord;
var Reaper;


//------------------------------------------------------
//              Spinning up your world...
//------------------------------------------------------
//SPECIAL ROOMS
var GreatHall = new SafeRoom('Great Hall', 'GreatHall', 0, 0);
var TutRoom = new SafeRoom('TutRoom', 'tutRoom', 0, 0);
var exitRoom = new SafeRoom('exitRoom', 'exitRoom', 0, 0);

var num_floors;

var room_list;

var curr_room;
var curr_floor;

//MOAR magic game variables
//variables to track the current position of hero
var avatarX;
var avatarY;

//variables for resets
var start_combatModule;
var pitActive;

//LetsiGO!
var DEVUTILS = true
// key listener
if(DEVUTILS){ dev_keys() }
else{ window.addEventListener("keydown", move, false); }

window.onload = function(){
    start_combatModule = document.getElementById('combat-module').innerHTML;
    start_game();
    //tutorialStart();
    document.getElementById("InvOpen").onclick = function() {
        invmd.toggleMod();
        doginvmd.hideMod();
        refreshInfo();
    }

    $("#TreeOpen").click(function(){
        $("#tree-module").toggle(100);
        refreshInfo();
    })

    //Slowly remove fog
    setInterval(function(){
        if(!room_list[curr_floor][curr_room].roomCleared && fog_radius > 1){
            oldFog = fog_radius;
            fog_radius--;
            console.log('fog closes in')
            room_list[curr_floor][curr_room].addFogWhenFogRadiusChanges(avatarX,avatarY, torchlight, oldFog, fog_radius)
        }
    }, game_duration / (initial_fog_radius-1))
}


//================================================================
//                          START GAME
//================================================================

function start_game(){
    //This is a function to set or reset all the relevant global game variables.
    //Additionally, this function builds a brand new world (except for the First
    //floor, since the GreatHall should be added to.)

    //character stats must reset
    hero = new Hero("The Hero", 5, 3, 20, "hero");
    // Dog = new Dog() ---> GETS INITIALIZED IN ROOM!
    tutorial = new Enemy("tutorial", 1, 5, 15);
    Troglodyte = new Enemy("Troglodyte", 3, 2, 30);
    DireRat = new Enemy("Dire Rat", 1, 15, 20);
    DireRat2 = new Enemy("Dire Rat", 1.5, 15, 20);
    Ogre = new Enemy("Ogre", 9, 1, 60);
    Sorcerer = new Enemy("Sorcerer", 6, 4, 20);
    Vagrant = new Enemy("Wandering Vagrant", 5, 4, 35);
    HellHound = new Boss("Hell Hound", 5, 6, 50, fireSword.items[0]);
    Golem = new Boss("Golem", 7, 3, 50, GreatSword.items[0]);
    Werewolf = new Enemy("werewolf", 6, 4, 40);
    slime = new Enemy("slime", 8, 2, 50);
    frostGiant = new Boss("frost giant", 8, 5, 100, icyShell.items[0]);
    ferBeast = new Enemy("feral beast", 9, 3, 20);
    smallWyrm = new Enemy("young wyrm", 10, 4, 300);
    pillager = new Enemy("pillager", 6, 6, 80);
    Bandit = new Enemy("Bandit", 3, 5, 40);
    DarkSquire = new Enemy("Dark Squire", 5, 3, 35);
    Cultist = new Enemy("Cultist", 2, 5, 30);
    CultMaster = new Enemy("Cult Master", 4, 5, 40);
    DarkKnight = new Enemy("Dark Knight", 7, 7, 100);
    CrimsonRider = new Enemy("Crimson Rider", 9, 5, 250);
    DisOfMoranos = new Enemy("Disciple of Moranos", 11, 3, 200);
    DreadPirate = new Enemy("Dread Pirate Williams", 15, 4, 300);
    AncientWyrm = new Enemy("Ancient Wyrm", 14, 8, 500);
    Moranos = new Boss("Moranos", 10, 15, 100, bladeMor.items[0]);
    DarkLord = new Enemy("Dark Lord", 9, 9, 300);
    Reaper = new Boss("Reaper", 20, 2, 200, scythe.items[0]);

    //active spells must be reset
    channelDivSpell = new ActiveSpell("channel divinity", 'channelDivS', hero, null, null, 20000, 3);
    fireball = new ActiveSpell('fireball', 'fireball', hero, null, 2, 5000, 1);
    lightningStrike = new ActiveSpell('lightning strike', 'lightningS', hero, null, 30, 15000, 2);
    mindDom = new ActiveSpell('mind domination', 'mindDomS', hero, null, null, 20000, 3);
    forcefieldSpell = new ActiveSpell('forcefield', 'forcefieldS', hero, null, null, 8000, 2);

    for(var i = 0; i < Object.keys(SPELLTREE).length; i++){
        SPELLTREE[Object.keys(SPELLTREE)[i]]['learned'] = false;
    }

    //combat-module must be reset
    $('#combat-module').html(start_combatModule);
    heroShield.vitality = heroShield.maxVitality;

    //message globals
    messageArray = [];
    messageCount = 0;

    //hero globals
    canMove = true;
    hero_protected = false
    heroShield.shield_ready = true;
    ready = true;
    clearInterval(shielded);
    clearTimeout(shieldUp);
    shieldUp = -1;
    magicReady = true;
    torchlight = false;
    initial_fog_radius = 5;
    fog_radius = initial_fog_radius;

    //Build room_list
    num_floors = 8;
    room_list = []

    //have an array of rooms per floor
    for(var i = 0; i < num_floors; i++){
        room_list.push([])
    }

    var Floor0 = new Floor(0, 3, [0], [exitRoom, GreatHall, TutRoom]);
    var Floor1 = new Floor(1, 4, [1], null);
    var Floor2 = new Floor(2, 4, [1, 2], null);
    var Floor3 = new Floor(3, 6, [2], null);
    var Floor4 = new Floor(4, 5, [2, 3], null);
    var Floor5 = new Floor(5, 4, [3], null);
    var Floor6 = new Floor(6, 4, [3, 4], null);
    var Floor7 = new Floor(7, 5, [4], null);

    doge.dogY = 8; //reset from last game
    doge.dogX = 6;
    doge.dog_radius = fog_radius;

    room_list[0] = Floor0.build_floor();
    room_list[1] = Floor1.build_floor();
    room_list[2] = Floor2.build_floor();
    room_list[3] = Floor3.build_floor();
    room_list[4] = Floor4.build_floor();
    room_list[5] = Floor5.build_floor();
    room_list[6] = Floor6.build_floor();
    room_list[7] = Floor7.build_floor();

    curr_room = 1;
    curr_floor = 0;

    //MOAR magic game variables
    //variables to track the current position of hero
    avatarX = Math.floor(room_list[curr_floor][curr_room].room_width/8);
    avatarY = Math.floor(room_list[curr_floor][curr_room].room_height/2);

    loc_facing = [avatarX+1, avatarY];
    last_key_press = 'd';

    //establish NPCs
    if(inactiveNPCs.length > 0){
      pitActive = false;
    }
    getNPCs();
    for(var i = 0; i < activeNPCs.length; i++){
        addNPC(activeNPCs[i]['charID'], room_list[0][activeNPCs[i]['roomIdx']].room_map, activeNPCs[i]['coords'][0], activeNPCs[i]['coords'][1]);
        room_list[0][activeNPCs[i]['roomIdx']].room_map[activeNPCs[i]['coords'][0]][activeNPCs[i]['coords'][1]].computeCoordsWithOffset(room_list[0][activeNPCs[i]['roomIdx']].yoff, room_list[0][activeNPCs[i]['roomIdx']].xoff);
        clearAllFog(room_list[0][1].room_map);
    }

    //get ready to start...
    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true; //place the hero in his starting position
    room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight,fog_radius);

    refreshInfo();
}
