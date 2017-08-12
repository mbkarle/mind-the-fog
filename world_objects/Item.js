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
        this.constructorName = "Item";

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
        this.constructorName = "effectItem";

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
        this.constructorName = "Currency";
    }
}

class Shields extends Item {
  constructor(name, type, strength, dexterity, vitality, healthBoost, weight, recovery, toList, objid, items){
    super(name, type, strength, dexterity, vitality, toList, objid, items);
    this.shield_ready = true;
    this.healthBoost = healthBoost;
    this.weight = weight;
    this.recovery = recovery;
    this.constructorName = "Shields";
  }
  shieldReady() {
    this.shield_ready = true;
    clearTimeout(shieldReadyup);
    return this.shield_ready;
  }
}

class Torch extends Item {
    constructor(num_torches){
        super('torch')
        this.torch_count = num_torches;
        this.constructorName = "Torch";
    }

}

var ConsumableList = {
    "minor health potion": {
        'characteristics' : ['vitality'],
        'changes': [10],
        'buffs': [],
        'debuffs': []
    },
    "major health potion": {
        'characteristics': ['vitality'],
        'changes': [50],
        'buffs': [],
        'debuffs': []
    },
    'strength potion': {
        'characteristics' : [],
        'changes': [],
        'buffs': [
            {
            'buff': supStrength,
            'chance': 1,
            'target': 'hero'
            }
        ],
        'debuffs': []
    }
}

class Consumable {
    constructor(name, objid){
        this.name = name;
        this.objid = objid;
    }
}
var ShieldList = {
    'wood': {
        'weight': 3,
        'recovery': 4,
        'healthBoost': 1,
        'vitality': 30,
        'maxVitality': 30,
        'value': 0
    },
    'ironwood': {
        'weight': 4,
        'recovery': 4,
        'healthBoost': 1,
        'vitality': 40,
        'maxVitality': 40,
        'value': 60
    },
    'lightwood': {
        'weight': 2,
        'recovery': 4,
        'healthBoost': 2,
        'vitality': 30,
        'maxVitality': 30,
        'value': 60
    },
    'iron': {
        'weight': 4,
        'recovery': 4,
        'healthBoost': 2,
        'vitality': 50,
        'maxVitality': 50,
        'value': 100
    },
    'cobalt': {
        'weight': 3,
        'recovery': 3,
        'healthBoost': 2,
        'vitality': 40,
        'maxVitality': 40,
        'value': 100
    },
    'copper': {
        'weight': 2,
        'recovery': 4,
        'healthBoost': 1,
        'vitality': 45,
        'maxVitality': 45,
        'value': 100
    },
    'tungsten': {
        'weight': 5,
        'recovery': 3,
        'healthBoost': 2,
        'vitality': 60,
        'maxVitality': 60,
        'value': 150
    },
    'silver': {
        'weight': 4,
        'recovery': 4,
        'healthBoost': 2,
        'vitality': 80,
        'maxVitality': 80,
        'value': 150
    },
    'lead': {
        'weight': 6,
        'recovery': 5,
        'healthBoost': 3,
        'vitality': 150,
        'maxVitality': 150,
        'value': 200
    },
    'gold': {
        'weight': 5,
        'recovery': 4,
        'healthBoost': 2,
        'vitality': 120,
        'maxVitality': 120,
        'value': 200
    },
    'steel': {
        'weight': 3,
        'recovery': 3,
        'healthBoost': 3,
        'vitality': 90,
        'maxVitality': 90,
        'value': 250
    },
    'lithium': {
        'weight': 1,
        'recovery': 4,
        'healthBoost': 1,
        'vitality': 70,
        'maxVitality': 70,
        'value': 230
    }
}

class ShieldUpgrade {
    constructor(name){
        this.name = name;
        this.weight = ShieldList[name]['weight'];
        this.recovery = ShieldList[name]['recovery'];
        this.healthBoost = ShieldList[name]['healthBoost'];
        this.vitality = ShieldList[name]['vitality'];
        this.maxVitality = ShieldList[name]['maxVitality'];
        this.value = ShieldList[name]['value'];
        this.purchased = false;
        this.equipped = false;
        this.constructorName = "ShieldUpgrade";
        this.equipShield = function() {
            this.unequipShield();
            for(var attribute in ShieldList[this.name]){
                if(attribute != 'value'){
                    heroShield[attribute] = ShieldList[this.name][attribute];
                }
            }
            this.equipped = true;
        }
        this.unequipShield = function() {
            for(var attribute in ShieldList['wood']){
                if(attribute != 'value'){
                    heroShield[attribute] = ShieldList['wood'][attribute];
                }
            }
            this.equipped = false;
        }
    }
    buyItem(item){
        var successful_transaction = false;
        if(hero.wallet >= item.value){
            hero.wallet -= item.value;
            successful_transaction = true;
            refreshInfo();
        }
        else{
            alert("You can't afford this item");
        }
        return successful_transaction;
    }
    drop_onSale(self){
        for(var i = 0; i < self.onSale.length; i++){
            var buyID = "#buy" + i;
            $(buyID).attr("buy_id", i);
            if(!self.onSale[$(buyID).attr('buy_id')].purchased){
                $(buyID).html(self.onSale[$(buyID).attr('buy_id')].value + 'gold');
                $(buyID).click(function(){
                    if(self.onSale[$(this).attr('buy_id')].buyItem(self.onSale[$(this).attr('buy_id')])){
                    $(this).off('click');
                    self.onSale[$(this).attr('buy_id')].purchased = true;
                    self.openNPCModule(self); //updates window
                }
                })
            }
            else if(self.onSale[$(buyID).attr('buy_id')].purchased && !self.onSale[$(buyID).attr('buy_id')].equipped){
                $(buyID).html("Equip");
                $(buyID).click(function(){
                    for(var j = 0; j < self.onSale.length; j++){
                            self.onSale[j].equipped = false;
                    }
                    self.onSale[$(this).attr('buy_id')].equipShield();
                    refreshInfo();
                    $(this).off('click');
                    self.openNPCModule(self);
                })
            }
            else{
                $(buyID).html('Unequip');
                $(buyID).click(function(){
                    self.onSale[$(this).attr('buy_id')].unequipShield();
                    refreshInfo();
                    $(this).off('click').html('Equip');
                    self.openNPCModule(self);
                })
            }
        }
    }
}
for(var shield in ShieldList){
    if(shield != 'wood'){
        var newShield = new ShieldUpgrade(shield);
        NPCList['shieldMaker']['merchandise'].push(newShield);
    }
}
