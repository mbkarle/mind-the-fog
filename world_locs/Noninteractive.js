/*
 * This file is for any Locations that are just for show and don't have
 * function. Currently this includes:
 *   1. Tile
 *   2. Wall
 *   3. EmptyTile
 */


class Tile extends Location {
    constructor(rowID, colID){
        super(rowID, colID, 'Tile', "tile", '.', '',true, true)//style preference? '·' instead??
    }
    hero_interact(){
        //You can interact with a tile if the dog is present!
        //Note that this should be the only way to interact with the dog--dog should
        //only move on tiles
        if(this.dog_present){
            doge.hero_interact(this)
        }
    }
}

class Wall extends Location{
    constructor(rowID,colID){
        super(rowID,colID, 'Wall', 'wall', '■', 'none shall pass',false)
    }
}

class EmptyTile extends Location{
    constructor(rowID, colID){
        super(rowID, colID, 'Empty Tile', 'empty', '', 'you shouldnt be here...',false)
    }
}

