/*
   Fichier: soundManager.js
   Nom: Magalie Abada
   But: Charge les sons
*/
let sonOn = false;

let sonCoin;
let sonChute;
let sonCreuser;
let sonTrou;
let sonViePerdue;
let sonGameOver;
let sonLevelUp;
let sonChuteGarde;
let sonGardeMort;

function initSounds() {
    // Lorsque Lode Runner ramasse un lingot d’or
    sonCoin = new Audio("ressources/pickup.mp3");

    // Lorsque Lode Runner fait une chute
    sonChute = new Audio("ressources/chute1.mp3");

    // Lorsque Lode Runner creuse un trou dans la passerelle
    sonCreuser = new Audio("ressources/dig1.mp3")

    // Lorsqu’un trou se remplit automatiquement (après 8 secondes)
    sonTrou = new Audio("ressources/trou.mp3");

    // Lorsque Lode Runner perd une vie
    sonViePerdue = new Audio("ressources/perdrevie.mp3");

    // Lorsque Lode Runner perd toutes ses vies (Game over)
    sonGameOver = new Audio("ressources/gameover.mp3");

    // Lorsque Lode Runner a terminé un niveau pour passer au niveau suivant
    sonLevelUp = new Audio("ressources/levelup.mp3");

    // Lorsqu’un garde tombe dans un trou 
    sonChuteGarde = new Audio("ressources/chute.mp3");

    // Lorsqu’un garde meurt 
    sonMortGarde = new Audio("ressources/gardemeurt.mp3");
}
/*
|-----------------------------------------------------------------------------|
| playSound:
|     Permet de jouer un son indépendamment des autres lectures du même son.
|     Crée une copie de l'objet Audio avec cloneNode() et joue cette copie
|-----------------------------------------------------------------------------|
*/
function playSound(audio) {
    const s = audio.cloneNode();
    s.play();
}