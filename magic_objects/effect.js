var effectList = [];

class Effect {
    constructor(name, target, duration, attributes, quantity){
        this.name = name;
        this.target = target;
        this.duration = duration; //pass in milliseconds
        this.attributes = attributes; //pass an array containing attributes to facilitate buffs with multiple
        this.quantity = quantity; //pass an array with quantities that matches the attributes array
        this.active = false;
        effectList.push(this);
    }
    displayEffects(target){
        var effectBoxes = "";
        var effectInfos = [];
        var toShow = false;
        var objid = target.constructorName + "Effects"
        if(target.constructorName == 'Boss'){
            objid = 'EnemyEffects';
        }
        for(var i = 0; i < target.effects.length; i++){
            if(target.effects[i].constructorName == "Buff"){
                effectBoxes += "<div id='effect" + i + target.objid + "' class='effect' style='left: " + 20 * i + "px'>▲</div>";
            }
            else if(target.effects[i].constructorName == "Debuff"){
                effectBoxes += "<div id='effect" + i + target.objid + "' class = 'effect' style='left: " + 20 * i + "px'>▼</div>";
            }

        }
        document.getElementById(objid).innerHTML = effectBoxes;
        if(target.effects.length > 0){
            $("#" + objid).show();
        }
        for(var i = 0; i < target.effects.length; i++){
            effectInfos.push(target.effects[i].name);
            var effectID = "#effect" + i + target.objid;
            var effect_to_print = (' ' + effectInfos[i]).slice(1);
            $(effectID).attr('eff_to_print', effect_to_print);
            $(effectID).mouseenter(function(){
                console.log("entered");
                document.getElementById('effectsHover').innerHTML = $(this).attr('eff_to_print');
                $("#effectsHover").show();
            })
            $(effectID).mouseleave(function(){
                $("#effectsHover").hide();
            })
        }
    }
}

class Buff extends Effect {
    constructor(name, target, duration, attributes, quantity){
        super(name, target, duration, attributes, quantity);
        var self = this;
        this.constructorName = "Buff";
        this.applyBuff = function(character){
            console.log("buff applied!")
            this.target = character;
            if(!this.active){
            this.active = true;
            this.target.effects.push(this);
            for(var i = 0; i < this.attributes.length; i++){
                this.target[attributes[i]] += this.quantity[i];
                refreshInfo();
            }
            this.displayEffects(this.target);
            window.setTimeout(function(){
                self.active = false;
              for(var i = 0; i < self.attributes.length; i++){
                console.log(self.target[self.attributes[i]] + "-" + self.quantity[i]);
                self.target[attributes[i]] -= self.quantity[i];
                if(character.vitality <= 0){
                    character.vitality = 1;
                }
                refreshInfo();}
                var SpliceIdx = self.target.effects.indexOf(self);
                self.target.effects.splice(SpliceIdx, 1);
                self.displayEffects(self.target);
            }, self.duration);
        }
        }
    }

}

class Debuff extends Effect {
    constructor(name, target, duration, attributes, quantity ){
        super(name, target, duration, attributes, quantity);
        var self = this;
        this.cached_stats = [];
        this.constructorName = "Debuff";
        this.applyDebuff = function(character) {
            this.target = character;
            if(!this.active){
                this.active = true;
                for(var i = 0; i < this.attributes.length; i++){
                    this.cached_stats.push(this.target[attributes[i]]);
                    this.target[attributes[i]] -= this.quantity[i];

                    if(character.dexterity <= 0){ //no dividing by 0!!
                        character.dexterity = 0.1;
                    }
                    if(character.strength <= 0){
                        character.strength = 0;
                    }
                    refreshInfo();
                }
                this.target.effects.push(this);
                this.displayEffects(this.target);
                window.setTimeout(function(){
                    self.active = false;
                  for(var i = 0; i < self.attributes.length; i++){
                    console.log(self.target[self.attributes[i]] + "+" + self.quantity[i]);
                    self.target[attributes[i]] = self.cached_stats[i];
                    refreshInfo();}
                    var SpliceIdx = self.target.effects.indexOf(self);
                    self.target.effects.splice(SpliceIdx, 1);
                    self.displayEffects(self.target);
                }, self.duration);
            }
        }
    }
}

//classes for specific effect debuffs and buffs:

class Exhaustion extends Debuff {
    constructor(name, target, duration){
        super(name, target, duration);
        var self = this;
        this.applyDebuff = function(){
            if(!self.active){
                self.active = true;
                magicReady = false;
                this.target.effects.push(this);
                this.displayEffects(this.target);
                window.setTimeout(function(){
                    magicReady= true;
                    self.active = false;
                    var SpliceIdx = self.target.effects.indexOf(self);
                    self.target.effects.splice(SpliceIdx, 1);
                    self.displayEffects(self.target);
                }, this.duration)
            }
        }
    }
}

class damageDebuff extends Debuff {
    constructor(name, target, duration, interval, damage){
        super(name, target, duration);
        this.interval = interval;
        this.damage = damage;
        this.source = {strength: this.damage};
        var self = this;
        this.applyDebuff = function(character){
            this.target = character;
            console.log(this.target)
            if(!this.active){
                this.active = true;
                console.log(this.target);
                this.target.effects.push(this);
                this.displayEffects(this.target);
            var damageInterval = setInterval(function(){
                if(self.target.vitality > 0){
                Damage(self.source, self.target);
            }
            }, self.interval);
            if(self.target.vitality <= 0 || hero.vitality <= 0){
                window.clearInterval(damageInterval);
                if(self.target == hero){
                    hero.vitality = 1;
                }
            }
            else{
            window.setTimeout(function(){
                window.clearInterval(damageInterval);
                self.active = false;
                var SpliceIdx = self.target.effects.indexOf(self);
                self.target.effects.splice(SpliceIdx, 1);
                self.displayEffects(self.target);
            }, duration);}
        }}
    }
}

//------------------------------------------------------
//              Initialize Buffs and Debuffs
//------------------------------------------------------
var adrenaline = new Buff("adrenaline", null, 5000, ["strength", "dexterity"], [1, 1]);
var indestructible = new Buff("indestructibility", null, 10000, ["vitality", "maxVitality"], [20, 20]);
var supStrength = new Buff("super strength", null, 10000, ['strength', 'dexterity'], [4, 1]);
var fire = new damageDebuff("fire", null, 16000, 4000, 3);
var divine = new Buff("divinity", null, 8000, ['strength', 'dexterity', 'vitality', 'maxVitality'], [5, 5, 50, 50]);
var ice = new Debuff("frozen", null, 10000, ["dexterity"], [2]);
var exhaust = new Exhaustion('magic exhaust', null, 15000);
var asphyxiation = new damageDebuff('asphyxiation', null, 12000, 4000, 2);
var blocked = new Debuff('blocked', null, 10000, ['strength'], [200]);
var suppressed = new Debuff('suppressed', null, 8000, ['strength'], [200]);
var dominated = new damageDebuff('dominated', null, 8000, 2000, 3);
var sponge = new Buff('sponge', null, 10000, ['vitality', 'maxVitality'], [100, 100]);
var slow = new Debuff('slow', null, 10000, ['dexterity'], [1]);
var supSpeed = new Buff('super speed', null, 10000, ['dexterity'], [4]);
