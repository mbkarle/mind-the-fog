var ITEMS_LOADED = {}

var ITEMS = {
  'MasterSword': {
    'name': 'the master sword',
    'type': 'weapon',
    'strength': 25,
    'dexterity': 17,
    'vitality': 30,
    'toList': false,
    'objid': null,
    'items': [1],
    'value': 10000
  },

  'startWeapon': {
    'name': 'rusty sword',
    'type': 'weapon',
    'strength': 0,
    'dexterity': 0,
    'vitality': 0,
    'toList': false,
    'objid': null,
    'items': [1],
    'value': 10
  },

  'IronHelm': {
    'name': 'iron helm',
    'type': 'headgear',
    'strength': null,
    'dexterity': -1,
    'vitality': 10,
    'toList': true,
    'objid': null,
    'items': [1],
    'value': 50
  },

  'katana': {
    'name': 'katana',
    'type': 'weapon',
    'strength': 1,
    'dexterity': 1,
    'vitality': null,
    'toList': true,
    'objid': null,
    'items': [1, 0],
    'value': 120
  },

  'thornArmor': {
    'name': 'armor of thorns',
    'type': 'armor',
    'strength': 1,
    'dexterity': -1,
    'vitality': 5,
    'toList': true,
    'objid': null,
    'items': [1],
    'value': 50
  },

  'chainMail': {
    'name': 'light chainmail',
    'type': 'armor',
    'strength': null,
    'dexterity': null,
    'vitality': 5,
    'toList': true,
    'objid': null,
    'items': [1, 0],
    'value': 100
  },

  'GreatSword': {
    'name': 'greatsword',
    'type': 'weapon',
    'strength': 3,
    'dexterity': null,
    'vitality': null,
    'toList': true,
    'objid': null,
    'items': [[]],
    'value': 300
  },

  'cloakMor': {
    'name': 'cloak of Moranos',
    'type': 'armor',
    'strength': null,
    'dexterity': 2,
    'vitality': -5,
    'toList': true,
    'objid': null,
    'items': [2, 0],
    'value': 150
  },

  'hoodofOmar': {
    'name': 'leather hood',
    'type': 'headgear',
    'strength': null,
    'dexterity': 1,
    'vitality': 3,
    'toList': true,
    'objid': null,
    'items': [1, 0],
    'value': 120
  },

  'ironMail': {
    'name': 'iron chainmail',
    'type': 'armor',
    'strength': null,
    'dexterity': -1,
    'vitality': 15,
    'toList': true,
    'objid': null,
    'items': [2, 0],
    'value': 150
  },

  'mace': {
    'name': 'mace',
    'type': 'weapon',
    'strength': 2,
    'dexterity': -1,
    'vitality': null,
    'toList': true,
    'objid': null,
    'items': [1],
    'value': 50
  },

  'assBlade': {
    'name': "assassin's blade",
    'type': 'weapon',
    'strength': -1,
    'dexterity': 3,
    'vitality': 5,
    'toList': true,
    'objid': null,
    'items': [2],
    'value': 180
  },

  'machete': {
    'name': 'machete',
    'type': 'weapon',
    'strength': 3,
    'dexterity': 1,
    'vitality': null,
    'toList': true,
    'objid': null,
    'items': [2],
    'value': 250
  },

  'cutlass': {
    'name': 'cutlass',
    'type': 'weapon',
    'strength': 2,
    'dexterity': 2,
    'vitality': 5,
    'toList': true,
    'objid': null,
    'items': [2, 3],
    'value': 330
  },

  'shadowCloak': {
    'name': 'shadow cloak',
    'type': 'armor',
    'strength': 1,
    'dexterity': 3,
    'vitality': 5,
    'toList': true,
    'objid': null,
    'items': [2],
    'value': 300
  },

  'steelHelm': {
    'name': 'steel helm',
    'type': 'headgear',
    'strength': 1,
    'dexterity': 1,
    'vitality': 10,
    'toList': true,
    'objid': null,
    'items': [2],
    'value': 250
  },

  'steelBlade': {
    'name': 'steel sword',
    'type': 'weapon',
    'strength': 5,
    'dexterity': 2,
    'vitality': null,
    'toList': true,
    'objid': null,
    'items': [3],
    'value': 400
  },

  'hoodMor': {
    'name': 'hood of Moranos',
    'type': 'headgear',
    'strength': 2,
    'dexterity': 5,
    'vitality': -10,
    'toList': true,
    'objid': null,
    'items': [3],
    'value': 350
  },

  'execAxe': {
    'name': "executioner's axe",
    'type': 'weapon',
    'strength': 9,
    'dexterity': 1,
    'vitality': 10,
    'toList': true,
    'objid': null,
    'items': [3],
    'value': 500
  },

  'legionHelm': {
    'name': "legionairre's helmet",
    'type': 'headgear',
    'strength': 4,
    'dexterity': 3,
    'vitality': 20,
    'toList': true,
    'objid': null,
    'items': [3],
    'value': 400
  },

  'HammerWrath': {
    'name': 'Hammer of Wrath',
    'type': 'weapon',
    'strength': 15,
    'dexterity': 2,
    'vitality': 20,
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 1000
  },

  'scythe': {
    'name': "Reaper's Scythe",
    'type': 'weapon',
    'strength': 12,
    'dexterity': 6,
    'vitality': 15,
    'toList': true,
    'objid': null,
    'items': [[]],
    'value': 1200
  },

  'bladeMor': {
    'name': 'Blade of Moranos',
    'type': 'weapon',
    'strength': 5,
    'dexterity': 15,
    'vitality': -10,
    'toList': true,
    'objid': null,
    'items': [[]],
    'value': 1000
  },

  'belia': {
    'name': 'Belia',
    'type': 'weapon',
    'strength': 10,
    'dexterity': 10,
    'vitality': 10,
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 1500
  },

  'CourDeath': {
    'name': 'Courier of Death',
    'type': 'weapon',
    'strength': 13,
    'dexterity': 8,
    'vitality': null,
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 1200
  },

  'ImpenetrableArm': {
    'name': 'Impenetrable Armor',
    'type': 'armor',
    'strength': 6,
    'dexterity': -5,
    'vitality': 200,
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 1000
  },

  'MasterHelm': {
    'name': "Master's Helmet",
    'type': 'headgear',
    'strength': 4,
    'dexterity': 4,
    'vitality': 40,
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 1000
  },

  'unbreakHelm': {
    'name': 'Unbreakable helmet',
    'type': 'headgear',
    'strength': 5,
    'dexterity': -3,
    'vitality': 100,
    'toList': true,
    'objid': null,
    'items': [4],
    'value': 1000
  }
}
