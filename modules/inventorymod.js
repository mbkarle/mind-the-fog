class InventoryModule {
    constructor() {
        this.open = false
        this.modID = "#info-module"
        this.xpID = "#xp"
        this.goldID = "#gold"
        this.torchVis = "#torchcount"
        this.charInfoID = "#characterInfo"
        this.invID = "#inventory"
        this.hoverID = "#inv_hoverInfo"
    }

    openMod() { this.open = true; $(this.modID).show(100) }
    hideMod() { this.open = false; $(this.modID).hide(100) }

    toggleMod() {
        // Use custom open/close to handle this.open
        if(this.open){ this.hideMod() }
        else{ this.openMod() }
    }

    refreshMod() {
        // For the refreshOpenMods() function in main

        // First get the inventory in question
        var inv = hero.inv
        var eqinv = hero.equip_inv

        // Status part -------------------------------------------------------
        // Update health sliders --------------------------
        var healthFraction = hero.vitality/hero.maxVitality;
        var shieldHealthFraction = heroShield.vitality/heroShield.maxVitality;

        var charInfoHTML = "Health: <br><div id='healthBar' class='statusBar'>" +
            hero.vitality + " / " + hero.maxVitality +
            "<div id='healthSlider' class='statusSlider'></div></div><br><br><hr style='width: 80%'><br>" +
            "Shield Health: <br><div id='shieldHealthBar' class='statusBar'>" +
            heroShield.vitality + " / " + heroShield.maxVitality +
            "<div id='shieldHealthSlider' class='statusSlider'></div></div><br>";

        $(this.charInfoID).html(charInfoHTML)

        // health sliders
        document.getElementById("healthSlider").style.width = 180 * healthFraction + "px";
        document.getElementById("shieldHealthSlider").style.width = 180 * shieldHealthFraction + "px";

        // Update XP --------------------------------------
        hero.levelCheck();
        var xpFraction = (hero.xp - hero.level * 1000) / 1000;
        var xpHTML = "<div id='xpBar' class='statusBar' style='width: 60px'>Level: " +
            hero.level + "<div id='xpSlider' class='statusSlider'></div></div>";

        $(this.xpID).html(xpHTML)

        // xp slider
        document.getElementById("xpSlider").style.width = 60 * xpFraction + "px";

        // Update Gold ------------------------------------
        $(this.goldID).html(inv.gold + " gold")

        // Update Torches ---------------------------------
        var torchtext = '';
        if(inv.torches > 0){
            torchtext = 't'
            for(var i = 0; i < inv.torches-1; i++){
                torchtext += "    t"
            }
        }
        $(this.torchVis).html(torchtext)

        // The equipped section ------------------------------------------------
        var inventoryMessage = "Equipped: <br><br>"
        for(var attribute in eqinv.inv){
            if(eqinv.inv[attribute] != null){
                inventoryMessage += attribute + ": " + eqinv.inv[attribute].name + "<br><br>";
            }
        }

        // Set mod_id and mod_cb's for the Inv HTML
        var eqmod_ids = {
            "hoverID": "#inv_hoverInfo",
            "uniqueID": "eqinv"
        }

        var eqmod_cbs = {
            "refresh": () => this.refreshMod(),
            "actioncb": function(id){
                eqinv.unequip(id)
                // Refresh vndmd if selling
                if(!vndmd.buying && vndmd.refreshFunc){vndmd.refreshFunc()}
            },
            "actiontxt": () => "Unequip",
            "dropcb": (id) => eqinv.remove(id)
        }

        // Display the inner html
        var eqinvHTMLObj = eqinv.generateHTML(eqmod_ids, eqmod_cbs)
        inventoryMessage += eqinvHTMLObj["innerhtml"]


        // The carried section -----------------------------------------------
        inventoryMessage += "<hr style='width: 80%'> Carried: <br><small>("+
            hero.inv.size() +"/" + hero.inv.capacity +")<br></small><br>"

        // Set mod_id and mod_cb's for the Inv HTML
        var carmod_ids = {
            "hoverID": this.hoverID,
            "uniqueID": "carinv"
        }

        var carmod_cbs = {
            "refresh": () => this.refreshMod(),
            "actioncb": function(id){
                var item = inv.get(id)
                if(item.constructorName === 'Consumable'){
                    inv.remove(id)
                    item.useConsumable()
                }
                else{ eqinv.equip(parseInt(id)) }

                // Refresh vndmd if selling
                if(!vndmd.buying && vndmd.refreshFunc){vndmd.refreshFunc()}
            },
            "actiontxt": function(item){
                if(item.constructorName === 'Consumable'){
                    return "Use"
                }
                else{ return "Equip" }
            },
            "dropcb": (id) => inv.remove(id)
        }

        // Display the inner html
        var invHTMLObj = inv.generateHTML(carmod_ids, carmod_cbs)
        inventoryMessage += invHTMLObj["innerhtml"]

        $(this.invID).html(inventoryMessage)

        // Mouse Listeners -- MUST BE SET AFTER ABOVE HTML
        eqinvHTMLObj["setClicks"]()
        invHTMLObj["setClicks"]()
    }
}
