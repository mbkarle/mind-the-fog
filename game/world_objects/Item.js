class Item {
  constructor (name, type, strength, dexterity, vitality, toList, objid, items, listMeta, value) {
    this.name = name
    this.type = type
    this.strength = strength
    this.dexterity = dexterity
    this.vitality = vitality
    this.maxVitality = vitality
    this.toList = toList
    this.objid = objid
    this.items = items
    this.value = value
    this.constructorName = 'Item'
    this.getOgIdx = function (room) {
      return room.itemList.indexOf(this)
    }

    if (toList) {
      for (var i = 0; i < items.length; i++) {
        if (typeof items[i] === 'number') {
          listMeta[items[i]].push(this)
        } else { items[i].push(this) }
      }
    }
  }

  genHoverInfoHTML () {
    var innerhtml = this.name + '<br>'
    for (var attribute in this) {
      if (typeof this[attribute] === 'number' && attribute != 'value') {
        if (this[attribute] >= 0) {
          innerhtml += attribute + ': +' + this[attribute] + '<br>'
        } else { // issue #49
          innerhtml += attribute + ': ' + this[attribute] + '<br>'
        }
      }
    }
    return innerhtml
  }
}

class effectItem extends Item {
  constructor (name, type, strength, dexterity, vitality, buffArray, buffChance, debuffArray, debuffChance, toList, objid, items, listMeta, value) {
    super(name, type, strength, dexterity, vitality, toList, objid, items, listMeta, value)
    this.buffArray = buffArray
    this.buffChance = buffChance // pass array to match buffArray
    this.debuffArray = debuffArray
    this.debuffChance = debuffChance
    this.constructorName = 'effectItem'

    this.buffUp = function (target) {
      for (var i = 0; i < this.buffArray.length; i++) {
        if (Math.random() <= this.buffChance[i]) {
          console.log('applying ' + this.buffArray[i].name)
          this.buffArray[i].applyBuff(target)
        }
      }
    }
    this.debuffUp = function (target) {
      for (var i = 0; i < this.debuffArray.length; i++) {
        if (Math.random() <= this.debuffChance[i]) {
          console.log('applying ' + this.debuffArray[i].name)
          this.debuffArray[i].applyDebuff(target)
        }
      }
    }
  }

  genHoverInfoHTML () {
    var innerhtml = super.genHoverInfoHTML()

    // add buffs/debuffs
    for (var j = 0; j < this.buffArray.length; j++) {
      innerhtml += 'buffs: ' + this.buffArray[j].name + '<br>'
    }
    for (var k = 0; k < this.debuffArray.length; k++) {
      innerhtml += 'debuffs: ' + this.debuffArray[k].name + '<br>'
    }

    return innerhtml
  }
}

class exoticItem extends Item {
  constructor (name, type, strength, dexterity, vitality, value, protoLists, listMeta) {
    super(name, type, strength, dexterity, vitality)
    this.constructorName = 'exoticItem'
    this.unlocked = false
    this.value = value
    this.protoLists = protoLists
    this.listMeta = listMeta

    // Push to Blacksmith
    NPCS['blacksmith']['merchandise'][name] = this
  }
}

class Shields extends Item {
  constructor (name, type, strength, dexterity, vitality, healthBoost, weight, recovery, toList, objid, items) {
    super(name, type, strength, dexterity, vitality, toList, objid, items)
    this.shield_ready = true
    this.healthBoost = healthBoost
    this.weight = weight
    this.recovery = recovery
    this.constructorName = 'Shields'
  }
  shieldReady () {
    this.shield_ready = true
    clearTimeout(shieldReadyup)
    return this.shield_ready
  }
}

class Consumable extends Item {
  constructor (name, objid) {
    super(name, 'consumable')
    this.name = name
    this.objid = objid
    for (var i = 0; i < CONSUMABLES[name]['characteristics'].length; i++) {
      this[CONSUMABLES[name]['characteristics'][i]] = CONSUMABLES[name]['changes'][i]
    }
    this.buffArray = CONSUMABLES[name]['buffs']
    this.debuffArray = CONSUMABLES[name]['debuffs']
    this.constructorName = 'Consumable'
    this.value = CONSUMABLES[name]['value']
    this.prototyped = false
    this.getOgIdx = function (room) {
      return room.itemList.indexOf(this)
    }
  }

  genHoverInfoHTML () {
    var innerhtml = super.genHoverInfoHTML()

    // add buffs/debuffs
    for (var j = 0; j < this.buffArray.length; j++) {
      innerhtml += 'buffs: ' + this.buffArray[j].buff.name + '<br>'
    }
    for (var k = 0; k < this.debuffArray.length; k++) {
      innerhtml += 'debuffs: ' + this.debuffArray[k].debuff.name + '<br>'
    }

    return innerhtml
  }

