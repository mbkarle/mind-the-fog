function Character(name, strength, dexterity, vitality) {
  this.name = name;
  this.strength = strength;
  this.dexterity = dexterity;
  this.vitality = vitality;
}
function Item(name, damage, vitality){
  this.name = name;
  this.damage = damage;
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
  document.getElementById("defend").innerHTML = "Shield: " + HeroShield.vitality;
  console.log(target.name + " was hurt");
}
function Shield(){
  Hero.vitality += 2;
  protected = true;
}
var Hero = new Character("The Hero", 5, 2, 20);
var Troglodyte = new Character("the Troglodyte", 3, 1, 50);
var HeroShield = new Item("the shield", null, 20);
var protected = false;
var shielded;
function myGame(){
  window.onload = function(){
    document.getElementById("hero").innerHTML = Hero.vitality;
    document.getElementById("enemy").innerHTML = Troglodyte.vitality;
    document.getElementById("defend").innerHTML = "Shield: " + HeroShield.vitality;
    document.getElementById("attack").onclick = function() {
      Damage(Hero, Troglodyte);
//jquery animations:
      $(".attackCooldown").show();
      $(".attackCooldown").animate({
        width: '0px'
      }, 10000, function() {
        $(".attackCooldown").hide();
      $(".attackCooldown").animate({
        width: '87px'
      }, 1);
    });
    };
    if(protected == false && HeroShield.vitality > 0){
    document.getElementById("defend").onclick = function() {
      shielded = setInterval(function() {Shield()}, 4000);

    }}
    var enemyAttack = setInterval(function() {if(protected == true){Damage(Troglodyte, HeroShield)} else{Damage(Troglodyte, Hero)}}, 4000);
    window.onclick = function(){
      console.log("clicked");
      if(protected == true || HeroShield.vitality <= 0){
        window.clearInterval(shielded);
        protected = false;
        //jquery animation:
          $(".defendCooldown").hide('fast');
      }
      if(Troglodyte.vitality < 0){
        window.clearInterval(enemyAttack);
      };
    };
    //jquery animation:
    $("#defend").click(function(){
      $(".defendCooldown").toggle(4000);
      })
  };

}

myGame();
