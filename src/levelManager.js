/*
    Fichier: levelManager.js
    Nom: Magalie Abada
    But: Gestion du niveau
*/


/* ----- Variables -----*/
const MAX_NIVEAUX = 10;

const ETAT_ATTENTE = "attente";
const ETAT_EN_COURS = "jeu";
const ETAT_TERMINE = "termine";
const ETAT_GAME_OVER = "game_over";
const ETAT_MORT_ANIM = "mort_anim";

let niveauCourant = 1;
let nbGardes = 0;

let etatJeu = ETAT_ATTENTE;

let debutNiveauMs = 0;
let tempsEcouleMs = 0;

let scoreTotal = 0;
let scoreNiveau = 0;

let vies = 5;


/* ----- Fonctions -----*/

/*
|-----------------------------------------------------------------------------|
| calculerNbGardesPourNiveau:
|   Calcule le nombre de gardes à afficher selon le niveau.
|-----------------------------------------------------------------------------|
*/
function calculerNbGardesPourNiveau(n) {
    return 2 + n;
}


/*
|-----------------------------------------------------------------------------|
| initNiveau:
|   Initialise les éléments du niveau.
|-----------------------------------------------------------------------------|
*/
function initNiveau() {
    initGrille();
    initSortie();
    initGold();
    initTrous();
    initLodeRunner();
    initSounds();

    nbGardes = calculerNbGardesPourNiveau(niveauCourant);
    initGardes(nbGardes);
    
    etatJeu = ETAT_ATTENTE;
    lodeRunner.estEnAnimationMort = false;
    debutNiveauMs = 0;
    tempsEcouleMs = 0;
    scoreNiveau = 0;
    lodeRunner.tempsMort = 0;
    lodeRunner.yDepartMort = lodeRunner.y;
}


/*
|-----------------------------------------------------------------------------|
| demarrerNiveau:
|   Démarre le niveau.
|-----------------------------------------------------------------------------|
*/
function demarrerNiveau() {
    if (etatJeu !== ETAT_ATTENTE) return;

    etatJeu = ETAT_EN_COURS;
    debutNiveauMs = performance.now();
}


/*
|-----------------------------------------------------------------------------|
| updateLevelManager:
|   Mise à jour du gestionnaire de niveau
|-----------------------------------------------------------------------------|
*/
function updateLevelManager() {
    if (etatJeu === ETAT_EN_COURS) {
        tempsEcouleMs = performance.now() - debutNiveauMs;
    }
}


/*
|-----------------------------------------------------------------------------|
| gagnerNiveau:
|   Gère la victoire du niveau, avec mise à jour du score
|-----------------------------------------------------------------------------|
*/
function gagnerNiveau() {
    if (etatJeu !== ETAT_EN_COURS) return;

    scoreNiveauReussi();
    scoreTotal += scoreNiveau;

    // Niveau suivant
    if (niveauCourant >= MAX_NIVEAUX) {
        etatJeu = ETAT_TERMINE;
        playSound(sonLevelUp);
        dessinerVictoire();

        return;
    }

    niveauCourant++;
    playSound(sonLevelUp);
    initNiveau();
}


/*
|-----------------------------------------------------------------------------|
| perdreNiveau:
|   Gère la défaite du niveau, mais aussi le game over en fonction du nombre
|       de vies restantes
|-----------------------------------------------------------------------------|
*/
function perdreNiveau() {
    if (etatJeu !== ETAT_EN_COURS) return;

    vies--;
    scoreNiveau = 0;
    

    if (vies <= 0) {
        etatJeu = ETAT_GAME_OVER;
        if (lodeRunner) lodeRunner.enVie = false;
        sonGameOver.currentTime = 0;
        sonGameOver.play(); 
        return;
    }

    etatJeu = ETAT_MORT_ANIM;
    
    lodeRunner.estEnAnimationMort = true;
    lodeRunner.yDepartMort = lodeRunner.y;
    lodeRunner.tempsMort = Date.now();

    sonViePerdue.currentTime = 0;
    sonViePerdue.play();
}


/*
|-----------------------------------------------------------------------------|
| recommencerJeu: 
|   Redémarre une partie à 0.
|-----------------------------------------------------------------------------|
*/
function recommencerJeu() {
    scoreTotal = 0;
    vies = 5;
    niveauCourant = 1;

    initNiveau();
}


/*
|-----------------------------------------------------------------------------|
| formatTemps: 
|   Retourne les ms dans un format court: mm:ss
|   Par exemple: '03:35'
|-----------------------------------------------------------------------------|
*/
function formatTemps(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}


/*
|-----------------------------------------------------------------------------|
| dessinertableauDeBord:
|   Affiche niveau, temps, score
|-----------------------------------------------------------------------------|
*/
function dessinertableauDeBord() {
    objC2D.fillStyle = "#000000";
    objC2D.fillRect(0, 544, NB_COLS * CELL, 50);

    objC2D.fillStyle = "#FFFFFF";
    objC2D.font = "20px Impact";

    objC2D.fillText(`Niveau: ${niveauCourant}  (Gardes: ${nbGardes})`, 8, 575);
    objC2D.fillText(`Vies: ${vies}`, 210, 575);
    objC2D.fillText(`Temps: ${formatTemps(tempsEcouleMs)}`, 300, 575);
    objC2D.fillText(`Score: ${scoreNiveau + scoreTotal}`, 430, 575);

    if (etatJeu === ETAT_ATTENTE) {
        objC2D.fillText("Appuie sur une touche pour démarrer", 580, 575);
    }
}


/*
|-----------------------------------------------------------------------------|
| scoreRamasserOr / scoreGardeTombeTrou / scoreGardeMeurtRessuscite / scoreNiveauReussi:
|   Fonctions pour ajouter des points au score du niveau selon les actions
|-----------------------------------------------------------------------------|
*/
function scoreRamasserOr() {
    scoreNiveau += 250;
}
function scoreGardeTombeTrou() {
    scoreNiveau += 75;
}
function scoreGardeMeurtRessuscite() {
    scoreNiveau += 75;
}
function scoreNiveauReussi() {
    scoreNiveau += 1500;
}