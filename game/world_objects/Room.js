// This is the class for a room, designed to fix #35 and #31.
/* A room should have:
* A list of enemies associated (enemies that could be encountered)
* The number of enemy encounters before the boss
* The special locations for the room
* The boss, if applicable
*/
class Room {
  constructor (name, roomType, tier, floor, roomCleared, boss, fightChance, maxLocs, npcRoom) {
    this.name = name
    this.maxLocs = maxLocs
    if (typeof this.maxLocs === 'undefined') {
      this.locations = tierToLocations(tier)
    } else {
      this.locations = tierToLocations(tier, this.maxLocs)
    }
    this.itemList = tierToItems(tier)
    this.npcRoom = npcRoom
    this.roomType = roomType
    this.roomCleared = roomCleared
    this.enemyList = tierToEnemies(tier)
    this.numEnemies = tierToNumEnemies(tier)
    this.xp = tierToXp(tier)
    this.boss = boss
    this.fightChance = fightChance
    this.floor = floor
    this.tier = tier
    this.darkness = tierToDarkness(tier)
    this.fogFreeRoom = (tier === 0)

    this.roomMap = this.buildRoom(roomType, this.locations, this.itemList, this.tier, floor, npcRoom)
    this.roomWidth = this.roomMap[0].length
    this.roomHeight = this.roomMap.length
    this.roomEntry = [Math.floor(this.roomHeight / (1 + Math.ceil(Math.random() * 7))), Math.floor(this.roomWidth / (1 + Math.ceil(Math.random() * 7)))]
    this.roomExit = [Math.floor(this.roomHeight / (1 + Math.ceil(Math.random() * 7))), this.roomWidth - 1]
    this.yoff = Math.floor((30 - this.roomHeight) / 2)
    this.xoff = Math.floor((40 - this.roomWidth) / 2)

    centerMap(this.roomMap, this.yoff, this.xoff)
  }

  howManyHeroPresents () {
    // This is a function that should NEVER be called, but is useful for debugging
    var map = this.roomMap
    var count = 0
    for (var i = 0; i < this.roomHeight; i++) {
      for (var j = 0; j < this.roomWidth; j++) {
        if (map[i][j].heroPresent) {
          count++
        }
      }
    }
    console.log(count)
  }

  buildRoom (type, locations, itemList, tier, floor, npcRoom) {
    var map
    var width
    var height
    switch (type) {
      case 'exitRoom':
        width = 20
        height = 15

        map = buildRoomOfSize(height, width)

        var exitDoor = new LockedDoor(7, 0)
        map[exitDoor.rowID][exitDoor.colID] = exitDoor
        clearAllFog(map)
        break

      case 'tutRoom':
        width = 30
        height = 20

        map = buildRoomOfSize(height, width)

        var tutorialDialogue = new CharDialogue(3, 5, 'instructor', 'instructor', 'GreatHall')
        map[tutorialDialogue.rowID][tutorialDialogue.colID] = tutorialDialogue

        clearAllFog(map)
        break

      case 'MidNorm':
        width = 30
        height = 30
        map = makeNormalRoom(height, width, map, locations, itemList, tier, floor, npcRoom)
        break

      case 'HorizHallNorm':
        width = 30
        height = 10
        map = makeNormalRoom(height, width, map, locations, itemList, tier, floor, npcRoom)
        break

      case 'VertHallNorm':
        width = 10
        height = 30
        map = makeNormalRoom(height, width, map, locations, itemList, tier, floor, npcRoom)
        break

      case 'SmallNorm':
        width = 20
        height = 20
        map = makeNormalRoom(height, width, map, locations, itemList, tier, floor, npcRoom)
        break

      case 'Exit':
        width = 20
        height = 20
        map = buildRoomOfSize(height, width)
        var exit = new Trapdoor(5, 5)
        map[exit.rowID][exit.colID] = exit
        // clearAllFog(map);
        break

      case 'GreatHall':
        width = 40
        height = 12

        map = buildRoomOfSize(height, width)

        var entrance = new DungeonEntrance(6, 35)
        map[entrance.rowID][entrance.colID] = entrance

        var gateKeeper = new CharDialogue(9, 30, 'gatekeeper', 'the gatekeeper', 'DungeonEntrance')
        map[gateKeeper.rowID][gateKeeper.colID] = gateKeeper

        map[doge.dogY][doge.dogX].dogPresent = true
        map[doge.dogY][doge.dogX].passable = false

        // after creating all special locations, turn fog off!
        clearAllFog(map)
        break

      default:
        width = 40
        height = 30
        map = makeNormalRoom(height, width, map, locations, itemList, tier, floor, npcRoom)
                // end switch on room type
    }
    return map
  }

