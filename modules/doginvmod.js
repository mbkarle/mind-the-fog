class DogInvModule {
    constructor() {
        this.modID = "#dog-info-module"
        this.textBoxID = "#dog-inventory"
        this.hoverID = "#doginv_hoverInfo"
    }

    refreshDogInv() {
        // All the setup goes here, as the toggle / hide is
        // handled by key listeners in move()

        // First load the ascii dog (for cuteness :) )
        // TODO

        // Next Start the html to display
        var innerhtml = "Dog Inventory: <br><small>(" + doge.inv.size() +
            "/" + doge.inv.capacity + ")</small><br><br>"

        // Show the dog inventory
        var dog_ids = { "hoverID": this.hoverID, "uniqueID": "doginv" }

        // Should account for being able to tell dog to drop items
        // (without transfer), and a transfer could affect an
        // ongoing sale
        var dog_cbs = {
            "refresh": () => this.refreshDogInv(),
            "actioncb": function(id){
                doge.inv.transfer_item(hero.inv, id)
                // Refresh vndmd if selling (theoretically possible!)
                if(!vndmd.buying && vndmd.refreshFunc){vndmd.refreshFunc()}
            },
            "actiontxt": () => "Take",
            "dropcb": (id) => doge.inv.remove(id)
        }

        var dogInvHTMLObj = doge.inv.generateHTML(dog_ids, dog_cbs)
        innerhtml += dogInvHTMLObj["innerhtml"]

        // Show the hero inventory
        innerhtml += "<br><hr style='width: 80%'><br>"
        innerhtml += "Hero Inventory: <br><small>(" + hero.inv.size() +
            "/" + hero.inv.capacity + ")</small><br><br>"

        var hero_ids = {"hoverID": this.hoverID, "uniqueID": "heroToDogInv"}
        var hero_cbs = {
            "refresh": () => this.refreshDogInv(),
            "actioncb": function(id){
                hero.inv.transfer_item(doge.inv, id)
                // Refresh vndmd if selling (theoretically possible!)
                if(!vndmd.buying && vndmd.refreshFunc){vndmd.refreshFunc()}
            },
            "actiontxt": () => "Give",
            "dropcb": (id) => hero.inv.remove(id)
        }

        var heroInvHTMLObj = hero.inv.generateHTML(hero_ids, hero_cbs)
        innerhtml += heroInvHTMLObj["innerhtml"]

        $(this.textBoxID).html(innerhtml)

        // Mouse listeners -- MUST BE SET AFTER ABOVE HTML
        dogInvHTMLObj["setClicks"]()
        heroInvHTMLObj["setClicks"]()
    }
}
