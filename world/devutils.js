/*
 * This file should be used exclusively for functions that are helpful to
 * development + debugging but serve no role in the playing of the game.
 */

// key listeners on top of the move listener!
function dev_keys() {
    window.addEventListener('keydown', devMove, false);

    function devMove(e) {
        move(e);

        // Add dev keys here!
        var room = room_list[curr_floor][curr_room]
        var map = room.room_map
        if (e.keyCode == "66") {
            console.log("Dev tools activated");
            console.log("So...., you're either a developer, or a cheater, or just lazy...")
            hero.inv.add(MasterSword); //give absurd weapons
            hero.equip_inv.equip(hero.inv.size()-1)
            hero.vitality = 100000; //set absurd health stats
            hero.maxVitality = 100000;
            refreshOpenMods()

            clearAllFog(map)
            room.clearAllFogTimeouts();
            room.buildRoomHTML(avatarX,avatarY, torchlight,fog_radius);
        }

        else if(e.keyCode == '189'){
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
            //'=' clears room!
            //for debugging only
            openAlert("****clearing room!****")
            room.roomCleared = true;
            var newPos = [avatarX,avatarY];
            room.updateRoomHTML(newPos,newPos,torchlight,fog_radius);
        }
    }

}

function unlockAllNPCS(){
    NPCKeys = Object.keys(NPCS)
    for(var i = 0; i < NPCKeys.length; i++){
        NPCS[NPCKeys[i]]["active"] = true
    }
    start_game()
    hero.inv.gold += 10000
}

// a temporary replacement to check functionality while we decide
// on the hard values of items
function randGenInvValues(){
    for(var i = 0; i < itemList1.length; i++){
        itemList1[i].value = Math.floor(Math.random() * 300)
    }
    for(var i = 0; i < itemList2.length; i++){
        itemList2[i].value = Math.floor(Math.random() * 300)
    }
    for(var i = 0; i < itemList3.length; i++){
        itemList3[i].value = Math.floor(Math.random() * 300)
    }
}

// function to debug the dog (call in console)
function where_is_doge(){
    var doge_locs = []
    for(var i = 0; i < room_list.length; i++){
        for(var j= 0; j < room_list[0].length; j++){
            for(var r = 0; r < room_list[i][j].room_map.length; r++){
                for(var c = 0; c < room_list[i][j].room_map[0].length; c++){
                    if(room_list[i][j].room_map[r][c].dog_present){
                        doge_locs.push([i, j, room_list[i][j].room_map[r][c]])
                    }
                }
            }
        }
    }
    return doge_locs;
}

function populateFirstRoom(){
    //func to populate the training room w Locs for dev
    //purposes
    map = room_list[0][1].room_map
    map[2][2] = new Fountain(2,2)
    map[2][3] = new Altar(2,3)
    map[2][4] = new Statue(2,4)
    map[2][5] = new Cave(2,5)
    map[2][6] = new Pit(2,6, "alchemist", "the alchemist")
    map[2][7] = new Pit(2,7, "shieldMaker", "the shield maker")
    map[2][8] = new Merchant(2,8, itemList1)

    //clear all fog at end
    clearAllFog(map)

    //redraw
    map[2][2].refreshInnerHTML()
    map[2][3].refreshInnerHTML()
    map[2][4].refreshInnerHTML()
    map[2][5].refreshInnerHTML()
    map[2][6].refreshInnerHTML()
    map[2][7].refreshInnerHTML()
    map[2][8].refreshInnerHTML()
}

// ============================================
// TEST FUNCTIONS
// ============================================

function textModBinTransFinalTest(tm){
    // Test the binary choice, transit text, and final text
    // of the txt-module
    tm.binaryDecision("wassup", "yee", "nay", function() {
        tm.transitText("in transit woooo", function(){
            tm.finalText("bye felicia", 'Me');
        })
    }, 'God')
}

function textModJSONTest(tm){
    // Test the JSON functionality...
    var obj = {
        "speaker": "the hooded one",
        "msgs": [
            ["trans", "hello"],
            ["dec", "Should I stay or should I go now?", "stay", "go"],
            ["trans", "Im glad you stayed..."],
            ["dec", "You SURE?", "STAY", "GO"],
            ["fin", "you ded foo"]
        ]}

    tm.parseTxtMdJSON(obj)
}

function textModJSONTestWBinFunc(tm){
    // Test the JSON functionality for things like Altar
    var func = function(){ console.log("stuff done to hero"); return "Func complete" }
    var obj = {
        "speaker": "middle func",
        "msgs": [
            ["trans", "hello"],
            ["dec", "act on hero?", "yee", "nah, G"],
            ["trans", func], //the output of the above decision happens
            ["fin", "cool stuff, man"]
        ]}

    tm.parseTxtMdJSON(obj)
}

function textModJSONTestWFinFunc(tm){
    // Test the JSON functionality for things like Altar
    var func = function(){ console.log("Enter the combat"); tm.revertTxtMd();}
    var obj = {
        "speaker": "monster",
        "msgs": [
            ["trans", "hello"],
            ["dec", "engage hero?", "yee", "nah, G"],
            ["finfunc", "this will be your downfall", "ENGAGE", func] //the output of the above decision happens
        ]}

    tm.parseTxtMdJSON(obj)
}

function testCombat(){
    enter_combat(room_list[curr_floor][curr_room])
}
