var CONSUMABLES = {
    "minor health potion": {
        'characteristics' : ['vitality'],
        'changes': [10],
        'buffs': [],
        'debuffs': [],
        'value': 20,
        'itemlists': [1, 2]
    },
    "major health potion": {
        'characteristics': ['vitality'],
        'changes': [50],
        'buffs': [],
        'debuffs': [],
        'value': 50,
        'itemlists': [0, 2, 3, 4]
    },
    'strength potion': {
        'characteristics' : [],
        'changes': [],
        'buffs': [
            {
            'buff': supStrength,
            'chance': 1,
            'target': 'hero'
            }
        ],
        'debuffs': [],
        'value': 50,
        'itemlists': [2, 3]
    },
    'dexterity potion': {
        'characteristics': [],
        'changes': [],
        'buffs': [
          {
            'buff': supSpeed,
            'chance': 1,
            'target': 'hero'
          }
        ],
        'debuffs': [],
        'value': 50,
        'itemlists': [2, 3]
    },
    'sponge potion': {
        'characteristics': [],
        'changes': [],
        'buffs': [
            {
                'buff': sponge,
                'chance': 1,
                'target': 'hero'
            }
        ],
        'debuffs': [
            {
                'debuff': slow,
                'chance': .5,
                'target': 'hero'
            }
        ],
        'value': 80,
        'itemlists': [3, 4]
    },
    'perma strength': {
      'characteristics': ['strength', 'vitality', 'maxVitality'],
      'changes': [2, 5, 5],
      'buffs': [],
      'debuffs': [],
      'value': 100,
      'itemlists': [2, 3]
    },
    'perma dexterity': {
      'characteristics': ['dexterity'],
      'changes': [2],
      'buffs': [],
      'debuffs': [],
      'value': 100,
      'itemlists': [2, 3]
    },
    'perma vitality': {
      'characteristics': ['vitality', 'maxVitality'],
      'changes': [20, 20],
      'buffs': [],
      'debuffs': [],
      'value': 100,
      'itemlists': [2, 3]
    },
    'liquid machismo': {
      'characteristics': ['strength', 'dexterity', 'vitality', 'maxVitality'],
      'changes': [1, 1, 20, 20],
      'buffs': [],
      'debuffs': [],
      'value': 150,
      'itemlists': [3, 4]
    }
}

