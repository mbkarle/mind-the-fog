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
        this.value = null;
        this.constructorName = "Item";
        this.getOgIdx = function(room){
            return room.itemList.indexOf(this);
        }

        if(toList){
            for(var i = 0; i < items.length; i++){
                items[i].push(this);
            }
        }
    }

    genHoverInfoHTML() {
        var innerhtml = this.name + "<br>"
        for (var attribute in this) {
            if (typeof this[attribute] == "number" && attribute != 'value') {
                if(this[attribute] >= 0){
                    innerhtml += attribute + ": +" + this[attribute] + "<br>";
                }
                else{ //issue #49
                    innerhtml += attribute + ": " + this[attribute] + "<br>";
                }
            }
        }
        return innerhtml
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

    genHoverInfoHTML(){
        var innerhtml = super.genHoverInfoHTML()

        // add buffs/debuffs
        for(var j = 0; j < this.buffArray.length; j++){
            innerhtml += "buffs: " + this.buffArray[j].name + "<br>";
        }
        for(var k = 0; k < this.debuffArray.length; k++){
            innerhtml += "debuffs: " + this.debuffArray[k].name + "<br>";
        }

        return innerhtml
    }
}

class exoticItem extends Item {
    constructor(name, type, strength, dexterity, vitality, value, protoLists){
        super(name, type, strength, dexterity, vitality, true, null, [NPCS['blacksmith']['merchandise']]);
        this.constructorName = "exoticItem";
        this.unlocked = false
        this.value = value;
        this.protoLists = protoLists;
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

class Consumable extends Item{
    constructor(name, objid){
        super(name, 'consumable')
        this.name = name;
        this.objid = objid;
        for(var i = 0; i < CONSUMABLES[name]['characteristics'].length; i++){
            this[CONSUMABLES[name]['characteristics'][i]] = CONSUMABLES[name]['changes'][i];
        }
        this.buffArray = CONSUMABLES[name]['buffs'];
        this.debuffArray = CONSUMABLES[name]['debuffs'];
        this.constructorName = 'Consumable';
        this.value = CONSUMABLES[name]['value'];
        this.prototyped = false;
        this.getOgIdx = function(room){
            return room.itemList.indexOf(this);
        }
    }

    genHoverInfoHTML(){
        var innerhtml = super.genHoverInfoHTML()

        // add buffs/debuffs
        for(var j = 0; j < this.buffArray.length; j++){
            innerhtml += "buffs: " + this.buffArray[j].buff.name + "<br>";
        }
        for(var k = 0; k < this.debuffArray.length; k++){
            innerhtml += "debuffs: " + this.debuffArray[k].debuff.name + "<br>";
        }

        return innerhtml
    }

    useConsumable(){
        for(var i = 0; i < CONSUMABLES[this.name]['characteristics'].length; i++){
            hero[CONSUMABLES[this.name]['characteristics'][i]] += CONSUMABLES[this.name]['changes'][i];
        }
        if(hero.vitality > hero.maxVitality){
            hero.vitality = hero.maxVitality;
        }
        for(var i = 0; i < CONSUMABLES[this.name]['buffs'].length; i++){
            if(Math.random() < CONSUMABLES[this.name]['buffs'][i]['chance']){
                CONSUMABLES[this.name]['buffs'][i]['buff'].applyBuff(hero);
            }
        }
        for(var i = 0; i < CONSUMABLES[this.name]['debuffs'].length; i++){
            if(Math.random() < CONSUMABLES[this.name]['debuffs'][i]['chance']){
                CONSUMABLES[this.name]['debuffs'][i]['debuff'].applyDebuff(hero);
            }
        }
        refreshInfo();
    }
}

// Load in consumables into NPCS
for(var consumable in CONSUMABLES){
    var newConsumable = new Consumable(consumable, 'lul');
    NPCS['alchemist']['merchandise'].push(newConsumable);
}

class ShieldUpgrade {
    constructor(name){
        this.name = name;
        this.weight = SHIELDS[name]['weight'];
        this.recovery = SHIELDS[name]['recovery'];
        this.healthBoost = SHIELDS[name]['healthBoost'];
        this.vitality = SHIELDS[name]['vitality'];
        this.maxVitality = SHIELDS[name]['maxVitality'];
        this.value = SHIELDS[name]['value'];
        this.purchased = false;
        this.constructorName = "ShieldUpgrade";
    }

    genHoverInfoHTML() {
        var innerhtml = this.name + "<br>"
        for (var attribute in this) {
            if (typeof this[attribute] == "number" && attribute != 'value') {
                innerhtml += attribute + ": " + this[attribute] + "<br>";
            }
        }
        return innerhtml
    }

    isEquipped() { return hero.shieldUpgradeName === this.name }

    equipShield() {
        hero.shieldUpgradeName = this.name // set hero's shield upg
        //set stats to be this shield
        for(var attribute in SHIELDS[this.name]){
            if(attribute != 'value'){
                heroShield[attribute] = SHIELDS[this.name][attribute];
            }
        }
    }

    unequipShield() {
        hero.shieldUpgradeName = 'wood' // reset hero's shield upg
        for(var attribute in SHIELDS['wood']){
            if(attribute != 'value'){
                heroShield[attribute] = SHIELDS['wood'][attribute];
            }
        }
    }
}

// Load in shields into NPCS
for(var shield in SHIELDS){
    if(shield != 'wood'){
        var newShield = new ShieldUpgrade(shield);
        NPCS['shieldMaker']['merchandise'].push(newShield);
    }
}
