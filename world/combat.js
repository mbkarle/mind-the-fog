/*
 * This file contains combat related functions
 */


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
