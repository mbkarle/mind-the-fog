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
