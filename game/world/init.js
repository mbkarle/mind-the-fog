/*
 * This file should include the initialziation script for the game,
 * including global variables called throughout
 */

Array.prototype.move = function (oldIndex, newIndex) {
  if (newIndex >= this.length) {
    var k = newIndex - this.length
    while ((k--) + 1) {
      this.push(undefined)
    }
  }
  this.splice(newIndex, 0, this.splice(oldIndex, 1)[0])
  return this
}
// ------------------------------------------------------
//          Some magical game variables...
// ------------------------------------------------------
var gameDuration = 1800000 // how long before the fog closes in totally

// Restore old game info
if (typeof Cookies.get('USER_INFO') === 'undefined') {
  console.log("Couldn't find USER_INFO in cookies, init to {}")
  USER_INFO = {}
} else {
  USER_INFO = JSON.parse(Cookies.get('USER_INFO'))
  console.log('Restored game from old cookie:')
  console.log(USER_INFO)
}

// Modules -- #120
var txtmd = new TextModule()
var vndmd = new VendorModule()
var doginvmd = new DogInvModule()
var cmbmd = new CombatModule()
var invmd = new InventoryModule()
var splmd = new SpellTreeModule()

// variables of hero status
var canMove
var heroProtected
var lastKeyPress
var locFacing
var dirFacing
var ready
var shielded
var shieldUp
var shieldReadyup
var magicReady
var enemyAttack
var torchlight
var initialFogRadius
var fogRadius
var fogDeath = -1

// dog related variables! mans best friend :)
// NOTE: these are initialized here bc the dog should NOT be created from scratch
// every time game is restarted! In fact, Dog's properties should be persistant
// (such as if its carrying a weapon).
var doge = new Dog(6, 8)

var channelDivSpell// new ActiveSpell("channel divinity", 'channelDivS', hero, null, null, 20000, 3);
var fireball// new ActiveSpell('fireball', 'fireball', hero, null, 2, 5000, 1);
var lightningStrike// new ActiveSpell('lightning strike', 'lightningS', hero, null, 30, 15000, 2);
var mindDom// new ActiveSpell('mind domination', 'mindDomS', hero, null, null, 20000, 3);
var forcefieldSpell// new ActiveSpell('forcefield', 'forcefieldS', hero, null, null, 8000, 2);
var learnCast = new Upgrade('learned caster')
var powerWill = new Upgrade('power of will')
var mindBody = new Upgrade('mind over body')
var dirtyMagic = new Upgrade('dirty magic')
var bloodDisciple = new Upgrade('blood disciple', bloodDisFoo)
var bloodMag = new Upgrade('blood magic', bloodMagFoo)

// ------------------------------------------------------
//              Initialize Items
// ------------------------------------------------------
var itemList1 = []
var itemList2 = []
var itemList3 = []
var mobDrops = []
var mobDrops2 = []
var itemList4 = []
var itemListMeta = new Array(mobDrops, itemList1, itemList2, itemList3, itemList4)
var heroShield = new Shields('the shield', 'shield', null, null, 30, 1, 3, 4, false, 'defendText', [itemList1])

for (var attr in ELEMITEMS) {
  e = ELEMITEMS[attr]
  var temp = new effectItem(e['name'], e['type'], e['strength'], e['dexterity'], e['vitality'], e['buffArray'], e['buffChance'], e['debuffArray'], e['debuffChance'], e['toList'], e['objid'], e['items'], itemListMeta, e['value'])

  ITEMS_LOADED[attr] = temp
}
for (var attr in ITEMS) {
  e = ITEMS[attr]
  var temp = new Item(e['name'], e['type'], e['strength'], e['dexterity'], e['vitality'], e['toList'], e['objid'], e['items'], itemListMeta, e['value'])

  ITEMS_LOADED[attr] = temp
}
for (var attr in EXOTICS) {
  e = EXOTICS[attr]
  var temp = new exoticItem(e['name'], e['type'], e['strength'], e['dexterity'], e['vitality'], e['value'], e['protoLists'], itemListMeta)

  ITEMS_LOADED[attr] = temp
}

// ------------------------------------------------------
//              Initialize Characters
// ------------------------------------------------------
// As of startGame's introduction, initialization happens in startGame;
var hero
var tutorial
var Troglodyte
var DireRat
var DireRat2
var Ogre
var Sorcerer
var Vagrant
var HellHound
var Golem
var Werewolf
var slime
var frostGiant
var ferBeast
var smallWyrm
var pillager
var Bandit
var DarkSquire
var Cultist
var CultMaster
var DarkKnight
var CrimsonRider
var DisOfMoranos
var DreadPirate
var AncientWyrm
var Moranos
var DarkLord
var Reaper

