/*
 * This file should be for the TextModule, the main way of
 * sending any text to the user (dialogue, info, chests, etc...)
 *
 * The goal of this file is to provide an abstraction layer
 * for the HTML changes, thus giving a consistent experience to the
 * outside code.
 */

class TextModule {
    constructor() {
        // The html id of the html element.
        this.modID = "#text-module_";
        this.textID = "#textBox_";
        this.botBtn = "#tmbtn_bot"
        this.topBtn = "#tmbtn_top"

        //reset each parse, indicates whether player completed parse
        this.parseCompleted = false;
    }

    startDialog(speakerID, dialogID, speakerName) {
        // A function for a character dialogue
        // Given @speaker and @dialogID, starts the appropriate dialogue in
        // dialogues.json

        // convo is the list of strings
        var convo = DIALOGUES[speakerID][dialogID]
        var msgs = []

        // iterate through convo, add appropriate list to msgs
        for(var i = 0; i < convo.length - 1; i++){
            msgs.push(["trans", convo[i]])
        }
        // last message is final text
        msgs.push(["fin", convo[i]])

        // assemble json w speaker and use parse func to do dialogue
        var txtmodmsg = { "speaker": speakerName, "msgs": msgs }
        this.parseTxtMdJSON(txtmodmsg);
    }

    binaryDecision(text, posBtnText, negBtnText, cb, speaker) {
        // A function for any time there is a binary decision
        // takes custom parameters for what text to show
        // and what function to execute if pos (neg = exit)

        // Update HTML
        this.setTextBox(text, speaker)
        $(this.topBtn).html(posBtnText)
        $(this.botBtn).html(negBtnText)

        // Show module + needed buttons
        $(this.modID).show()
        $(this.topBtn).show()
        $(this.botBtn).show()

        // Set click listeners
        var self = this;
        $(this.topBtn).click(function(){
            self.revertBtns();
            cb();
        });
        $(this.botBtn).click(function(){self.revertTxtMd()})
    }

    transitText(text, cb, speaker) {
        // A function to show text with only one button which
        // calls func cb.
        // Intended for cb to be a decision or final text.

        // Update HTML
        this.setTextBox(text, speaker)
        $(this.botBtn).html("-->")

        // Show module + needed buttons
        $(this.modID).show()
        $(this.botBtn).show()

        // Set click listeners
        var self = this;
        $(this.botBtn).click(function(){
            self.revertBtns();
            cb();
        });
    }

    finalText(text, speaker) {
        // The final text, only one button showed, exit

        // Update HTML
        this.setTextBox(text, speaker)
        $(this.botBtn).html(" X ")

        // Show module + needed buttons
        $(this.modID).show()
        $(this.botBtn).show()

        // Set click listeners
        var self = this;
        $(this.botBtn).click(function(){self.revertTxtMd()})
    }

    finalFunc(text, btnTxt, cb, speaker) {
        // The final text, only one button showed, function
        // Example use: Engage for combat

        // Update HTML
        this.setTextBox(text, speaker)
        $(this.botBtn).html(btnTxt)

        // Show module + needed buttons
        $(this.modID).show()
        $(this.botBtn).show()

        // Set click listeners
        $(this.botBtn).click(cb)
    }

    parseTxtMdJSON(json) {
        // Given a text-mod json, parse into the appropriate nested
        // function calls
        // ex:
        // {
        //      //speaker of all messages
        //      "speaker": "hooded one",
        //
        //      //the array of messages, each msg an array of format
        //      //[TYPE, arg0, arg1...]
        //      //NOTE: the presence of another msg indicates the cb it to go to that msg
        //      "msgs" : [
        //           ["dec", "Stay or go now?", "stay", "go"],
        //           ["transit", "Glad you stayed..."],
        //           ["combat", "Now I will eat you! muahahaha"]
        //      ]
        //  }
        //  This starts with a decision, shows transition text,
        //  and ends with a custom combat

        this.parseCompleted = false; // always start w false completion

        var speaker = json["speaker"]
        var msgs = json["msgs"]

        // go through all messages, build nested function
        // easiest to do by recursively calling this function
        if(msgs.length == 1){
            // base case! no recursive cb
            // execute the function in arg0 using type map with all else as args
            var args = [...msgs[0].splice(1), speaker]
            this.parseCompleted = true; // set to true so user knows full parse completed
        }
        else{
            // Assume cb is to the next tm display func
            var newJson = {"speaker": speaker, "msgs": msgs.splice(1)} // create a new json 4 recursion
            var self = this;
            var cb = function() { self.parseTxtMdJSON(newJson) } // create cb
            var args = [...msgs[0].splice(1), cb, speaker]
        }

        //switch case over the type of function.
        switch(msgs[0][0]){
            case "dec":
                this.binaryDecision(...args)
                break;
            case "trans":
                this.transitText(...args)
                break;
            case "fin":
                this.finalText(...args)
                break;
            case "finfunc":
                this.finalFunc(...args)
                break;
            default:
                alert("UNKNOWN TEXTMOD CASE")
                break;
        }
    }

    revertTxtMd() {
        // Revert back to normal, make disappear
        // hide module
        console.log("reverting..." + this.modID)
        canMove = true;
        this.revertBtns();
        $(this.modID).hide()
        console.log("parse completed: " + this.parseCompleted)
        return this.parseCompleted
    }

    revertBtns() {
        // Revert all buttons

        // Turn off click listeners
        $(this.topBtn).off("click")
        $(this.botBtn).off("click")

        // Hide buttons
        $(this.topBtn).hide()
        $(this.botBtn).hide()
    }

    showInventory() {
        // Show an inventory (chest, dog, monster, etc)

        // TODO
    }

    setTextBox(text, speaker) {
        // Custom helper for text box to handle speaker/lack of
        if(typeof speaker == 'undefined'){
            var spkrtext = ""
        }
        // Else build html
        else{
            var spkrtext = `<div style="font-size:12px;position:absolute;top:0;left:10px;">${speaker}</div>`
        }
        if(typeof text == 'function'){
            text = text(); // execute function, needs to return the text to display in mod
        }
        $(this.textID).html(spkrtext + text)
    }
}
