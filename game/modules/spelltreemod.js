class SpellTreeModule {
  constructor () {
    this.modID = '#tree-module'
    this.open = false
  }

  openMod () { this.open = true; $(this.modID).show(100) }

  hideMod () { this.open = false; $(this.modID).hide(100) }

  toggleMod () {
    if (this.open) { this.hideMod() } else { this.openMod() }
  }

  refreshMod () {
    var thisModule = this
    $(this.modID).html('')
    for (var spell in Object.getOwnPropertyNames(SPELLTREE)) {
      if (typeof Object.getOwnPropertyNames(SPELLTREE)[spell] !== 'function') {
        var spellBox
        var thisSpell = Object.getOwnPropertyNames(SPELLTREE)[spell]
        var objid = '#' + SPELLTREE[thisSpell]['objid']
        var top = 60 * (SPELLTREE[Object.getOwnPropertyNames(SPELLTREE)[spell]]['level'] - 2)
        var left
        if (SPELLTREE[Object.getOwnPropertyNames(SPELLTREE)[spell]]['karma'] === 1) {
          left = 5 + '%'
        } else if (SPELLTREE[Object.getOwnPropertyNames(SPELLTREE)[spell]]['karma'] === -1) {
          left = 64 + '%'
        } else {
          left = 35 + '%'
        }
        var toDisplay
        function isLearnable (spellName) {
          var learnable = (hero.levelCheck() >= SPELLTREE[spellName]['level'] &&
                ((SPELLTREE[spellName]['karma'] >= 0 && hero.karma >= SPELLTREE[spellName]['level'] - 3) ||
                (SPELLTREE[spellName]['karma'] <= 0 && hero.karma <= SPELLTREE[spellName]['level'] * -1 + 3)))
          return learnable
        }
        if (!isLearnable(Object.getOwnPropertyNames(SPELLTREE)[spell])) {
          toDisplay = '?'
        } else {
          toDisplay = Object.getOwnPropertyNames(SPELLTREE)[spell]
        }
        $(this.modID).append("<div id='" + SPELLTREE[thisSpell]['objid'] + "' class='treeBox' style='left:" + left + ';top:' + top + "px;'>" + toDisplay + '</div>')
        if (SPELLTREE[thisSpell]['learned']) {
          $(objid).css({'background-color': 'white', 'color': 'black'})
        }
        $(objid).attr('thisSpell', thisSpell)
        $(objid).click(function () {
          $(thisModule.modID).html("<div style='text-align:center;font-size:12px;font-family:cursive;'>" +
                $(this).attr('thisSpell') + '<br><br>' +
                SPELLTREE[$(this).attr('thisSpell')]['description'] + '<br><br> Required Level: ' +
                SPELLTREE[$(this).attr('thisSpell')]['level'] + "<div id='closeWindow' class='interact'>Close</div></div>")
          $(thisModule.modID).append("<div id='learn" + spell + "' class='interact' style='left:0; width:40px;display:none;'>Learn</div>")

          var learnID = '#learn' + spell
          $(learnID).attr('thisSpell', $(this).attr('thisSpell'))
          $('#closeWindow').click(function () {
            refreshOpenMods()
          })
          if (!SPELLTREE[$(this).attr('thisSpell')]['learned'] && isLearnable($(this).attr('thisSpell'))) {
            $(learnID).show()
            $(learnID).click(function () {
              SPELLTREE[$(this).attr('thisSpell')]['learned'] = true
              hero.karma += SPELLTREE[$(this).attr('thisSpell')]['karma']
              if (typeof SPELLTREE[$(this).attr('thisSpell')]['active spell'] !== 'undefined') {
                SPELLTREE[$(this).attr('thisSpell')]['active spell'].createButton()
              } else if (typeof SPELLTREE[$(this).attr('thisSpell')]['upgrade'] !== 'undefined') {
                SPELLTREE[$(this).attr('thisSpell')]['upgrade'].upgrade()
              }
              refreshOpenMods()
            })
          }
        })
      }
    }
  }
}
