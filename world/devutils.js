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

// ============================================
// TEST FUNCTIONS
// ============================================

function textModBinTransFinalTest(){
    // Test the binary choice, transit text, and final text
    // of the text-module
    tm = new TextModule()
    tm.binaryDecision("wassup", "yee", "nay", function() {
        tm.transitText("in transit woooo", function(){
            tm.finalText("bye felicia", 'Me');
        })
    }, 'God')
}
