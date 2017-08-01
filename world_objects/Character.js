class Character{
    constructor(name, strength, dexterity, vitality, objid) {
        this.name = name;
        this.strength = strength;
        this.dexterity = dexterity;
        this.vitality = vitality;
        this.maxVitality = vitality;
        this.objid = objid;
    }
}

class Boss extends Character{
  constructor(name, strength, dexterity, vitality, lootList){
    super(name, strength, dexterity, vitality, 'enemy');
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
    this.num_torches = 3;
  }
}



class Enemy extends Character{
  constructor(name, strength, dexterity, vitality){
    super(name, strength, dexterity, vitality, 'enemy');
    this.lootId = -1;
  }
}
