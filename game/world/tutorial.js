/*
 * This file is for the start of the game tutorial
 */

function tutorialStart(){ //TODO: add fight simulation; make more interactive
    // remove hero from wherever he is
    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = false;

    // spawn in tutorial room
    curr_room = 2;
    avatarX = 21;
    avatarY = 10;
    canMove = false;
    room_list[curr_floor][curr_room].room_map[avatarY][avatarX].hero_present = true;
    room_list[curr_floor][curr_room].buildRoomHTML(avatarX, avatarY, torchlight, fog_radius);

    // fade in as if from a dream
    $("#GUI-panel").fadeOut(1).fadeIn(4000)
    $("#InvOpen").fadeOut(1).fadeIn(4000)
    $("#TreeOpen").fadeOut(1).fadeIn(4000)
    $("#worldMap").fadeOut(1).fadeIn(4000, function(){

        // extra tutorial function, if go this route
        var getSchooled = function() {
            txtmd.revertTxtMd()
            var dialoguePromResolve;

            // add special key listener for checking you have moved
            window.removeEventListener('keydown', move);
            window.addEventListener('keydown', moveAndCheck, false);
            var moveProm = new Promise(function(resolve, reject) {
                dialoguePromResolve = resolve;
            });

            // After you move, discuss character interaction
            moveProm.then(function(){
                var txtmodmsg = {
                    "speaker": "voice in the dark",
                    "msgs":[["fin", "The C represents the location of a character. When facing a location, you can press E to interact."]]}
                txtmd.parseTxtMdJSON(txtmodmsg)

                // restore keylisteners
                window.removeEventListener('keydown', moveAndCheck);
                window.addEventListener('keydown', move, false);
            })

            function moveAndCheck(e){
                move(e);
                if(e.keyCode == "69"){ //if you leave the room without approaching tutorial
                    window.removeEventListener('keydown', moveAndCheck);
                    window.addEventListener('keydown', move, false);
                }
                if(avatarY <= 6 && avatarX <= 6){
                    console.log("close!")
                    dialoguePromResolve();
                }
            }
        }

        txtmodmsg = {
            "speaker": "voice in the dark",
            "msgs": [
                ["trans", "You're awake at last!"],
                ["trans", "Welcome to the dungeon. I've been trapped down here for millenia, and have learned a few tricks along the way."],
                ["prompt", "What is your name weary traveler?", USER_INFO, "name"],
                ["dec", "Would you like some instruction on how to survive?", "Yes", "No"],
                ["trans", "Great, I'll show you the ropes."],
                ["trans", "First, start by walking over to me. I'm about 7 steps up and 16 paces to the left"],
                ["finfunc", "Use the W, A, S, and D keys to move around", "Try", getSchooled]
            ]};

        txtmd.parseTxtMdJSON(txtmodmsg)
    })
}
