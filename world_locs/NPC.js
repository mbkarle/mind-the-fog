/*
 * This file contains all NPC related locations.
 * Currently this is:
 *   1. Pit (where you find the NPC)
 *   2. NPC (interacting with one)
 *   3. CharDialogue (like NPC-lite, just a dialogue)
 */

class Pit extends Location{
    constructor(rowID, colID, charID, charDisplay){
        super(rowID, colID, "Pit", 'pit', 'p', 'A pitfall, once covered with crumbled stone. Someone appears trapped within.', false, true)
        this.charID = charID;
        this.charDisplay = charDisplay;
        this.used = false;
    }

    hero_interact(){
        if(!this.used){
            canMove = false;
            var self = this;

            // Chance to get hurt, occurs if decide to not leave
            var rescueFunc = function() {
                self.used = true;
                if(Math.random() < .4){
                    return 'You descend carefully and reach the bottom unscathed.';
                }
                else{
                    hero.vitality -= 10;
                    refreshInfo();
                    return 'You make it to the bottom, slightly worse for wear.';
                }
            }

            // After the rescue chance of hurt, start dialog
            var dialogFunc = function() { 
                // Push the start message
                DIALOGUES[self.charID]['rescue'].push(
                    "Together you climb out. The gatekeeper will take care of " +
                        self.charDisplay + " from here.");

                // Activate the NPC to be in GreatHall
                NPCList[self.charID]['active'] = true;

                // Start the dialog
                txtmd.startDialog(self.charID, "rescue", self.charDisplay)
            }

            var txtmodmsg = { "msgs": [
                ["dec", this.message, "Rescue", "Leave"],
                ["finfunc", rescueFunc, "-->", dialogFunc]
            ]};

            txtmd.parseTxtMdJSON(txtmodmsg)
        }
    }
}

class CharDialogue extends Location{
    constructor(rowID, colID, charId, charDisplay, dialogId){
        super(rowID, colID, 'Character Dialogue', 'charDialogue', 'C', "", false, true);
        this.charId = charId;
        this.charDisplay = charDisplay;
        this.dialogId = dialogId;
    }

    hero_interact(){
        canMove = false;
        txtmd.startDialog(this.charId, this.dialogId, this.charDisplay)
    }

}

class NPC extends Location {
    constructor(rowID, colID, name){
        super(rowID, colID, name, 'npc', NPCList[name]['symbol'], NPCList[name]['description'], false, true);
        this.onSale = NPCList[name]['merchandise'];
        var self = this;
        this.interact = function(){
          canMove = false;
          print('message', this.message);
          $('#text-module').show();
          $('#enter').hide();
          $('#open').show().click(function(){
            self.openNPCModule(self);
            $('#open').hide().off('click');
            $('#text-module').animate({
              top: '175px'
            })
          })
        }
    }
    hero_interact(){
        if(this.onSale.length > 0){
            this.interact();
        }
    }
    openNPCModule(self){
      $('#worldMap').hide();
      $("#vendor-module").show();
      $("#tab").hide();
      var itemMessage = "On sale: <br>";
      var itemInfos = [];
      for(var i = 0; i < self.onSale.length; i++){
        itemInfos.push((self.onSale[i].name + "<br>"))
        for (attribute in self.onSale[i]) {
            if (typeof self.onSale[i][attribute] == "number" && attribute != 'value') {
                if(self.onSale[i].constructorName != 'ShieldUpgrade'){
                    if(self.onSale[i][attribute] >= 0){
                        itemInfos[i] += attribute + ": +" + self.onSale[i][attribute] + "<br>";
                    }
                    else{ //issue #49
                        itemInfos[i] += attribute + ": " + self.onSale[i][attribute] + "<br>";
                    }
                }
                else{
                    itemInfos[i] += attribute + ": " + self.onSale[i][attribute] + "<br>";
                }
            }
        }
        if(self.onSale[i].constructorName == 'effectItem'){

            for(var j = 0; j < self.onSale[i].buffArray.length; j++){

                itemInfos[i] += "buffs: " + self.onSale[i].buffArray[j].name + "<br>";
            }
            for(var k = 0; k < self.onSale[i].debuffArray.length; k++){
                itemInfos[i] += "debuffs: " + self.onSale[i].debuffArray[k].name + "<br>";
            }
        }
        if(self.onSale[i].constructorName == 'Consumable'){

            for(var j = 0; j < self.onSale[i].buffArray.length; j++){

                itemInfos[i] += "buffs: " + self.onSale[i].buffArray[j]['buff'].name + "<br>";
            }
            for(var k = 0; k < self.onSale[i].debuffArray.length; k++){
                itemInfos[i] += "debuffs: " + self.onSale[i].debuffArray[k]['debuff'].name + "<br>";
            }
        }

        itemMessage += "<div class='itemInfo' id='onSale" + i + "' style='border-width:2px;'>" + self.onSale[i].name + "<div id='buy" + i + "' class='interact'>" +  "</div></div>";
      }
      $('#vendor-contents').html(itemMessage);
      if(self.onSale.length > 0){
          self.onSale[0].drop_onSale(self);
      }


      for(var i = 0; i < self.onSale.length; i++){
          var item_to_print =  (' ' + itemInfos[i]).slice(1)
          var id = '#onSale'+i;
          $(id).attr('item_to_print', item_to_print)
          $(id).mouseenter(function(){
              $("#vendor-hover").html( $(this).attr('item_to_print') );
              $("#vendor-hover").show();
          })
          $(id).mouseleave(function(){
              $("#vendor-hover").hide();
          })

      }
      $("#close").click(function(){
          self.closeModule();
      })
    }

    closeModule(){
        $("#tab").show();
        canMove = true;
        $("#worldMap").show();
        $("#vendor-module").hide();
        revertTextModule();
        refreshInfo();
        $("#close").off('click');
    }
}
