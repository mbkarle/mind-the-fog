var DOGUPGRADES = {
    "Dog Gold Carry 1": {
        "func": (dog) => dog.goldCarryFrac = .2,
        "description": "Your Dog will carry <br>20% of your Gold<br> after you die.",
        "value": 1000,
        "prereqs": []
    },
    "Dog Gold Carry 2": {
        "func": (dog) => dog.goldCarryFrac = .3,
        "description": "Your Dog will carry <br>30% of your Gold<br> after you die.",
        "value": 2000,
        "prereqs": ["Dog Gold Carry 1"]
    },
    "Dog Gold Carry 3": {
        "func": (dog) => dog.goldCarryFrac = .4,
        "description": "Your Dog will carry <br>40% of your Gold<br> after you die.",
        "value": 3000,
        "prereqs": ["Dog Gold Carry 2"]
    },
    "Dog Gold Carry 4": {
        "func": (dog) => dog.goldCarryFrac = .5,
        "description": "Your Dog will carry <br>50% of your Gold<br> after you die.",
        "value": 4000,
        "prereqs": ["Dog Gold Carry 3"]
    },
    "Dog Item Carry 1": {
        "func": (dog) => dog.inv.capacity = 2,
        "description": "Your Dog can carry<br> up to 2 items!",
        "value": 1000,
        "prereqs": []
    },
    "Dog Item Carry 2": {
        "func": (dog) => dog.inv.capacity = 3,
        "description": "Your Dog can carry<br> up to 3 items!",
        "value": 2000,
        "prereqs": ["Dog Gold Carry 1", "Dog Item Carry 1"]
    },
    "Dog Item Carry 3": {
        "func": (dog) => dog.inv.capacity = 4,
        "description": "Your Dog can carry<br> up to 4 items!",
        "value": 3000,
        "prereqs": ["Dog Item Carry 2"]
    },
    "Dog Item Carry 4": {
        "func": (dog) => dog.inv.capacity = 5,
        "description": "Your Dog can carry<br> up to 5 items!",
        "value": 4000,
        "prereqs": ["Dog Item Carry 3"]
    }
}
