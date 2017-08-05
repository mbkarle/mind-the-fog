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
    'stun': {   'description': 'Your mastery of magic allows you to put your opponent out of action',
                'level': 6,
                'karma': 1,
                'learned': false,
                'objid': 'stunBox'
                },
    'forcefield': { 'description': 'You learn to block kinetic impacts with magic',
                    'level': 7,
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
    'Blood Magic': {    'description': 'You can sacrifice your vitality to cast more effectively',
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

    'stun': {
        'buffs': [],
        'debuffs': [
            {   'debuff': stunned,
                'chance': 1,
                'target': 'enemy'
            }
        ]
    }
}

class ActiveSpell extends Spell {
    constructor(name, objid, source, target, damage, cooldown){
        super(name, source, target);
        this.damage = damage;
        this.effectJSON = activeSpellEffects[this.name];
        this.objid = objid;
        this.cooldown = cooldown;
        var self = this;
        this.castSpell = function(){
            if(magicReady){
            console.log('casting');
            Damage({strength: this.damage}, this.target);
            for(var i = 0; i < this.effectJSON['buffs'].length; i++){
                if(Math.random() <= this.effectJSON['buffs'][i].chance){
                    this.effectJSON['buffs'][i]['buff'].applyBuff(this.effectJSON['buffs'][i]['target']);
                }
            }
            for(var n = 0; n < this.effectJSON['debuffs'].length; n++){
                if(Math.random() <= this.effectJSON['debuffs'][n].chance){
                    console.log(this.effectJSON['debuffs'][n]['debuff']);
                    this.effectJSON['debuffs'][n]['debuff'].applyDebuff(this.effectJSON['debuffs'][n]['target']);
                }
            }
            exhaust.target = hero;
            exhaust.duration = this.cooldown;
            exhaust.applyDebuff();
        }}
        this.createButton = function(){
            var thisButton;
            var thisID = '#' + this.objid;
            hero.spells.push(this);
            if(hero.spells.length % 2 == 0){
                thisButton = "<div id='" + this.objid + "' class='spell' style='top: " + (250 + 50 * (hero.spells.length - 1)) + "px;left: 320px;'>" + this.name + "</div>"
            }
            else{
                thisButton = "<div id='" + this.objid + "' class='spell' style='top: " + (250 + 50 * hero.spells.length) + "px;left: 150px;'>" + this.name + "</div>"
            }

            $("#combat-module").append(thisButton);
            console.log("#" + this.objid);
            $(thisID).click(function(){
                self.castSpell();
                console.log('casting ' + self);
            })
        }
        spellTree[this.name]['active spell'] = this;
    }
}

// effectJSON format:
// {
//     buffs: [
//         {buff: <buff>,
//             chance: <chance>,
//             target: target
//                },
//             {buff2JSON},
//             {etc}
//         ],
//     debuffs: [
//             {same format},
//             {etc}
//         ]
// }
