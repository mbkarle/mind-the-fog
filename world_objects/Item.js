class Item {
    constructor(name, type, strength, dexterity, vitality, toList, objid, items, listMeta) {
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
        this.getOgIdx = function(room){
            return room.itemList.indexOf(this);
        }

        if(toList){
            for(var i = 0; i < items.length; i++){
            if(typeof items[i] === "number"){
                listMeta[items[i]].push(this);
            }else{
                items[i].push(this);
            }
        }
        }

    }
}

class effectItem extends Item {
    constructor(name, type, strength, dexterity, vitality, buffArray, buffChance, debuffArray, debuffChance, toList, objid, items, listMeta){
        super(name, type, strength, dexterity, vitality, toList, objid, items, listMeta);
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

class exoticItem extends Item {
    constructor(name, type, strength, dexterity, vitality, value, protoLists, listMeta){
        super(name, type, strength, dexterity, vitality, true, null, [NPCList['blacksmith']['merchandise']]);
        this.constructorName = "exoticItem";
        this.getListIdx = function(){
            return NPCList['blacksmith']['merchandise'].indexOf(this);
        }
        this.value = value;
        this.protoLists = protoLists;
    }
    buyItem(item){
        var successful_transaction = false;
        if(hero.wallet >= item.value){
            hero.wallet -= item.value;
            successful_transaction = true;
            for(var i = 0; i < item.protoLists.length; i++){
               listMeta[ item.protoLists[i]].push(item);
            }
            NPCList['blacksmith']['merchandise'].splice(item.getListIdx(), 1);
            refillChests();
            refreshInfo();
        }
        else{
            openAlert("You can't afford this item");
        }
        return successful_transaction;
    }
    drop_onSale(self){
        for(var i = 0; i < self.onSale.length; i++){
            var buyID = "#buy" + i;
            $(buyID).attr("buy_id", i);
            $(buyID).html(self.onSale[$(buyID).attr('buy_id')].value + 'gold');
            $(buyID).click(function(){
                console.log('buying item');
                if(self.onSale[$(this).attr('buy_id')].buyItem(self.onSale[$(this).attr('buy_id')])){
                $(this).off('click');
                self.openNPCModule(self); //updates window
            }
            })
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
        this.getOgIdx = function(room){
            return this;
        }
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
        this.getOgIdx = function(room){
            return this;
        }
    }

}

var ConsumableList = {
    "minor health potion": {
        'characteristics' : ['vitality'],
        'changes': [10],
        'buffs': [],
        'debuffs': [],
        'value': 20,
        'itemlists': [1, 2]
    },
    "major health potion": {
        'characteristics': ['vitality'],
        'changes': [50],
        'buffs': [],
        'debuffs': [],
        'value': 50,
        'itemlists': [0, 2, 3, 4]
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
        'debuffs': [],
        'value': 50,
        'itemlists': [2, 3]
    },
    'dexterity potion': {
        'characteristics': [],
        'changes': [],
        'buffs': [
          {
            'buff': supSpeed,
            'chance': 1,
            'target': 'hero'
          }
        ],
        'debuffs': [],
        'value': 50,
        'itemlists': [2, 3]
    },
    'sponge potion': {
        'characteristics': [],
        'changes': [],
        'buffs': [
            {
                'buff': sponge,
                'chance': 1,
                'target': 'hero'
            }
        ],
        'debuffs': [
            {
                'debuff': slow,
                'chance': .5,
                'target': 'hero'
            }
        ],
        'value': 80,
        'itemlists': [3, 4]
    },
    'perma strength': {
      'characteristics': ['strength', 'vitality', 'maxVitality'],
      'changes': [2, 5, 5],
      'buffs': [],
      'debuffs': [],
      'value': 100,
      'itemlists': [2, 3]
    },
    'perma dexterity': {
      'characteristics': ['dexterity'],
      'changes': [2],
      'buffs': [],
      'debuffs': [],
      'value': 100,
      'itemlists': [2, 3]
    },
    'perma vitality': {
      'characteristics': ['vitality', 'maxVitality'],
      'changes': [20, 20],
      'buffs': [],
      'debuffs': [],
      'value': 100,
      'itemlists': [2, 3]
    },
    'liquid machismo': {
      'characteristics': ['strength', 'dexterity', 'vitality', 'maxVitality'],
      'changes': [1, 1, 20, 20],
      'buffs': [],
      'debuffs': [],
      'value': 150,
      'itemlists': [3, 4]
    }
}

class Consumable {
    constructor(name, objid){
        this.name = name;
        this.objid = objid;
        for(var i = 0; i < ConsumableList[name]['characteristics'].length; i++){
            this[ConsumableList[name]['characteristics'][i]] = ConsumableList[name]['changes'][i];
        }
        this.buffArray = ConsumableList[name]['buffs'];
        this.debuffArray = ConsumableList[name]['debuffs'];
        this.constructorName = 'Consumable';
        this.value = ConsumableList[name]['value'];
        this.prototyped = false;
        this.getOgIdx = function(room){
            return room.itemList.indexOf(this);
        }
    }
    useConsumable(consumable){
        for(var i = 0; i < ConsumableList[consumable.name]['characteristics'].length; i++){
            hero[ConsumableList[consumable.name]['characteristics'][i]] += ConsumableList[consumable.name]['changes'][i];
        }
        if(hero.vitality > hero.maxVitality){
            hero.vitality = hero.maxVitality;
        }
        for(var i = 0; i < ConsumableList[consumable.name]['buffs'].length; i++){
            if(Math.random() < ConsumableList[consumable.name]['buffs'][i]['chance']){
                ConsumableList[consumable.name]['buffs'][i]['buff'].applyBuff(hero);
            }
        }
        for(var i = 0; i < ConsumableList[consumable.name]['debuffs'].length; i++){
            if(Math.random() < ConsumableList[consumable.name]['debuffs'][i]['chance']){
                ConsumableList[consumable.name]['debuffs'][i]['debuff'].applyDebuff(hero);
            }
        }
        refreshInfo();
    }
    buyItem(item){
        var successful_transaction = false;
        if(hero.wallet >= item.value){
            hero.wallet -= item.value;
            successful_transaction = true;
            take_item(item);
            if(!item.prototyped){
              item.prototyped = true;
              for(var i = 0; i < ConsumableList[item.name]['itemlists'].length; i++){
                itemListMeta[ConsumableList[item.name]['itemlists'][i]].push(item);
              }
              refillChests();
            }
            refreshInfo();
        }
        else{
            openAlert("You can't afford this item");
        }
        return successful_transaction;
    }
    drop_onSale(self){
        for(var i = 0; i < self.onSale.length; i++){
            self.onSale[i].value = ConsumableList[self.onSale[i].name]['value'];
            var buyID = "#buy" + i;
            $(buyID).attr("buy_id", i);
            $(buyID).html(self.onSale[$(buyID).attr('buy_id')].value + 'gold');
            $(buyID).click(function(){
                console.log('buying item');
                if(self.onSale[$(this).attr('buy_id')].buyItem(self.onSale[$(this).attr('buy_id')])){
                $(this).off('click');
                self.openNPCModule(self); //updates window
            }
            })
        }
    }
}
for(var consumable in ConsumableList){
    var newConsumable = new Consumable(consumable, 'lul');
    NPCList['alchemist']['merchandise'].push(newConsumable);
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
            openAlert("You can't afford this item");
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
