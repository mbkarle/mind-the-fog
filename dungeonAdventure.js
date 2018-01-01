//------------------------------------------------------------------------------------------------
// This script should be the game runner. Other classes should live in the
// ./world_objects/ folder,although this script can have helper methods and global variables.
//------------------------------------------------------------------------------------------------

function tutorialStart(){ //TODO: add fight simulation; make more interactive
    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
    curr_room = 2;
    avatarX = 21;
    avatarY = 10;
    canMove = false;
    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
    room_list[curr_floor][curr_room].buildRoomHTML(avatarX, avatarY, torchlight, fog_radius);
    $("#worldMap").fadeOut(1).fadeIn(4000, function(){
        var tutVoice1 = new CharDialogue(null, null, "tutVoice1", "voice in the dark");
        var dialoguePromResolve;
        var dialogueProm1 = new Promise(function(resolve, reject) {
            dialoguePromResolve = resolve;
            tutVoice1.dialogue(dialogues['tutVoice1'], 0, dialoguePromResolve);
        });
        dialogueProm1.then(function(){
            var heroName = [];
            openPrompt("What's your name?", heroName).then(function(){
                print("message", "Would you like some instruction on how to survive, " + heroName + "?");
                $("#text-module").show();
                $("#enter").hide();
                $("#descend").show().html("Yes").click(function(){
                    revertTextModule();
                    var tutVoice2 = new CharDialogue(null, null, "tutVoice2", "voice in the dark");
                    var dialogueProm2 = new Promise(function(resolve, reject){
                        dialoguePromResolve = resolve;
                        tutVoice2.dialogue(dialogues['tutVoice2'], 0, dialoguePromResolve);
                    });
                    dialogueProm2.then(function(){
                        print("message", "Use the W, A, S, and D keys to move around.");
                        window.removeEventListener('keydown', move);
                        window.addEventListener('keydown', moveAndCheck, false);
                        var moveProm = new Promise(function(resolve, reject) {
                            dialoguePromResolve = resolve;
                        });
                        moveProm.then(function(){
                            print("message", "The C represents the location of a character. When facing a location, you can press E to interact.");
                            $("#text-module").show();
                            $("#open").show().click(function(){
                                $("#open").off('click').hide();
                                $("#text-module").hide();
                                window.removeEventListener('keydown', moveAndCheck);
                                window.addEventListener('keydown', move, false);
                            })
                        })
                        function moveAndCheck(e){
                            move(e);
                            if(e.keyCode == "69"){ //if you leave the room without approaching tutorial
                                window.removeEventListener('keydown', moveAndCheck);
                                window.addEventListener('keydown', move, false);
                            }
                            if(avatarY <= 6 && avatarX <= 6){
                                dialoguePromResolve();
                            }
                        }
                        $("#text-module").show();
                        $("#enter").hide()
                        $("#open").show().click(function(){
                            $("#open").off('click').hide()
                            $("#text-module").hide();
                        })
                    })
                })
                $("#stay").show().html("No").click(function(){
                    revertTextModule();
                })
            })
        })
    })
}