  useConsumable () {
    for (var i = 0; i < CONSUMABLES[this.name]['characteristics'].length; i++) {
      hero[CONSUMABLES[this.name]['characteristics'][i]] += CONSUMABLES[this.name]['changes'][i]
    }
    if (hero.vitality > hero.maxVitality) {
      hero.vitality = hero.maxVitality
    }
    for (var i = 0; i < CONSUMABLES[this.name]['buffs'].length; i++) {
      if (Math.random() < CONSUMABLES[this.name]['buffs'][i]['chance']) {
        CONSUMABLES[this.name]['buffs'][i]['buff'].applyBuff(hero)
      }
    }
    for (var i = 0; i < CONSUMABLES[this.name]['debuffs'].length; i++) {
      if (Math.random() < CONSUMABLES[this.name]['debuffs'][i]['chance']) {
        CONSUMABLES[this.name]['debuffs'][i]['debuff'].applyDebuff(hero)
      }
    }
    refreshOpenMods()
  }
}

// Load in consumables into NPCS
for (var consumable in CONSUMABLES) {
  var newConsumable = new Consumable(consumable, 'lul')
  var id = newConsumable.name
  NPCS['alchemist']['merchandise'][id] = newConsumable
}

class ShieldUpgrade {
  constructor (name) {
    this.name = name
    this.weight = SHIELDS[name]['weight']
    this.recovery = SHIELDS[name]['recovery']
    this.healthBoost = SHIELDS[name]['healthBoost']
    this.vitality = SHIELDS[name]['vitality']
    this.maxVitality = SHIELDS[name]['maxVitality']
    this.value = SHIELDS[name]['value']
    this.purchased = false
    this.constructorName = 'ShieldUpgrade'
    this.tier = SHIELDS[name]['tier']
    this.catalog = NPCS['shieldMaker']['merchandise']
  }

  genHoverInfoHTML () {
    var innerhtml = this.name + '<br>'
    for (var attribute in this) {
      if (typeof this[attribute] === 'number' && attribute != 'value' && attribute != 'tier') {
        innerhtml += attribute + ': ' + this[attribute] + '<br>'
      }
    }
    innerhtml += '<br>Tier: ' + this.tier + '<br><small>Prereq: purchased tier <br> equal or lower'
    return innerhtml
  }

  isEquipped () { return hero.shieldUpgradeName === this.name }

  equipShield () {
    hero.shieldUpgradeName = this.name // set hero's shield upg
    // set stats to be this shield
    for (var attribute in SHIELDS[this.name]) {
      if (attribute != 'value') {
        heroShield[attribute] = SHIELDS[this.name][attribute]
      }
    }
  }

  unequipShield () {
    hero.shieldUpgradeName = 'wood' // reset hero's shield upg
    for (var attribute in SHIELDS['wood']) {
      if (attribute != 'value') {
        heroShield[attribute] = SHIELDS['wood'][attribute]
      }
    }
  }

  purchasable () {
    // Returns if able to purchase in terms of prereqs
    return this.tier <= hero.maxUnlockedShieldTier + 1
  }
}

// Load in shields into NPCS
for (var shield in SHIELDS) {
  if (shield != 'wood') {
    var newShield = new ShieldUpgrade(shield)
    var id = newShield.name
    NPCS['shieldMaker']['merchandise'][id] = newShield
  }
}

class DogUpgrade {
  // A DogUpgrade is essentially a function you buy that when you buy
  // you apply to the dog!
  constructor (name) {
    this.name = name
    this.purchased = false
    this.upgradeFunc = DOGUPGRADES[name]['func']
    this.desc = DOGUPGRADES[name]['description']
    this.value = DOGUPGRADES[name]['value']
    this.prereqs = DOGUPGRADES[name]['prereqs']
    this.catalog = NPCS['dogTrainer']['merchandise']
  }

  use () { this.upgradeFunc(doge) }

  genHoverInfoHTML () {
    var html = 'Description: <br> ' + this.desc
    if (this.prereqs.length > 0) { html += '<br><br>Prerequisites:<br>' }
    for (var i = 0; i < this.prereqs.length; i++) {
      html += this.prereqs[i] + '<br>'
    }
    return html
  }

  purchasable () {
    // Returns if able to purchase in terms of prereqs
    for (var i = 0; i < this.prereqs.length; i++) {
      // Look up in the merch json
      if (!this.catalog[this.prereqs[i]].purchased) {
        return false
      }
    }
    return true
  }
}

// Load in shields into NPCS
for (var dogup in DOGUPGRADES) {
  var newDogUP = new DogUpgrade(dogup)
  var id = newDogUP.name
  NPCS['dogTrainer']['merchandise'][id] = newDogUP
}
