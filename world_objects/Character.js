class Character{
    constructor(name, strength, dexterity, vitality, objid) {
        this.name = name;
        this.strength = strength;
        this.dexterity = dexterity;
        this.vitality = vitality;
        this.maxVitality = vitality;
        this.objid = objid;
        this.effects = [];

    }
}

class Boss extends Character{
  constructor(name, strength, dexterity, vitality, lootList){
    super(name, strength, dexterity, vitality, 'enemy');
    this.constructorName = "Boss";
    this.loot = lootList[Math.floor(Math.random() * lootList.length)];
  }
}


class Hero extends Character{
  constructor(name, strength, dexterity, vitality, objid){
    super(name, strength, dexterity, vitality, objid);
    this.xp = 1000;
    this.levelCheck = function() {
        return this.level = Math.floor(this.xp / 1000);
    }
    this.wallet = 0;
    this.constructorName = "Hero";
    this.num_torches = 3;
    this.spells = [];
    this.karma = 0;
    this.exhaustStatus = 0;
    this.exhaustLimit = 3;

    //hero start inventory
    this.inventory = {
        weapon: null,
        headgear: null,
        armor: null,
        carried: []
    }

  }
}



class Enemy extends Character{
  constructor(name, strength, dexterity, vitality){
    super(name, strength, dexterity, vitality, 'enemy');
    this.lootId = -1;
    this.constructorName = "Enemy";
  }
}
