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
        this.empty = false;
        var self = this;
        this.encounter = function(){
            print('message', this.message);
            canMove = false;
            $("#text-module").show();
            $("#enter").hide();
            $("#stay").show().html('Leave').click(function(){
                revertTextModule();
            })
            $("#descend").show().html('Rescue').click(function(){
                revertTextModule();
                if(Math.random() < .4){
                    self.message = 'You descend carefully and reach the bottom unscathed.';
                }
                else{
                    self.message = 'You make it to the bottom, slightly worse for wear.';
                    hero.vitality -= 10;
                    refreshInfo();
                }
                print('message', self.message);
                $("#text-module").show();
                $("#enter").hide();
                $("#descend").off('click').hide();
                $("#stay").off('click').hide();
                $("#open").show().click(function(){
                    $("#open").off('click').hide();
                    self.used = true;
                    dialogues['trapped'][self.charID].push("Together you climb out. The gatekeeper will take care of " +  self.charDisplay + " from here.");
                    self.interact(self, dialogues['trapped'][self.charID], 0);
                })
            })
        }
    }
    hero_interact(){
        if(!this.used){
            this.encounter();
        }
    }
    interact(self, stringArray, thisMessage){
        if(thisMessage == 0 || thisMessage == stringArray.length - 1){
            print('message', stringArray[thisMessage]);
        }
        else{
        print("message", "<div style='font-size:12px;position:absolute;top:0;left:10px;'>" + self.charDisplay + "</div>" + stringArray[thisMessage]);
    }
      NPCList[self.charID]['active'] = true;
        $("#open").show();
        $("#open").click(
            function() {
                $("#open").off('click');
                if(thisMessage + 1 < stringArray.length){
                    console.log("next panel");
                    thisMessage++;
                    self.interact(self, stringArray, thisMessage);
                }
                else{
                    console.log("dialogue over");
                    $("#open").hide();
                    $("#enter").show();
                    $("#text-module").hide();
                    print("lastMessage", "enemy-message");
                    canMove = true;
                }
            }
        )
    }
}

class CharDialogue extends Location{
    constructor(rowID, colID, charId, charDisplay){
        super(rowID, colID, 'Character Dialogue', 'charDialogue', 'C', "", false, true);
        this.charId = charId;
        this.charDisplay = charDisplay;
        var self = this;

        this.dialogue = function(stringArray, thisMessage, promResolve){
        print("message", "<div style='font-size:12px;position:absolute;top:0;left:10px;'>" + this.charDisplay + "</div>" + stringArray[thisMessage]);
        $("#text-module").show();
        $("#enter").hide();
        $("#open").show();
        $("#open").click(
            function() {
                $("#open").off('click');
                if(thisMessage + 1 < stringArray.length){
                    console.log("next panel");
                    thisMessage++;
                    self.dialogue(stringArray, thisMessage, promResolve);
                }
                else{
                    if(typeof promResolve != "undefined"){
                        console.log("resolving promise");
                        promResolve();
                    }
                    console.log("dialogue over");
                    $("#open").hide();
                    $("#enter").show();
                    $("#text-module").hide();
                    print("lastMessage", "enemy-message");
                    canMove = true;
                }
            }
        )
        }
    }
    hero_interact(){
        canMove = false;
        this.dialogue(dialogues[this.charId], 0);
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