//Takes in @room, which has a number of enemies left, and a list of enemies to fight
function enter_combat(room, custom_enemy) {
    console.log('entered combat')
    $("#text-module").show();
    canMove = false;
    for(var i = 0; i < effectList.length; i++){
        effectList[i].active = false;
    }

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
    console.log(enemy);
    enemyHealthPCent = enemy.vitality / enemy.maxVitality * 100;
    $("#enemyHealthBar").html(
        enemy.vitality + " / " + enemy.maxVitality +
        "<div id='" + enemy.objid + "HealthSlider' class='statusSlider' style='width: " + enemyHealthPCent + "%'></div>"
    );
    var healthFraction = hero.vitality / hero.maxVitality;
    $("#heroHealthBar").html(
        hero.vitality + " / " + hero.maxVitality +
        "<div id='heroHealthSlider' class='statusSlider' style='width: " + healthFraction * 100 + "%'></div>"
    );

    //set spell targets:
    for(var i = 0; i < hero.spells.length; i++){
        hero.spells[i].target = enemy;
        for(var n = 0; n < activeSpellEffects[hero.spells[i].name]['buffs'].length; n++){
            if(activeSpellEffects[hero.spells[i].name]['buffs'][n].target === 'enemy'){
                activeSpellEffects[hero.spells[i].name]['buffs'][n].target = enemy;
            }
            else if(activeSpellEffects[hero.spells[i].name]['buffs'][n].target === 'hero'){
                activeSpellEffects[hero.spells[i].name]['buffs'][n].target = hero;
            }
        }
        for(var m = 0; m < activeSpellEffects[hero.spells[i].name]['debuffs'].length; m++){
            if(activeSpellEffects[hero.spells[i].name]['debuffs'][m].target === 'enemy'){
                activeSpellEffects[hero.spells[i].name]['debuffs'][m].target = enemy;
            }
            else if(activeSpellEffects[hero.spells[i].name]['debuffs'][m].target === 'hero'){
                activeSpellEffects[hero.spells[i].name]['debuffs'][m].target = hero;
            }
        }
    }

    document.getElementById("enter").onclick = function() {
        if(hero.spells.length % 2 != 0){
            $("#text-module").animate({
                top: 300 + 50 * hero.spells.length + 'px'
            })
        }
        else if(hero.spells.length % 2 == 0 && hero.spells.length != 0){
            $("#text-module").animate({
                top: 300 + 50 * (hero.spells.length  - 1) + 'px'
            })
        }
        else{
            $("#text-module").animate({
                top: '300px'
            }, 500);
        }
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
            $("#enemySymbol").animate({
                top: '25px',
                left: '-25px'
            }, 1, function(){
                $("#enemySymbol").animate({
                    top: '0',
                    left: '0'
                }, 10000 / (2 * enemy.dexterity))
            })
            if (hero.vitality <= 0) {
                print("message", "You died!");
                room_list[curr_floor][curr_room].clearAllFogTimeouts();
                refreshInfo();
                $("#combat-module").hide(1000);
                window.clearInterval(enemyAttack);
                window.clearInterval(shielded);
                window.clearTimeout(shieldUp);
                shieldUp = -1;
                $("#shieldascii").html("")
                hero.vitality = 0;
                cached_gold = Math.floor(hero.wallet / 10);
                $("#descend").show().html('Restart').click(function(){
                        revertTextModule();
                        $("#worldMap").show();
                        start_game();
                        $("#text-module").animate({
                            top: "175px"
                        }, 1000);
                        $("#defendSlider").hide('fast');
                })
            }
            if (heroShield.vitality <= 0) {
                window.clearInterval(shielded);
                window.clearTimeout(shieldUp);
                shieldUp = -1;
                $("#shieldascii").html("")
                hero_protected = false;
                heroShield.shieldReady();
                //jquery animation:
                $("#defendSlider").hide('fast');
            }
        }, 10000 / enemy.dexterity);
    }

    $("#defendText").html( "Shield: " + heroShield.vitality );
    refreshInfo();

    document.getElementById("attack").onclick = function() {
        if (ready) {
            ready = false;
            window.setTimeout(readyUp, 10000 / hero.dexterity);
            if (hero.inventory.weapon != null && hero.inventory.weapon.constructorName == 'effectItem') {
                console.log("buffing up")
                hero.inventory.weapon.buffUp(hero);
                hero.inventory.weapon.debuffUp(enemy);
            }
            if (hero.inventory.armor != null) {
                if (hero.inventory.armor.constructorName == 'effectItem') {
                    hero.inventory.armor.buffUp(hero);
                    hero.inventory.armor.debuffUp(enemy);
                }
            }
            if (hero.inventory.headgear != null) {
                if (hero.inventory.headgear.constructorName == 'effectItem') {
                    hero.inventory.headgear.buffUp(hero);
                    hero.inventory.headgear.debuffUp(enemy);
                }
            }
            hitprint = Damage(hero, enemy);
            if(enemy.vitality > 0){
            print("damageDealt", hitprint);
        }
            //jquery animations:
            $("#heroSymbol").animate({
                top: '-25px',
                left: '25px'
            }, 1, function(){
                $("#heroSymbol").animate({
                    top: '0',
                    left: '0'
                }, 10000 / (2 * hero.dexterity));
            })
            $("#attackSlider").show();
            $("#attackSlider").animate({
                width: '0px'
            }, 10000 / hero.dexterity, function() {
                $("#attackSlider").hide();
                $("#attackSlider").animate({
                    width: '110px'
                }, 1);
            });
        }
    };
    document.getElementById("defend").onclick = function() {
        if (hero_protected == false && heroShield.vitality > 0 && heroShield.shield_ready) {
            //  $("#defend").off('click');
            $("#defendSlider").show(heroShield.weight * 1000);
                heroShield.shield_ready = false;
                shieldUp = setTimeout(function(){
                    Shield();
                    // show the shield ascii
                    $("#shieldascii").html(ASCII_SHIELD) //note ASCII_SHIELD loaded from asciiart/ dir
                    shielded = setInterval(function() {
                        Shield()
                    }, heroShield.recovery * 1000);
                }, heroShield.weight * 1000);

        }
    }

    document.getElementById('combat-module').onclick = function() {
        console.log(hero_protected);
        if (heroShield.shield_ready == false && hero_protected == true || heroShield.vitality <= 0) {
            window.clearInterval(shielded);
            window.clearTimeout(shieldUp);
            $("#shieldascii").html("") // remove shield symbol
            shieldUp = -1;
            heroShield.shieldReady();
            hero_protected = false;
            //jquery animation:
            $("#defendSlider").hide('fast');
        }
    }
}