// ------------------------------------------------------
//              Spinning up your world...
// ------------------------------------------------------
// SPECIAL ROOMS
var GreatHall = new SafeRoom('Great Hall', 'GreatHall', 0, 0)
var TutRoom = new SafeRoom('TutRoom', 'tutRoom', 0, 0)
var exitRoom = new SafeRoom('exitRoom', 'exitRoom', 0, 0)

var numFloors

var roomList

var currRoom
var currFloor

// MOAR magic game variables
// variables to track the current position of hero
var avatarX
var avatarY

// variables for resets
var startCombatModule
var pitActive

// LetsiGO!
var DEVUTILS = true
if (DEVUTILS) {
  window.addEventListener('keydown', devKeys, false)
}

// key listener
window.addEventListener('keydown', move, false)

// Add recurring save
setInterval(function () {
  Cookies.set('USER_INFO', USER_INFO)
}, 10000)

window.onload = function () {
  startCombatModule = document.getElementById('combat-module').innerHTML
  startGame()
  tutorialStart()
  document.getElementById('InvOpen').onclick = function () {
    invmd.toggleMod()
    doginvmd.hideMod()
    refreshOpenMods()
  }

  $('#TreeOpen').click(function () {
    splmd.toggleMod()
    refreshOpenMods()
  })

  $('.GUI-button').mouseenter(function () {
    $(this).css('text-decoration', 'underline')
  }).mouseleave(function () {
    $(this).css('text-decoration', 'none')
  })

  $('#restart-game').click(function () {
    location.reload() // add more once data persistence is implemented
  })

  $('#restart-round').click(function () {
    exitCombat(roomList[currFloor][currRoom])
    txtmd.revertTxtMd()
    window.clearInterval(enemyAttack)
    window.clearInterval(shielded)
    window.clearInterval(shieldUp)
    cmbmd.close()
    vndmd.revertVendorMd()
    startGame()
  })

  var insanity = -1
  // Slowly remove fog
  setInterval(function () {
    if (!roomList[currFloor][currRoom].roomCleared && fogRadius > 1) {
      oldFog = fogRadius
      fogRadius--
      if (fogRadius === 1 && !torchlight && insanity === -1) {
        insanity = setInterval(function () {
          if (fogRadius === 1 && !torchlight && hero.vitality > 0 && !roomList[currFloor][currRoom].roomCleared) {
            hero.vitality -= Math.floor(hero.maxVitality / 5)
            if (!cmbmd.open) {
              $('#worldMap').fadeOut(10).fadeIn(1000)
            }
            refreshOpenMods()
            if (hero.vitality <= 0) {
              killPlayer('The fog consumed you!')
              window.clearInterval(insanity)
              insanity = -1
            }
          }
        }, 2000)
      }
      console.log('fog closes in')
      roomList[currFloor][currRoom].addFogWhenFogRadiusChanges(avatarX, avatarY, torchlight, oldFog, fogRadius)
    }
  }, gameDuration / (initialFogRadius - 1))
}

//= ===============================================================
//                          START GAME
//= ===============================================================

