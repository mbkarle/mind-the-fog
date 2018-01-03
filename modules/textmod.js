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
        console.log(this.modID)
    }
    
    startDialogue(dialogID) {
        // A function for a character dialogue
        // Given @dialogID, starts the appropriate dialogue in
        // dialogues.json

        // TODO
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

    revertTxtMd() {
        // Revert back to normal, make disappear
        // hide module
        console.log("reverting..." + this.modID)
        this.revertBtns();
        $(this.modID).hide()
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
        $(this.textID).html(spkrtext + text)
    }
}
