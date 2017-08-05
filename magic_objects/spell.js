class Spell {
    constructor(name, source, target){
        this.name = name;
        this.description = spellTree[this.name];
        this.source = source;
        this.target = target;
    }
}

var spellTree = {
    'fireball': "A basic spell. Deals damage but tires the mind.",
    'learned caster': 'Practice and study has taught you endurance',
    'power of will': 'Greater mental fortitude grants greater impact',
    'mind over body': 'You learn to channel your magic to accomplish inhuman physical feats',
    'stun': 'Your mastery of magic allows you to put your opponent out of action',
    'forcefield': 'You learn to block kinetic impacts with magic',
    'dirty magic': 'You discover shortcuts to faster, stronger magic – but it puts you at risk',
    'mind domination': 'Take control of the mind of your enemy',
    'blood disciple': 'You redirect your magical energies in order to drain the health of your enemy',
    'lightning strike': 'Channel your hate to call upon the heavens to smite your enemy',
    'Blood Magic': 'You can sacrifice your vitality to cast more effectively'
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
