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

        if(toList){
            items.push(this);
        }
    }
}
