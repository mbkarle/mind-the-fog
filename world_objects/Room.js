//This is the class for a room, designed to fix #35 and #31.
/*A room should have:
* A list of enemies associated (enemies that could be encountered)
* The number of enemy encounters before the boss
* The special locations for the room
* The boss, if applicable
*/
class Room {
    constructor(en_list, num_ens, locations, boss) {
        this.enemy_list = en_list;
        this.num_enemies = num_ens;
        this.locations = locations;
        this.boss = boss;
    }
}
