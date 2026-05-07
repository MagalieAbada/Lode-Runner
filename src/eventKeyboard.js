/*
   Fichier: eventKeyboard.js
   Nom: Magalie Abada
   But: Gestion des événements du clavier
*/

/* ----- Fonctions -----*/

/*
|-----------------------------------------------------------------------------|
| gestionClavier:
|   Gérer les événements de pression des touches du clavier
|-----------------------------------------------------------------------------|
*/
function gestionClavier(event) {
    if (etatJeu === ETAT_GAME_OVER || etatJeu === ETAT_TERMINE) {
        if (event.code === "Enter") {
            recommencerJeu();
        }
        return;
    }

    demarrerNiveau();

    switch (event.key) {
        case "ArrowLeft":
            lodeRunner.bougeG = true;
            break;

        case "ArrowRight":
            lodeRunner.bougeD = true;
            break;

        case "ArrowUp":
            lodeRunner.bougeH = true;
            break;

        case "ArrowDown":
            lodeRunner.bougeB = true;
            break;

        case "z":
        case "Z":
            lodeRunner.creuseG = true;
            break;
        case "x":
        case "X":
            lodeRunner.creuseD = true;
            break;
    }

    
}


/*
|-----------------------------------------------------------------------------|
| gestionRelache:
|   Gérer les événements de relâchement des touches du clavier
|-----------------------------------------------------------------------------|
*/
function gestionRelache(event) {
    switch (event.key) {
        case "ArrowLeft":
            lodeRunner.bougeG = false;
            break;

        case "ArrowRight":
            lodeRunner.bougeD = false;
            break;

        case "ArrowUp":
            lodeRunner.bougeH = false;
            break;

        case "ArrowDown":
            lodeRunner.bougeB = false;
            break;

        case "z":
        case "Z":
        case "x":
        case "X":
        case "Enter":
            break;
    }
}