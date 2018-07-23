/*
 * This file is for any location that causes a change in room.
 * Currently this is limited to:
 *  1. Door
 *  2. Trapdoor
 *  3. Locked Door (not a change, but fits name)
 *  4. Dungeon Entrance
 */

class Door extends Location { // highly experimental content at hand here
  constructor (rowID, colID, roomID, nextRoomID) {
    super(rowID, colID, 'Door', 'door', '□', 'Leave room?', false, true)
    this.roomID = roomID
    this.nextRoomID = nextRoomID
  }

  heroInteract () {
    var self = this
    var nextRoomFunc = function () {
      // remove hero from old room + clear fog
      roomList[currFloor][currRoom].roomMap[avatarY][avatarX].heroPresent = false
      roomList[currFloor][currRoom].clearAllFogTimeouts()
      var oldMap = roomList[currFloor][currRoom].roomMap

      // change currRoom + update hero position coords
      currRoom = self.nextRoomID
      if (avatarX === 1) {
        avatarX = roomList[currFloor][currRoom].roomWidth - 2
        avatarY = roomList[currFloor][currRoom].roomExit[0]
        updateLocFacing(lastKeyPress)
      } else {
        avatarX = 2
        avatarY = roomList[currFloor][currRoom].roomEntry[0]
        updateLocFacing(lastKeyPress)
      }

      // update room to have hero + spawn dog
      roomList[currFloor][currRoom].roomMap[avatarY][avatarX].heroPresent = true
      doge.spawnDog(avatarX, avatarY, oldMap, roomList[currFloor][currRoom])
      roomList[currFloor][currRoom].buildRoomHTML(avatarX, avatarY, torchlight, fogRadius)

      txtmd.revertTxtMd()
    }

    var txtmodmsg = {
      'msgs': [
        ['dec', this.message, 'Leave', 'Stay', nextRoomFunc]
      ]}

    txtmd.parseTxtMdJSON(txtmodmsg)
  }
}

class LockedDoor extends Location {
  constructor (rowID, colID) {
    super(rowID, colID, 'Locked Door', 'lockedDoor', '□', "It appears to be the way out of here, but it's locked. If only you had a key...", false, true)
  }

  heroInteract () {
    txtmd.parseTxtMdJSON({ 'msgs': [ ['fin', this.message] ] })
  }
}

class Trapdoor extends Location {
  constructor (rowID, colID) {
    super(rowID, colID, 'Trapdoor', 'trapdoor', 'ø', 'A gaping black hole stares at you from the floor of the dungeon... you wonder what is on the other side', false, true)

    this.keeperSpawned = false
  }

  heroInteract () {
    var descendFunc = function () {
      // TODO: shouldnt have to check this... just dont build trapdoors on last floornew map!
      if (currFloor < numFloors - 1) {
        if (currFloor > 0) {
          for (let i = 0; i < roomList[currFloor][currRoom].enemyList.length; i++) { // scale recurring enemies
            // make enemies stronger and revive them
            roomList[currFloor][currRoom].enemyList[i].maxVitality += 5
            roomList[currFloor][currRoom].enemyList[i].vitality = roomList[currFloor][currRoom].enemyList[i].maxVitality
            roomList[currFloor][currRoom].enemyList[i].strength += 1
          }
        }

        // clear fog
        roomList[currFloor][currRoom].clearAllFogTimeouts()

        // remove hero
        var oldmap = roomList[currFloor][currRoom].roomMap
        oldmap[avatarY][avatarX].heroPresent = false

        // spawn hero next floor
        currFloor++
        currRoom = 0
        avatarY = roomList[currFloor][currRoom].roomEntry[0]
        avatarX = roomList[currFloor][currRoom].roomEntry[1]
        updateLocFacing(lastKeyPress)
        roomList[currFloor][currRoom].roomMap[avatarY][avatarX].heroPresent = true

        // build room then spawn dog
        roomList[currFloor][currRoom].buildRoomHTML(avatarX, avatarY, torchlight, fogRadius)
        doge.spawnDog(avatarX, avatarY, oldmap, roomList[currFloor][currRoom])

        // refresh shield upon descent
        heroShield.vitality = heroShield.maxVitality
        refreshOpenMods()

        // revert textmod
        txtmd.revertTxtMd()
      }
    }

    var self = this
    var gatekeepWarning = function () {
      txtmd.revertTxtMd()
      canMove = false
      self.symbol = 'C'
      self.keeperSpawned = true
      self.refreshInnerHTML()
      $(self.htmlID).fadeOut(1).fadeIn(3000, function () {
        txtmd.startDialog('gatekeeper', 'Floor' + currFloor, 'gatekeeper', function () {
          txtmd.parseTxtMdJSON({ 'speaker': 'gatekeeper',
            'msgs': [['dec', 'Are you sure you want to descend? If you do, remember, mind the fog!',
              'Descend', 'Stay', descendFunc]] })
        }
        )
      })
    }

    if (!this.keeperSpawned) {
      txtmd.parseTxtMdJSON({ 'msgs': [ ['dec', this.message, 'Descend', 'Stay', gatekeepWarning] ] })
    } else {
      txtmd.parseTxtMdJSON({'speaker': 'gatekeeper',
        'msgs': [['dec', 'Are you sure you want to descend? If you do, remember, mind the fog!', 'Descend', 'Stay', descendFunc]] })
    }
  }
}

class DungeonEntrance extends Trapdoor {
  constructor (rowID, colID) {
    super(rowID, colID)

    // These are the properties diff from Trapdoor
    this.name = 'Dungeon Entrance'
    this.objid = 'Entrance'
    this.symbol = 'D'
    this.message = 'The entrance to the dungeon stands, forboding and dark.'
    this.passable = false
  }
}
