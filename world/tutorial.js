/*
 * This file is for the start of the game tutorial
 */

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

