function Character(name, strength, dexterity, vitality) {
  this.name = name;
  this.strength = strength;
  this.dexterity = dexterity;
  this.vitality = vitality;
}
function Dex(Character){
  return Math.pow(Math.random(), 1 / (Character.dexterity / 3));
}
function Damage(Character, target){
  var hit = Math.floor(Math.random() * 6) + Character.strength;
  target.vitality -= hit;
  document.getElementById("hero").innerHTML = Hero.vitality;
  document.getElementById("enemy").innerHTML = Troglodyte.vitality;
  console.log(target.name + " was hurt");
}

var Hero = new Character("The Hero", 5, 2, 20);
var Troglodyte = new Character("the Troglodyte", 3, 1, 50);
function myGame(){
  window.onload = function(){
    document.getElementById("hero").innerHTML = Hero.vitality;
    document.getElementById("enemy").innerHTML = Troglodyte.vitality;
    document.getElementById("attack").onclick = function() {Damage(Hero, Troglodyte)};
    //if(Troglodyte.vitality > 0){
    var enemyAttack = setInterval(function() {Damage(Troglodyte, Hero);}, 4000);

    //TODO: onload only happens once! check this every click?
    // while(Troglodyte.vitality > 0){
    //   console.log("waiting...")

    // };
    // window.clearInterval(enemyAttack);
    // console.log("should be cleared...");
  };
}

myGame();