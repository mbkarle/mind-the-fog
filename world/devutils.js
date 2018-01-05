/*
 * This file should be used exclusively for functions that are helpful to
 * development + debugging but serve no role in the playing of the game.
 */

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
    map = room_list[0][2].room_map
    map[2][2] = new Fountain(2,2)
    map[2][3] = new Altar(2,3)
    map[2][4] = new Statue(2,4)
    map[2][5] = new Cave(2,5)
    map[2][6] = new Pit(2,6, "alchemist", "the alchemist")
    map[2][7] = new Pit(2,7, "shieldMaker", "the shield maker")

    //clear all fog at end
    clearAllFog(map)

    //redraw
    map[2][2].refreshInnerHTML()
    map[2][3].refreshInnerHTML()
    map[2][4].refreshInnerHTML()
    map[2][5].refreshInnerHTML()
    map[2][6].refreshInnerHTML()
    map[2][7].refreshInnerHTML()
}

// ============================================
// TEST FUNCTIONS
// ============================================

function textModBinTransFinalTest(tm){
    // Test the binary choice, transit text, and final text
    // of the text-module
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

