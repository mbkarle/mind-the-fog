var activeNPCs = []
var inactiveNPCs = []

function getNPCs () {
  var NPCSKeys = Object.keys(NPCS)
  for (var i = 0; i < NPCSKeys.length; i++) {
    if (NPCS[NPCSKeys[i]]['active']) {
      activeNPCs.push(NPCS[NPCSKeys[i]])
      var inactiveSplice = inactiveNPCs.indexOf(NPCS[NPCSKeys[i]])
      inactiveNPCs.splice(inactiveSplice, 1)
    } else {
      inactiveNPCs.push(NPCS[NPCSKeys[i]])
    }
  }
}

function addNPC (name, room_map, yCoord, xCoord) {
  var newNPC = new NPC(yCoord, xCoord, name)
  room_map[yCoord][xCoord] = newNPC
}
