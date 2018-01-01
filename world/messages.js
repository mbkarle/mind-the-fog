/*
 * This file is for all message-related things including alerts,
 * prompts, etc
 */


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
