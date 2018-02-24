class Floor {
    constructor(floor_num, num_rooms, tierList, custom){
        this.floor_num = floor_num;
        this.num_rooms = num_rooms;
        this.tierList = tierList;
        this.custom = custom;
        this.npcRoom = Math.floor(Math.random() * num_rooms);
        this.fightRoomTypes = ['MidNorm', 'HorizHallNorm', 'VertHallNorm', 'SmallNorm', 'norm'];
        this.safeRoomTypes = ['MidNorm', 'HorizHallNorm', 'VertHallNorm', 'SmallNorm', 'Exit'];
        this.build_floor = function(){
            if(this.custom == null){
            for(var i = 0; i < this.num_rooms; i++){
                var type;
                var maxLocs;

                if(Math.random() < .75){
                    type = this.fightRoomTypes[Math.floor(Math.random()*this.fightRoomTypes.length)];

                    if(type == 'MidNorm' || type == 'HorizHallNorm' || type == 'VertHallNorm'){
                        maxLocs = Math.ceil(Math.random() * 2) + 1;

                    }
                    else if(type == 'SmallNorm'){
                        maxLocs = 1;


                    }
                    else{
                        maxLocs = undefined;

                    }
                    room_list[this.floor_num][i] = new FightRoom("", type, this.tierList[Math.floor(Math.random()*this.tierList.length)], this.floor_num, maxLocs, this.npcRoom);
                }
                else{
                    type = this.safeRoomTypes[Math.floor(Math.random()*this.safeRoomTypes.length)]
                    if(type == 'MidNorm', 'HorizHallNorm', 'VertHallNorm'){
                        maxLocs = Math.ceil(Math.random() * 2) + 1;
                    }
                    else if(type == 'SmallNorm'){
                        maxLocs = 1;
                    }
                    else{
                        maxLocs = undefined;
                    }
                    room_list[this.floor_num][i] = new SafeRoom("", type,
                this.tierList[Math.floor(Math.random()*this.tierList.length)], this.floor_num, maxLocs, this.npcRoom);
            }
                build_doors(this, room_list, i, num_rooms)
                center_map(room_list[this.floor_num][i].room_map, room_list[this.floor_num][i].yoff, room_list[this.floor_num][i].xoff);
                room_list[this.floor_num][i].origin_floor = this;
            }}
            else{
                for(var i = 0; i < this.custom.length; i++){
                    room_list[this.floor_num][i] = this.custom[i];
                    build_doors(this, room_list, i, num_rooms)
                    center_map(room_list[this.floor_num][i].room_map, room_list[this.floor_num][i].yoff, room_list[this.floor_num][i].xoff);
                }
            }

            return room_list[this.floor_num];

            function build_doors(self, room_list, i, num_rooms){
                if(i <  num_rooms - 1){
                    var nextRoomDoor = new Door(Math.floor(room_list[self.floor_num][i].room_exit[0]), room_list[self.floor_num][i].room_width - 1, i, i + 1);
                    if(room_list[self.floor_num][i].constructor.name == 'SafeRoom'){
                        nextRoomDoor.fog = false;
                    }
                    room_list[self.floor_num][i].room_map[nextRoomDoor.rowID][nextRoomDoor.colID] = nextRoomDoor;
                }
                if(i > 0){
                    var prevRoomDoor = new Door(room_list[self.floor_num][i].room_entry[0], 0, i, i - 1);
                    if(room_list[self.floor_num][i].constructor.name == 'SafeRoom'){
                        prevRoomDoor.fog = false;
                    }
                    room_list[self.floor_num][i].room_map[prevRoomDoor.rowID][prevRoomDoor.colID] = prevRoomDoor;
                }
            }
        }
    }
}
