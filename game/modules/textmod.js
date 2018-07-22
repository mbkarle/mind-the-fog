/*
 * This file should be for the TextModule, the main way of
 * sending any text to the user (dialogue, info, chests, etc...)
 *
 * The goal of this file is to provide an abstraction layer
 * for the HTML changes, thus giving a consistent experience to the
 * outside code.
 */

class TextModule {
  constructor () {
    // The html id of the html element.
    this.modID = '#text-module_'
    this.textID = '#textBox_'
    this.botBtn = '#tmbtnBot'
    this.topBtn = '#tmbtnTop'
    this.input = '#inputBox'

    // reset each parse, indicates whether player completed parse
    this.parseCompleted = false

    // position of text box (for animation)
    this.posID = 'norm'

    // hover info
    this.hoverID = '#hoverInfo_'

    // for refreshing inv using refreshOpenMods
    this.openAndChanging = false
    this.refreshFunc = null
  }

  commentator (text, speaker) {
    // Commentator style, no buttons, just updates text
    // Ex: use in combat as hit done on fly

    // Update HTML
    this.setTextBox(text, speaker)

    // Show Module
    $(this.modID).show()
  }

  setPosition (posID, hero) {
    // animate the position of the textbox
    if (posID === this.posID) {
      return
    }
    switch (posID) {
      case 'norm':
        this.posID = 'norm'
        $(this.modID).animate({ top: '175px' }, 1000)
        break

      case 'high':
        this.posID = 'high'
        $(this.modID).animate({top: '100px'}, 1000)
        break

      case 'combat':
        this.posID = 'combat'
        // need to determine from hero how many spells
        // to leave space for
        if (hero.spells.length % 2 !== 0) {
          $(this.modID).animate({
            top: 300 + 50 * hero.spells.length + 'px'
          })
        } else if (hero.spells.length % 2 === 0 && hero.spells.length !== 0) {
          $(this.modID).animate({
            top: 300 + 50 * (hero.spells.length - 1) + 'px'
          })
        } else {
          $(this.modID).animate({
            top: '300px'
          }, 500)
        }
        break

      default:
        alert('UNKNOWN TXTMD ANIMATION')
        break
    }
  }

  startDialog (speakerID, dialogID, speakerName, cb) {
    // A function for a character dialogue
    // Given @speaker and @dialogID, starts the appropriate dialogue in
    // dialogues.json

    // convo is the list of strings
    var convo = DIALOGUES[speakerID][dialogID]
    var msgs = []

    // iterate through convo, add appropriate list to msgs
    for (var i = 0; i < convo.length - 1; i++) {
      msgs.push(['trans', convo[i]])
    }
    // last message is final text
    if (typeof cb === 'undefined') { msgs.push(['fin', convo[i]]) } else { msgs.push(['finfunc', convo[i], '-->', cb]) }

    // assemble json w speaker and use parse func to do dialogue
    var txtmodmsg = { 'speaker': speakerName, 'msgs': msgs }
    this.parseTxtMdJSON(txtmodmsg)
  }

  binaryDecision (text, posBtnText, negBtnText, cb, speaker) {
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
    var self = this
    $(this.topBtn).click(function () {
      self.revertBtns()
      cb()
    })
    $(this.botBtn).click(function () { self.revertTxtMd() })
  }

  transitText (text, cb, speaker) {
    // A function to show text with only one button which
    // calls func cb.
    // Intended for cb to be a decision or final text.

    // Update HTML
    this.setTextBox(text, speaker)
    $(this.botBtn).html('-->')

    // Show module + needed buttons
    $(this.modID).show()
    $(this.botBtn).show()

    // Set click listeners
    var self = this
    $(this.botBtn).click(function () {
      self.revertBtns()
      cb()
    })
  }

  finalText (text, speaker) {
    // The final text, only one button showed, exit

    // Update HTML
    this.setTextBox(text, speaker)
    $(this.botBtn).html(' X ')

    // Show module + needed buttons
    $(this.modID).show()
    $(this.botBtn).show()

    // Set click listeners
    var self = this
    $(this.botBtn).click(function () { self.revertTxtMd() })
  }

