var ELEMITEMS = {

  'vikHelm': {
    'name': 'viking helmet',
    'type': 'headgear',
    'strength': 1,
    'dexterity': -1,
    'vitality': null,
    'buffArray': [adrenaline],
    'buffChance': [0.3],
    'debuffArray': [],
    'debuffChance': [],
    'toList': true,
    'objid': null,
    'items': [1, 0],
    'value': 30
  },

  'WarAxe': {
    'name': 'war axe',
    'type': 'weapon',
    'strength': 1,
    'dexterity': 1,
    'vitality': -3,
    'buffArray': [adrenaline],
    'buffChance': [0.4],
    'debuffArray': [],
    'debuffChance': [],
    'toList': true,
    'objid': null,
    'items': [0],
    'value': 50
  },

  'fireSword': {
    'name': 'blazing sword',
    'type': 'weapon',
    'strength': 2,
    'dexterity': 1,
    'vitality': null,
    'buffArray': [],
    'buffChance': [],
    'debuffArray': [fire],
    'debuffChance': [0.4],
    'toList': true,
    'objid': null,
    'items': [[]],
    'value': 200
  },

  'enchantedSword': {
    'name': 'enchanted sword',
    'type': 'weapon',
    'strength': null,
    'dexterity': null,
    'vitality': null,
    'buffArray': [adrenaline, indestructible],
    'buffChance': [0.1, 0.1],
    'debuffArray': [fire, ice],
    'debuffChance': [0.1, 0.1],
    'toList': true,
    'objid': null,
    'items': [1, 2, 0],
    'value': 120
  },

  'iceStaff': {
    'name': 'ice staff',
    'type': 'weapon',
    'strength': 1,
    'dexterity': null,
    'vitality': null,
    'buffArray': [indestructible],
    'buffChance': [0.1],
    'debuffArray': [ice],
    'debuffChance': [0.3],
    'toList': true,
    'objid': null,
    'items': [0],
    'value': 100
  },

  'fireStaff': {
    'name': 'fire staff',
    'type': 'weapon',
    'strength': 3,
    'dexterity': 1,
    'vitality': null,
    'buffArray': [],
    'buffChance': [],
    'debuffArray': [fire],
    'debuffChance': [0.4],
    'toList': true,
    'objid': null,
    'items': [2, 3],
    'value': 250
  },

  'hellPlate': {
    'name': "Hell Knights' breastplate",
    'type': 'armor',
    'strength': null,
    'dexterity': 1,
    'vitality': 10,
    'buffArray': [],
    'buffChance': [],
    'debuffArray': [fire],
    'debuffChance': [0.3],
    'toList': true,
    'objid': null,
    'items': [2],
    'value': 300
  },

  'icyShell': {
    'name': 'icy shell',
    'type': 'armor',
    'strength': 2,
    'dexterity': -1,
    'vitality': 10,
    'buffArray': [indestructible],
    'buffChance': [0.3],
    'debuffArray': [ice],
    'debuffChance': [0.3],
    'toList': true,
    'objid': null,
    'items': [[]],
    'value': 200
  },

  'enchantedCrown': {
    'name': 'enchanted crown',
    'type': 'headgear',
    'strength': null,
    'dexterity': null,
    'vitality': 20,
    'buffArray': [indestructible],
    'buffChance': [0.3],
    'debuffArray': [],
    'debuffChance': [],
    'toList': true,
    'objid': null,
    'items': [2],
    'value': 250
  },

  'cultMask': {
    'name': "cultist's mask",
    'type': 'headgear',
    'strength': 1,
    'dexterity': 1,
    'vitality': 10,
    'buffArray': [adrenaline],
    'buffChance': [0.2],
    'debuffArray': [fire],
    'debuffChance': [0.2],
    'toList': true,
    'objid': null,
    'items': [2],
    'value': 300
  },

  'goldChakram': {
    'name': 'golden chakram',
    'type': 'weapon',
    'strength': 4,
    'dexterity': 2,
    'vitality': 5,
    'buffArray': [],
    'buffChance': [],
    'debuffArray': [fire],
    'debuffChance': [0.3],
    'toList': true,
    'objid': null,
    'items': [3],
    'value': 450
  },

  'unbreakMail': {
    'name': 'unbreakable chainmail',
    'type': 'armor',
    'strength': 5,
    'dexterity': 2,
    'vitality': 30,
    'buffArray': [indestructible],
    'buffChance': [0.3],
    'debuffArray': [],
    'debuffChance': [],
    'toList': true,
    'objid': null,
    'items': [3],
    'value': 500
  },

  'invisCloak': {
    'name': 'Invisibility Cloak',
    'type': 'armor',
    'strength': null,
    'dexterity': 5,
    'vitality': 40,
    'buffArray': [],
    'buffChance': [],
    'debuffArray': [suppressed],
    'debuffChance': [0.3],
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 600
  },

  'MasterArmor': {
    'name': 'Master Armor',
    'type': 'armor',
    'strength': 5,
    'dexterity': 3,
    'vitality': 80,
    'buffArray': [indestructible],
    'buffChance': [0.5],
    'debuffArray': [],
    'debuffChance': [],
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 800
  },

  'enchantedHelm': {
    'name': 'enchanted helmet',
    'type': 'headgear',
    'strength': 2,
    'dexterity': 2,
    'vitality': 20,
    'buffArray': [adrenaline, indestructible],
    'buffChance': [0.4, 0.4],
    'debuffArray': [fire, ice],
    'debuffChance': [0.4, 0.4],
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 500
  }

}