  clearAllFogTimeouts () {
    for (var i = 0; i < this.roomMap.length; i++) {
      for (var j = 0; j < this.roomMap[0].length; j++) {
        clearInterval(this.roomMap[i][j].fogTimeout)
      }
    }
  }

  buildRoomHTML (avatarX, avatarY, torchlight, fogRad) {
    var worldContents = ''

    // add fog to whole map (in case room has been seen before)
    if (!this.fogFreeRoom) {
      for (var i = 0; i < this.roomMap.length; i++) {
        for (var j = 0; j < this.roomMap[0].length; j++) {
          this.roomMap[i][j].fog = true
        }
      }
    }

    var heroSight = fogRad
    if (this.roomCleared) {
      heroSight = this.darkness
    }

    // Remove the fog around the hero
    var neigh = this.getNeighborLocations([avatarX, avatarY], torchlight, heroSight)
    for (var i = 0; i < neigh.length; i++) {
      neigh[i].fog = false
    }

    // Build the worldContents HTML string
    for (var i = 0; i < this.roomMap.length; i++) {
      for (var j = 0; j < this.roomMap[0].length; j++) {
        var symbol = this.roomMap[i][j].getSymbol() // accounts for fog, dog, hero
        worldContents += "<div id='" + this.roomMap[i][j].htmlID.substring(1) + "' style='top:" + this.roomMap[i][j].yCoord + 'px; left:' + this.roomMap[i][j].xCoord + "px; position: absolute;'>" + symbol + '</div>'
      }
    }
    $('#worldContent').html(worldContents)
  }

  addFogWhenTorchBurnsOut (avX, avY, fogRad) {
    // Since the addition of "addFogBackAfterTimeout", all we need to do here
    // is find the coords that used to be in the radius of the torch and add
    // their fog back after a timeout!
    if (!this.fogFreeRoom) {
      var heroSight = fogRad
      if (this.roomCleared) {
        heroSight = this.darkness
      }
      var torchCoords = this.getValidCoords(avX, avY, true, heroSight)
      var noTorchCoords = this.getValidCoords(avX, avY, false, heroSight)

      var coordsToUpdate = []
      var haystack = JSON.stringify(noTorchCoords)
      for (var i = 0; i < torchCoords.length; i++) {
        var coord = torchCoords[i]
        if (haystack.indexOf(JSON.stringify(coord)) === -1) {
          coordsToUpdate.push(coord)
        }
      }

      for (var i = 0; i < coordsToUpdate.length; i++) {
        var cx = coordsToUpdate[i][0]
        var cy = coordsToUpdate[i][1]
        this.roomMap[cy][cx].addFogBackAfterTimeout(this.tier)
      }
    }
  }

  addFogWhenFogRadiusChanges (avX, avY, torchlight, oldRad, newRad) {
    var oldRadCoords = this.getValidCoords(avX, avY, torchlight, oldRad)
    var newRadCoords = this.getValidCoords(avX, avY, torchlight, newRad)

    var coordsToUpdate = []
    var haystack = JSON.stringify(newRadCoords)
    for (var i = 0; i < oldRadCoords.length; i++) {
      var coord = oldRadCoords[i]
      if (haystack.indexOf(JSON.stringify(coord)) === -1) {
        coordsToUpdate.push(coord)
      }
    }

    for (var i = 0; i < coordsToUpdate.length; i++) {
      var cx = coordsToUpdate[i][0]
      var cy = coordsToUpdate[i][1]
      this.roomMap[cy][cx].addFogBackAfterTimeout(this.tier)
    }
  }