function exit_combat(room, customCombat) {
    console.log('exiting combat');
    hero.xp += room.xp;
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
                $('#enter').html('Engage')
                $("#open").hide();
                $("#enter").show();
                $("#text-module").hide();
                $("#worldMap").show();
                $("#open").off("click");
            })

        // clearAllFog(room_list[curr_floor][curr_room].room_map);
        // hero_sight = room.darkness
        //TODO: darkness for a room based on tier!
        room_list[curr_floor][curr_room].clearAllFogTimeouts();
        room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight,fog_radius);
    }
    for(var i = 0; i < hero.spells.length; i++){
        hero.spells[i].target = enemy;
        for(var n = 0; n < activeSpellEffects[hero.spells[i].name]['buffs'].length; n++){
            if(activeSpellEffects[hero.spells[i].name]['buffs'][n].target.constructorName === 'Enemy' || activeSpellEffects[hero.spells[i].name]['buffs'][n].target.constructorName === 'Boss'){
                activeSpellEffects[hero.spells[i].name]['buffs'][n].target = 'enemy';
            }
        }
        for(var m = 0; m < activeSpellEffects[hero.spells[i].name]['debuffs'].length; m++){
            if(activeSpellEffects[hero.spells[i].name]['debuffs'][m].target.constructorName === 'Enemy' || activeSpellEffects[hero.spells[i].name]['debuffs'][m].target.constructorName === 'Boss'){
                activeSpellEffects[hero.spells[i].name]['debuffs'][m].target = 'enemy';
            }
        }
    }
}

// function Dex(Character){
//   return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
// }

function update_loc_facing(key_press){
    switch (key_press) {
        case 'w':
            loc_facing = [avatarX, avatarY-1];
            break;
        case 's':
            loc_facing = [avatarX, avatarY+1];
            break;
        case 'a':
            loc_facing = [avatarX-1, avatarY];
            break;

        case 'd':
            loc_facing = [avatarX+1, avatarY];
            break;

        default:
            console.log('unknown update_loc_facing');

    }
}

