class Item {
    constructor(name, strength, dexterity, vitality, toList, objid, items) {
        this.name = name;
        this.strength = strength;
        this.dexterity = dexterity;
        this.vitality = vitality;
        this.ogVit = vitality;
        this.toList = toList;
        this.objid = objid;

        if(toList){
            items.push(this);
        }
    }
}
