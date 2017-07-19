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

        if(toList){
            for(i = 0; i < items.length; i++){
            items[i].push(this);
        }
        }
    }
}

class Shields extends Item {
  constructor(name, type, strength, dexterity, vitality, toList, objid, items){
    super(name, type, strength, dexterity, vitality, toList, objid, items);
    this.shield_ready = true;
  }
  shieldReady() {
    this.shield_ready = true;
    clearTimeout(shieldReadyup);
    return this.shield_ready;
  }
}
