var SPELLTREE = {
  'fireball': { 'description': 'A basic spell. Deals damage but tires the mind.',
    'level': 2,
    'karma': 0,
    'learned': false,
    'objid': 'fireballBox'
  },

  'learned caster': { 'description': 'Practice and study has taught you endurance',
    'level': 3,
    'karma': 1,
    'learned': false,
    'objid': 'learnedCaster'
  },

  'power of will': { 'description': 'Greater mental fortitude grants greater impact',
    'level': 4,
    'karma': 1,
    'learned': false,
    'objid': 'powerWill'
  },

  'mind over body': { 'description': 'You learn to channel your magic to accomplish inhuman physical feats',
    'level': 5,
    'karma': 1,
    'learned': false,
    'objid': 'mindBody'
  },

  'channel divinity': { 'description': 'Your mastery of magic of the light allows you to ascend to divinity',
    'level': 7,
    'karma': 1,
    'learned': false,
    'objid': 'divineBox'
  },

  'forcefield': { 'description': 'You learn to block kinetic impacts with magic',
    'level': 6,
    'karma': 1,
    'learned': false,
    'objid': 'forcefieldBox'
  },

  'dirty magic': { 'description': 'You discover shortcuts to faster, stronger magic – but it puts you at risk',
    'level': 3,
    'karma': -1,
    'learned': false,
    'objid': 'dirtyMagic'
  },

  'mind domination': { 'description': 'Take control of the mind of your enemy',
    'level': 4,
    'karma': -1,
    'learned': false,
    'objid': 'mindDomBox'
  },

  'blood disciple': { 'description': 'You redirect your magical energies in order to drain the health of your enemy',
    'level': 5,
    'karma': -1,
    'learned': false,
    'objid': 'bloodDis'
  },

  'lightning strike': { 'description': 'Channel your hate to call upon the heavens to smite your enemy',
    'level': 6,
    'karma': -1,
    'learned': false,
    'objid': 'lightningBox'
  },

  'blood magic': { 'description': 'You can sacrifice your vitality to cast more effectively',
    'level': 7,
    'karma': -1,
    'learned': false,
    'objid': 'bloodMagic'
  }
}

var SPELL_UPGRADES = {
  'learned caster': {
    'fireball': {
      'characteristics': ['spellCooldown'],
      'changes': [-2000]
    },
    'hero': {
      'characteristics': ['exhaustLimit'],
      'changes': [1]
    }
  },

  'power of will': {
    'fireball': {
      'characteristics': ['spellCooldown', 'damage'],
      'changes': [-500, 2]
    }
  },

  'mind over body': {
    'hero': {
      'characteristics': ['strength', 'dexterity', 'vitality', 'maxVitality'],
      'changes': [1, 1, 10, 10]
    }
  },

  'dirty magic': {
    'fireball': {
      'characteristics': ['spellCooldown', 'damage'],
      'changes': [-3000, 2],
      'effectAdd': {
        'type': 'debuffs',
        'effect': {
          'debuff': asphyxiation,
          'chance': 0.3,
          'target': 'hero'
        }
      }
    },
    'hero': {
      'characteristics': ['exhaustLimit'],
      'changes': [1]
    }
  },

  'blood disciple': {
    'fireball': {
      'characteristics': ['damage'],
      'changes': [-1]
    }
  },

  'blood magic': {
    'fireball': {
      'characteristics': ['spellCooldown'],
      'changes': [-2000]
    },
    'lightning': {
      'characteristics': ['spellCooldown'],
      'changes': [-3000]
    },
    'mind domination': {
      'characteristics': ['spellCooldown'],
      'changes': [-3000]
    },
    'hero': {
      'characteristics': ['exhaustLimit'],
      'changes': [1]
    }
  }
}

var ACTIVE_SPELL_EFFECTS = {
  'fireball': {
    'buffs': [],
    'debuffs': [
      { 'debuff': fire,
        'chance': 0.3,
        'target': 'enemy' // set to appropriate enemy on combat_enter
      }
    ]
  },

  'channel divinity': {
    'buffs': [
      { 'buff': divine,
        'chance': 1,
        'target': 'hero'
      }
    ],
    'debuffs': [
      { 'debuff': fire,
        'chance': 0.3,
        'target': 'enemy'
      },
      { 'debuff': ice,
        'chance': 0.3,
        'target': 'enemy'
      }
    ]
  },

  'forcefield': {
    'buffs': [],
    'debuffs': [
      { 'debuff': blocked,
        'chance': 1,
        'target': 'enemy'
      }
    ]
  },

  'mind domination': {
    'buffs': [],
    'debuffs': [
      { 'debuff': suppressed,
        'chance': 1,
        'target': 'enemy'
      },
      { 'debuff': dominated,
        'chance': 1,
        'target': 'enemy'
      },
      { 'debuff': asphyxiation,
        'chance': 0.3,
        'target': 'hero'
      }
    ]
  },

  'lightning strike': {
    'buffs': [],
    'debuffs': [
      { 'debuff': asphyxiation,
        'chance': 0.3,
        'target': 'hero'
      }
    ]
  }
}
