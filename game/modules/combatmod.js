class CombatModule {
    constructor() {
        this.open = false
        this.attackBtn = "#attack"
        this.defendBtn = "#defend"
        this.enSymbol = "#enemySymbol"
        this.heroSymbol = "#heroSymbol"
        this.attackSlider = "#attackSlider"
        this.defendSlider = "#defendSlider"
        this.modID = "#combat-module"
        this.defTxt = "#defendText"
        this.shieldAscii = "#shieldascii"
        this.enHealthBar = "#enemyHealthBar"
        this.heroHealthBar = "#heroHealthBar"
    }

    enemyAttackAnimation(enemy) {
        var self = this;
        $(self.enSymbol).animate({
            top: '25px',
            left: '-25px'
        }, 1, function(){
            $(self.enSymbol).animate({
                top: '0',
                left: '0'
            }, 10000 / (2 * enemy.dexterity))
        })
    }

    heroAttackAnimation(hero) {
        //jquery animations:
        var self = this;
        $(self.heroSymbol).animate({
            top: '-25px',
            left: '25px'
        }, 1, function(){
            $(self.heroSymbol).animate({
                top: '0',
                left: '0'
            }, 10000 / (2 * hero.dexterity));
        })
        $(self.attackSlider).show();
        $(self.attackSlider).animate({
            width: '0px'
        }, 10000 / hero.dexterity, function() {
            $(self.attackSlider).hide();
            $(self.attackSlider).animate({
                width: '110px'
            }, 1);
        });
    }

    openMod(hero, enemy){
        this.open = true
        $("#worldMap").hide()
        $(this.modID).show(500);

        // setup HTML
        // Shield health
        $(this.defTxt).html( "Shield: " + heroShield.vitality );

        // Enemy health
        var enemyHealthPCent = enemy.vitality / enemy.maxVitality * 100;
        $(this.enHealthBar).html(
            enemy.vitality + " / " + enemy.maxVitality +
            "<div id='" + enemy.objid + "HealthSlider' class='statusSlider' style='width: " + enemyHealthPCent + "%'></div>"
        );

        // Hero health
        var healthFraction = hero.vitality / hero.maxVitality;
        $(this.heroHealthBar).html(
            hero.vitality + " / " + hero.maxVitality +
            "<div id='heroHealthSlider' class='statusSlider' style='width: " + healthFraction * 100 + "%'></div>"
        );

        // refresh open mods
        refreshOpenMods();
    }

    indicateShieldOff() {
        // hide the shield html icons
        $(this.shieldAscii).html("")
        //jquery animation:
        $(this.defendSlider).hide('fast');
    }

    startShieldUp() { $(this.defendSlider).show(heroShield.weight * 1000); }

    showShieldUp() {
        // show shield ascii from asciiart/ dir
        $(this.shieldAscii).html(ASCII_SHIELD)
    }


    close() {
        this.open = false
        $("#worldMap").show()
        $(this.modID).hide(1000);
        this.indicateShieldOff()
    }

    refreshOnDamage(target) {
        $(this.defTxt).html( "Shield: " + heroShield.vitality );
        if(target.objid != "defendText"){
            var targetHealthFrac = target.vitality / target.maxVitality * 100;
            var targetHealthObjid = "#" + target.objid + "HealthBar";
            $(targetHealthObjid).html(
                target.vitality + " / " + target.maxVitality +
                "<div id='" + target.objid + "HealthSlider' class='statusSlider' style='width: " + targetHealthFrac + "%'></div>"
            )
        }
    }
}
