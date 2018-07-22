class Floor {
  constructor (floorNum, numRooms, tierList, custom) {
    this.floorNum = floorNum
    this.numRooms = numRooms
    this.tierList = tierList
    this.custom = custom
    this.npcRoom = Math.floor(Math.random() * numRooms)
    this.fightRoomTypes = ['MidNorm', 'HorizHallNorm', 'VertHallNorm', 'SmallNorm', 'norm']
    this.safeRoomTypes = ['MidNorm', 'HorizHallNorm', 'VertHallNorm', 'SmallNorm', 'Exit']
    this.buildFloor = function () {
      if (this.custom == null) {
        for (var i = 0; i < this.numRooms; i++) {
          var type
          var maxLocs

          if (Math.random() < 0.75) {
            type = this.fightRoomTypes[Math.floor(Math.random() * this.fightRoomTypes.length)]

            if (type == 'MidNorm' || type == 'HorizHallNorm' || type == 'VertHallNorm') {
              maxLocs = Math.ceil(Math.random() * 2) + 1
            } else if (type == 'SmallNorm') {
              maxLocs = 1
            } else {
              maxLocs = undefined
            }
            roomList[this.floorNum][i] = new FightRoom('', type, this.tierList[Math.floor(Math.random() * this.tierList.length)], this.floorNum, maxLocs, this.npcRoom)
          } else {
            type = this.safeRoomTypes[Math.floor(Math.random() * this.safeRoomTypes.length)]
            if (type == 'MidNorm', 'HorizHallNorm', 'VertHallNorm') {
              maxLocs = Math.ceil(Math.random() * 2) + 1
            } else if (type == 'SmallNorm') {
              maxLocs = 1
            } else {
              maxLocs = undefined
            }
            roomList[this.floorNum][i] = new SafeRoom('', type,
              this.tierList[Math.floor(Math.random() * this.tierList.length)], this.floorNum, maxLocs, this.npcRoom)
          }
          buildDoors(this, roomList, i, numRooms)
          centerMap(roomList[this.floorNum][i].roomMap, roomList[this.floorNum][i].yoff, roomList[this.floorNum][i].xoff)
          roomList[this.floorNum][i].originFloor = this
        }
      } else {
        for (var i = 0; i < this.custom.length; i++) {
          roomList[this.floorNum][i] = this.custom[i]
          buildDoors(this, roomList, i, numRooms)
          centerMap(roomList[this.floorNum][i].roomMap, roomList[this.floorNum][i].yoff, roomList[this.floorNum][i].xoff)
        }
      }

      return roomList[this.floorNum]

      function buildDoors (self, roomList, i, numRooms) {
        if (i < numRooms - 1) {
          var nextRoomDoor = new Door(Math.floor(roomList[self.floorNum][i].roomExit[0]), roomList[self.floorNum][i].roomWidth - 1, i, i + 1)
          if (roomList[self.floorNum][i].constructor.name == 'SafeRoom') {
            nextRoomDoor.fog = false
          }
          roomList[self.floorNum][i].roomMap[nextRoomDoor.rowID][nextRoomDoor.colID] = nextRoomDoor
        }
        if (i > 0) {
          var prevRoomDoor = new Door(roomList[self.floorNum][i].roomEntry[0], 0, i, i - 1)
          if (roomList[self.floorNum][i].constructor.name == 'SafeRoom') {
            prevRoomDoor.fog = false
          }
          roomList[self.floorNum][i].roomMap[prevRoomDoor.rowID][prevRoomDoor.colID] = prevRoomDoor
        }
      }
    }
  }
}
