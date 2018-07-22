class Dog {
  constructor (dogX, dogY) {
    this.name = 'dog' // name of the Location
    this.message = 'what a puppaluppagus' // message displayed on print()
    this.objid = 'dog' // object id
    this.symbol = 'd' // symbol to display on map
    this.dogX = dogX // row index in world_map
    this.dogY = dogY // col index in world_map

    this.following = false
    this.dog_radius = -1 // should be set each time fog changes to fog_radius
    this.path_to_hero = []
    this.move_interval = -1

    // Trainable characteristics!
    this.dog_speed = 100
    this.goldCarryFrac = 0.1 // used on hero death

    // The Dog Inventory
    this.inv = new Inventory([], 1) // start size one.
  }

  // A function all special Locations have upon a hero interacting
  hero_interact (tile) {
    this.following = !this.following
    console.log('following = ' + this.following)

    tile.passable = !tile.passable
  }

  compute_path_to_hero (avX, avY, map) {
    // Takes in the hero's pos and updates the path_to_hero variable to be
    // an array of locations needed to travel to reach the hero.

    // compute the html tags of start and end locations
    var start_loc = String(this.dogY) + 'x' + String(this.dogX)
    var end_loc = String(avY) + 'x' + String(avX)

    // set the path_to_hero to be the path from helper a* search
    this.path_to_hero = a_star_search(start_loc, end_loc, map)
  }

  spawn_dog (avX, avY, oldmap, room) {
    // Called upon entering any room, spawn dog in new room
    if (this.following) {
      var newmap = room.room_map
      // Upon changing a room / descending, the dog should:
      // 1) spawn on the character
      // 2) move one to the left/right, etc
      // 3) all move intervals should be reset...

      this.path_to_hero = [] // reset any old paths
      this.clearMoveInterval()

      // Remove the dog from the old map...
      oldmap[this.dogY][this.dogX].dog_present = false
      oldmap[this.dogY][this.dogX].refreshInnerHTML()

      // Spawn the dog in the new map
      this.dogX = avX
      this.dogY = avY
      newmap[this.dogY][this.dogX].dog_present = true

      // just find any position available thats not the hero's loc then move the dog!
      var newloc = this.get_avail_dog_loc('w', avX, avY, newmap)
      this.move_dog_restore_map(newloc, newmap)
    }
  }

  move_dog_restore_map (newloc, map) {
    // Internal function to move dog between two locs on map

    // Remove the dog from its current tile and refresh its html
    map[this.dogY][this.dogX].dog_present = false
    map[this.dogY][this.dogX].refreshInnerHTML()

    // Move the dog to the new loc
    this.dogX = newloc[0]
    this.dogY = newloc[1]
    map[this.dogY][this.dogX].dog_present = true
    map[this.dogY][this.dogX].refreshInnerHTML()
  }

  move_along_path (map) {
    // internal function to move the dog one towards hero

    if (this.path_to_hero.length > 0) {
      // The new location to move to is the first on path_to_hero
      var newloc = this.path_to_hero.shift()
      this.move_dog_restore_map(newloc, map)
    } else {
      this.clearMoveInterval()
    }
  }

  hero_move_update_dog (hero_move_dir, avX, avY, map) {
    // external function called on every hero move

    // only update dog pos if certain dist away + following
    if (this.manhat_dist_from_hero(avX, avY) >= 3 && this.following) {
      // You moved: recompute path_to_hero
      this.compute_path_to_hero(avX, avY, map)

      // Now, if you arent in motion already, start hoppin along
      // that path!
      if (this.move_interval === -1) {
        var self = this // needed to preserve variable on interval
        this.move_interval = setInterval(function () {
          self.move_along_path(map)
        }, this.dog_speed)
      }
    }

    // if hero collided with dog, get out tha way!
    if (this.dogX === avX && this.dogY === avY && map[avY][avX].dog_present) {
      var newloc = this.get_avail_dog_loc(hero_move_dir, avX, avY, map)
      this.move_dog_restore_map(newloc, map)
      this.clearMoveInterval()
      map[avY][avX].hero_present = true
      this.hero_present = false
    }
  }

  clearMoveInterval () {
    // internal function to clear move interval
    clearInterval(this.move_interval)
    this.move_interval = -1
  }

  get_avail_dog_loc (hero_move_dir, x, y, map) {
    // internal function for getting available dog location
    // upon hero collision based on hero's direction
    var poss_locs
    switch (hero_move_dir) {
      case 'w':
        poss_locs = [[x + 1, y], [x - 1, y], [x, y - 1]]
        break
      case 's':
        poss_locs = [[x + 1, y], [x - 1, y], [x, y + 1]]
        break
      case 'a':
        poss_locs = [[x, y - 1], [x - 1, y], [x, y + 1]]
        break
      case 'd':
        poss_locs = [[x, y - 1], [x + 1, y], [x, y + 1]]
        break

      default:
        console.log('unknown hero_move_dir, Dog location get_avail_dog_loc')
    }

    var loc_to_return
    for (var i = 0; i < poss_locs.length; i++) {
      loc_to_return = poss_locs[i]
      if (map[loc_to_return[1]][loc_to_return[0]].objid === 'tile') {
        return loc_to_return
      }
    }
  }

  manhat_dist_from_hero (avX, avY) {
    // internal function for manhattan distance to hero
    return Math.abs(avY - this.dogY) + Math.abs(avX - this.dogX)
  }
}

