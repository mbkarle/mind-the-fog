class Spell {
  constructor (name, source, target) {
    this.name = name
    this.description = SPELLTREE[this.name]['description']
    this.source = source
    this.target = target
  }
}

class ActiveSpell extends Spell {
  constructor (name, objid, source, target, damage, spellCooldown, exhaustAdd) {
    super(name, source, target)
    this.damage = damage
    this.effectJSON = ACTIVE_SPELL_EFFECTS[this.name]
    this.objid = objid
    this.spellCooldown = spellCooldown
    this.exhaustAdd = exhaustAdd
    this.exhaustCooldown = 15000
    this.ready = true
    var self = this
    this.castSpell = function () {
      if (magicReady && this.ready) {
        this.ready = false
        console.log('casting')
        var spellReadyTimeout = setTimeout(function () {
          self.ready = true
        }, this.spellCooldown)
        Damage({strength: this.damage}, this.target)
        for (let i = 0; i < this.effectJSON['buffs'].length; i++) {
          if (Math.random() <= this.effectJSON['buffs'][i].chance) {
            this.effectJSON['buffs'][i]['buff'].applyBuff(this.effectJSON['buffs'][i]['target'])
          }
        }
        for (let n = 0; n < this.effectJSON['debuffs'].length; n++) {
          if (Math.random() <= this.effectJSON['debuffs'][n].chance) {
            console.log(this.effectJSON['debuffs'][n]['target'])
            this.effectJSON['debuffs'][n]['debuff'].applyDebuff(this.effectJSON['debuffs'][n]['target'])
          }
        }
        exhaust.target = hero
        exhaust.duration = this.exhaustCooldown
        hero.exhaustStatus += this.exhaustAdd
        for (let i = 0; i < this.exhaustAdd; i++) {
          var duration = 4000 + 4000 * i
          window.setTimeout(function () {
            if (hero.exhaustStatus > 0) {
              hero.exhaustStatus -= 1
              console.log('hero.exhaustStatus: ' + hero.exhaustStatus)
            }
          }, duration)
        }
        if (hero.exhaustStatus >= hero.exhaustLimit) {
          exhaust.applyDebuff()
        }
      }
    }
    this.createButton = function () {
      var thisButton
      var thisID = '#' + this.objid
      var thisSlider = '#' + this.objid + 'slider'
      hero.spells.push(this)
      if (hero.spells.length > 1) {
        thisButton = "<div id='" + this.objid + "' class='spell' style='top: " + (250 + 50 * (hero.spells.length - 1)) + "px;left: 320px;'>" + this.name +
                "<div id='" + this.objid + "slider' class='coolDown' style='position:absolute;top:0;left:0;display:none;width:100%;height:100%;'></div></div>"
      } else {
        thisButton = "<div id='" + this.objid + "' class='spell' style='top: " + (250 + 50 * hero.spells.length) + "px;left: 150px;'>" + this.name +
                "<div id='" + this.objid + "slider' class='coolDown' style='position:absolute;top:0;left:0;display:none;width:100%;height:100%;'></div></div>"
      }

      $('#combat-module').append(thisButton)
      console.log('#' + this.objid)
      $(thisID).click(function () {
        self.castSpell()
        if (magicReady) {
          $(thisSlider).show().animate({
            width: '0%'
          }, self.spellCooldown, function () {
            $(thisSlider).hide()
            $(thisSlider).animate({
              width: '100%'
            }, 1)
          })
          console.log('casting ' + self)
        }
      })
    }
    SPELLTREE[this.name]['active spell'] = this
  }
}

class Upgrade {
  constructor (name, addedFunction) {
    this.name = name
    this.addedFunction = addedFunction
    var self = this
    this.upgrade = function () {
      for (let target in SPELL_UPGRADES[this.name]) {
        for (let i = 0; i < hero.spells.length; i++) {
          if (target === hero.spells[i].name) {
            for (let n = 0; n < SPELL_UPGRADES[this.name][target]['characteristics'].length; n++) {
              hero.spells[i][SPELL_UPGRADES[this.name][target]['characteristics'][n]] += SPELL_UPGRADES[this.name][target]['changes'][n]
            }
            if (typeof SPELL_UPGRADES[this.name][target]['effectAdd'] !== 'undefined') {
              console.log(SPELL_UPGRADES[this.name][target]['effectAdd']['effect'])
              ACTIVE_SPELL_EFFECTS[hero.spells[i].name][SPELL_UPGRADES[this.name][target]['effectAdd']['type']].push(SPELL_UPGRADES[this.name][target]['effectAdd']['effect'])
            }
          } else if (target === 'hero') {
            for (let n = 0; n < SPELL_UPGRADES[this.name][target]['characteristics'].length; n++) {
              hero[SPELL_UPGRADES[this.name][target]['characteristics'][n]] += SPELL_UPGRADES[this.name][target]['changes'][n]
            }
          }
          if (typeof this.addedFunction !== 'undefined') {
            if (typeof this.cachedFunction !== 'undefined') {
              hero.spells[i].castSpell = this.cachedFunction
            }
            hero.spells[i].castSpell = (function () {
              self.cachedFunction = hero.spells[i].castSpell

              return function () {
                self.addedFunction()
                self.cachedFunction.apply(this, arguments)
              }
            }())
          }
        }
      }
    }
    SPELLTREE[this.name]['upgrade'] = this
  }
}

function bloodDisFoo () {
  if (magicReady && hero.vitality <= hero.maxVitality - 2) {
    hero.vitality += 2
  } else if (magicReady && hero.vitality < hero.maxVitality) {
    hero.vitality += 1
  }
}
function bloodMagFoo () {
  bloodDisFoo()
  if (magicReady) {
    hero.vitality -= 5
  }
}