  updateRoomHTML (oldPos, newPos, torchlight, fogRad) { // in [x,y] format
    // If youre in a special room that has no fog (GreatHall), you REALLY only need
    // to update the character position (no fog updates necessary!)
    if (this.fogFreeRoom) {
      var oldX = oldPos[0] // checkme
      var oldY = oldPos[1]
      $(this.roomMap[oldY][oldX].htmlID).html(this.roomMap[oldY][oldX].symbol)

      var newX = newPos[0]
      var newY = newPos[1]
      $(this.roomMap[newY][newX].htmlID).html('x')
    } else { // Else, theres fog work to be done
      // heroVisibleLocs need their fog timeouts cleared.
      var heroSight = fogRad
      if (this.roomCleared) {
        heroSight = this.darkness
      }
      var heroVisibleLocs = this.getNeighborLocations(newPos, torchlight, heroSight)
      for (var i = 0; i < heroVisibleLocs.length; i++) {
        heroVisibleLocs[i].removeFogBecauseHeroPresent()
      }

      // outOfDateCoords are coords no longer visible to the player that need
      // their fog regenerated.
      var outOfDateCoords = this.getOutOfDateCoords(oldPos, newPos, torchlight, heroSight)
      for (var i = 0; i < outOfDateCoords.length; i++) {
        var cx = outOfDateCoords[i][0]
        var cy = outOfDateCoords[i][1]
        this.roomMap[cy][cx].addFogBackAfterTimeout(this.tier)
      }
    }
  }

  // Returns the actual Location objects of the visible places around a position
  getNeighborLocations (position, torchlight, fogRad) {
    var neigh = []
    var validCoords = this.getValidCoords(position[0], position[1], torchlight, fogRad)
    for (var i = 0; i < validCoords.length; i++) {
      var cx = validCoords[i][0]
      var cy = validCoords[i][1]
      neigh.push(this.roomMap[cy][cx])
    }
    return neigh
  }

  getOutOfDateCoords (oldPos, newPos, torchlight, fogRad) {
    // The reason to call this is to decide which parts of the html to update.
    // In this case, we care about the new position, the old position, and the difference
    // between them.

    // NOTE: Prior to 900abac, this function was smarter about the coords that needed updating.
    // In fact, it returned a list of all "out of date" coords (which need fog added bc they
    // are no longer visible) as well as the coords that needed their position updated.
    //
    // The idea was that in a SafeRoom, you really only need to update the Location of the character.
    // Now this function should be called just for out of date coords, as all coords in view
    // of the hero need their fog timeout cleared.
    var map = this.roomMap

    // If you are on a higher tier which fog regenerates:
    // Now, we need to find all oldCoords that were NOT in newCoords,
    // because these are no longer visible to the player...
    var validCoordsNewPos = this.getValidCoords(newPos[0], newPos[1], torchlight, fogRad)
    var validCoordsOldPos = this.getValidCoords(oldPos[0], oldPos[1], torchlight, fogRad)

    var outOfDateCoords = []

    var haystack = JSON.stringify(validCoordsNewPos)
    for (var i = 0; i < validCoordsOldPos.length; i++) {
      var coord = validCoordsOldPos[i]
      if (haystack.indexOf(JSON.stringify(coord)) === -1) {
        outOfDateCoords.push(coord)
      }
    }

    return outOfDateCoords
  }

  getValidCoords (avX, avY, torchlight, fogRad) {
    // getValidCoords is a function which will return all visible coordinates
    // IN [X,Y] ORDERING around a [x,y] position.
    var possCoords = []
    if (torchlight) {
      fogRad += 3
    }

    for (var y = avY - fogRad; y <= avY + fogRad; y++) {
      for (var x = avX - fogRad; x <= avX + fogRad; x++) {
        var distFromHero = Math.sqrt((x - avX) ** 2 + (y - avY) ** 2)
        if (distFromHero < fogRad) {
          possCoords.push([x, y])
        }
      }
    }

    var realCoords = []
    for (var i = 0; i < possCoords.length; i++) {
      if (this.isValidCoord(possCoords[i][0], possCoords[i][1])) {
        realCoords.push(possCoords[i])
      }
    }
    return realCoords
  }