// Citation: I based this code off of the wikipedia psuedo code
function a_star_search (start_loc, end_loc, map) {
  // start_loc should be the htmlID of the start loc
  // end_loc should be the htmlID of the end loc

  // Set of seen locations
  var closed_set = new Set()

  // Set to explore
  var open_set = new Set([start_loc])

  // A mapping from location -> location visited from
  var came_from = {}

  // Distance from the start per location
  var g_score = {}
  g_score[start_loc] = 0

  // F score = g score + heuristic
  var f_score = {}
  f_score[start_loc] = heuristic_distance(start_loc, end_loc)

  // While theres still locations to visit (and you haven't found the target)
  while (open_set.size > 0) {
    // Find all f scores of the open_set
    var open_f_scores = {}
    open_set.forEach(function (a) { open_f_scores[a] = f_score[a] })

    // find the minimum open f score and explore that location
    var current = Object.keys(open_f_scores).reduce(function (a, b) { return open_f_scores[a] < open_f_scores[b] ? a : b })

    // Find all the neighbors of the loc we are exploring
    var neighs = get_valid_neighs_from_htmlID(current, map)

    // If its the end, return
    if (current == end_loc) {
      return reconstruct_path(came_from, current)
    }

    // Else delete it, add to close set
    var del_succ = open_set.delete(current)
    if (!del_succ) {
      console.log(current)
      console.log(open_set)
      return []
    }
    // console.log(del_succ)
    closed_set.add(current)

    // For each neighbor
    for (var i = 0; i < neighs.length; i++) {
      var neigh = neighs[i]
      if (closed_set.has(neigh)) { // don't add to open_set if already explored
        continue
      }
      if (!open_set.has(neigh)) {
        open_set.add(neigh)
      }

      // We found it from current, so the tentative g score is current + 1,
      // Compare this to whats currently stored (if anything) for this neigh.
      // If this is a better path to neigh then update came_from, g_score, and f_score
      var tentative_gscore = g_score[current] + 1
      if (tentative_gscore >= g_score[neigh]) {
        continue
      }

      // Appropriate updates...
      came_from[neigh] = current
      g_score[neigh] = tentative_gscore
      f_score[neigh] = g_score[neigh] + heuristic_distance(neigh, end_loc)
    }
  }

  // If we make it to this point then we did not find a path, return empty
  return []

  // Helper function to return the path by recursing through came_from
  function reconstruct_path (came_from, current) {
    var total_path = []
    while (current in came_from) {
      current = came_from[current]
      total_path.push(current)
    }
    total_path = total_path.map(function (a) {
      var splt = a.split('x')
      var x = splt[1]
      var y = splt[0]
      return [parseInt(x), parseInt(y)]
    })
    total_path = total_path.splice(1)
    return total_path.reverse()
  }
}

function get_valid_neighs_from_htmlID (current, map) {
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

function heuristic_distance (start, end) {
  // both start and end are htmlID's

  // Parse the start htmlID into row/col:
  var split_start = start.split('x')
  var startRow = split_start[0]
  var startCol = split_start[1]

  // Parse the end htmlID into row/col
  var split_end = end.split('x')
  var endRow = split_end[0]
  var endCol = split_end[1]

  // compute and return the manhattan distance between
  // the start and the end locations.
  return Math.abs(startRow - endRow) + Math.abs(startCol - endCol)
}
