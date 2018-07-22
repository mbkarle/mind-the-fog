class Dog {
  constructor (dogX, dogY) {
    this.name = 'dog' // name of the Location
    this.message = 'what a puppaluppagus' // message displayed on print()
    this.objid = 'dog' // object id
    this.symbol = 'd' // symbol to display on map
    this.dogX = dogX // row index in worldMap
    this.dogY = dogY // col index in worldMap

    this.following = false
    this.dogRadius = -1 // should be set each time fog changes to fogRadius
    this.pathToHero = []
    this.moveInterval = -1

    // Trainable characteristics!
    this.dogSpeed = 100
    this.goldCarryFrac = 0.1 // used on hero death

    // The Dog Inventory
    this.inv = new Inventory([], 1) // start size one.
  }

  // A function all special Locations have upon a hero interacting
  heroInteract (tile) {
    this.following = !this.following
    console.log('following = ' + this.following)

    tile.passable = !tile.passable
  }

  computePathToHero (avX, avY, map) {
    // Takes in the hero's pos and updates the pathToHero variable to be
    // an array of locations needed to travel to reach the hero.

    // compute the html tags of start and end locations
    var startLoc = String(this.dogY) + 'x' + String(this.dogX)
    var endLoc = String(avY) + 'x' + String(avX)

    // set the pathToHero to be the path from helper a* search
    this.pathToHero = aStarSearch(startLoc, endLoc, map)
  }

  spawnDog (avX, avY, oldmap, room) {
    // Called upon entering any room, spawn dog in new room
    if (this.following) {
      var newmap = room.roomMap
      // Upon changing a room / descending, the dog should:
      // 1) spawn on the character
      // 2) move one to the left/right, etc
      // 3) all move intervals should be reset...

      this.pathToHero = [] // reset any old paths
      this.clearMoveInterval()

      // Remove the dog from the old map...
      oldmap[this.dogY][this.dogX].dogPresent = false
      oldmap[this.dogY][this.dogX].refreshInnerHTML()

      // Spawn the dog in the new map
      this.dogX = avX
      this.dogY = avY
      newmap[this.dogY][this.dogX].dogPresent = true

      // just find any position available thats not the hero's loc then move the dog!
      var newloc = this.getAvailDogLoc('w', avX, avY, newmap)
      this.moveDogRestoreMap(newloc, newmap)
    }
  }

  moveDogRestoreMap (newloc, map) {
    // Internal function to move dog between two locs on map

    // Remove the dog from its current tile and refresh its html
    map[this.dogY][this.dogX].dogPresent = false
    map[this.dogY][this.dogX].refreshInnerHTML()

    // Move the dog to the new loc
    this.dogX = newloc[0]
    this.dogY = newloc[1]
    map[this.dogY][this.dogX].dogPresent = true
    map[this.dogY][this.dogX].refreshInnerHTML()
  }

  moveAlongPath (map) {
    // internal function to move the dog one towards hero

    if (this.pathToHero.length > 0) {
      // The new location to move to is the first on pathToHero
      var newloc = this.pathToHero.shift()
      this.moveDogRestoreMap(newloc, map)
    } else {
      this.clearMoveInterval()
    }
  }

  heroMoveUpdateDog (heroMoveDir, avX, avY, map) {
    // external function called on every hero move

    // only update dog pos if certain dist away + following
    if (this.manhatDistFromHero(avX, avY) >= 3 && this.following) {
      // You moved: recompute pathToHero
      this.computePathToHero(avX, avY, map)

      // Now, if you arent in motion already, start hoppin along
      // that path!
      if (this.moveInterval === -1) {
        var self = this // needed to preserve variable on interval
        this.moveInterval = setInterval(function () {
          self.moveAlongPath(map)
        }, this.dogSpeed)
      }
    }

    // if hero collided with dog, get out tha way!
    if (this.dogX === avX && this.dogY === avY && map[avY][avX].dogPresent) {
      var newloc = this.getAvailDogLoc(heroMoveDir, avX, avY, map)
      this.moveDogRestoreMap(newloc, map)
      this.clearMoveInterval()
      map[avY][avX].heroPresent = true
      this.heroPresent = false
    }
  }

  clearMoveInterval () {
    // internal function to clear move interval
    clearInterval(this.moveInterval)
    this.moveInterval = -1
  }

  getAvailDogLoc (heroMoveDir, x, y, map) {
    // internal function for getting available dog location
    // upon hero collision based on hero's direction
    var possLocs
    switch (heroMoveDir) {
      case 'w':
        possLocs = [[x + 1, y], [x - 1, y], [x, y - 1]]
        break
      case 's':
        possLocs = [[x + 1, y], [x - 1, y], [x, y + 1]]
        break
      case 'a':
        possLocs = [[x, y - 1], [x - 1, y], [x, y + 1]]
        break
      case 'd':
        possLocs = [[x, y - 1], [x + 1, y], [x, y + 1]]
        break

      default:
        console.log('unknown heroMoveDir, Dog location getAvailDogLoc')
    }

    var locToReturn
    for (var i = 0; i < possLocs.length; i++) {
      locToReturn = possLocs[i]
      if (map[locToReturn[1]][locToReturn[0]].objid === 'tile') {
        return locToReturn
      }
    }
  }

  manhatDistFromHero (avX, avY) {
    // internal function for manhattan distance to hero
    return Math.abs(avY - this.dogY) + Math.abs(avX - this.dogX)
  }
}

