/*
 * This file should be for skill-tree (magic tree) related functions.
 */
function refreshSpellTreeHTML(hero){
    $("#tree-module").html('')
    for(var spell in Object.getOwnPropertyNames(spellTree)){
        if(typeof Object.getOwnPropertyNames(spellTree)[spell] != 'function'){
        var spellBox;
        var this_spell = Object.getOwnPropertyNames(spellTree)[spell];
        var objid = '#' + spellTree[this_spell]['objid']
        var top = 60 * (spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['level'] - 2);
        var left;
        if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == 1){
            left = 5 + '%';
        }
        else if(spellTree[Object.getOwnPropertyNames(spellTree)[spell]]['karma'] == -1){
            left = 64 + '%';
        }
        else{
            left = 35 + '%';
        }
        var toDisplay;
        if(hero.level < spellTree[this_spell]['level']){
          toDisplay = "?";
        }
        else{
          toDisplay = Object.getOwnPropertyNames(spellTree)[spell];
        }
        $("#tree-module").append("<div id='" + spellTree[this_spell]['objid'] + "' class='treeBox' style='left:" + left + ";top:" + top + "px;'>" + toDisplay + "</div>")
        if(spellTree[this_spell]['learned']){
            $(objid).css({'background-color': 'white', 'color': 'black'});
        }
        $(objid).attr('this_spell', this_spell);
        $(objid).click(function(){
            console.log($(this).attr('this_spell'))
            console.log(spellTree[$(this).attr('this_spell')])
            $("#tree-module").html("<div style='text-align:center;font-size:12px;font-family:cursive;'>" +
            $(this).attr('this_spell') + "<br><br>" +
            spellTree[$(this).attr('this_spell')]['description'] + "<br><br> Required Level: " +
            spellTree[$(this).attr('this_spell')]['level'] + "<div id='closeWindow' class='interact'>Close</div></div>");
            $("#tree-module").append("<div id='learn" + spell + "' class='interact' style='left:0; width:40px;display:none;'>Learn</div>");

            var learnID = '#learn' + spell;
            $(learnID).attr('this_spell', $(this).attr('this_spell'));
            $("#closeWindow").click(function(){
                refreshInfo();
            })
            if(!spellTree[$(this).attr('this_spell')]['learned'] && hero.level >= spellTree[$(this).attr('this_spell')]['level'] &&
            ((spellTree[$(this).attr('this_spell')]['karma'] >= 0 && hero.karma >= spellTree[$(this).attr('this_spell')]['level'] - 3) ||
            (spellTree[$(this).attr('this_spell')]['karma'] <= 0 && hero.karma <= spellTree[$(this).attr('this_spell')]['level'] * -1 + 3))){
                $(learnID).show();
                $(learnID).click(function(){
                    spellTree[$(this).attr('this_spell')]['learned'] = true;
                    hero.karma += spellTree[$(this).attr('this_spell')]['karma'];
                    if(typeof spellTree[$(this).attr('this_spell')]['active spell'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['active spell'].createButton();
                    }
                    else if(typeof spellTree[$(this).attr('this_spell')]['upgrade'] != 'undefined'){
                        spellTree[$(this).attr('this_spell')]['upgrade'].upgrade();
                    }
                    refreshInfo();

                })
            }
        })
    }}
}
