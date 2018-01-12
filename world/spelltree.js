class SpellTreeModule {
    constructor() {
        this.modID = "#tree-module"
        this.open = false
    }

    openMod() {this.open = true; $(this.modID).show(100)}

    hideMod() {this.open = false; $(this.modID).hide(100)}

    toggleMod() {
        if(this.open){ this.hideMod() }
        else{ this.openMod() }
    }

    refreshMod(){
        $(this.modID).html('')
        for(var spell in Object.getOwnPropertyNames(SPELLTREE)){
            if(typeof Object.getOwnPropertyNames(SPELLTREE)[spell] != 'function'){
            var spellBox;
            var this_spell = Object.getOwnPropertyNames(SPELLTREE)[spell];
            var objid = '#' + SPELLTREE[this_spell]['objid']
            var top = 60 * (SPELLTREE[Object.getOwnPropertyNames(SPELLTREE)[spell]]['level'] - 2);
            var left;
            if(SPELLTREE[Object.getOwnPropertyNames(SPELLTREE)[spell]]['karma'] == 1){
                left = 5 + '%';
            }
            else if(SPELLTREE[Object.getOwnPropertyNames(SPELLTREE)[spell]]['karma'] == -1){
                left = 64 + '%';
            }
            else{
                left = 35 + '%';
            }
            var toDisplay;
            if(hero.level < SPELLTREE[this_spell]['level']){
              toDisplay = "?";
            }
            else{
              toDisplay = Object.getOwnPropertyNames(SPELLTREE)[spell];
            }
            $(this.modID).append("<div id='" + SPELLTREE[this_spell]['objid'] + "' class='treeBox' style='left:" + left + ";top:" + top + "px;'>" + toDisplay + "</div>")
            if(SPELLTREE[this_spell]['learned']){
                $(objid).css({'background-color': 'white', 'color': 'black'});
            }
            $(objid).attr('this_spell', this_spell);
            $(objid).click(function(){
                console.log($(this).attr('this_spell'))
                console.log(SPELLTREE[$(this).attr('this_spell')])
                $(this.modID).html("<div style='text-align:center;font-size:12px;font-family:cursive;'>" +
                $(this).attr('this_spell') + "<br><br>" +
                SPELLTREE[$(this).attr('this_spell')]['description'] + "<br><br> Required Level: " +
                SPELLTREE[$(this).attr('this_spell')]['level'] + "<div id='closeWindow' class='interact'>Close</div></div>");
                $(this.modID).append("<div id='learn" + spell + "' class='interact' style='left:0; width:40px;display:none;'>Learn</div>");

                var learnID = '#learn' + spell;
                $(learnID).attr('this_spell', $(this).attr('this_spell'));
                $("#closeWindow").click(function(){
                    refreshInfo();
                })
                if(!SPELLTREE[$(this).attr('this_spell')]['learned'] && hero.level >= SPELLTREE[$(this).attr('this_spell')]['level'] &&
                ((SPELLTREE[$(this).attr('this_spell')]['karma'] >= 0 && hero.karma >= SPELLTREE[$(this).attr('this_spell')]['level'] - 3) ||
                (SPELLTREE[$(this).attr('this_spell')]['karma'] <= 0 && hero.karma <= SPELLTREE[$(this).attr('this_spell')]['level'] * -1 + 3))){
                    $(learnID).show();
                    $(learnID).click(function(){
                        SPELLTREE[$(this).attr('this_spell')]['learned'] = true;
                        hero.karma += SPELLTREE[$(this).attr('this_spell')]['karma'];
                        if(typeof SPELLTREE[$(this).attr('this_spell')]['active spell'] != 'undefined'){
                            SPELLTREE[$(this).attr('this_spell')]['active spell'].createButton();
                        }
                        else if(typeof SPELLTREE[$(this).attr('this_spell')]['upgrade'] != 'undefined'){
                            SPELLTREE[$(this).attr('this_spell')]['upgrade'].upgrade();
                        }
                        refreshInfo();

                    })
                }
            })
        }}
    }
}