// Citation: I based this code off of the wikipedia psuedo code
function aStarSearch (startLoc, endLoc, map) {
  // startLoc should be the htmlID of the start loc
  // endLoc should be the htmlID of the end loc

  // Set of seen locations
  var closedSet = new Set()

  // Set to explore
  var openSet = new Set([startLoc])

  // A mapping from location -> location visited from
  var cameFrom = {}

  // Distance from the start per location
  var gScore = {}
  gScore[startLoc] = 0

  // F score = g score + heuristic
  var fScore = {}
  fScore[startLoc] = heuristicDistance(startLoc, endLoc)

  // While theres still locations to visit (and you haven't found the target)
  while (openSet.size > 0) {
    // Find all f scores of the openSet
    var openFScores = {}
    openSet.forEach(function (a) { openFScores[a] = fScore[a] })

    // find the minimum open f score and explore that location
    var current = Object.keys(openFScores).reduce(function (a, b) { return openFScores[a] < openFScores[b] ? a : b })

    // Find all the neighbors of the loc we are exploring
    var neighs = getValidNeighsFromHtmlID(current, map)

    // If its the end, return
    if (current == endLoc) {
      return reconstructPath(cameFrom, current)
    }

    // Else delete it, add to close set
    var delSucc = openSet.delete(current)
    if (!delSucc) {
      console.log(current)
      console.log(openSet)
      return []
    }
    // console.log(delSucc)
    closedSet.add(current)

    // For each neighbor
    for (var i = 0; i < neighs.length; i++) {
      var neigh = neighs[i]
      if (closedSet.has(neigh)) { // don't add to openSet if already explored
        continue
      }
      if (!openSet.has(neigh)) {
        openSet.add(neigh)
      }

      // We found it from current, so the tentative g score is current + 1,
      // Compare this to whats currently stored (if anything) for this neigh.
      // If this is a better path to neigh then update cameFrom, gScore, and fScore
      var tentativeGscore = gScore[current] + 1
      if (tentativeGscore >= gScore[neigh]) {
        continue
      }

      // Appropriate updates...
      cameFrom[neigh] = current
      gScore[neigh] = tentativeGscore
      fScore[neigh] = gScore[neigh] + heuristicDistance(neigh, endLoc)
    }
  }

  // If we make it to this point then we did not find a path, return empty
  return []

  // Helper function to return the path by recursing through cameFrom
  function reconstructPath (cameFrom, current) {
    var totalPath = []
    while (current in cameFrom) {
      current = cameFrom[current]
      totalPath.push(current)
    }
    totalPath = totalPath.map(function (a) {
      var splt = a.split('x')
      var x = splt[1]
      var y = splt[0]
      return [parseInt(x), parseInt(y)]
    })
    totalPath = totalPath.splice(1)
    return totalPath.reverse()
  }
}

function getValidNeighsFromHtmlID (current, map) {
  // Helper function to get the tile neighbors of a current location.

  // Parse the current htmlID:
  var strsplit = current.split('x')
  var rowID = parseInt(strsplit[0])
  var colID = parseInt(strsplit[1])

  // Get the dimensions of the room:
  var height = map.length
  var width = map[0].length

  neigh = []
  // Neighbors are all htmlID's of adjacent positions that are tiles...
  if (rowID > 0) {
    if (map[rowID - 1][colID].objid === 'tile') { neigh.push(String(rowID - 1) + 'x' + String(colID)) }
  }
  if (colID > 0) {
    if (map[rowID][colID - 1].objid === 'tile') { neigh.push(String(rowID) + 'x' + String(colID - 1)) }
  }
  if (rowID < height - 1) {
    if (map[rowID + 1][colID].objid === 'tile') { neigh.push(String(rowID + 1) + 'x' + String(colID)) }
  }
  if (colID < width - 1) {
    if (map[rowID][colID + 1].objid === 'tile') { neigh.push(String(rowID) + 'x' + String(colID + 1)) }
  }

  // Diagonals
  if (rowID > 0 && colID > 0) {
    if (map[rowID - 1][colID - 1].objid === 'tile') { neigh.push(String(rowID - 1) + 'x' + String(colID - 1)) }
  }
  if (colID > 0 && rowID < height - 1) {
    if (map[rowID + 1][colID - 1].objid === 'tile') { neigh.push(String(rowID + 1) + 'x' + String(colID - 1)) }
  }
  if (rowID < height - 1 && colID < width - 1) {
    if (map[rowID + 1][colID + 1].objid === 'tile') { neigh.push(String(rowID + 1) + 'x' + String(colID + 1)) }
  }
  if (colID < width - 1 && rowID > 0) {
    if (map[rowID - 1][colID + 1].objid === 'tile') { neigh.push(String(rowID - 1) + 'x' + String(colID + 1)) }
  }

  return neigh
}

function heuristicDistance (start, end) {
  // both start and end are htmlID's

  // Parse the start htmlID into row/col:
  var splitStart = start.split('x')
  var startRow = splitStart[0]
  var startCol = splitStart[1]

  // Parse the end htmlID into row/col
  var splitEnd = end.split('x')
  var endRow = splitEnd[0]
  var endCol = splitEnd[1]

  // compute and return the manhattan distance between
  // the start and the end locations.
  return Math.abs(startRow - endRow) + Math.abs(startCol - endCol)
}
