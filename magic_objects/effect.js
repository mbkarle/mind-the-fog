class Effect {
    constructor(source, target, duration, attributes, quantity, chance){
        this.source = source;
        this.target = target;
        this.duration = duration; //pass in milliseconds
        this.attributes = attributes; //pass an array containing attributes to facilitate buffs with multiple
        this.quantity = quantity; //pass an array with quantities that matches the attributes array
        this.chance = chance;

    }
}

class Buff extends Effect {
    constructor(source, target, duration, attributes, quantity, chance){
        super(source, target, duration, attributes, quantity, chance);
        var self = this;
        this.active = false;
        this.applyBuff = function(character){
            console.log("buff applied!")
            this.target = character;
            if(!self.active){
            self.active = true;
            for(var i = 0; i < this.attributes.length; i++){
                this.target[attributes[i]] += this.quantity[i];
                refreshInfo();
            }
            window.setTimeout(function(){
                self.active = false;
              for(var i = 0; i < self.attributes.length; i++){
                console.log(self.target[self.attributes[i]] + "-" + self.quantity[i]);
                self.target[attributes[i]] -= self.quantity[i];
                refreshInfo();}
            }, self.duration);
        }
        }
    }
}

class Debuff extends Effect {
    constructor(source, target, duration, attributes, quantity, chance){
        super(source, target, duration, attributes, quantity);
        var self = this;
        this.active = false;
        this.applyDebuff = function(character) {
            this.target = character;
            if(!self.active){
                self.active = true;
                for(var i = 0; i < this.attributes.length; i++){
                    this.target[attributes[i]] -= this.quantity[i];
                    refreshInfo();
                }
                window.setTimeout(function(){
                    self.active = false;
                  for(var i = 0; i < self.attributes.length; i++){
                    console.log(self.target[self.attributes[i]] + "+" + self.quantity[i]);
                    self.target[attributes[i]] += self.quantity[i];
                    refreshInfo();}
                }, self.duration);
            }
        }
    }
}

//classes for specific effect debuffs and buffs:

class Exhaustion extends Debuff {
    constructor(source, target, duration){
        super(source, target, duration);
        this.exhaust = function(){
            magicReady = false;
            window.setTimeout(function(){
                magicReady= true;
            }, this.duration)
        }
    }
}
