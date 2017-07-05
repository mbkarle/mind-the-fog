var Hero = new Character("The Hero", 5, 3, 20,"hero");
var Troglodyte = new Character("Troglodyte", 3, 2, 30,"enemy");
var DireRat = new Character("Dire Rat", 1, 15, 20,"enemy");
var DireRat2 = new Character("Dire Rat", 1, 15, 20,"enemy");
var Ogre = new Character("Ogre", 7, 1, 60, "enemy");

var HeroShield = new Item("the shield", null, 20,"defend");
var protected = false;
var ready = true;
var shielded;
//var hit;
var startOver;
var enemyAttack;
var globalEnemies = [Troglodyte, DireRat, DireRat2, Ogre];

combat(Hero, globalEnemies);

//----------------------------------------------------------------
//                      HELPER FUNCTIONS
//----------------------------------------------------------------

function Character(name, strength, dexterity, vitality,objid) {
  this.name = name;
  this.strength = strength;
  this.dexterity = dexterity;
  this.vitality = vitality;
  this.objid = objid;
}

function Item(name, damage, vitality, objid){
  this.name = name;
  this.damage = damage;
  this.vitality = vitality;
  this.objid = objid;
}
// function Dex(Character){
//   return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
// }

function Damage(source_character, target_character){
  hit = Math.floor(Math.random() * source_character.strength) + source_character.strength;
  target_character.vitality -= hit;
  document.getElementById(source_character.objid).innerHTML = source_character.vitality;
  document.getElementById(target_character.objid).innerHTML = target_character.vitality /*+ target_character.name */;
  document.getElementById("hero").innerHTML = Hero.vitality;
  document.getElementById("defend").innerHTML = "Shield: " + HeroShield.vitality;//TODO
  console.log(target_character.name + " was hurt");
  return hit;
}

function Shield(){//TODO fix during recursion
  Hero.vitality += 2;
  protected = true;
  console.log("Shield on");
}

function readyUp(){
  ready = true;
  return ready;
}

function print(messageType, message){
  if(messageType == "damageDealt"){
  document.getElementById("textBox").innerHTML = "You strike for " + message + " damage!"
}
else{
  document.getElementById("textBox").innerHTML = message;
}
}


function combat(hero, enemyListArg){ //take in enemy list
// for(enemy_index = 0; enemy_index < enemyListArg.length; enemy_index++){
  window.onload = function(){
  combat_helper(hero, enemyListArg, 0);
};
  // console.log("NEXT ENEMY");

}


function combat_helper(hero, enemyList, idx){ //TODO GLOBAL VARIABLES
  console.log("lap " + idx);
  Hero.vitality = 20;
  HeroShield.vitality = 20;
  if(Hero.vitality <= 0){
    return;
  }
    print("enemy-message", "A fearsome " + enemyList[idx].name + " emerges from the shadows!")
    document.getElementById("enter").onclick = function() {
      console.log("Engaging!");
      $("#text-module").animate({
        top: '350px',
        left: '20px'
      }, 500);
      $("#combat-module").show(500);
      $("#enter").hide();
    enemyAttack = setInterval(function() {print("combat start", "The enemy strikes!"); if(protected == true){Damage(enemyList[idx], HeroShield)} else{Damage(enemyList[idx], Hero)} if(Hero.vitality <= 0){print("lul","You died!");}}, 10000 / enemyList[idx].dexterity);
    }

    document.getElementById("hero").innerHTML = Hero.vitality;
    document.getElementById("enemy").innerHTML = enemyList[idx].vitality;
    document.getElementById("defend").innerHTML = "Shield: " + HeroShield.vitality;

    document.getElementById("attack").onclick = function() {
      if(ready){
      ready = false;
      window.setTimeout(readyUp, 10000 / Hero.dexterity);
      hitprint=Damage(Hero, enemyList[idx]);
      print("damageDealt", hitprint);
//jquery animations:
      $("#attackSlider").show();
      $("#attackSlider").animate({
        width: '0px'
      }, 10000 / Hero.dexterity, function() {
        $("#attackSlider").hide();
      $("#attackSlider").animate({
        width: '87px'
      }, 1);
    });
  }};

    if(protected == false && HeroShield.vitality > 0){
    document.getElementById("defend").onclick = function() {
      shielded = setInterval(function() {Shield()}, 4000);

    }}

    // var enemyAttack = setInterval(function() {print("combat start", "The enemy strikes!"); if(protected == true){Damage(enemyList[idx], HeroShield)} else{Damage(enemyList[idx], Hero)}}, 10000 / enemyList[idx].dexterity);
    window.onclick = function(){
      console.log(protected);
      if(protected == true || HeroShield.vitality <= 0){
        window.clearInterval(shielded);
        protected = false;
        //jquery animation:
          $("#defendSlider").hide('fast');
      }
      if(enemyList[idx].vitality <= 0){
        enemyList[idx].vitality = 0;
        window.clearInterval(enemyAttack);
        print("message", "You've defeated the beast!");
        if (idx < enemyList.length){
          idx++;
          document.getElementById("enter").innerHTML = "––>";
          $("#enter").show();
          document.getElementById("enter").onclick = function() {
            $("#combat-module").hide(500);
            $("#text-module").animate({
              top: "30px",
              left: "20px"
            }, 500);
            document.getElementById("enter").innerHTML = "Engage";
            combat_helper(hero, enemyList, idx);
          }

        }; //success
      };
    };
    //jquery animation:
    $("#defend").click(function(){
      $("#defendSlider").show(4000);
      })

}