  finalFunc (text, btnTxt, cb, speaker) {
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

  parseTxtMdJSON (json) {
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
    //           ["finfunc", "Now I will eat you! muahahaha", fightEnemy(hero, Boss)]
    //      ]
    //  }
    //  This starts with a decision, shows transition text,
    //  and ends with a custom combat

    // prevent hero from moving
    canMove = false

    this.parseCompleted = false // always start w false completion

    var speaker = json['speaker']
    var msgs = json['msgs']

    // go through all messages, build nested function
    // easiest to do by recursively calling this function
    if (msgs.length === 1) {
      // base case! no recursive cb
      // execute the function in arg0 using type map with all else as args
      var args = [...msgs[0].splice(1), speaker]
      this.parseCompleted = true // set to true so user knows full parse completed
    } else {
      // Assume cb is to the next tm display func
      var newJson = {'speaker': speaker, 'msgs': msgs.splice(1)} // create a new json 4 recursion
      var self = this
      var cb = function () { self.parseTxtMdJSON(newJson) } // create cb
      var args = [...msgs[0].splice(1), cb, speaker]
    }

    // switch case over the type of function.
    switch (msgs[0][0]) {
      case 'dec':
        this.binaryDecision(...args)
        break
      case 'trans':
        this.transitText(...args)
        break
      case 'fin':
        this.finalText(...args)
        break
      case 'finfunc':
        this.finalFunc(...args)
        break
      case 'prompt':
        this.showPrompt(...args)
        break
      default:
        alert('UNKNOWN TEXTMOD CASE')
        break
    }
  }

  revertTxtMd () {
    // Revert back to normal, make disappear
    // hide module
    this.setPosition('norm')
    canMove = true
    this.revertBtns()
    $(this.modID).hide()
    $(this.hoverID).hide()
    $(this.input).hide()
    this.refreshFunc = null
    this.openAndChanging = false
    return this.parseCompleted
  }

  revertBtns () {
    // Revert all buttons

    // Turn off click listeners
    $(this.topBtn).off('click')
    $(this.botBtn).off('click')

    // Hide buttons
    $(this.topBtn).hide()
    $(this.botBtn).hide()
  }

  showInventory (inv, cb) {
    // Show an inventory (chest, dog, monster, etc)

    // Establish refresh func for refreshOpenMods()
    this.refreshFunc = () => this.showInventory(inv, cb)
    this.openAndChanging = true

    // Necessary info for generating inv html:
    var modIds = {
      'hoverID': this.hoverID,
      'uniqueID': 'txtmd'
    }

    var modCbs = {
      'torchcb': () => inv.transferItem(hero.inv, 'torches'),
      'goldcb': () => inv.transferItem(hero.inv, 'gold'),
      'actioncb': (id) => inv.transferItem(hero.inv, id),
      'actiontxt': () => 'Take'
    }

    // Display the inner html ------------------------------
    var invHTMLObj = inv.generateHTML(modIds, modCbs)

    var innerhtml = invHTMLObj['innerhtml']
    var header = 'You Find: <br>'
    if (innerhtml === '') {
      innerhtml = header + 'Nothing left to take'
    } else { innerhtml = header + innerhtml }

    this.setTextBox(innerhtml)

    // Mouse Listeners--------------------------------------
    invHTMLObj['setClicks']()

    // At the end of it all, show the txtmd!
    var self = this
    $(this.modID).show()
    $(this.botBtn).show()
    $(this.botBtn).html('X')
    if (typeof cb === 'undefined') {
      $(this.botBtn).off().click(function () { self.revertTxtMd() })
    } else { $(this.botBtn).off().click(cb) }
  }

  setTextBox (text, speaker) {
    // Custom helper for text box to handle speaker/lack of
    if (typeof speaker === 'undefined') {
      var spkrtext = ''
    }
    // Else build html
    else {
      var spkrtext = `<div style="font-size:12px;position:absolute;top:0;left:10px;">${speaker}</div>`
    }
    if (typeof text === 'function') {
      text = text() // execute function, needs to return the text to display in mod
    }
    $(this.textID).html(spkrtext + text)
  }

  showPrompt (text, saveobj, savekey, cb, speaker) {
    // Display text in text box (above input box)
    this.setTextBox(text, speaker)
    // Set input html
    $(this.input).html("<form id='TXTFORM'> <input id='TXTMDINPUT' type='text' name='firstname'><br>")
    // Disable form submit
    $('#TXTFORM').submit(function () {
      return false
    })
    // Show the input and box
    $(this.input).show()
    $(this.modID).show()

    // Remove the normal key listeners
    window.removeEventListener('keydown', move)
    if (DEVUTILS) {
      window.removeEventListener('keydown', devKeys)
    }

    // Show button and save the input to the @saveloc
    this.revertBtns()
    var self = this
    $(this.botBtn).html('Done').show().click(function () {
      // save input
      saveobj[savekey] = $('#TXTMDINPUT').val()
      // hide the input
      $(self.input).hide()
      // restore move listener
      window.addEventListener('keydown', move, false)
      if (DEVUTILS) {
        window.addEventListener('keydown', devKeys, false)
      }
      // call the cbs
      if (typeof cb !== 'undefined') { cb() } else { txtmd.revertTxtMd() }
    })
  }
}