  isValidCoord (avX, avY) {
    // Simple function to tell if a coord is a valid coord. Used with the getValidCoords function
    return (avX >= 0 && avY >= 0 && avX < this.roomWidth && avY < this.roomHeight)
  }
}

function makeNormalRoom (height, width, map, locations, itemList, tier, floor, npcRoom) {
  map = buildRoomOfSize(height, width)

  if (roomList[floor].length === npcRoom && floor % 2 === 1) {
    locations.push('pit')
  }

  var locs = rollLocations(locations.length, height, width) // locs of locations

  for (var i = 0; i < locations.length; i++) {
    switch (locations[i]) {
      case 'chest':
        map[locs[i][0]][locs[i][1]] = new Chest(locs[i][0], locs[i][1], itemList)
        break

      case 'trapdoor':
        map[locs[i][0]][locs[i][1]] = new Trapdoor(locs[i][0], locs[i][1])
        break
      case 'statue':
        map[locs[i][0]][locs[i][1]] = new Statue(locs[i][0], locs[i][1])
        break
      case 'fountain':
        map[locs[i][0]][locs[i][1]] = new Fountain(locs[i][0], locs[i][1])
        break

      case 'altar':
        map[locs[i][0]][locs[i][1]] = new Altar(locs[i][0], locs[i][1])
        break

      case 'cave':
        map[locs[i][0]][locs[i][1]] = new Cave(locs[i][0], locs[i][1])
        break

      case 'merchant':
        map[locs[i][0]][locs[i][1]] = new Merchant(locs[i][0], locs[i][1], itemList)
        break

      case 'pit':
        var thisNPC
        var npcDiscoverable = true
        if (floor === 1 && !NPCS['shieldMaker']['active']) {
          thisNPC = NPCS['shieldMaker']
        } else if (floor === 3 && !NPCS['alchemist']['active']) {
          thisNPC = NPCS['alchemist']
        }
        // floor 5 dog trainer
        // floor 7 rare item blacksmith
        // chance encounter npc "Winston"
        else {
          locations.splice(locations.length - 1, 1)
          npcDiscoverable = false
        }
        if (npcDiscoverable) {
          map[locs[i][0]][locs[i][1]] = new Pit(locs[i][0], locs[i][1], thisNPC['charID'], thisNPC['charDisplay'])
        }
        break

      default:
        openAlert('UNKNOWN LOCATION TYPE!')
    }
  }
  return map
}

class SafeRoom extends Room {
  constructor (name, roomType, tier, floor, maxLocs, npcRoom) {
    super(name, roomType, tier, floor, true, null, 0, maxLocs, npcRoom)
  }
}

class FightRoom extends Room {
  constructor (name, roomType, tier, floor, maxLocs, npcRoom) {
    super(name, roomType, tier, floor, false, tierToBoss(tier), tierToFightChance(tier), maxLocs, npcRoom)
  }
}

function clearAllFog (roomMap) {
  for (var i = 0; i < roomMap.length; i++) {
    for (var j = 0; j < roomMap[0].length; j++) {
      roomMap[i][j].fog = false
    }
  }
}

function buildRoomOfSize (height, width) {
  var map = new Array(height)

  for (var i = 0; i < height; i++) {
    map[i] = new Array(width)
    for (var j = 0; j < width; j++) {
      // populate it with Tile locations
      // boundaries should be walls... aesthetic thing
      if (i === 0 || j === 0 || i === height - 1 || j === width - 1) {
        map[i][j] = new Wall(i, j)
      } else {
        map[i][j] = new Tile(i, j)
      }
    }
  }
  return map
}

function rollLocations (numLocs, height, width) {
  // Generate possible height / widths
  var hPoss = Array.from({length: height - 4}, (x, i) => i + 2)
  var wPoss = Array.from({length: width - 4}, (x, i) => i + 2)

  var locs = [] // array of [y,x] coords
  for (var n = 0; n < numLocs; n++) {
    // Pick random x & y from poss (w/out replacement)
    var x = wPoss.splice(Math.random() * wPoss.length, 1)
    var y = hPoss.splice(Math.random() * hPoss.length, 1)

    // Push to locs
    locs.push([y[0], x[0]])
  }

  return locs
}

