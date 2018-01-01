/*
 * This file should house all inventory related functions
 */

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
