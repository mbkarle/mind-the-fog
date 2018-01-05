/*
 * This file should be for the Merchat location
 * TODO: Move the html to modules/
 */
class Merchant extends Location{ // problems with selling: page needs to refresh when items are equipped in the inventory (equipped items shouldn't be sold)
    constructor(rowID, colID, itemList){
        super(rowID, colID, "Merchant", "merchant", "m", "Another wanderer has set up shop here, vending his wares – for a price.", false, true);
        this.itemList = itemList;
        this.onSale = [];
        this.excludedItems = 0;
        this.pickItems = function(){
            this.num_items = 3 + Math.floor(Math.random() * 6);
            for(var i = 0; i < this.num_items; i++){
                var thisItem = Math.floor(Math.random() * this.itemList.length);
                var itemListfor_idx;
                if(this.itemList[thisItem].constructorName == "exoticItem"){
                    itemListfor_idx = this.itemList[thisItem].protoLists[0];               
                 }
                else if(this.itemList[thisItem].constructorName == "Consumable"){
                    itemListfor_idx = itemListMeta[ConsumableList[this.itemList[thisItem].name]['itemlists'][0]];
                }
                else{
                    itemListfor_idx = this.itemList[thisItem].items[0];
                }
                this.itemList[thisItem].value = Math.floor(Math.random() * 10 * (itemListMeta.indexOf(itemListfor_idx) + 1)) * 10;
            //    console.log(itemListMeta.indexOf[this.itemList[thisItem].items[0]]);
                this.onSale.push(this.itemList[thisItem])
            }
        }
        this.openModule = function(buying){
            canMove = false;
            var self = this;
            $("#worldMap").hide();
            $("#vendor-module").show();

            if(buying){
                self.excludedItems = 0;
                var itemMessage = "On sale: <br>"
                var itemInfos = []
                for(var i = 0; i < this.onSale.length; i++){
                    itemInfos.push((this.onSale[i].name + "<br>"))
                    for (attribute in this.onSale[i]) {
                        if (typeof this.onSale[i][attribute] == "number") {
                            if(this.onSale[i][attribute] >= 0){
                                itemInfos[i] += attribute + ": +" + this.onSale[i][attribute] + "<br>";
                            }
                            else{ //issue #49
                                itemInfos[i] += attribute + ": " + this.onSale[i][attribute] + "<br>";
                            }
                        }
                    }
                    if(this.onSale[i].constructorName == 'effectItem'){

                        for(var j = 0; j < this.onSale[i].buffArray.length; j++){

                            itemInfos[i] += "buffs: " + this.onSale[i].buffArray[j].name + "<br>";
                        }
                        for(var k = 0; k < this.onSale[i].debuffArray.length; k++){
                            itemInfos[i] += "debuffs: " + this.onSale[i].debuffArray[k].name + "<br>";
                        }
                    }
                    //build the html to print to the textBox

                    itemMessage += "<div class='itemInfo' id='onSale" + i + "' style='border-width:2px;'>" + this.onSale[i].name + "<div id='buy" + i + "' class='interact'>" + this.onSale[i].value + "gold </div></div>";
                }
                $("#vendor-contents").html( itemMessage );
                $("#tab").html( "Sell" );
                this.drop_onSale(self);

                for(var i = 0; i < this.onSale.length; i++){
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

                $("#tab").click(function(){
                    $("#tab").off('click');
                    self.openModule(false);
                })
            }
            else{
                self.excludedItems = 0;
                var itemMessage = "";
                var itemInfos = [];
                var inventoryForSale = [];
                var inventory = hero.inventory

                self.getValueForList(inventory['carried']);
            //    var items_to_print = [];
                for(var i = 0; i < inventory['carried'].length; i++){
                    if(!inventory['carried'][i].equipped){
                        inventoryForSale.push(inventory['carried'][i]);
                    }
                    else{
                        console.log(inventory['carried'][i]);
                        self.excludedItems ++;
                        console.log(self.excludedItems);
                    }
                }
                for(var n = 0; n < inventoryForSale.length; n++){
                        //store all the item infos to be displayed upon hover...
                        itemInfos.push((inventoryForSale[n].name + "<br>"))
                        for (attribute in inventoryForSale[n]) {
                            if (typeof inventoryForSale[n][attribute] == "number") {

                                if(inventoryForSale[n][attribute] >= 0){
                                    itemInfos[n] += attribute + ": +" + inventoryForSale[n][attribute] + "<br>";
                                }
                                else{ // issue #49
                                    itemInfos[n] += attribute + ": " + inventoryForSale[n][attribute] + "<br>";
                                }
                            }
                        }
                        if(inventoryForSale[n].constructorName == 'effectItem'){

                            for(var j = 0; j < inventoryForSale[n].buffArray.length; j++){

                                itemInfos[n] += "buffs: " + inventoryForSale[n].buffArray[j].name + "<br>";
                            }
                            for(var k = 0; k < inventoryForSale[n].debuffArray.length; k++){
                                itemInfos[n] += "debuffs: " + inventoryForSale[n].debuffArray[k].name + "<br>";
                            }
                        }


                        itemMessage += "<div class='itemInfo' id='forSale" + n + "' style='border-width:2px;'>" + inventoryForSale[n].name + "<div id = 'sell" + n + "' class='interact'>" + Math.floor(inventoryForSale[n].value / 4) + "gold </div></div>";

                    }

                $('#vendor-contents').html( itemMessage );
                $('#tab').html( "Buy" );
                this.drop_forSale(self);

                for(var i = 0; i < inventoryForSale.length; i++){
                    var item_to_print =  (' ' + itemInfos[i]).slice(1)
                    var id = '#forSale'+i;
                    $(id).attr('item_to_print', item_to_print)
                    $(id).mouseenter(function(){
                        $("#vendor-hover").html( $(this).attr('item_to_print') );
                        $("#vendor-hover").show();
                    })
                    $(id).mouseleave(function(){
                        $("#vendor-hover").hide();
                    })

                }

                $("#tab").click(function(){
                    $("#tab").off('click');
                    self.openModule(true);
                })
            }
            $("#close").click(function(){
                self.closeModule();
            })
        }

    }
    hero_interact(){
        canMove = false;
        var merch = this;
        var shopFunc = function(){
            txtmd.revertTxtMd();
            merch.openModule(true);
        }
        txtmd.parseTxtMdJSON({"msgs": [["dec", merch.message, "Shop", "Leave", shopFunc]]})
    }

    buyItem(item){
        var successful_transaction = false;
        if(inventory['carried'].length < 10 && hero.wallet >= item.value){
            take_item(item);
            hero.wallet -= item.value;
            successful_transaction = true;
            refreshInfo();
        }
        else if(inventory['carried'].length >= 10){
            openAlert("Your inventory is full");
        }
        else if(hero.wallet < item.value){
            openAlert("You can't afford this item");
        }
        return successful_transaction;
    }
    drop_onSale(self){
        for(var i = 0; i < self.onSale.length; i++){
            var buyID = "#buy" + i;
            $(buyID).attr("buy_id", i)
            $(buyID).click(function(){
                console.log('buying item');
                if(self.buyItem(self.onSale[$(this).attr('buy_id')])){
                $(this).hide().off('click');
                self.onSale.splice($(this).attr('buy_id'), 1);
                self.openModule(true); //updates window
            }
            })
        }
    }
    drop_forSale(self){
        var inventory = hero.inventory;
        for(var i = 0; i < inventory['carried'].length; i++){
            var sellID = "#sell" + i;

            $(sellID).attr("sell_id", (i + self.excludedItems));
            $(sellID).click(function(){
                console.log('selling item');
                hero.wallet += Math.floor(inventory['carried'][$(this).attr('sell_id')].value / 4);
                inventory['carried'].splice($(this).attr('sell_id'), 1);
                $(this).hide().off('click');
                refreshInfo();
                self.openModule(false); //updates window
            })
        }
    }
    closeModule(){
        canMove = true;
        $("#worldMap").show();
        $("#vendor-module").hide();
        revertTextModule();
        refreshInfo();
        $("#close").off('click');
    }
    getValueForList(itemList){
        for(var i = 0; i < itemList.length; i++){
            if(itemList[i].value == null){
                itemList[i].value = Math.floor(Math.random() * 10 * itemListMeta.indexOf(itemList[i].items[0])) * 10;
            }
        }
    }
}
