/*
 * This file holds all functions for world interaction
 * (movement, descent)
 */

function updateLocFacing (keyPress) {
  switch (keyPress) {
    case 'w':
      locFacing = [avatarX, avatarY - 1]
      if (dirFacing !== 'N') {
        dirFacing = 'N'
        $('#compassascii').html(ASCII_COMPASS_N)
      }
      break
    case 's':
      locFacing = [avatarX, avatarY + 1]
      if (dirFacing !== 'S') {
        dirFacing = 'S'
        $('#compassascii').html(ASCII_COMPASS_S)
      }
      break
    case 'a':
      locFacing = [avatarX - 1, avatarY]
      if (dirFacing !== 'W') {
        dirFacing = 'W'
        $('#compassascii').html(ASCII_COMPASS_W)
      }
      break

    case 'd':
      locFacing = [avatarX + 1, avatarY]
      if (dirFacing !== 'E') {
        dirFacing = 'E'
        $('#compassascii').html(ASCII_COMPASS_E)
      }
      break

    default:
      console.log('unknown updateLocFacing')
  }
}

function move (e) {
  if (canMove === true) {
    var didMove = false
    var oldPos = [avatarX, avatarY]
    var room = roomList[currFloor][currRoom]
    var map = room.roomMap
    if (e.keyCode === 87 && avatarY > 0) { // up
      lastKeyPress = 'w'
      if (map[avatarY - 1][avatarX].passable) {
        map[avatarY][avatarX].heroPresent = false
        avatarY--
        map[avatarY][avatarX].heroPresent = true
        didMove = true
      }
    } else if (e.keyCode === 83 && avatarY < room.roomHeight - 1) { // down
      lastKeyPress = 's'
      if (map[avatarY + 1][avatarX].passable) {
        map[avatarY][avatarX].heroPresent = false
        avatarY++
        map[avatarY][avatarX].heroPresent = true
        didMove = true
      }
    } else if (e.keyCode === 65 && avatarX > 0) { // left
      lastKeyPress = 'a'
      if (map[avatarY][avatarX - 1].passable) {
        map[avatarY][avatarX].heroPresent = false
        avatarX--
        map[avatarY][avatarX].heroPresent = true
        didMove = true
      }
    } else if (e.keyCode === 68 && avatarX < room.roomWidth - 1) { // right
      lastKeyPress = 'd'
      if (map[avatarY][avatarX + 1].passable) {
        map[avatarY][avatarX].heroPresent = false
        avatarX++
        map[avatarY][avatarX].heroPresent = true
        didMove = true
      }
    } else if (e.keyCode === 69) {
      // e for interact (#81 issues)
      // do a checkLocation with the locFacing
      checkLocation(locFacing[0], locFacing[1])
    }
    updateLocFacing(lastKeyPress)

    if (didMove) {
      doge.heroMoveUpdateDog(lastKeyPress, avatarX, avatarY, map)
    }

    // Check dist btw dog & hero and activate doginvmd if needed!
    if (roomList[currFloor][currRoom].roomMap[locFacing[1]][locFacing[0]].dogPresent) {
      doginvmd.activateMod()
    } else { doginvmd.deactivateMod() }

    if (didMove) {
      var newPos = [avatarX, avatarY]
      room.updateRoomHTML(oldPos, newPos, torchlight, fogRadius)
    }

    // chance to enter combat
    if (Math.random() < room.fightChance && !room.roomCleared && didMove) {
      enterCombat(room)
    }

    // heal from moving
    if (hero.vitality + 2 <= hero.maxVitality && didMove) {
      hero.vitality += 2
      refreshOpenMods()
    } else if (hero.vitality + 1 <= hero.maxVitality && didMove) {
      hero.vitality += 1
      refreshOpenMods()
    }

    // passable loc interactions happen when stepped on!
    if (didMove) {
      checkLocation(avatarX, avatarY)
    }
  }

  // keypresses outside of canMove
  if (e.keyCode === 84) { // t for torch
    // If dont have a torch
    if (!torchlight && hero.inv.useTorch()) {
      console.log('Activating torch')

      // Show ascii
      $('#torchascii').html(TORCHES[4])
      var torchToShow = 4
      var torchDecay = setInterval(function () {
        torchToShow--
        $('#torchascii').html(TORCHES[torchToShow])
      }, 10000 / 4)

      // Refresh mods
      refreshOpenMods()

      // Rebuild room
      torchlight = true
      var pos = [avatarX, avatarY]
      roomList[currFloor][currRoom].updateRoomHTML(pos, pos, torchlight, fogRadius)

      // Set timeout for torch burnout
      setTimeout(function () {
        torchlight = false
        // if(!roomList[currFloor][currRoom].roomCleared){
        var room = roomList[currFloor][currRoom]
        if (!room.fogFreeRoom) {
          room.addFogWhenTorchBurnsOut(avatarX, avatarY, fogRadius)
          var newPos = [avatarX, avatarY]
          room.updateRoomHTML(newPos, newPos, torchlight, fogRadius)
        }
        $('#torchascii').html(TORCHES[0])
        clearInterval(torchDecay)
        console.log('Your torch fades to nothing.'
        )
      }, 10000)
    }
  }
  if (e.keyCode === 73) { // i for inventory
    invmd.toggleMod()
    doginvmd.hideMod() // there can only be one!
    refreshOpenMods()
  } else if (doginvmd.avail && e.keyCode === 70) { // f for friend (dog)
    doginvmd.toggleMod()
    invmd.hideMod()
    refreshOpenMods()
  } else if (e.keyCode === 77) {
    splmd.toggleMod()
    refreshOpenMods()
  }
  /* if(fogRadius === 1 && fogDeath === -1){
      fogDeath = setInterval(function(){
         if(fogRadius === 1 && hero.vitality > 0){
             Damage({strength: 5}, hero);
         }
         else if(hero.vitality <= 0){
             clearInterval(fogDeath);
             fogDeath = -1;
         }
         else{
             clearInterval(fogDeath);
             fogDeath = -1;
         }
         }, 1000);
    }
    */
}

function checkLocation (avX, avY) {
  // If whatever you try to interact with is interactive, call its interact function
  if (roomList[currFloor][currRoom].roomMap[avY][avX].isInteractive) {
    roomList[currFloor][currRoom].roomMap[avY][avX].heroInteract()
  }
}

function refillChests () {
  // rebuilds floors so that chests can be filled with newly introduced materials
  // used after interaction w certain npcs
  console.log('Old room 1: ')
  console.log(roomList[1][0])
  for (var i = 1; i < roomList.length; i++) {
    roomList[i] = roomList[i][0].originFloor.buildFloor()
  }
  console.log('new room 1: ')
  console.log(roomList[1][0])
}

function refreshOpenMods () {
  // inventory
  if (invmd.open) { invmd.refreshMod() }

  // spell tree:
  if (splmd.open) { splmd.refreshMod() }

  // dog inventory
  if (doginvmd.open) { doginvmd.refreshDogInv() }

  // vendor module
  if (vndmd.open) { vndmd.refreshFunc() }

  // txtmd if showing inv
  if (txtmd.openAndChanging) { txtmd.refreshFunc() }
}