function move(e) {
    if (canMove == true) {
        var didMove = false;
        var activatedTorch = false;
        var oldPos = [avatarX,avatarY]
        if (e.keyCode == "87" && avatarY > 0) { //up
            last_key_press = 'w';
            if(room_list[curr_floor][curr_room].room_map[avatarY-1][avatarX].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarY --;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "83" && avatarY < room_list[curr_floor][curr_room].room_height-1) { //down
            last_key_press = 's';
            if(room_list[curr_floor][curr_room].room_map[avatarY+1][avatarX].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarY ++;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "65" && avatarX > 0) { //left
            last_key_press = 'a';
            if(room_list[curr_floor][curr_room].room_map[avatarY][avatarX-1].passable){
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
                avatarX --;
                room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
                didMove = true;
            }
        } else if (e.keyCode == "68" && avatarX < room_list[curr_floor][curr_room].room_width-1) { //right
            last_key_press = 'd';
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
            room_list[curr_floor][curr_room].clearAllFogTimeouts();
            room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight,fog_radius);
        } else if (e.keyCode == "84"){ //t for torch
            if(hero.num_torches > 0){
                if(!torchlight){
                    console.log("Activating torch")
                    hero.num_torches--;
                    activatedTorch = true;
                    refreshInfo();
                    torchlight = true;
                    setTimeout(function(){
                        torchlight = false;
                        // if(!room_list[curr_floor][curr_room].roomCleared){
                        if(!room_list[curr_floor][curr_room].fog_free_room){
                            room_list[curr_floor][curr_room].addFogWhenTorchBurnsOut(avatarX,avatarY,fog_radius);
                            var newPos = [avatarX,avatarY];
                            room_list[curr_floor][curr_room].updateRoomHTML(newPos,newPos,torchlight,fog_radius);
                        }
                        console.log("Your torch fades to nothing."
                    )}, 10000)
                }
                else{
                    console.log("You can't turn off a torch, silly!")
                }
            }
            else{
                console.log("No torches to use!")
            }
        } else if(e.keyCode == '189'){
            //'-' removes monsters!
            //for debugging only
            openAlert("****removing monsters from the game!****")
            for(var i = 0; i < room_list.length; i++){
                for(var j = 0; j < room_list[i].length; j++){
                    room_list[i][j].fightChance = 0;
                }
            }

        }
        else if(e.keyCode == '187'){
            //'-' removes monsters!
            //for debugging only
            openAlert("****clearing floor!****")
            room_list[curr_floor][curr_room].roomCleared = true;
            var newPos = [avatarX,avatarY];
            room_list[curr_floor][curr_room].updateRoomHTML(newPos,newPos,torchlight,fog_radius);

        }
        else if(e.keyCode == '69'){
            //e for interact (#81 issues)
            //do a checkLocation with the loc_facing
            checkLocation(loc_facing[0], loc_facing[1])
        }
        update_loc_facing(last_key_press);

        if(didMove){
            doge.hero_move_update_dog(last_key_press,avatarX, avatarY, room_list[curr_floor][curr_room].room_map);
        }

        if(didMove || activatedTorch){
            var newPos = [avatarX,avatarY];
            room_list[curr_floor][curr_room].updateRoomHTML(oldPos,newPos,torchlight,fog_radius);
        }

        //chance to enter combat
        if (Math.random() < room_list[curr_floor][curr_room].fightChance  && !room_list[curr_floor][curr_room].roomCleared && didMove) {
            enter_combat(room_list[curr_floor][curr_room])

        }

        if(hero.vitality + 2 <= hero.maxVitality && didMove) {
            hero.vitality += 2;
            refreshInfo();
        } else if(hero.vitality + 1 <= hero.maxVitality && didMove){
          hero.vitality += 1;
          refreshInfo();
        }

        if(didMove){
            checkLocation(avatarX, avatarY);
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
    if(fog_radius == 1 && fogDeath == -1){
      fogDeath = setInterval(function(){
         if(fog_radius == 1 && hero.vitality > 0){
             Damage({strength: 5}, hero);
         }
         else if(hero.vitality <= 0){
             clearInterval(fogDeath);
             fogDeath = -1;
         }
         else{
             clearInterval(fogDeath);
             fogDeath = -1;
         }
         }, 1000);
    }
}

function checkLocation(avX, avY){
    //If whatever you try to interact with is interactive, call its interact function
    if(room_list[curr_floor][curr_room].room_map[avY][avX].is_interactive){
        room_list[curr_floor][curr_room].room_map[avY][avX].hero_interact();
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
            room_list[curr_floor][curr_room].clearAllFogTimeouts();
            oldmap = room_list[curr_floor][curr_room].room_map;
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;
            curr_floor++;
            curr_room = 0;
            avatarY = room_list[curr_floor][curr_room].room_entry[0];
            avatarX = room_list[curr_floor][curr_room].room_entry[1];
            update_loc_facing(last_key_press);
            room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;

            /*var gatekeep = new CharDialogue(room_list[curr_floor][curr_room].room_entry[0], room_list[curr_floor][curr_room].room_entry[1], 'gatekeeper' + curr_floor, 'the gatekeeper');
            room_list[curr_floor][curr_room].room_map[gatekeep.rowID][gatekeep.colID] = gatekeep;
            room_list[curr_floor][curr_room].room_map[gatekeep.rowID][gatekeep.colID].computeCoordsWithOffset(room_list[curr_floor][curr_room].yoff, room_list[curr_floor][curr_room].xoff);
            checkLocation(); */

            room_list[curr_floor][curr_room].buildRoomHTML(avatarX,avatarY, torchlight, fog_radius);
            doge.spawn_dog(avatarX, avatarY, oldmap, room_list[curr_floor][curr_room])


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
    $('#descend').html("Descend")
    $('#stay').html("Stay")
}

function refreshInfo() {
    //inventory
    refreshInventoryHTML(hero, heroShield)

    //magic tree:
    $("#tree-module").html('')
    for(var spell in Object.getOwnPropertyNames(spellTree)){
        if(typeof Object.getOwnPropertyNames(spellTree)[spell] != 'function'){
        var spellBox;
        var this_spell = Object.getOwnPropertyNames(spellTree)[spell];
        var objid = '#' + spellTree[this_spell]['objid']
        var top = 60 * (spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['level'] - 2);
        var left;
        if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == 1){
            left = 5 + '%';
        }
        else if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == -1){
            left = 64 + '%';
        }
        else{
            left = 35 + '%';
        }
        var toDisplay;
        if(hero.level < spellTree[this_spell]['level']){
          toDisplay = "?";
        }
        else{
          toDisplay = Object.getOwnPropertyNames(spellTree)[spell];
        }
        $("#tree-module").append("<div id='" + spellTree[this_spell]['objid'] + "' class='treeBox' style='left:" + left + ";top:" + top + "px;'>" + toDisplay + "</div>")
        if(spellTree[this_spell]['learned']){
            $(objid).css({'background-color': 'white', 'color': 'black'});
        }
        $(objid).attr('this_spell', this_spell);
        $(objid).click(function(){
            console.log($(this).attr('this_spell'))
            console.log(spellTree[$(this).attr('this_spell')])
            $("#tree-module").html("<div style='text-align:center;font-size:12px;font-family:cursive;'>" +
            $(this).attr('this_spell') + "<br><br>" +
            spellTree[$(this).attr('this_spell')]['description'] + "<br><br> Required Level: " +
            spellTree[$(this).attr('this_spell')]['level'] + "<div id='closeWindow' class='interact'>Close</div></div>");
            $("#tree-module").append("<div id='learn" + spell + "' class='interact' style='left:0; width:40px;display:none;'>Learn</div>");

            var learnID = '#learn' + spell;
            $(learnID).attr('this_spell', $(this).attr('this_spell'));
            $("#closeWindow").click(function(){
                refreshInfo();
            })
            if(!spellTree[$(this).attr('this_spell')]['learned'] && hero.level >= spellTree[$(this).attr('this_spell')]['level'] &&
            ((spellTree[$(this).attr('this_spell')]['karma'] >= 0 && hero.karma >= spellTree[$(this).attr('this_spell')]['level'] - 3) ||
            (spellTree[$(this).attr('this_spell')]['karma'] <= 0 && hero.karma <= spellTree[$(this).attr('this_spell')]['level'] * -1 + 3))){
                $(learnID).show();
                $(learnID).click(function(){
                    spellTree[$(this).attr('this_spell')]['learned'] = true;
                    hero.karma += spellTree[$(this).attr('this_spell')]['karma'];
                    if(typeof spellTree[$(this).attr('this_spell')]['active spell'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['active spell'].createButton();
                    }
                    else if(typeof spellTree[$(this).attr('this_spell')]['upgrade'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['upgrade'].upgrade();
                    }
                    refreshInfo();

                })
            }
        })
    }}


    //refresh for combat-module:
    var healthFraction = hero.vitality/hero.maxVitality;
    $("#heroHealthBar").html(
        hero.vitality + " / " + hero.maxVitality +
        "<div id='heroHealthSlider' class='statusSlider' style='width: " + healthFraction * 100 + "%'></div>"
    );
    $("#defendText").html( "Shield: " + heroShield.vitality );

}

function Damage(source, target) {
    customCombat = false;
    if(target.constructorName == 'Boss'){
        customCombat = true;
    }
    room = room_list[curr_floor][curr_room];
    hit = Math.floor(Math.random() * source.strength + source.strength);
    target.vitality -= hit;

    $("#defendText").html( "Shield: " + heroShield.vitality );

    if(target.objid != "defendText"){
        var targetHealthFrac = target.vitality / target.maxVitality * 100;
        var targetHealthObjid = "#" + target.objid + "HealthBar";
        $(targetHealthObjid).html(
            target.vitality + " / " + target.maxVitality +
            "<div id='" + target.objid + "HealthSlider' class='statusSlider' style='width: " + targetHealthFrac + "%'></div>"
        )
    }
    refreshInfo();

    //if the source was a hero (check based on if target is enemy or boss), and target dead
    if ((target.constructorName == 'Enemy' || customCombat) && target.vitality <= 0) {
        target.vitality = 0;
        window.clearInterval(enemyAttack);

        window.clearInterval(shielded);
        window.clearInterval(shieldUp)
        $("#shieldascii").html("") // remove shield symbol
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
                    mob_drop_items([mobDrops[target.lootId]])
                    // $("#open").off('click');
                    $("#open").click(function(){$("#open").off('click'); exit_combat(room, customCombat); })
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
                    mob_drop_items([target.loot])
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
    hero_protected = true;
}

function readyUp() {
    ready = true;
    return ready;
}

function refillChests(){ //rebuilds floors so that chests can be filled with newly introduced materials
  console.log('Old room 1: ')
  console.log(room_list[1][0]);
  for(var i = 1; i < room_list.length; i++){
    room_list[i] = room_list[i][0].origin_floor.build_floor();
  }
  console.log('new room 1: ')
  console.log(room_list[1][0]);
}

function take_item(item, chest_to_take_from){
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
        hero.inventory.carried.push(item)
    }
    refreshInfo();
    if(typeof chest_to_take_from != 'undefined'){
        var indexToRemove = chest_to_take_from.treasureIDs.indexOf(item.ogIdx);
        chest_to_take_from.treasureIDs.splice(indexToRemove, 1); //removes item from treasureIDs so that it will not appear on next visit of chest
    }

}

function mob_drop_items(items){
    for(var i = 0; i < items.length; i++){
        takeID = '#take'+i;
        item = $().extend({}, items[i])
        $(takeID).attr('item_id', i)
        $(takeID).click(
            function() {
                if(hero.inventory['carried'].length < 10 || items[$(this).attr('item_id')].constructorName == "Currency" || items[$(this).attr('item_id')].constructorName == "Torch"){
                    item_to_take = items[$(this).attr('item_id')];
                    if(item_to_take.constructorName != 'Consumable'){
                        take_item($().extend({},item_to_take))
                    }
                    else{
                      var temp = new Consumable(item_to_take.name, 'lul');
                      take_item(temp);
                    }

                    $(this).hide();
                }
                else {
                    openAlert("Your inventory is full");
                }
            }
        )
    }
}

function openAlert(message){
  var cached_html = '<div id="ok" class="interact" style="z-index:6;">––&#62;</div>';
  $('#alertBox').show().append(message + "<br>");
  $('#ok').click(function(){
    $('#ok').off('click');
    $('#alertBox').hide().html(cached_html);
  })
}


function openPrompt(prompt, res2){
    var resolvePrompt;
    var result;
    var openPromise = new Promise(function(resolve, reject){
        resolvePrompt = resolve;
        var cached_html = $("#textBox").html();
        var cached_input = $("#inputBox").html();
        //var resolveProm;
        // var resultPromise = new Promise(function(resolve, reject){
        //     resolveProm = resolve;
        // })

        var done = false;
        print("message", prompt);
        $("#text-module").show();
        $("#textBox").append("<div id='inputBox' style='border-style:solid;border-color:#a6a6a6;height:25px;'></div>");
        window.removeEventListener('keydown', move);
        window.addEventListener('keydown', recordKeys, false);
        function recordKeys(key){
            cached_inputArray = $("#inputBox").html().split('');
            cached_inputArray.splice(cached_inputArray.length - 1, 1);
            cached_input = cached_inputArray.join('');
            if(key.key.split("").length == 1 || key.keyCode == 32){
                $("#inputBox").append(key.key);
            }
            else if(key.keyCode == 8){
                $("#inputBox").html(cached_input);
            }
            result = $("#inputBox").html();
        }
        $("#enter").hide();
        $("#open").show().click(function(){
            $("#open").off('click').hide();
            $("#enter").show();
            window.removeEventListener('keydown', recordKeys);
            window.addEventListener('keydown', move, false);
            result = $("#inputBox").html();
            resolvePrompt(result);
            $("#textBox").html(cached_html);
            $("#text-module").hide();
            done = true;
        })
    }).then(function(){
        console.log("find result:" + result);
        if(typeof res2 != "undefined"){
            res2.push(result);
        }

        return result;
    })
    // openPromise.then(function(){
    //     return result;
    // })

    // function getStatus(){
    //     return done;
    // }
    // function updateResult(status){
    //     setTimeout(function(){
    //         if(status){
    //
    //             return result;
    //         }
    //         else{
    //             return updateResult(getStatus());
    //         }
    //     }, 2000);
    //
    // }

    return openPromise;

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
        $("#textBox").html( "You strike for " + message + " damage!");
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
        $("#textBox").html( prevMessage );
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
                if (typeof items[i][attribute] == "number" && attribute != 'value') {
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
            if(self.items[i].constructorName == 'Consumable'){

                for(var j = 0; j < self.items[i].buffArray.length; j++){

                    itemInfos[i] += "buffs: " + self.items[i].buffArray[j]['buff'].name + "<br>";
                }
                for(var k = 0; k < self.items[i].debuffArray.length; k++){
                    itemInfos[i] += "debuffs: " + self.items[i].debuffArray[k]['debuff'].name + "<br>";
                }
            }
            //build the html to print to the textBox
            itemMessage += "<div class='itemInfo' id='itemInfo" + i + "'>" + items[i].name + "<div id='take" + i + "' class='interact'> Take </div></div>"; //style='top: " + (25 + takeID*25) + "px;'>

        }
        console.log(itemInfos)
        $("#textBox").html( itemMessage );

        //need mouse listeners after itemMessage printed...
        for(var i = 0; i < items.length; i++){
            var item_to_print =  (' ' + itemInfos[i]).slice(1)
            var id = '#itemInfo'+i;
            $(id).attr('item_to_print', item_to_print)
            $(id).mouseenter(function(){
                $("#hoverInfo").html( $(this).attr('item_to_print') );
                $("#hoverInfo").show();
            })
            $(id).mouseleave(function(){
                $("#hoverInfo").hide();
            })

        }

        messageCount--; //NEED TO DECREMENT BC ITEM NOT PUSHED
    }
    else {
        $("#textBox").html( message );
        messageArray.push([messageType, message]);
    }
    messageCount++
    //console.log(messageArray.toString());
    return messageArray[messageCount-1][1];
}
