/*
   Fichier: gold.js
   Nom: Magalie Abada
   But: Gestion des lingots d'or (ramassage)
*/

/* ----- Variables -----*/
let nbOrTotal = 0;
let nbOrRamasse = 0;


/* ----- Fonctions -----*/

/*
|-----------------------------------------------------------------------------|
| initGold:
|   Initialise les propriétés de l'or (compteur total et ramassé)
|-----------------------------------------------------------------------------|
*/
function initGold() {
    nbOrTotal = 0;
    nbOrRamasse = 0;

    for (let lig = 0; lig < NB_LIGNES; lig++) {
        for (let col = 0; col < NB_COLS; col++) {
            if (grille[lig][col] === OR) nbOrTotal++;
        }
    }
}


/*
|-----------------------------------------------------------------------------|
| ramasserOrSurCase:
|   Gère le ramassage de l'or
|-----------------------------------------------------------------------------|
*/
function ramasserOrSurCase(ligne, col) {
    if (getTypeCase(ligne, col) === OR) {
        grille[ligne][col] = VIDE;
        return true;
    }
    return false;
}


/*
|-----------------------------------------------------------------------------|
| toutOrRamasse:
|   Condition de victoire
|-----------------------------------------------------------------------------|
*/
function toutOrRamasse() {
    return nbOrTotal > 0 && nbOrRamasse >= nbOrTotal;
}