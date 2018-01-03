/*
 * This file is for any location that asks for a decision and acts on the hero.
 * Currently this is:
 *   1. Fountain
 *   2. Altar
 */

class Fountain extends Location {
    constructor(rowID, colID){
        super(rowID, colID, "Fountain", 'fountain', 'f', "A beautiful fountain, flowing with divine grace.", false, true);
        this.used = false;
    }
    hero_interact(){
        if(!this.used){
            canMove = false;
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();

            var msg = print("message", this.message);
            $("#descend").html("Use");
            $("#stay").html("Leave");
            var fountain = this;
            $("#descend").click(
                function(){
                    revertTextModule();
                    if(Math.random() <= .5){
                        hero.maxVitality += 5;
                        hero.vitality = hero.maxVitality;
                        refreshInfo();
                        print("message", "The gods have smiled upon you. Your vitality is improved.");
                        $("#text-module").show();
                        $("#enter").hide();
                        $("#open").show().click(function(){
                            $("#open").off('click');
                            $("#open").hide();
                            revertTextModule();
                        })
                    }
                    else{
                        print("message", "The gods do not hear your prayers. Nothing happens.");
                        $("#text-module").show();
                        $("#enter").hide();
                        $("#open").show().click(function(){
                            $("#open").off('click').hide();

                            revertTextModule();
                        })
                    }
                fountain.used = true;
                }
            )
        $("#stay").click(function(){
            revertTextModule();
        })
        }
    }
}

class Altar extends Location {
    constructor(rowID, colID){
        super(rowID, colID, "Altar", 'altar', 'a', "A blood-stained altar. Sacrifice here might make the gods of death smile upon you.", false, true);
        this.used = false;
    }
    hero_interact(){
        if(!this.used){
            canMove = false;
            $("#text-module").show();
            $("#enter").hide();
            $("#descend").show();
            $("#stay").show();

            var msg = print("message", this.message);
            $("#descend").html('Use');
            $("#stay").html('Leave');
            var altar = this;
            $("#descend").click(
                function(){
                    revertTextModule();
                    hero.maxVitality -= 5;
                    hero.vitality -= 5;
                    if(hero.vitality <= 0){
                        hero.vitality = 1;
                    }
                    var statToImprove = Math.random();
                    if(statToImprove <= .5){
                        hero.strength += Math.ceil(Math.random() * 2);
                        statToImprove = "strength";
                    }
                    else{
                        hero.dexterity += Math.ceil(Math.random() * 2);
                        statToImprove = "dexterity";
                    }
                    print("message", "The gods of death accept your blood sacrifice. Your " + statToImprove + " has improved.");
                    refreshInfo();
                    $("#text-module").show();
                    $("#enter").hide();
                    $("#open").show().click(function(){
                        $("#open").off('click');
                        $("#open").hide();
                        revertTextModule();
                        })

                altar.used = true;
                }
            )

        $("#stay").click(function(){
            revertTextModule();
        })
        }
    }
}

