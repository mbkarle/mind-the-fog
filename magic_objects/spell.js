class Spell {
    constructor(name, source, target){
        this.name = name;
        this.description = spellTree[this.name]['description'];
        this.source = source;
        this.target = target;
    }
}

var spellTree = {
    'fireball': {   'description': "A basic spell. Deals damage but tires the mind.",
                    'level': 2,
                    'karma': 0,
                    'learned': false,
                    'objid': 'fireballBox',
                },
    'learned caster': { 'description': 'Practice and study has taught you endurance',
                        'level': 3,
                        'karma': 1,
                        'learned': false,
                        'objid': 'learnedCaster'
                },
    'power of will': {  'description': 'Greater mental fortitude grants greater impact',
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
    'channel divinity': {   'description': 'Your mastery of magic of the light allows you to ascend to divinity',
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
    'dirty magic': {    'description': 'You discover shortcuts to faster, stronger magic – but it puts you at risk',
                        'level': 3,
                        'karma': -1,
                        'learned': false,
                        'objid': 'dirtyMagic'
                },
    'mind domination': {    'description': 'Take control of the mind of your enemy',
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
    'lightning strike': {   'description': 'Channel your hate to call upon the heavens to smite your enemy',
                            'level': 6,
                            'karma': -1,
                            'learned': false,
                            'objid': 'lightningBox'
                },
    'blood magic': {    'description': 'You can sacrifice your vitality to cast more effectively',
                        'level': 7,
                        'karma': -1,
                        'learned': false,
                        'objid': 'bloodMagic'
                }
}

var activeSpellEffects = {
    'fireball': {
        'buffs': [],
        'debuffs': [
            {   'debuff': fire,
                'chance': .3,
                'target': 'enemy' //set to appropriate enemy on combat_enter
            }
        ]
    },

    'channel divinity': {
        'buffs': [
            {   'buff': divine,
                'chance': 1,
                'target': 'hero'
            }
        ],
        'debuffs': [
            {   'debuff': fire,
                'chance': .3,
                'target': 'enemy'
            },
            {   'debuff': ice,
                'chance': .3,
                'target': 'enemy'
            }
        ]
    },
    'forcefield': {
        'buffs': [],
        'debuffs': [
            {   'debuff': blocked,
                'chance': 1,
                'target': 'enemy'
            }
        ]
    },
    'mind domination': {
        'buffs': [],
        'debuffs': [
            {   'debuff': suppressed,
                'chance': 1,
                'target': 'enemy'
            },
            {   'debuff': dominated,
                'chance': 1,
                'target': 'enemy'
            },
            {   'debuff': asphyxiation,
                'chance': .3,
                'target': 'hero'
            }
        ]
    },
    'lightning strike': {
        'buffs': [],
        'debuffs': [
            {   'debuff': asphyxiation,
                'chance': .3,
                'target': 'hero'
            }
        ]
    }
}

class ActiveSpell extends Spell {
    constructor(name, objid, source, target, damage, spellCooldown, exhaustAdd){
        super(name, source, target);
        this.damage = damage;
        this.effectJSON = activeSpellEffects[this.name];
        this.objid = objid;
        this.spellCooldown = spellCooldown;
        this.exhaustAdd = exhaustAdd;
        this.exhaustCooldown = 15000;
        this.ready = true;
        var self = this;
        this.castSpell = function(){
            if(magicReady && this.ready){
            this.ready = false;
            console.log('casting');
            var spellReadyTimeout = setTimeout(function(){
                self.ready = true;
            }, this.spellCooldown);
            Damage({strength: this.damage}, this.target);
            for(var i = 0; i < this.effectJSON['buffs'].length; i++){
                if(Math.random() <= this.effectJSON['buffs'][i].chance){
                    this.effectJSON['buffs'][i]['buff'].applyBuff(this.effectJSON['buffs'][i]['target']);
                }
            }
            for(var n = 0; n < this.effectJSON['debuffs'].length; n++){
                if(Math.random() <= this.effectJSON['debuffs'][n].chance){
                    console.log(this.effectJSON['debuffs'][n]['target']);
                    this.effectJSON['debuffs'][n]['debuff'].applyDebuff(this.effectJSON['debuffs'][n]['target']);
                }
            }
            exhaust.target = hero;
            exhaust.duration = this.exhaustCooldown;
            hero.exhaustStatus += this.exhaustAdd;
            for(var i = 0; i < this.exhaustAdd; i++){
              var duration = 4000 + 4000 * i;
              window.setTimeout(function(){
                  if(hero.exhaustStatus > 0){
                    hero.exhaustStatus -= 1;
                    console.log("hero.exhaustStatus: " + hero.exhaustStatus);
                }
              }, duration );
            }
            if(hero.exhaustStatus >= hero.exhaustLimit){
                exhaust.applyDebuff();
            }

        }}
        this.createButton = function(){
            var thisButton;
            var thisID = '#' + this.objid;
            var thisSlider = '#' + this.objid + 'slider';
            hero.spells.push(this);
            if(hero.spells.length > 1){
                thisButton = "<div id='" + this.objid + "' class='spell' style='top: " + (250 + 50 * (hero.spells.length - 1)) + "px;left: 320px;'>" + this.name +
                "<div id='" + this.objid + "slider' class='coolDown' style='position:absolute;top:0;left:0;display:none;width:100%;height:100%;'></div></div>"
            }
            else{
                thisButton = "<div id='" + this.objid + "' class='spell' style='top: " + (250 + 50 * hero.spells.length) + "px;left: 150px;'>" + this.name +
                "<div id='" + this.objid + "slider' class='coolDown' style='position:absolute;top:0;left:0;display:none;width:100%;height:100%;'></div></div>"
            }

            $("#combat-module").append(thisButton);
            console.log("#" + this.objid);
            $(thisID).click(function(){
                self.castSpell();
                $(thisSlider).show().animate({
                    width: '0%'
                }, self.spellCooldown, function(){
                    $(thisSlider).hide();
                    $(thisSlider).animate({
                        width: '100%'
                    }, 1);
                })
                console.log('casting ' + self);
            })
        }
        spellTree[this.name]['active spell'] = this;
    }
}

var upgradesJSON = {
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
                    'chance': .3,
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
        'fireball':{
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

class Upgrade {
    constructor(name, addedFunction){
        this.name = name;
        this.addedFunction = addedFunction;
        this.cached_function;
        var self = this;
        this.upgrade = function(){
            for(var target in upgradesJSON[this.name]){
                for(var i = 0; i < hero.spells.length; i++){
                    if(target === hero.spells[i].name){
                        for(var n = 0; n < upgradesJSON[this.name][target]['characteristics'].length; n++){
                            hero.spells[i][upgradesJSON[this.name][target]['characteristics'][n]] += upgradesJSON[this.name][target]['changes'][n];
                        }
                        if(typeof upgradesJSON[this.name][target]['effectAdd'] != 'undefined'){
                            console.log(upgradesJSON[this.name][target]['effectAdd']['effect']);
                            activeSpellEffects[hero.spells[i].name][upgradesJSON[this.name][target]['effectAdd']['type']].push(upgradesJSON[this.name][target]['effectAdd']['effect']);
                        }
                    }
                    else if(target == 'hero'){
                        for(var n = 0; n < upgradesJSON[this.name][target]['characteristics'].length; n++){
                            hero[upgradesJSON[this.name][target]['characteristics'][n]] += upgradesJSON[this.name][target]['changes'][n];
                        }
                    }
                    if(typeof this.addedFunction != 'undefined'){
                        if(typeof this.cached_function != 'undefined'){
                            hero.spells[i].castSpell = this.cached_function;
                        }
                        hero.spells[i].castSpell = (function(){
                            self.cached_function = hero.spells[i].castSpell;

                            return function(){
                                self.addedFunction();
                                self.cached_function.apply(this, arguments);
                            };
                        }())
                    }
                }
            }

        }
        spellTree[this.name]['upgrade'] = this;
    }
}

function bloodDisFoo(){
    if(magicReady && hero.vitality <= hero.maxVitality - 2){
        hero.vitality += 2;
    }
    else if(magicReady && hero.vitality < hero.maxVitality){
        hero.vitality += 1;
    }
}
function bloodMagFoo(){
    bloodDisFoo();
    if(magicReady){
        hero.vitality -= 5;
    }
}