function tierToNumEnemies (tier) {
  // TODO: create mapping
  return 3 + 2 * tier
}

// copy me down
function tierToItems (tier) {
  if (tier === 1) {
    return itemList1
  } else if (tier === 2) {
    return itemList2
  } else if (tier === 3) {
    return itemList3
  } else if (tier === 4) {
    return itemList4
  }
}
function tierToXp (tier) {
  return 75 + tier * 25
}
function tierToXp (tier) {
  return 75 + tier * 25
}

function tierToEnemies (tier) {
  // TODO: randomize using larger lists and numEnemies
  var enemies = []
  if (tier === 1) {
    enemies = [Troglodyte, DireRat, DireRat2, Sorcerer, Ogre, Cultist, Bandit, DarkSquire]
  } else if (tier === 2) {
    enemies = [Sorcerer, DireRat2, Ogre, Vagrant, HellHound, Werewolf, slime, ferBeast, pillager]
  } else if (tier === 3) {
    enemies = [pillager, frostGiant, smallWyrm, DisOfMoranos, DarkKnight, CrimsonRider]
  } else if (tier === 4) {
    enemies = [AncientWyrm, Moranos, Reaper, DreadPirate, DarkLord, smallWyrm, CrimsonRider]
  } else {
    enemies = [Troglodyte, DireRat, DireRat2, Sorcerer, Ogre, Vagrant, HellHound, Werewolf, slime, frostGiant, ferBeast, smallWyrm, pillager]
  }

  return enemies
}

function tierToLocations (tier, maxLocs) {
  // TODO: more locations!!! this code sets the framework for full randomization but it's meaningless with such small possAddedLocs lists
  var possAddedLocs
  var addedLocs = []
  if (typeof maxLocs === 'undefined') {
    var locationList = ['chest', 'trapdoor', 'chest']
  } else if (maxLocs === 1) {
    var locationList = ['trapdoor']
  } else if (maxLocs === 2 || maxLocs === 3) {
    var locationList = ['chest']
  }

  if (tier === 1) {
    possAddedLocs = ['chest', 'statue', 'fountain', 'merchant', 'trapdoor' ]
  } else if (tier === 2) {
    possAddedLocs = ['chest', 'cave', 'fountain', 'altar', 'merchant', 'trapdoor']
  } else if (tier === 3) {
    possAddedLocs = ['chest', 'cave', 'altar', 'merchant', 'trapdoor']
  } else {
    possAddedLocs = ['chest', 'cave', 'altar', 'merchant', 'trapdoor']
  }
  // if(Math.random() < .2 - activeNPCs.length/50 && !pitActive){
  //     possAddedLocs.push('pit');
  // }
  if (typeof maxLocs === 'undefined') {
    var numAddedLocs = Math.ceil(Math.random() * 3)
  } else {
    var numAddedLocs = Math.ceil(Math.random() * maxLocs)
  }
  if (tier > 0) {
    for (var i = 0; i < numAddedLocs; i++) {
      locToAdd = Math.floor(Math.random() * possAddedLocs.length)
      addedLocs.push(possAddedLocs[locToAdd])
      // if(possAddedLocs[locToAdd] === 'pit'){
      //   pitActive = true;
      //   console.log("pit is present");
      // }
      for (var j = 0; j < i; j++) { // no repeats in addedLocs !
        if (addedLocs[i] === addedLocs[j]) {
          addedLocs.splice(i, 1)
          i--
        }
      }
    }
    //    if(addedLocs.length === numAddedLocs){
    for (var n = 0; n < addedLocs.length; n++) {
      locationList.push(addedLocs[n])
    }
    // return locationList;
  }
  //  }
  return locationList
}

function tierToFightChance (tier) {
  return 0.02 + tier / 100
}

function tierToBoss (tier) {
  // TODO: create mapping
  return HellHound
}

function centerMap (map, yoff, xoff) {
  for (var i = 0; i < map.length; i++) {
    for (var j = 0; j < map[0].length; j++) {
      map[i][j].computeCoordsWithOffset(yoff, xoff)
    }
  }
}

function tierToDarkness (tier) {
  return Math.floor(8 - (1.5 * tier))
}
