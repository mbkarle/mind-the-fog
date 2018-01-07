/*
 * This file should house all inventory related functions
 */

function refreshInventoryHTML(hero, shield) {
    // For the refreshInfo() function in main

    // First get the inventory in question
    var inv = hero.inventory

    // Status part -------------------------------------------------------
    // Update health sliders --------------------------
    var healthFraction = hero.vitality/hero.maxVitality;
    var shieldHealthFraction = shield.vitality/shield.maxVitality;

    var charInfoHTML = "Health: <br><div id='healthBar' class='statusBar'>" +
        hero.vitality + " / " + hero.maxVitality +
        "<div id='healthSlider' class='statusSlider'></div></div><br><br><hr style='width: 80%'><br>" +
        "Shield Health: <br><div id='shieldHealthBar' class='statusBar'>" +
        shield.vitality + " / " + shield.maxVitality +
        "<div id='shieldHealthSlider' class='statusSlider'></div></div><br>";

    $('#characterInfo').html(charInfoHTML)

    // health sliders
    document.getElementById("healthSlider").style.width = 180 * healthFraction + "px";
    document.getElementById("shieldHealthSlider").style.width = 180 * shieldHealthFraction + "px";

    // Update XP --------------------------------------
    hero.levelCheck();
    var xpFraction = (hero.xp - hero.level * 1000) / 1000;
    var xpHTML = "<div id='xpBar' class='statusBar' style='width: 60px'>Level: " +
        hero.level + "<div id='xpSlider' class='statusSlider'></div></div>";

    $("#xp").html(xpHTML)

    // xp slider
    document.getElementById("xpSlider").style.width = 60 * xpFraction + "px";

    // Update Gold ------------------------------------
    $("#gold").html(hero.wallet + " gold")

    // Update Torches ---------------------------------
    var torchtext = '';
    if(hero.num_torches > 0){
        torchtext = 't'
        for(var i = 0; i < hero.num_torches-1; i++){
            torchtext += "    t"
        }
    }
    $('#torchcount').html(torchtext)

    // The equipped section ------------------------------------------------
    var inventoryMessage = "Equipped: <br><br>"
    for(attribute in inv){
        if(inv[attribute] != null && attribute !== 'carried'){
            inventoryMessage += attribute + ": " + inv[attribute].name + "<br><br>";
        }
    }

    // The carried section -----------------------------------------------
    inventoryMessage += "<hr style='width: 80%'> Carried: <br><br>"
    items_carried = inv['carried'];
    for(var i = 0; i < items_carried.length; i++){
        if (items_carried[i].equipped){
            inventoryMessage += "<div class='invCarry' id='invInfo" + i + "'>" + items_carried[i].name + "<div id='carried" + i + "' class='interact'> Unequip </div></div> <br><br>"; //style='top: " + (25 + takeID*25) + "px;'>
        }
        else{
            inventoryMessage += "<div class='invCarry' id='invInfo" + i + "'>" + items_carried[i].name +
            "<div id='carried" + i + "' class='interact'> Equip </div><div id='invDrop" + i + "' class='interact small'>x</div></div> <br><br>"; //style='top: " + (25 + takeID*25) + "px;'>
        }
    }
    $("#inventory").html(inventoryMessage);

    // Hover infos for the items -------------------------------------------
    itemInfos = []
    var item_to_compare;
    for(var i = 0; i < items_carried.length; i++){
        //store all the item infos to be displayed upon hover...
        itemInfos.push((items_carried[i].name + "<br>"))
        for (attribute in items_carried[i]) {
            if (typeof items_carried[i][attribute] == "number" && attribute != 'value') {
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
        if(items_carried[i].constructorName == 'Consumable'){

            for(var j = 0; j < items_carried[i].buffArray.length; j++){

                itemInfos[i] += "buffs: " + items_carried[i].buffArray[j]['buff'].name + "<br>";
            }
            for(var k = 0; k < items_carried[i].debuffArray.length; k++){
                itemInfos[i] += "debuffs: " + items_carried[i].debuffArray[k]['debuff'].name + "<br>";
            }
        }
    }

    //set equip listeners to inventory --------------------------------------
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
        $(invCarID).attr('inv_idx', i);
        if(items_carried[$(carriedID).attr('inv_idx')].constructorName != 'Consumable'){
            if(!items_carried[$(carriedID).attr('inv_idx')].equipped){
                $(carriedID).click(function(){
                    equip(hero,items_carried[$(this).attr('inv_idx')])
                    refreshInfo()
                })
            }
            else{
                $(carriedID).click(function(){
                    Unequip(hero, items_carried[$(this).attr('inv_idx')]);
                    refreshInfo();
                })
            }
        }
        else{
            $(carriedID).html('Use').click(function(){
                items_carried[$(this).attr('inv_idx')].useConsumable(items_carried[$(this).attr('inv_idx')]);
                items_carried.splice($(this).attr('inv_idx'), 1);
                refreshInfo();
            })
        }
        $(dropID).click(function(){
          console.log($(this).attr('drop_idx'));
          items_carried.splice($(this).attr('drop_idx'), 1);
          refreshInfo();
        })
        $(invCarID).mouseenter(function(){
            $("#inv_hoverInfo").html($(this).attr('item_to_print'));
            $("#inv_hoverInfo").show();
            if(inv[items_carried[$(this).attr('inv_idx')].type] != null && inv[items_carried[$(this).attr('inv_idx')].type].name != items_carried[$(this).attr('inv_idx')].name){

                for(var m = 0; m < items_carried.length; m++){
                    if(items_carried[m].name == inv[items_carried[$(this).attr('inv_idx')].type].name){
                        item_to_compare = (' ' + itemInfos[m]).slice(1);
                        break;
                    }
                }
                $("#hoverCompare").html(item_to_compare).show();
            }

        })
        $(invCarID).mouseleave(function(){
            $("#inv_hoverInfo").hide();
            $("#hoverCompare").hide();
        })
    }
}

function equip(target, equipment) {
    inventory = target.inventory

    // console.log(target.name + " equipped " + equipment.name);
    equipment.equipped = true;
    if(inventory[equipment.type] != null && equipment.constructorName != "Currency"){
        temp_item = inventory[equipment.type];
        Unequip(hero, temp_item, true);
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

function Unequip(target, equipment, replace) {
    // console.log(target.name + " unequipped " + equipment.name) // finish inventory

    inventory = target.inventory

    //go through and update stats
    equipment.equipped = false;
    inventory[equipment.type] = null;
    var attribute;
    for (attribute in equipment) {
        if (typeof equipment[attribute] == "number") {
            target[attribute] -= equipment[attribute];
            if(target.vitality <= 0){
                target.vitality = 1;
            }
        }
    }
    if(!replace){
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
    }

}
