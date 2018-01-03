class Location {
    constructor(rowID, colID, name, objid, symbol, message,passable, interactable){
        this.name = name; //name of the Location
        this.message = message; //message displayed on print()
        this.objid = objid; //object id
        this.symbol = symbol; //symbol to display on map
        this.hero_present = false; //whether or not the hero is on this Location
        this.dog_present = false; //whether the dog is on this spot
        this.xCoord = colID * 15; //pixel coords
        this.yCoord = rowID * 15;
        this.rowID = rowID; //row index in world_map
        this.colID = colID; //col index in world_map
        this.fog = true; //whether or not fog is present
        this.passable = passable;
        this.fogTimeout;
        this.htmlID = '#' + String(this.rowID) + 'x' + String(this.colID)

        this.computeCoordsWithOffset = function(yoff,xoff){
            this.xCoord = (this.colID * 15) + xoff * 15;
            this.yCoord = (this.rowID * 15) + yoff * 15;
        }
        if(typeof interactable != 'undefined'){
            this.is_interactive = interactable;
        }
        else{
            this.is_interactive = false;
        }
    }

    getSymbol(){
        if(this.fog){
            return '';
        }
        else if(this.hero_present){
            return 'x';
        }
        else if(this.dog_present){
            return 'd';
        }
        else{
            return this.symbol;
        }
    }

    refreshInnerHTML(){
        var symbol = this.getSymbol();
        $(this.htmlID).html(symbol);
    }

    addFogBackAfterTimeout(tier){
        this.fog = false;
        var symbol = this.getSymbol();
        $(this.htmlID).html(symbol);

        clearTimeout(this.fogTimeout);
        var self = this;
        this.fogTimeout = setTimeout(function(){
            self.fog = true;
            $(self.htmlID).html('');
        }, 20000/(2*(tier+1)))

    }


    removeFogBecauseHeroPresent(){
        this.fog = false;
        var symbol = this.getSymbol();
        clearTimeout(this.fogTimeout)
        $(this.htmlID).html(symbol);
    }
};
