class Item {
    constructor(name, type, strength, dexterity, vitality, toList, objid, items) {
        this.name = name;
        this.type = type;
        this.strength = strength;
        this.dexterity = dexterity;
        this.vitality = vitality;
        this.maxVitality = vitality;
        this.toList = toList;
        this.objid = objid;
        this.items = items;
        this.equipped = false;
        this.value = null;

        if(toList){
            for(var i = 0; i < items.length; i++){
            items[i].push(this);
        }
        }

    }
}

class effectItem extends Item {
    constructor(name, type, strength, dexterity, vitality, buffArray, buffChance, debuffArray, debuffChance, toList, objid, items){
        super(name, type, strength, dexterity, vitality, toList, objid, items);
        this.buffArray = buffArray;
        this.buffChance = buffChance; //pass array to match buffArray
        this.debuffArray = debuffArray;
        this.debuffChance = debuffChance;

        this.buffUp = function(target){
            for(var i = 0; i < this.buffArray.length; i++){
                if(Math.random() <= this.buffChance[i]){
                    console.log("applying " + this.buffArray[i].name)
                    this.buffArray[i].applyBuff(target);
                }
            }
        }
        this.debuffUp = function(target){
            for(var i = 0; i < this.debuffArray.length; i++){
                if(Math.random() <= this.debuffChance[i]){
                    console.log("applying " + this.debuffArray[i].name);
                    this.debuffArray[i].applyDebuff(target);
                }
            }
        }
    }
}

class Currency extends Item {
    constructor(name, value, amount){
        super(name);
        this.value = value;
        this.amount = amount;
        this.wallet;
        this.walletCheck = function(){ // adds directly to hero.wallet
            return this.wallet = this.amount * this.value;
        }
    }
}

class Shields extends Item {
  constructor(name, type, strength, dexterity, vitality, healthBoost, toList, objid, items){
    super(name, type, strength, dexterity, vitality, toList, objid, items);
    this.shield_ready = true;
    this.healthBoost = healthBoost;
  }
  shieldReady() {
    this.shield_ready = true;
    clearTimeout(shieldReadyup);
    return this.shield_ready;
  }
}
