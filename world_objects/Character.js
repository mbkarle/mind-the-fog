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
        this.inv = new Inventory(lootList, 1, 1)
        this.lootList = lootList
    }

    regenInv(){
        this.inv = new Inventory(this.lootList, 1, 1)
    }
}


class Hero extends Character{
    constructor(name, strength, dexterity, vitality, objid){
        super(name, strength, dexterity, vitality, objid);
        this.xp = 1000;
        this.levelCheck = function() {
            return this.level = Math.floor(this.xp / 1000);
        }
        this.constructorName = "Hero";
        this.spells = [];
        this.karma = 0;
        this.exhaustStatus = 0;
        this.exhaustLimit = 3;

        //hero inventory
        this.inv = new Inventory([], 10)

        //start hero w 3 torches
        this.inv.torches = 3

        //hero's equipped inventory (linked to inv)
        this.equip_inv = new EquippedInventory(this, this.inv)
    }
}


class Enemy extends Character{
    constructor(name, strength, dexterity, vitality){
        super(name, strength, dexterity, vitality, 'enemy');
        this.constructorName = "Enemy";
        this.inv = new Inventory(mobDrops, 2, 0)
    }

    regenInv(items=mobDrops){
        this.inv = new Inventory(items, 2, 0)
    }

}
