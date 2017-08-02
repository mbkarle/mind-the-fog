class Effect {
    constructor(name, target, duration, attributes, quantity){
        this.name = name;
        this.target = target;
        this.duration = duration; //pass in milliseconds
        this.attributes = attributes; //pass an array containing attributes to facilitate buffs with multiple
        this.quantity = quantity; //pass an array with quantities that matches the attributes array

    }
    displayEffects(target){
        var effectBoxes = "";
        var effectInfos = [];
        var toShow = false;
        var objid = target.constructorName + "Effects"
        for(var i = 0; i < target.effects.length; i++){
            if(target.effects[i].constructorName == "Buff"){
                effectBoxes += "<div id='effect" + i + target.objid + "' class='effect' style='left: " + 20 * i + "px'>▲</div>";
            }
            else if(target.effects[i].constructorName == "Debuff"){
                effectBoxes += "<div id='effect" + i + target.objid + "' class = 'effect' style='left: " + 20 * i + "px'>▼</div>";
            }

        }
        document.getElementById(objid).innerHTML = effectBoxes;

        $("#" + objid).show();
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
        this.active = false;
        this.constructorName = "Buff";
        this.applyBuff = function(character){
            console.log("buff applied!")
            this.target = character;
            if(!self.active){
            self.active = true;
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
                self.target.effects.splice(SpliceIdx);
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
        this.active = false;
        this.constructorName = "Debuff";
        this.applyDebuff = function(character) {
            this.target = character;
            if(!self.active){
                self.active = true;
                for(var i = 0; i < this.attributes.length; i++){
                    this.target[attributes[i]] -= this.quantity[i];

                    if(character.dexterity <= 0){ //no dividing by 0!!
                        character.dexterity = 0.5;
                    }
                    refreshInfo();
                }
                this.target.effects.push(this);
                this.displayEffects(this.target);
                window.setTimeout(function(){
                    self.active = false;
                  for(var i = 0; i < self.attributes.length; i++){
                    console.log(self.target[self.attributes[i]] + "+" + self.quantity[i]);
                    self.target[attributes[i]] += self.quantity[i];
                    refreshInfo();}
                    var SpliceIdx = self.target.effects.indexOf(self);
                    self.target.effects.splice(SpliceIdx);
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
        this.exhaust = function(){
            magicReady = false;
            window.setTimeout(function(){
                magicReady= true;
            }, this.duration)
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
            self.target = character;
            if(!self.active){
                self.active = true;
                this.target.effects.push(this);
                this.displayEffects(this.target);
            var damageInterval = setInterval(function(){
                if(self.target.vitality > 0){
                Damage(self.source, self.target);
            }
            }, self.interval);
            if(self.target.vitality <= 0){
                window.clearInterval(damageInterval);
            }
            else{
            window.setTimeout(function(){
                window.clearInterval(damageInterval);
                self.active = false;
                var SpliceIdx = self.target.effects.indexOf(self);
                self.target.effects.splice(SpliceIdx);
                self.displayEffects(self.target);
            }, duration);}
        }}
    }
}
