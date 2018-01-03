var NPCList = {
    "alchemist": {
        "charID": "alchemist",
        "charDisplay": "the alchemist",
        "active": false,
        "roomIdx": 1,
        'coords': [3, 15],
        'symbol': 'A',
        'description': 'A pungent smell wafts towards you from where the alchemist sits, peddling his wares.',
        'merchandise': []
    },
    "shieldMaker":{
        "charID": "shieldMaker",
        "charDisplay": "the shield maker",
        "active": false,
        "roomIdx": 1,
        'coords': [3, 6],
        'symbol': 'S',
        'description': 'The shield maker can improve your shield, for a price.',
        'merchandise': []
    },
    "dogTrainer":{
        "charID": "dogTrainer",
        "charDisplay": "the dog trainer",
        "active": false,
        "roomIdx": 1,
        "coords": [9, 15],
        'symbol': 'T',
        'description': "The dog's plenty loyal. The trainer will put it to work.",
        'merchandise': []
    },
    "blacksmith":{
        "charID": 'blacksmith',
        'charDisplay': 'the blacksmith',
        'roomIdx': 1,
        'coords': [9, 25],
        'symbol': 'B',
        'description': "The blacksmith will fill the dungeon with his finest crafts.",
        'merchandise': []
    },
    "winston":{
        "charID": 'winston',
        'charDisplay': "Winston",
        'active': false,
        'roomIdx': 1,
        'coords': [3, 25],
        'symbol': 'W',
        'description': 'Winston will lend you his powers, for a price.',
        'merchandise': []
    }
}

var activeNPCs = [];
var inactiveNPCs = [];

function getNPCs(){
    var NPCListKeys = Object.keys(NPCList);
    for(var i = 0; i < NPCListKeys.length; i++){
        if(NPCList[NPCListKeys[i]]['active']){
            activeNPCs.push(NPCList[NPCListKeys[i]]);
            var inactiveSplice = inactiveNPCs.indexOf(NPCList[NPCListKeys[i]]);
            inactiveNPCs.splice(inactiveSplice, 1);
        }
        else{
          inactiveNPCs.push(NPCList[NPCListKeys[i]]);
        }
    }
}

function addNPC(name, room_map, yCoord, xCoord){
    var newNPC = new NPC(yCoord, xCoord, name);
    room_map[yCoord][xCoord] = newNPC;
}