function startGame () {
  // This is a function to set or reset all the relevant global game variables.
  // Additionally, this function builds a brand new world (except for the First
  // floor, since the GreatHall should be added to.)

  // character stats must reset
  hero = new Hero('The Hero', 5, 3, 20, 'hero')
  // Dog = new Dog() ---> GETS INITIALIZED IN ROOM!
  tutorial = new Enemy('tutorial', 1, 5, 15)
  Troglodyte = new Enemy('Troglodyte', 3, 2, 30)
  DireRat = new Enemy('Dire Rat', 1, 15, 20)
  DireRat2 = new Enemy('Dire Rat', 1.5, 15, 20)
  Ogre = new Enemy('Ogre', 9, 1, 60)
  Sorcerer = new Enemy('Sorcerer', 6, 4, 20)
  Vagrant = new Enemy('Wandering Vagrant', 5, 4, 35)
  HellHound = new Boss('Hell Hound', 5, 6, 50, [ITEMS_LOADED['fireSword']])
  Golem = new Boss('Golem', 7, 3, 50, [ITEMS_LOADED['GreatSword']])
  Werewolf = new Enemy('werewolf', 6, 4, 40)
  slime = new Enemy('slime', 8, 2, 50)
  frostGiant = new Boss('frost giant', 8, 5, 100, [ITEMS_LOADED['icyShell']])
  ferBeast = new Enemy('feral beast', 9, 3, 20)
  smallWyrm = new Enemy('young wyrm', 10, 4, 300)
  pillager = new Enemy('pillager', 6, 6, 80)
  Bandit = new Enemy('Bandit', 3, 5, 40)
  DarkSquire = new Enemy('Dark Squire', 5, 3, 35)
  Cultist = new Enemy('Cultist', 2, 5, 30)
  CultMaster = new Enemy('Cult Master', 4, 5, 40)
  DarkKnight = new Enemy('Dark Knight', 7, 7, 100)
  CrimsonRider = new Enemy('Crimson Rider', 9, 5, 250)
  DisOfMoranos = new Enemy('Disciple of Moranos', 11, 3, 200)
  DreadPirate = new Enemy('Dread Pirate Williams', 15, 4, 300)
  AncientWyrm = new Enemy('Ancient Wyrm', 14, 8, 500)
  Moranos = new Boss('Moranos', 10, 15, 100, [ITEMS_LOADED['bladeMor']])
  DarkLord = new Enemy('Dark Lord', 9, 9, 300)
  Reaper = new Boss('Reaper', 20, 2, 200, [ITEMS_LOADED['scythe']])

  // active spells must be reset
  channelDivSpell = new ActiveSpell('channel divinity', 'channelDivS', hero, null, null, 20000, 3)
  fireball = new ActiveSpell('fireball', 'fireball', hero, null, 2, 5000, 1)
  lightningStrike = new ActiveSpell('lightning strike', 'lightningS', hero, null, 30, 15000, 2)
  mindDom = new ActiveSpell('mind domination', 'mindDomS', hero, null, null, 20000, 3)
  forcefieldSpell = new ActiveSpell('forcefield', 'forcefieldS', hero, null, null, 8000, 2)

  for (var i = 0; i < Object.keys(SPELLTREE).length; i++) {
    SPELLTREE[Object.keys(SPELLTREE)[i]]['learned'] = false
  }

  // combat-module must be reset
  $('#combat-module').html(startCombatModule)
  heroShield.vitality = heroShield.maxVitality
  $('#compassascii').html(ASCII_COMPASS_N)
  dirFacing = 'N'
  $('#torchascii').html(TORCHES[0])

  // message globals
  messageArray = []
  messageCount = 0

  // hero globals
  canMove = true
  heroProtected = false
  heroShield.shieldReady = true
  ready = true
  clearInterval(shielded)
  clearTimeout(shieldUp)
  shieldUp = -1
  magicReady = true
  torchlight = false
  initialFogRadius = 5
  fogRadius = initialFogRadius

  // Build roomList
  numFloors = 8
  roomList = []

  // have an array of rooms per floor
  for (var i = 0; i < numFloors; i++) {
    roomList.push([])
  }

  var Floor0 = new Floor(0, 3, [0], [exitRoom, GreatHall, TutRoom])
  var Floor1 = new Floor(1, 4, [1], null)
  var Floor2 = new Floor(2, 4, [1, 2], null)
  var Floor3 = new Floor(3, 6, [2], null)
  var Floor4 = new Floor(4, 5, [2, 3], null)
  var Floor5 = new Floor(5, 4, [3], null)
  var Floor6 = new Floor(6, 4, [3, 4], null)
  var Floor7 = new Floor(7, 5, [4], null)

  doge.dogY = 8 // reset from last game
  doge.dogX = 6
  doge.dogRadius = fogRadius

  roomList[0] = Floor0.buildFloor()
  roomList[1] = Floor1.buildFloor()
  roomList[2] = Floor2.buildFloor()
  roomList[3] = Floor3.buildFloor()
  roomList[4] = Floor4.buildFloor()
  roomList[5] = Floor5.buildFloor()
  roomList[6] = Floor6.buildFloor()
  roomList[7] = Floor7.buildFloor()

  currRoom = 1
  currFloor = 0

  // MOAR magic game variables
  // variables to track the current position of hero
  avatarX = Math.floor(roomList[currFloor][currRoom].roomWidth / 8)
  avatarY = Math.floor(roomList[currFloor][currRoom].roomHeight / 2)

  locFacing = [avatarX + 1, avatarY]
  lastKeyPress = 'w'

  // establish NPCs
  if (inactiveNPCs.length > 0) {
    pitActive = false
  }
  getNPCs()
  for (var i = 0; i < activeNPCs.length; i++) {
    addNPC(activeNPCs[i]['charID'], roomList[0][activeNPCs[i]['roomIdx']].roomMap, activeNPCs[i]['coords'][0], activeNPCs[i]['coords'][1])
    roomList[0][activeNPCs[i]['roomIdx']].roomMap[activeNPCs[i]['coords'][0]][activeNPCs[i]['coords'][1]].computeCoordsWithOffset(roomList[0][activeNPCs[i]['roomIdx']].yoff, roomList[0][activeNPCs[i]['roomIdx']].xoff)
    clearAllFog(roomList[0][1].roomMap)
  }

  // get ready to start...
  roomList[currFloor][currRoom].roomMap[avatarY][avatarX].heroPresent = true // place the hero in his starting position
  roomList[currFloor][currRoom].buildRoomHTML(avatarX, avatarY, torchlight, fogRadius)

  refreshOpenMods()
}
